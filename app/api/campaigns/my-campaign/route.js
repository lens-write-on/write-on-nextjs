import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

/**
 * Handle GET request for fetching campaigns created by the current user
 * @param {Request} request - The incoming request object
 */
export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User ID is required"
      }, { status: 400 });
    }
    
    // Fetch campaigns owned by the user
    const campaigns = await prisma.campaign.findMany({
      where: {
        ownerId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        participants: true,
        owner: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
    });
    
    // Format response data to match frontend expectations
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      participants: campaign.participants.length,
      endDate: campaign.endDate,
      image: campaign.coverImage || null,
      startDate: campaign.startDate,
      keywords: campaign.keywords,
      owner: campaign.owner,
      rewardPool: campaign.rewardPool,
      status: campaign.status,
      campaignAddress: campaign.campaignAddress,
      txHash: campaign.txHash
    }));
    
    // Return successful response
    return NextResponse.json({
      success: true,
      data: formattedCampaigns
    });
    
  } catch (error) {
    console.error("Error fetching user campaigns:", error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to fetch user campaigns",
      error: error.message
    }, { status: 500 });
  }
}