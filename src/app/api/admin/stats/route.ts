import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - 7)

    const [todayCount, weekCount, totalCount, recentVisits] = await Promise.all([
      prisma.visit.count({ where: { createdAt: { gte: todayStart } } }),
      prisma.visit.count({ where: { createdAt: { gte: weekStart } } }),
      prisma.visit.count(),
      prisma.visit.findMany({
        include: { employee: { select: { name: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ])

    return NextResponse.json({
      success: true,
      stats: {
        todayCount,
        weekCount,
        totalCount,
      },
      recentVisits,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      success: true,
      stats: { todayCount: 0, weekCount: 0, totalCount: 0 },
      recentVisits: [],
    })
  }
}
