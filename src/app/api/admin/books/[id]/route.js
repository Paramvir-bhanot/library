import { NextResponse } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';
import { isValidBookCategory } from '@/src/lib/bookCategories';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

function parseBookFields(formData) {
  const parsed = {};
  const fields = [
    'title',
    'author',
    'description',
    'category',
    'price',
    'publishedDate',
    'pages',
    'language',
    'rating',
  ];

  fields.forEach((field) => {
    const value = formData.get(field);
    if (value === null || value === '') {
      return;
    }

    if (field === 'price' || field === 'pages' || field === 'rating') {
      parsed[field] = Number(value);
      return;
    }

    if (field === 'publishedDate') {
      parsed[field] = new Date(value);
      return;
    }

    parsed[field] = value;
  });

  return parsed;
}

async function saveCoverImage(file) {
  if (!file || file.size === 0) {
    return null;
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }

  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const extension = path.extname(file.name || '') || '.jpg';
  const fileName = `cover-${uniqueSuffix}${extension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

async function removeLocalUpload(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\//, ''));
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: book }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching book' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const payload = parseBookFields(formData);

    if (!payload.title || !payload.author) {
      return NextResponse.json(
        { success: false, message: 'Title and Author are required' },
        { status: 400 }
      );
    }

    if (payload.category && !isValidBookCategory(payload.category)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid category. Choose a category from knowlage.json options.',
        },
        { status: 400 }
      );
    }

    const coverImage = formData.get('coverImage');
    if (coverImage && coverImage.size > 0) {
      const newCover = await saveCoverImage(coverImage);
      await removeLocalUpload(existingBook.coverImage);
      payload.coverImage = newCover;
    }

    const updatedBook = await Book.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      { success: true, message: 'Book updated successfully', data: updatedBook },
      { status: 200 }
    );
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Error updating book' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, { params }) {
  try {
    const { id } = await params;
    await connectDB();

    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    await removeLocalUpload(existingBook.coverImage);
    await removeLocalUpload(existingBook.pdfUrl);
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