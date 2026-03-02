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
        { success: false, error: 'Employee ID required' },
        { status: 400 }
      )
    }

    try {
      const employee = await prisma.employee.findUnique({
        where: { id },
        include: { department: true, location: true, appointments: true },
      })

      if (!employee) {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        )
      }

      return NextResponse.json({ success: true, employee })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch employee' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Get employee error:', error)
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
        { success: false, error: 'Employee ID required' },
        { status: 400 }
      )
    }

    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: body,
        include: { department: true, location: true },
      })

      return NextResponse.json({ success: true, employee })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update employee' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update employee error:', error)
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
        { success: false, error: 'Employee ID required' },
        { status: 400 }
      )
    }

    try {
      const employee = await prisma.employee.update({
        where: { id },
        data: { isActive: false },
        include: { department: true, location: true },
      })

      return NextResponse.json({
        success: true,
        message: 'Employee soft-deleted',
        employee,
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Employee not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to delete employee' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
