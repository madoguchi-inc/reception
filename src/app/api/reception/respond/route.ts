import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendWebhookMessage } from '@/lib/google-chat'

const actionLabels: Record<string, string> = {
  on_my_way: '✅ 向かいます',
  please_wait: '🕐 少々お待ちください',
  call: '📞 通話で対応',
}

export async function POST(request: NextRequest) {
  try {
    const { visitId, action } = await request.json()

    if (!visitId || !action) {
      return NextResponse.json(
        { success: false, error: 'visitId と action は必須です' },
        { status: 400 }
      )
    }

    const validActions = ['on_my_way', 'please_wait', 'call', 'call_ended']
    if (!validActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: '無効なアクションです' },
        { status: 400 }
      )
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {
      responseAt: new Date(),
    }

    if (action === 'call') {
      updateData.response = 'on_my_way'
      updateData.callStatus = 'ringing'
      updateData.callStartedAt = new Date()
    } else if (action === 'call_ended') {
      updateData.callStatus = 'ended'
      updateData.callEndedAt = new Date()
    } else {
      updateData.response = action
    }

    // DB更新 - エラーは握り潰さずに返す
    const visit = await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
      select: {
        visitorName: true,
        visitorCompany: true,
        purpose: true,
      },
    })

    // Google Chat に対応済み通知を送信（call_ended 以外）
    if (action !== 'call_ended') {
      try {
        const webhookUrl = process.env.GOOGLE_CHAT_WEBHOOK_URL
        if (webhookUrl) {
          const purposeLabels: Record<string, string> = {
            meeting: '打ち合わせ',
            interview: '面接',
            delivery: '配達',
            other: 'その他',
          }
          const visitorInfo = `${visit.visitorName}様${visit.visitorCompany ? ` (${visit.visitorCompany})` : ''}`
          const purposeText = purposeLabels[visit.purpose] || visit.purpose
          const actionText = actionLabels[action] || action
          const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Tokyo' })

          await sendWebhookMessage(webhookUrl, {
            text: `${actionText}\n📋 ${visitorInfo}【${purposeText}】の来訪に対応しました（${time}）`,
          })
        }
      } catch (chatError) {
        // Google Chat 通知失敗してもレスポンス自体は成功扱い
        console.error('Google Chat notification failed:', chatError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Respond error:', error)
    const message = error instanceof Error ? error.message : '処理に失敗しました'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
