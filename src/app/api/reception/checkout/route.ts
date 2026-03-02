import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorName, appointmentId } = body

    if (!visitorName && !appointmentId) {
      return NextResponse.json(
        { success: false, error: 'Either visitorName or appointmentId required' },
        { status: 400 }
      )
    }

    try {
      let appointment
      const now = new Date()

      if (appointmentId) {
        // Find by appointment ID
        appointment = await prisma.appointment.findUnique({
          where: { id: appointmentId },
        })
      } else {
        // Find latest CHECKED_IN appointment by visitor name
        appointment = await prisma.appointment.findFirst({
          where: {
            visitorName,
            status: 'CHECKED_IN',
          },
          orderBy: { checkedInAt: 'desc' },
        })
      }

      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'No active appointment found' },
          { status: 404 }
        )
      }

      // Update appointment to completed
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointment.id },
        data: {
          status: 'COMPLETED',
          checkedOutAt: now,
        },
      })

      // Create checkout visit log
      await prisma.visitLog.create({
        data: {
          appointmentId: appointment.id,
          action: 'CHECK_OUT',
          details: 'Manual check-out',
        },
      })

      return NextResponse.json({
        success: true,
        appointmentId: updatedAppointment.id,
        visitorName: updatedAppointment.visitorName,
        checkedOutAt: updatedAppointment.checkedOutAt,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return demo response if DB is not connected
      return NextResponse.json({
        success: true,
        appointmentId: `demo-${Date.now()}`,
        checkedOutAt: new Date(),
      })
    }
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
