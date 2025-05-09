import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';

import axios from "axios";

async function checkScore(params) {
  let { contentUrl, campaignDescription, campaign_keywords, target_audience, CTA_goal } = params;
  console.log("params", params);  
  try {

    const params = {};
    if (contentUrl) params.contentUrl = contentUrl;
    if (campaignDescription) params.campaignDescription = campaignDescription;
    if (campaign_keywords) params.campaign_keywords = campaign_keywords;
    if (target_audience) params.target_audience = target_audience;
    if (CTA_goal) params.CTA_goal = CTA_goal;
    console.log("vvv params");
    console.log(params);

    const response = await axios.get("https://api.writeon.space/api/getscore", { params });

    return response.data;
  } catch (error) {
    console.error("Error checking score:", error);
    throw new Error("Failed to check score. Please try again later.");
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { submissionId, link, userWalletAddress } = body;

    if (!submissionId || !link) {
      return NextResponse.json({ error: "Submission ID and link are required." }, { status: 400 });
    }

    // Check if the campaign exists in the database
    const campaign = await prisma.campaign.findUnique({
      where: { id: submissionId },
    });

    const user = await prisma.user.findUnique({
      where: { walletAddress: userWalletAddress },
    });


    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }
    if(!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }
    console.log(typeof campaign.aiDescription, campaign.aiDescription)
    console.log(campaign.description);

    let description = '';
    if(typeof campaign.aiDescription === 'string' && campaign.aiDescription.length > 0) {
      description = campaign.aiDescription;
    } else{
      description = campaign.description;
    }

    const result = await checkScore({
      contentUrl: link,
      campaignDescription: description,
      campaign_keywords: campaign.keywords,
      target_audience: campaign.targetAudience,
      CTA_goal: campaign.callToAction,
    });

    // For now, just return the received data
    return NextResponse.json({ submissionId, link, result: {...result?.data?.result} });
  } catch (_error) {
    return NextResponse.json({ error: "An error occurred while processing the request." }, { status: 500 });
  }
}