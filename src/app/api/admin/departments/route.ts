import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const locationId = searchParams.get('locationId')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const departments = await prisma.department.findMany({
        where: {
          organizationId,
          ...(locationId && { locationId }),
        },
        include: { location: true, employees: true },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        departments,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, departments: [] })
    }
  } catch (error) {
    console.error('Get departments error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, organizationId, locationId } = body

    if (!name || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const department = await prisma.department.create({
        data: {
          name,
          organizationId,
          locationId,
        },
        include: { location: true },
      })

      return NextResponse.json(
        { success: true, department },
        { status: 201 }
      )
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Department name already exists for this organization' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create department' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create department error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
