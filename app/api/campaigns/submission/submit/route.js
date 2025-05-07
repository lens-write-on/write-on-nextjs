import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma/client';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Log the POST data
    console.log('Submission data received:', body);
    
    // Extract the data from the request body
    const { submissionId, link, userWalletAddress, totalScore, result } = body;
    
    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: {
        walletAddress: userWalletAddress,
      },
    });

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found'
      }, { status: 404 });
    }

    // Update or create campaign participant record
    const updatedParticipant = await prisma.campaignParticipant.upsert({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId: submissionId
        }
      },
      update: {
        blog_url: link,
        total_score: totalScore,
        status: "PENDING",
        data: JSON.stringify(result),
      },
      create: {
        userId: user.id,
        campaignId: submissionId,
        blog_url: link,
        total_score: totalScore,
        status: "PENDING",
        data: JSON.stringify(result),
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: 'Submission saved successfully',
      data: updatedParticipant
    }, { status: 200 });
    
  } catch (_error) {
    console.error('Error processing submission:', _error);
    return NextResponse.json({ 
      success: false, 
      message: 'Failed to process submission',
      error: _error.message 
    }, { status: 500 });
  }
}