import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID required' },
        { status: 400 }
      )
    }

    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id },
        include: {
          employee: { include: { department: true } },
          meetingRoom: true,
          location: true,
          visitLogs: { orderBy: { createdAt: 'desc' } },
          notifications: { orderBy: { createdAt: 'desc' } },
        },
      })

      if (!appointment) {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, appointment })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch appointment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Get appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Appointment ID required' },
        { status: 400 }
      )
    }

    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: body,
        include: {
          employee: { include: { department: true } },
          meetingRoom: true,
          location: true,
        },
      })

      return NextResponse.json({ success: true, appointment })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update appointment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update appointment error:', error)
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
        { success: false, error: 'Appointment ID required' },
        { status: 400 }
      )
    }

    try {
      const appointment = await prisma.appointment.update({
        where: { id },
        data: { status: 'CANCELLED' },
        include: {
          employee: { include: { department: true } },
          meetingRoom: true,
          location: true,
        },
      })

      // Create visit log for cancellation
      await prisma.visitLog.create({
        data: {
          appointmentId: id,
          action: 'CANCELLED',
          details: 'Appointment cancelled',
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Appointment cancelled',
        appointment,
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Appointment not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to cancel appointment' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete appointment error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
