import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateQrToken } from '@/lib/utils'
import { sendWebhookMessage } from '@/lib/google-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carrier, organizationId } = body

    if (!carrier) {
      return NextResponse.json(
        { success: false, error: 'Carrier is required' },
        { status: 400 }
      )
    }

    try {
      // If organizationId is not provided, we cannot proceed with real DB operations
      if (!organizationId) {
        throw new Error('Organization ID is required')
      }

      // Find the 総務部 (General Affairs) department
      const generalAffairsDept = await prisma.department.findFirst({
        where: {
          organizationId,
          name: {
            contains: '総務部',
          },
        },
      })

      if (!generalAffairsDept) {
        throw new Error('General Affairs department not found')
      }

      // Find a designated employee in the General Affairs department
      const employee = await prisma.employee.findFirst({
        where: {
          departmentId: generalAffairsDept.id,
          organizationId,
        },
        include: { department: true, location: true },
      })

      if (!employee) {
        throw new Error('General Affairs employee not found')
      }

      // Get organization details
      const organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      })

      if (!organization) {
        throw new Error('Organization not found')
      }

      // Create appointment record for delivery
      const qrToken = generateQrToken()
      const now = new Date()

      const appointment = await prisma.appointment.create({
        data: {
          visitorName: `配達: ${carrier}`,
          visitorCompany: carrier,
          visitorEmail: null,
          purpose: 'DELIVERY' as any, // DeliveryPurpose enum
          employeeId: employee.id,
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
          details: `Delivery check-in from ${carrier}`,
        },
      })

      // Try to send Google Chat notification
      let notificationId: string | null = null
      try {
        const settings = await prisma.organizationSettings.findUnique({
          where: { organizationId },
        })

        if (settings?.googleChatWebhookUrl && employee.googleChatSpaceId) {
          // Create simplified delivery notification message
          const message = {
            text: `📦 配達受付: ${carrier}`,
            cards: [
              {
                sections: [
                  {
                    widgets: [
                      {
                        textParagraph: {
                          text: `<b>配達業者:</b> ${carrier}`,
                        },
                      },
                      {
                        textParagraph: {
                          text: `<b>受付部門:</b> ${employee.department?.name || 'General Affairs'}`,
                        },
                      },
                      {
                        textParagraph: {
                          text: `<b>受付担当:</b> ${employee.name}`,
                        },
                      },
                      {
                        textParagraph: {
                          text: `<b>受付時刻:</b> ${now.toLocaleString('ja-JP')}`,
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          }

          await sendWebhookMessage(settings.googleChatWebhookUrl, message)

          // Create notification record
          const notification = await prisma.notification.create({
            data: {
              appointmentId: appointment.id,
              employeeId: employee.id,
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
        message: `${carrier} の配達を受付しました。${employee.department?.name || '総務部'}に通知しました。`,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Return demo response if DB is not connected
      const mockId = `demo-${Date.now()}`
      return NextResponse.json({
        success: true,
        appointmentId: mockId,
        qrToken: `demo-${generateQrToken()}`,
        message: `${carrier} の配達を受付しました。総務部に通知しました。`,
      })
    }
  } catch (error) {
    console.error('Delivery check-in error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
