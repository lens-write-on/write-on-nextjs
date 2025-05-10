import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { verifyMessage } from 'viem';

// GET request to check if a user exists with the given wallet address
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const walletAddress = searchParams.get('walletAddress');
    
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false,
        message: 'Wallet address is required'
      }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        walletAddress: walletAddress
      }
    });

    return NextResponse.json({ 
      success: true,
      exists: !!user,
      user: user
    });
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ 
      success: false,
      message: 'An error occurred while checking user'
    }, { status: 500 });
  }
}

// POST request to create a new user
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const username = formData.get('username');
    const bio = formData.get('bio');
    const walletAddress = formData.get('walletAddress');
    const signature = formData.get('signature');
    const signedMessage = formData.get('signedMessage');
    const image = formData.get('image');
    
    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required'
      }, { status: 400 });
    }

    if (!signature || !signedMessage) {
      return NextResponse.json({ 
        success: false, 
        message: 'Signature verification failed: Missing signature data'
      }, { status: 400 });
    }
    
    // Verify the signature using viem
    try {
      const isValid = await verifyMessage({
        address: walletAddress,
        message: signedMessage,
        signature: signature,
      });
      
      if (!isValid) {
        return NextResponse.json({ 
          success: false, 
          message: 'Signature verification failed: Invalid signature'
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Signature verification failed: ' + error.message
      }, { status: 400 });
    }

    // Check if user already exists with this wallet
    const existingUserByWallet = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (existingUserByWallet) {
      return NextResponse.json({ 
        success: false, 
        message: 'User with this wallet address already exists'
      }, { status: 400 });
    }

    let imagePath = null;
    
    // Process image upload if provided
    if (image && image.size > 0) {
      const fileExtension = image.type.split('/')[1];
      const fileName = `${uuidv4()}.${fileExtension}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Save the file
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(`${uploadDir}/${fileName}`, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        username,
        bio,
        walletAddress,
        image: imagePath
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    console.error('Error creating user:', error);
    
    // Provide more detailed error messages
    if (error.code === 'P2002' && error.meta?.target?.includes('walletAddress')) {
      return NextResponse.json({
        success: false,
        message: 'This wallet address is already registered'
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while registering the user: ' + error.message
    }, { status: 500 });
  }
}

// PUT request to update an existing user
export async function PUT(request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const username = formData.get('username');
    const bio = formData.get('bio');
    const walletAddress = formData.get('walletAddress');
    const signature = formData.get('signature');
    const signedMessage = formData.get('signedMessage');
    const image = formData.get('image');
    
    // Validate required fields
    if (!walletAddress) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet address is required'
      }, { status: 400 });
    }

    if (!signature || !signedMessage) {
      return NextResponse.json({ 
        success: false, 
        message: 'Signature verification failed: Missing signature data'
      }, { status: 400 });
    }
    
    // Verify the signature using viem
    try {
      const isValid = await verifyMessage({
        address: walletAddress,
        message: signedMessage,
        signature: signature,
      });
      
      if (!isValid) {
        return NextResponse.json({ 
          success: false, 
          message: 'Signature verification failed: Invalid signature'
        }, { status: 400 });
      }
    } catch (error) {
      console.error('Signature verification error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Signature verification failed: ' + error.message
      }, { status: 400 });
    }

    // Find the existing user
    const existingUser = await prisma.user.findUnique({
      where: { walletAddress }
    });

    if (!existingUser) {
      return NextResponse.json({ 
        success: false, 
        message: 'User not found'
      }, { status: 404 });
    }

    let imagePath = existingUser.image;
    
    // Process image upload if provided
    if (image && typeof image !== 'string' && image.size > 0) {
      const fileExtension = image.type.split('/')[1];
      const fileName = `${uuidv4()}.${fileExtension}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      
      // Save the file
      const arrayBuffer = await image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(`${uploadDir}/${fileName}`, buffer);
      
      imagePath = `/uploads/${fileName}`;
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        username: username || existingUser.username,
        bio: bio !== undefined ? bio : existingUser.bio,
        image: imagePath
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'User profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'An error occurred while updating the user: ' + error.message
    }, { status: 500 });
  }
}