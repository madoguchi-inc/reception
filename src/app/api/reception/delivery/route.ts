import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWebhookMessage } from '@/lib/google-chat'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { carrier } = body

    if (!carrier) {
      return NextResponse.json(
        { success: false, error: '配送業者を選択してください' },
        { status: 400 }
      )
    }

    const carrierLabels: Record<string, string> = {
      yamato: 'ヤマト運輸',
      sagawa: '佐川急便',
      japanpost: '日本郵便',
      other_delivery: 'その他',
    }
    const carrierName = carrierLabels[carrier] || carrier

    // Create visit record
    let visitId: string
    try {
      const visit = await prisma.visit.create({
        data: {
          visitorName: `配達: ${carrierName}`,
          visitorCompany: carrierName,
          purpose: 'delivery',
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
        const now = new Date()
        const timeStr = now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
        const message = {
          text: `📦 *配達受付*\n\n配送業者: ${carrierName}\n受付時刻: ${timeStr}\n\n荷物の受け取りをお願いします。`,
        }
        await sendWebhookMessage(webhookUrl, message)

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
      message: `${carrierName} の配達を受付しました`,
    })
  } catch (error) {
    console.error('Delivery error:', error)
    return NextResponse.json(
      { success: false, error: '配達受付に失敗しました' },
      { status: 500 }
    )
  }
}
