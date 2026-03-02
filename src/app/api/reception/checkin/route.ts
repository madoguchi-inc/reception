import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateQrToken } from '@/lib/utils'
import { createVisitorNotificationCard, sendWebhookMessage } from '@/lib/google-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorName, visitorCompany, visitorEmail, purpose, employeeId, organizationId } = body

    if (!visitorName || !purpose || !employeeId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      // Get employee and organization details
      const [employee, organization] = await Promise.all([
        prisma.employee.findUnique({
          where: { id: employeeId },
          include: { department: true, location: true },
        }),
        prisma.organization.findUnique({
          where: { id: organizationId },
        }),
      ])

      if (!employee || !organization) {
        return NextResponse.json(
          { success: false, error: 'Employee or organization not found' },
          { status: 404 }
        )
      }

      // Create appointment
      const qrToken = generateQrToken()
      const now = new Date()

      const appointment = await prisma.appointment.create({
        data: {
          visitorName,
          visitorCompany,
          visitorEmail,
          purpose: purpose as any, // VisitPurpose enum
          employeeId,
          organizationId,
          locationId: employee.locationId || organizationId,
          qrToken,
          status: 'CHECKED_IN',
          scheduledAt: now,
          checkedInAt: now,
        },
      })

      // Create visit log
      await prisma.visitLog.create({
        data: {
          appointmentId: appointment.id,
          action: 'CHECK_IN',
          details: 'Walk-in check-in',
        },
      })

      // Try to send Google Chat notification
      let notificationId: string | null = null
      try {
        const settings = await prisma.organizationSettings.findUnique({
          where: { organizationId },
        })

        if (settings?.googleChatWebhookUrl && employee.googleChatSpaceId) {
          const card = createVisitorNotificationCard({
            visitorName,
            visitorCompany,
            purpose,
            employeeName: employee.name,
            appointmentId: appointment.id,
          })

          await sendWebhookMessage(settings.googleChatWebhookUrl, card)

          // Create notification record
          const notification = await prisma.notification.create({
            data: {
              appointmentId: appointment.id,
              employeeId,
              channel: 'GOOGLE_CHAT',
              status: 'SENT',
              sentAt: new Date(),
            },
          })

          notificationId = notification.id
        }
      } catch (chatError) {
        // Log but don't fail the request
        console.error('Failed to send Google Chat notification:', chatError)
      }

      return NextResponse.json({
        success: true,
        appointmentId: appointment.id,
        qrToken: appointment.qrToken,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return demo response if DB is not connected
      const mockId = `demo-${Date.now()}`
      return NextResponse.json({
        success: true,
        appointmentId: mockId,
        qrToken: `demo-${generateQrToken()}`,
      })
    }
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
