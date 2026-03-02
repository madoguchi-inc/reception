import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const search = request.nextUrl.searchParams.get('search')

    const employees = await prisma.employee.findMany({
      where: search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { department: { contains: search, mode: 'insensitive' } },
        ],
      } : undefined,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json({ success: true, employees })
  } catch (error: any) {
    console.error('Get employees error:', error)
    return NextResponse.json({ success: false, error: error.message || 'DB connection failed', employees: [] })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, department, position } = body

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: '名前とメールアドレスは必須です' },
        { status: 400 }
      )
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        email,
        department: department || '',
        position: position || null,
      },
    })

    return NextResponse.json({ success: true, employee }, { status: 201 })
  } catch (error: any) {
    console.error('Create employee error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'このメールアドレスは既に登録されています' },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { success: false, error: '社員の登録に失敗しました' },
      { status: 500 }
    )
  }
}
