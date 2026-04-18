import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

function validateId(id) {
  if (!id) {
    return 'Book ID is required';
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return 'Invalid book ID';
  }
  return null;
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

export async function GET(request, { params }) {
  try {
    await connectDB();

    const id = params?.id;
    const idError = validateId(id);
    if (idError) {
      return NextResponse.json({ success: false, message: idError }, { status: 400 });
    }

    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: book }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching book' },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const id = params?.id;
    const idError = validateId(id);
    if (idError) {
      return NextResponse.json({ success: false, message: idError }, { status: 400 });
    }

    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    const formData = await request.formData();
    const updateData = parseBookFields(formData);

    const coverImage = formData.get('coverImage');
    if (coverImage && coverImage.size > 0) {
      updateData.coverImage = await saveCoverImage(coverImage);
    }

    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
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

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      return NextResponse.json(
        { success: false, message: `A book with this ${field} already exists` },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Error updating book' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const id = params?.id;
    const idError = validateId(id);
    if (idError) {
      return NextResponse.json({ success: false, message: idError }, { status: 400 });
    }

    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return NextResponse.json({ success: false, message: 'Book not found' }, { status: 404 });
    }

    if (deletedBook.coverImage && deletedBook.coverImage.startsWith('/uploads/')) {
      const fileName = deletedBook.coverImage.split('/').pop();
      const filePath = path.join(UPLOAD_DIR, fileName);
      if (existsSync(filePath)) {
        await unlink(filePath);
      }
    }

    return NextResponse.json({ success: true, message: 'Book deleted successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error deleting book' },
      { status: 500 }
    );
  }
}