import { getServerSession } from 'next-auth';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';
import { authOptions } from '@/src/lib/auth';

export async function GET(req) {
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

    // Find user by email
    const user = await User.findOne({ email: session.user.email }).lean();

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return user profile data (exclude sensitive fields)
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
    console.error('Error fetching user profile:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch profile' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
