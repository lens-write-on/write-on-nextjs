import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma/client'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const campaignId = searchParams.get('campaignId')

    if (!campaignId) {
      return NextResponse.json({ 
        success: false, 
        message: 'Campaign ID is required' 
      }, { status: 400 })
    }

    // Get all participants for the campaign with their user data
    const participants = await prisma.campaignParticipant.findMany({
      where: {
        campaignId: campaignId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
            image: true,
          }
        }
      },
      orderBy: {
        total_score: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: participants
    })

  } catch (error) {
    console.error('Error fetching campaign submissions:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch campaign submissions', 
        error: error.message 
      }, 
      { status: 500 }
    )
  }
}