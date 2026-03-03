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

    try {
      await prisma.visit.update({
        where: { id: visitId },
        data: updateData,
      })
    } catch (dbError) {
      console.error('DB update error:', dbError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Respond error:', error)
    return NextResponse.json(
      { success: false, error: '処理に失敗しました' },
      { status: 500 }
    )
  }
}
