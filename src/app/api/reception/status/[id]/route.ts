import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Visit ID required' },
        { status: 400 }
      )
    }

    try {
      const visit = await prisma.visit.findUnique({
        where: { id },
        include: { employee: true },
      })

      if (!visit) {
        // Try demo fallback
        return NextResponse.json({
          success: true,
          appointment: {
            visitorName: 'ゲスト',
            status: 'CHECKED_IN',
            response: null,
          },
        })
      }

      const res = NextResponse.json({
        success: true,
        appointment: {
          visitorName: visit.visitorName,
          visitorCompany: visit.visitorCompany,
          employeeName: visit.employee?.name || '担当者',
          status: visit.status,
          response: visit.response || null,
          callStatus: visit.callStatus || null,
          checkedInAt: visit.createdAt,
          purpose: visit.purpose,
        },
      })

      // キャッシュ無効化
      res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
      res.headers.set('Pragma', 'no-cache')

      return res
    } catch (dbError) {
      console.error('DB error:', dbError)
      return NextResponse.json({
        success: true,
        appointment: {
          visitorName: 'ゲスト',
          status: 'CHECKED_IN',
          response: null,
        },
      })
    }
  } catch (error) {
    console.error('Status error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
