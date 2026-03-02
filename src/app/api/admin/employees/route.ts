import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')
    const departmentId = searchParams.get('departmentId')
    const search = searchParams.get('search')
    const isActive = searchParams.get('isActive')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const employees = await prisma.employee.findMany({
        where: {
          organizationId,
          ...(departmentId && { departmentId }),
          ...(isActive !== null && { isActive: isActive === 'true' }),
          ...(search && {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
            ],
          }),
        },
        include: { department: true, location: true },
        orderBy: { createdAt: 'desc' },
      })

      return NextResponse.json({
        success: true,
        employees,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({ success: true, employees: [] })
    }
  } catch (error) {
    console.error('Get employees error:', error)
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
      email,
      phone,
      departmentId,
      organizationId,
      locationId,
      position,
      googleChatSpaceId,
    } = body

    if (!name || !email || !departmentId || !organizationId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    try {
      const employee = await prisma.employee.create({
        data: {
          name,
          email,
          phone,
          departmentId,
          organizationId,
          locationId,
          position,
          googleChatSpaceId,
        },
        include: { department: true, location: true },
      })

      return NextResponse.json(
        { success: true, employee },
        { status: 201 }
      )
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { success: false, error: 'Email already exists for this organization' },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create employee' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Create employee error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
