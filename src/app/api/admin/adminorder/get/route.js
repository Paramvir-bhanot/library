import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import User from '../../../../models/user'; // Adjust path based on your project structure

// Database connection function
async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/yourdb');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export async function GET(request) {
  try {
    // Connect to database
    await connectDB();

    // Get query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 10;
    const skip = (page - 1) * limit;

    // Fetch users with pagination
    const users = await User.find()
      .select('-password') // Exclude password field
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }); // Sort by newest first

    // Get total count for pagination
    const total = await User.countDocuments();
    const pages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch users',
      },
      { status: 500 }
    );
  }
}