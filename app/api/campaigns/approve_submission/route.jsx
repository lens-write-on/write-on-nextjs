import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { campaignId, submissionId, walletSigner } = body;

    if (!campaignId || !submissionId || !walletSigner) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // 1. Get the campaign and verify ownership
    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { owner: true }
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    // Check if the wallet signer is the owner of the campaign
    if (campaign.owner.walletAddress.toLowerCase() !== walletSigner.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized: Only campaign owner can approve submissions" },
        { status: 403 }
      );
    }

    // 2. Update the CampaignParticipant status to "ACCEPTED"
    const updatedSubmission = await prisma.campaignParticipant.update({
      where: {
        id: submissionId,
        campaignId: campaignId
      },
      data: {
        status: "ACCEPTED",
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      message: "Submission approved successfully",
      data: updatedSubmission
    });
  } catch (error) {
    console.error("Error approving submission:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}