import { NextResponse } from 'next/server';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import path from 'path';
import connectDB from '@/src/lib/DBconnection';
import Book from '@/src/models/books';

async function removeLocalUpload(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\//, ''));
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

export async function DELETE(request) {
  try {
    await connectDB();

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book id is required' },
        { status: 400 }
      );
    }

    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    await removeLocalUpload(book.coverImage);
    await removeLocalUpload(book.pdfUrl);
    await Book.findByIdAndDelete(id);

    return NextResponse.json(
      { success: true, message: 'Book deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting book' },
      { status: 500 }
    );
  }
}