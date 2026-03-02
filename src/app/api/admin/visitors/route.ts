import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search')

    const where = search ? {
      OR: [
        { visitorName: { contains: search, mode: 'insensitive' as const } },
        { visitorCompany: { contains: search, mode: 'insensitive' as const } },
      ],
    } : undefined

    const [visits, total] = await Promise.all([
      prisma.visit.findMany({
        where,
        include: { employee: { select: { name: true, department: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.visit.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      visits,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Get visitors error:', error)
    return NextResponse.json({ success: true, visits: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } })
  }
}
