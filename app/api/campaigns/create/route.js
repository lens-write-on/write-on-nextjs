import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Handle POST request for creating a new campaign
 * @param {Request} request - The incoming request object
 */
export async function POST(request) {
  try {
    // Parse the form data from the request
    const formData = await request.formData();

    // Extract campaign data and validation fields
    const title = formData.get('title');
    const description = formData.get('description');
    const aiDescription = formData.get('aiDescription');
    const keywords = formData.get('keywords');
    const rewardPool = parseFloat(formData.get('rewardPool')) || 0;
    const targetAudience = formData.get('targetAudience');
    const CtaGoal = formData.get('CtaGoal');
    const startDateStr = formData.get('startDate');
    const endDateStr = formData.get('endDate');
    const walletAddress = formData.get('walletAddress');
    const txHash = formData.get('txHash');
    const coverImage = formData.get('coverImage');
    const campaignAddress = formData.get('campaignAddress');

    // Validate required fields
    if (!title || !description || !startDateStr || !endDateStr || !walletAddress || !txHash || !campaignAddress) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Find the user by wallet address
    const user = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    // Parse dates
    let startDate, endDate;
    try {
      // Handle ISO string dates sent from frontend
      startDate = new Date(startDateStr);
      endDate = new Date(endDateStr);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }
    } catch (error) {
      console.error('Date parsing error:', startDateStr, endDateStr, error);
      return NextResponse.json({
        success: false,
        message: `Invalid date format: ${error.message}`
      }, { status: 400 });
    }

    // Handle image upload
    let imagePath = null;
    if (coverImage && coverImage.size > 0) {
      const fileExtension = coverImage.type.split('/')[1];
      const fileName = `${uuidv4()}.${fileExtension}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Save the file
      const arrayBuffer = await coverImage.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(`${uploadDir}/${fileName}`, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }

    // Create campaign in database
    const campaign = await prisma.campaign.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        aiDescription,
        keywords,
        targetAudience,
        CtaGoal,
        coverImage: imagePath,
        rewardPool,
        txHash,
        campaignAddress,
        ownerId: user.id
      }
    });

    // Return the created campaign with owner information
    return NextResponse.json({
      success: true,
      message: 'Campaign created successfully',
      campaign: {
        ...campaign,
        owner: {
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress
        }
      }
    });
    
  } catch (error) {
    console.error("Error creating campaign:", error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create campaign',
      error: error.message
    }, { status: 500 });
  }
}