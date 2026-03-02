import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const organizationId = searchParams.get('organizationId')

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      let settings = await prisma.organizationSettings.findUnique({
        where: { organizationId },
      })

      // Create default settings if they don't exist
      if (!settings) {
        settings = await prisma.organizationSettings.create({
          data: {
            organizationId,
            defaultLanguage: 'ja',
            allowedPurposes: ['MEETING', 'INTERVIEW', 'DELIVERY', 'OTHER'],
            notificationChannels: ['GOOGLE_CHAT'],
          },
        })
      }

      return NextResponse.json({
        success: true,
        settings,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json({
        success: true,
        settings: {
          defaultLanguage: 'ja',
          allowedPurposes: ['MEETING', 'INTERVIEW', 'DELIVERY', 'OTHER'],
          notificationChannels: ['GOOGLE_CHAT'],
        },
      })
    }
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { organizationId, ...updateData } = body

    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: 'organizationId required' },
        { status: 400 }
      )
    }

    try {
      const settings = await prisma.organizationSettings.upsert({
        where: { organizationId },
        update: updateData,
        create: {
          organizationId,
          ...updateData,
        },
      })

      return NextResponse.json({
        success: true,
        settings,
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to update settings' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
