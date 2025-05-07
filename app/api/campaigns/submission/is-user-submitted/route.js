import { NextResponse } from "next/server";
import prisma from "@/lib/prisma/client";

export async function GET(request) {
  try {
    // Get query parameters from the URL
    const searchParams = request.nextUrl.searchParams;
    const campaignId = searchParams.get("campaignId");
    const address = searchParams.get("address");
    
    // Validate required parameters
    if (!campaignId || !address) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required parameters: campaignId or address" 
      }, { status: 400 });
    }

    // Get user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress: address }
    });

    // If user doesn't exist, they haven't submitted anything
    if (!user) {
      return NextResponse.json({ success: true, data: false });
    }

    // Check if the user has submitted to this campaign
    const submission = await prisma.campaignParticipant.findUnique({
      where: {
        userId_campaignId: {
          userId: user.id,
          campaignId: campaignId
        }
      }
    });

    // Return whether the submission exists or not
    return NextResponse.json({ 
      success: true, 
      data: !!submission 
    });
    
  } catch (error) {
    console.error("Error checking user submission status:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Server error while checking submission status" 
    }, { status: 500 });
  }
}