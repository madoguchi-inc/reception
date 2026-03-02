import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const locationId = searchParams.get('locationId')
    const isActive = searchParams.get('isActive')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const rooms = await prisma.meetingRoom.findMany({
        where: {
          organizationId,
          ...(locationId && { locationId }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
        },
        include: { location: true },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        rooms,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, rooms: [] })
    }
  } catch (error) {
    console.error('Get rooms error:', error)
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
      name,
      capacity,
      floor,
      locationId,
      organizationId,
      googleCalendarId,
      facilities,
    } = body

    if (!name || !locationId || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const room = await prisma.meetingRoom.create({
        data: {
          name,
          capacity: capacity || 1,
          floor,
          locationId,
          organizationId,
          googleCalendarId,
          facilities: facilities || [],
        },
        include: { location: true },
      })

      return NextResponse.json(
        { success: true, room },
        { status: 201 }
      )
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Room name already exists in this location' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create room' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create room error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
