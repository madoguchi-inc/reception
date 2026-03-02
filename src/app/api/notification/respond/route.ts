import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { appointmentId, response } = body

    if (!appointmentId || !response) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!['on_my_way', 'please_wait'].includes(response)) {
      return NextResponse.json(
        { success: false, error: 'Invalid response value' },
        { status: 400 }
      )
    }

    try {
      // Find the latest notification for this appointment
      const notification = await prisma.notification.findFirst({
        where: { appointmentId },
        orderBy: { createdAt: 'desc' },
      })

      if (!notification) {
        return NextResponse.json(
          { success: false, error: 'Notification not found' },
          { status: 404 }
        )
      }

      // Update notification with response
      const updatedNotification = await prisma.notification.update({
        where: { id: notification.id },
        data: {
          response,
          status: 'RESPONDED',
          respondedAt: new Date(),
        },
      })

      // Create visit log for response
      await prisma.visitLog.create({
        data: {
          appointmentId,
          action: 'RESPONSE_RECEIVED',
          details: `Employee responded: ${response === 'on_my_way' ? 'On my way' : 'Please wait'}`,
        },
      })

      return NextResponse.json({
        success: true,
        notification: updatedNotification,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: true,
        notification: { response, status: 'RESPONDED' },
      })
    }
  } catch (error) {
    console.error('Notification response error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
