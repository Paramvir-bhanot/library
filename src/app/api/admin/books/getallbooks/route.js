import { NextResponse } from 'next/server';
import connectDB from '@/lib/DBconnection';
import Book from '@/models/books';

export async function GET() {
  try {
    await connectDB();

    const books = await Book.find()
      .select('title category rating publishedDate downloads coverImage pdfUrl')
      .sort({ publishedDate: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: books.length,
        data: books,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching books:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Server error while fetching books',
      },
      { status: 500 }
    );
  }
}