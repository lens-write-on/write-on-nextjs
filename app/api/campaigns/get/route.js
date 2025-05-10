import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, message: 'Campaign ID is required' }, { status: 400 })
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        owner: true,
        participants: {
          include: {
            user: true
          }
        }
      }
    })

    if (!campaign) {
      return NextResponse.json({ success: false, message: 'Campaign not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: campaign })
  } catch (error) {
    console.error('Error fetching campaign:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}