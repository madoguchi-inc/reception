import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekStart = new Date(today)
      weekStart.setDate(today.getDate() - today.getDay())
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

      const [
        todayStats,
        weekStats,
        monthStats,
        departmentStats,
        upcomingAppointments,
      ] = await Promise.all([
        // Today's statistics by status
        prisma.appointment.groupBy({
          by: ['status'],
          where: {
            organizationId,
            scheduledAt: { gte: today },
          },
          _count: true,
        }),
        // This week's statistics
        prisma.appointment.findMany({
          where: {
            organizationId,
            scheduledAt: { gte: weekStart },
          },
          select: { status: true },
        }),
        // This month's statistics
        prisma.appointment.findMany({
          where: {
            organizationId,
            scheduledAt: { gte: monthStart },
          },
          select: { status: true },
        }),
        // Department-wise breakdown for this month
        prisma.appointment.groupBy({
          by: ['employeeId'],
          where: {
            organizationId,
            scheduledAt: { gte: monthStart },
          },
          _count: true,
        }),
        // Upcoming appointments (next 7 days)
        prisma.appointment.findMany({
          where: {
            organizationId,
            status: 'SCHEDULED',
            scheduledAt: {
              gte: today,
              lt: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
            },
          },
          include: { employee: { include: { department: true } } },
          orderBy: { scheduledAt: 'asc' },
          take: 10,
        }),
      ])

      // Process statistics
      const todayByStatus: Record<string, number> = {}
      todayStats.forEach((stat: any) => {
        todayByStatus[stat.status] = stat._count
      })

      const weekCount = weekStats.length
      const monthCount = monthStats.length

      // Get department names for department stats
      const departmentStatsWithNames = await Promise.all(
        departmentStats.map(async (stat: any) => {
          const employee = await prisma.employee.findUnique({
            where: { id: stat.employeeId },
            include: { department: true },
          })
          return {
            departmentId: employee?.department.id,
            departmentName: employee?.department.name,
            employeeName: employee?.name,
            count: stat._count,
          }
        })
      )

      // Aggregate by department
      const byDepartment: Record<string, number> = {}
      departmentStatsWithNames.forEach(stat => {
        if (stat.departmentName) {
          byDepartment[stat.departmentName] = (byDepartment[stat.departmentName] || 0) + stat.count
        }
      })

      return NextResponse.json({
        success: true,
        stats: {
          today: {
            total: Object.values(todayByStatus).reduce((a, b) => a + b, 0),
            byStatus: todayByStatus,
          },
          week: {
            total: weekCount,
            byStatus: countByStatus(weekStats),
          },
          month: {
            total: monthCount,
            byStatus: countByStatus(monthStats),
          },
          byDepartment,
          upcomingAppointments,
        },
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: true,
        stats: {
          today: { total: 0, byStatus: {} },
          week: { total: 0, byStatus: {} },
          month: { total: 0, byStatus: {} },
          byDepartment: {},
          upcomingAppointments: [],
        },
      })
    }
  } catch (error) {
    console.error('Get stats error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function countByStatus(appointments: any[]): Record<string, number> {
  const counts: Record<string, number> = {}
  appointments.forEach(apt => {
    counts[apt.status] = (counts[apt.status] || 0) + 1
  })
  return counts
}
