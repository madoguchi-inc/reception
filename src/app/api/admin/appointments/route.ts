import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { generateQrToken } from '@/lib/utils'
import { generateQRCodeDataUrl } from '@/lib/qrcode'
import { sendInvitationEmail, createTransporter } from '@/lib/email'
import { createCalendarEvent } from '@/lib/google-calendar'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const appointments = await prisma.appointment.findMany({
        where: {
          organizationId,
          ...(status && { status: status as any }),
          ...(dateFrom && {
            scheduledAt: { gte: new Date(dateFrom) },
          }),
          ...(dateTo && {
            scheduledAt: { lte: new Date(dateTo) },
          }),
          ...(search && {
            OR: [
              { visitorName: { contains: search, mode: 'insensitive' } },
              { visitorEmail: { contains: search, mode: 'insensitive' } },
              { visitorCompany: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: {
          employee: true,
          meetingRoom: true,
          location: true,
        },
        orderBy: { scheduledAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        appointments,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, appointments: [] })
    }
  } catch (error) {
    console.error('Get appointments error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      visitorName,
      visitorCompany,
      visitorEmail,
      visitorPhone,
      purpose,
      employeeId,
      organizationId,
      locationId,
      meetingRoomId,
      scheduledAt,
      notes,
    } = body

    if (!visitorName || !purpose || !employeeId || !organizationId || !locationId || !scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const qrToken = generateQrToken()
      const scheduledDate = new Date(scheduledAt)

      const appointment = await prisma.appointment.create({
        data: {
          visitorName,
          visitorCompany,
          visitorEmail,
          visitorPhone,
          purpose: purpose as any,
          employeeId,
          organizationId,
          locationId,
          meetingRoomId,
          qrToken,
          scheduledAt: scheduledDate,
          notes,
          status: 'SCHEDULED',
        },
        include: {
          employee: true,
          meetingRoom: true,
          location: true,
        },
      })

      // Send invitation email if email is provided
      if (visitorEmail) {
        try {
          const qrCodeDataUrl = await generateQRCodeDataUrl(qrToken)
          const settings = await prisma.organizationSettings.findUnique({
            where: { organizationId },
          })

          if (settings?.smtpHost && settings?.smtpPort && settings?.smtpFrom) {
            const emailConfig = {
              host: settings.smtpHost,
              port: settings.smtpPort,
              user: settings.smtpUser || '',
              pass: settings.smtpPass || '',
              from: settings.smtpFrom,
            }

            try {
              await sendInvitationEmail(emailConfig, {
                to: visitorEmail,
                visitorName,
                hostName: appointment.employee.name,
                hostCompany: (await prisma.organization.findUnique({
                  where: { id: organizationId },
                }))?.name || '',
                scheduledAt: scheduledDate,
                location: appointment.location.name,
                qrCodeDataUrl,
                meetingRoom: appointment.meetingRoom?.name,
                notes,
              })
            } catch (emailError) {
              console.error('Failed to send invitation email:', emailError)
            }
          }
        } catch (qrError) {
          console.error('Failed to generate QR code:', qrError)
        }
      }

      // Try to create Google Calendar event
      try {
        const employee = appointment.employee
        if (employee.googleChatSpaceId) {
          // This would require access token - skip for now
          // const endTime = new Date(scheduledDate.getTime() + 60 * 60 * 1000)
          // await createCalendarEvent(accessToken, {
          //   summary: `Visit: ${visitorName}`,
          //   description: notes,
          //   startTime: scheduledDate,
          //   endTime,
          //   attendees: [employee.email],
          //   location: appointment.location.name,
          // })
        }
      } catch (calError) {
        console.error('Failed to create calendar event:', calError)
      }

      return NextResponse.json(
        {
          success: true,
          appointment: {
            ...appointment,
            qrToken,
          },
        },
        { status: 201 }
      )
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to create appointment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
