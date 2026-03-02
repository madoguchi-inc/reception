import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const page = searchParams.get('page') || '1'
    const limit = searchParams.get('limit') || '50'
    const format = searchParams.get('format') || 'json'

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const pageNum = parseInt(page, 10)
      const limitNum = parseInt(limit, 10)
      const skip = (pageNum - 1) * limitNum

      const where: any = {
        organizationId,
        status: 'COMPLETED',
        ...(dateFrom && {
          checkedInAt: { gte: new Date(dateFrom) },
        }),
        ...(dateTo && {
          checkedInAt: { lte: new Date(dateTo) },
        }),
        ...(search && {
          OR: [
            { visitorName: { contains: search, mode: 'insensitive' } },
            { visitorCompany: { contains: search, mode: 'insensitive' } },
          ],
        }),
      }

      const [visitors, total] = await Promise.all([
        prisma.appointment.findMany({
          where,
          include: {
            employee: { include: { department: true } },
            meetingRoom: true,
            location: true,
          },
          orderBy: { checkedInAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.appointment.count({ where }),
      ])

      // Calculate stay duration
      const visitorsWithDuration = visitors.map((visit: any) => ({
        ...visit,
        stayDurationMinutes: visit.checkedOutAt && visit.checkedInAt
          ? Math.round((visit.checkedOutAt.getTime() - visit.checkedInAt.getTime()) / 60000)
          : null,
      }))

      if (format === 'csv') {
        // Return CSV
        const csv = convertToCSV(visitorsWithDuration)
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="visitors.csv"',
          },
        })
      }

      return NextResponse.json({
        success: true,
        visitors: visitorsWithDuration,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, visitors: [], pagination: { page: 1, limit: 50, total: 0, pages: 0 } })
    }
  } catch (error) {
    console.error('Get visitors error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function convertToCSV(visitors: any[]): string {
  const BOM = '\uFEFF'
  const headers = [
    '訪問者名',
    '会社名',
    '訪問日時',
    '退社日時',
    '滞在時間（分）',
    '目的',
    '担当者',
    '部門',
    '会議室',
    'メールアドレス',
    '電話番号',
  ]

  const rows = visitors.map((v) => [
    v.visitorName,
    v.visitorCompany || '',
    v.checkedInAt ? new Date(v.checkedInAt).toLocaleString('ja-JP') : '',
    v.checkedOutAt ? new Date(v.checkedOutAt).toLocaleString('ja-JP') : '',
    v.stayDurationMinutes || '',
    v.purpose,
    v.employee.name,
    v.employee.department?.name || '',
    v.meetingRoom?.name || '',
    v.visitorEmail || '',
    v.visitorPhone || '',
  ])

  const csvContent = [
    headers.map(h => `"${h}"`).join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n')

  return BOM + csvContent
}
