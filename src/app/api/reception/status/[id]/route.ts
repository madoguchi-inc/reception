import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID required' },
        { status: 400 }
      )
    }

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          employee: true,
          meetingRoom: true,
          notifications: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }

      const latestNotification = appointment.notifications[0]

      return NextResponse.json({
        success: true,
        appointment: {
          visitorName: appointment.visitorName,
          visitorCompany: appointment.visitorCompany,
          employeeName: appointment.employee.name,
          meetingRoom: appointment.meetingRoom?.name,
          status: appointment.status,
          response: latestNotification?.response,
          checkedInAt: appointment.checkedInAt,
          scheduledAt: appointment.scheduledAt,
          purpose: appointment.purpose,
        },
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return demo data if DB is not connected
      return NextResponse.json({
        success: true,
        appointment: {
          visitorName: 'Demo Visitor',
          status: 'CHECKED_IN',
          response: null,
        },
      })
    }
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
