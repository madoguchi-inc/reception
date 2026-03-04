import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    await prisma.visit.update({
      where: { id: visitId },
      data: updateData,
    })

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
