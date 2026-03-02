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
        { success: false, error: 'Department ID required' },
        { status: 400 }
      )
    }

    try {
      const department = await prisma.department.update({
        where: { id },
        data: body,
        include: { location: true, employees: true },
      })

      return NextResponse.json({ success: true, department })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Department not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update department' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update department error:', error)
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
        { success: false, error: 'Department ID required' },
        { status: 400 }
      )
    }

    try {
      // Check if department has employees
      const employeeCount = await prisma.employee.count({
        where: { departmentId: id },
      })

      if (employeeCount > 0) {
        return NextResponse.json(
          { success: false, error: 'Cannot delete department with active employees' },
          { status: 409 }
        )
      }

      await prisma.department.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Department deleted',
      })
    } catch (dbError: any) {
      console.error('Database error:', dbError)
      if (dbError.code === 'P2025') {
        return NextResponse.json(
          { success: false, error: 'Department not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to delete department' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
