import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWebhookMessage, createVisitorNotificationCard } from '@/lib/google-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visitorName, visitorCompany, purpose, employeeId } = body

    if (!visitorName || !purpose) {
      return NextResponse.json(
        { success: false, error: 'お名前と用件は必須です' },
        { status: 400 }
      )
    }

    const purposeLabels: Record<string, string> = {
      meeting: '打ち合わせ',
      interview: '面接',
      delivery: '配達',
      other: 'その他',
    }

    // Get employee info if selected
    let employeeName = '指定なし'
    if (employeeId) {
      try {
        const employee = await prisma.employee.findUnique({ where: { id: employeeId } })
        if (employee) employeeName = employee.name
      } catch (e) { /* DB not connected */ }
    }

    // Create visit record
    let visitId: string
    try {
      const visit = await prisma.visit.create({
        data: {
          visitorName,
          visitorCompany: visitorCompany || null,
          purpose,
          employeeId: employeeId || null,
          status: 'CHECKED_IN',
        },
      })
      visitId = visit.id
    } catch (dbError) {
      console.error('DB error:', dbError)
      visitId = `visit-${Date.now()}`
    }

    // Send Google Chat notification
    try {
      const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL
      if (webhookUrl) {
        const card = createVisitorNotificationCard({
          visitorName,
          visitorCompany,
          purpose: purposeLabels[purpose] || purpose,
          employeeName,
          appointmentId: visitId,
        })
        await sendWebhookMessage(webhookUrl, card)

        // Update status
        try {
          await prisma.visit.update({
            where: { id: visitId },
            data: { status: 'NOTIFIED', notifiedAt: new Date() },
          })
        } catch (e) { /* ignore */ }
      }
    } catch (chatError) {
      console.error('Google Chat failed:', chatError)
    }

    return NextResponse.json({
      success: true,
      appointmentId: visitId,
      employeeName,
    })
  } catch (error) {
    console.error('Check-in error:', error)
    return NextResponse.json(
      { success: false, error: '受付処理に失敗しました' },
      { status: 500 }
    )
  }
}
