import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const visitors = await prisma.appointment.findMany({
        where: {
          organizationId,
          status: 'COMPLETED',
          ...(dateFrom && {
            checkedInAt: { gte: new Date(dateFrom) },
          }),
          ...(dateTo && {
            checkedInAt: { lte: new Date(dateTo) },
          }),
        },
        include: {
          employee: { include: { department: true } },
          meetingRoom: true,
        },
        orderBy: { checkedInAt: 'desc' },
      })

      // Create CSV with BOM for Excel Japanese compatibility
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

      const rows = visitors.map((v: any) => {
        const stayDurationMinutes = v.checkedOutAt && v.checkedInAt
          ? Math.round((v.checkedOutAt.getTime() - v.checkedInAt.getTime()) / 60000)
          : null

        return [
          v.visitorName,
          v.visitorCompany || '',
          v.checkedInAt ? new Date(v.checkedInAt).toLocaleString('ja-JP') : '',
          v.checkedOutAt ? new Date(v.checkedOutAt).toLocaleString('ja-JP') : '',
          stayDurationMinutes || '',
          v.purpose,
          v.employee.name,
          v.employee.department?.name || '',
          v.meetingRoom?.name || '',
          v.visitorEmail || '',
          v.visitorPhone || '',
        ]
      })

      const csvContent = [
        headers.map(h => `"${h}"`).join(','),
        ...rows.map((row: any) => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n')

      const csv = BOM + csvContent

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="visitors-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return empty CSV on error
      const BOM = '\uFEFF'
      const csv = BOM + '訪問者名,会社名,訪問日時,退社日時,滞在時間（分）,目的,担当者,部門,会議室,メールアドレス,電話番号'
      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="visitors-export-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      })
    }
  } catch (error) {
    console.error('Export visitors error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
