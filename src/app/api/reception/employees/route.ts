import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Mock employees as fallback
const MOCK_EMPLOYEES = [
  { id: 'mock-1', name: '田中 太郎', department: '営業部' },
  { id: 'mock-2', name: '佐藤 花子', department: '営業部' },
  { id: 'mock-3', name: '鈴木 次郎', department: '企画部' },
  { id: 'mock-4', name: '高橋 美咲', department: '開発部' },
]

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        department: true,
        position: true,
      },
      orderBy: [
        { sortOrder: 'asc' },
        { department: 'asc' },
        { name: 'asc' },
      ],
    })

    if (employees.length === 0) {
      // Return mock data if no employees in DB
      return NextResponse.json({ success: true, employees: MOCK_EMPLOYEES })
    }

    return NextResponse.json({ success: true, employees })
  } catch (dbError) {
    console.error('DB error fetching employees:', dbError)
    return NextResponse.json({ success: true, employees: MOCK_EMPLOYEES })
  }
}
