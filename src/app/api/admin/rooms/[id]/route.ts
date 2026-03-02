import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      )
    }

    try {
      const room = await prisma.meetingRoom.update({
        where: { id },
        data: body,
        include: { location: true },
      })

      return NextResponse.json({ success: true, room })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update room error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Room ID required' },
        { status: 400 }
      )
    }

    try {
      const room = await prisma.meetingRoom.update({
        where: { id },
        data: { isActive: false },
        include: { location: true },
      })

      return NextResponse.json({
        success: true,
        message: 'Room soft-deleted',
        room,
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to delete room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete room error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
