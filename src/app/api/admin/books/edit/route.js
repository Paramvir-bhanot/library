import { NextResponse } from 'next/server';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';
import { isValidBookCategory } from '@/src/lib/bookCategories';

export async function PUT(request) {
  try {
    await connectDB();

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book id is required' },
        { status: 400 }
      );
    }

    const payload = await request.json();
    if (!payload.title || !payload.author) {
      return NextResponse.json(
        { success: false, message: 'Title and Author are required' },
        { status: 400 }
      );
    }

    if (payload.category && !isValidBookCategory(payload.category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category. Choose a valid knowlage.json category.' },
        { status: 400 }
      );
    }

    const updatedBook = await Book.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Book updated successfully', data: updatedBook },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error updating book' },
      { status: 500 }
    );
  }
}