import { getServerSession } from 'next-auth';
import connectDB from '@/src/lib/DBconnection';
import User from '@/src/models/user';
import { authOptions } from '@/src/lib/auth';

// Add or remove a book from liked books
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.email) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    const { bookId, action } = await req.json(); // action: 'add' or 'remove'

    if (!bookId || !action) {
      return new Response(
        JSON.stringify({ error: 'Missing bookId or action' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let user;
    if (action === 'add') {
      user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $addToSet: { likedBooks: bookId } },
        { new: true }
      ).lean();
    } else if (action === 'remove') {
      user = await User.findOneAndUpdate(
        { email: session.user.email },
        { $pull: { likedBooks: bookId } },
        { new: true }
      ).lean();
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ likedBooks: user.likedBooks }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error managing liked books:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to manage liked books' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
