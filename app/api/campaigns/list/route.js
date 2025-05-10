import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

/**
 * Handle GET request for fetching campaigns
 * @param {Request} request - The incoming request object
 */
export async function GET(request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const skip = (page - 1) * limit;
    const featured = url.searchParams.get('featured');
    
    // Prepare filter conditions
    const where = {};
    
    // Add featured filter if specified
    if (featured === 'true') {
      where.featured = true;
    } else if (featured === 'false') {
      where.featured = false;
    }
    
    // Fetch campaigns from database with pagination
    const campaigns = await prisma.campaign.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        owner: {
          select: {
            id: true,
            username: true,
            walletAddress: true,
          },
        },
      },
      include: {
        _count: {
          select: { participants: true },
        },
      },



    });
    
    // Get total count for pagination
    const total = await prisma.campaign.count({ where });
    
    // Format response data to match frontend expectations
    console.log(campaigns[1])
    const formattedCampaigns = campaigns.map(campaign => ({
      id: campaign.id,
      title: campaign.title,
      description: campaign.description,
      participants: campaign._count.participants || 0, // Default to 0 if null
      deadline: campaign.endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      endDate: campaign.endDate,
      image: campaign.coverImage || null,
      featured: campaign.featured || false,
      // Additional fields that might be useful
      startDate: campaign.startDate,
      keywords: campaign.keywords,
      owner: campaign.owner,
      rewardPool: campaign.rewardPool,
    }));
    
    // Return successful response with pagination metadata
    return NextResponse.json({
      success: true,
      data: formattedCampaigns,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    
    // Return error response
    return NextResponse.json({
      success: false,
      message: "Failed to fetch campaigns",
      error: error.message
    }, { status: 500 });
  }
}