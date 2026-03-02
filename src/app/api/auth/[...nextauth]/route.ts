import { NextResponse } from 'next/server'

// Admin authentication is simplified - no OAuth needed for reception system
// This endpoint exists to prevent 404 errors
export async function GET() {
  return NextResponse.json({ message: 'Auth not required for reception' })
}

export async function POST() {
  return NextResponse.json({ message: 'Auth not required for reception' })
}
