import { getServerSession } from 'next-auth';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';
import { authOptions } from '@/src/lib/auth';

export async function PUT(req) {
  try {
    // Get session to authenticate user
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Connect to database
    await connectDB();

    // Get request body
    const body = await req.json();

    // Validate input - only allow specific fields to be updated
    const allowedFields = ['name', 'subject', 'degree', 'medium', 'image'];
    const updateData = {};

    allowedFields.forEach((field) => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update user
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true, runValidators: true }
    ).lean();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return updated user profile data
    const profileData = {
      name: user.name,
      email: user.email,
      image: user.image,
      provider: user.provider,
      degree: user.degree,
      subject: user.subject,
      medium: user.medium,
      likedBooks: user.likedBooks || [],
      savedNotes: user.savedNotes || [],
      isSubscribed: user.isSubscribed,
      applicantId: user.applicantId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return new Response(JSON.stringify(profileData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to update profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
