import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, email, department, position, isActive, sortOrder } = body

    const employee = await prisma.employee.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(department !== undefined && { department }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    })

    return NextResponse.json({ success: true, employee })
  } catch (error: any) {
    console.error('Update employee error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に使用されています' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: '更新に失敗しました' },
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

    await prisma.employee.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete employee error:', error)
    return NextResponse.json(
      { success: false, error: '削除に失敗しました' },
      { status: 500 }
    )
  }
}
