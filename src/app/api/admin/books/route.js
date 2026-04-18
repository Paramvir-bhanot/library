import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';

const UPLOAD_DIR = path.join(process.cwd(), 'public/uploads');

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

export async function GET() {
  try {
    await connectDB();
    const books = await Book.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: books }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching books' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();
    const payload = parseBookFields(formData);

    const coverImage = formData.get('coverImage');
    if (coverImage && coverImage.size > 0) {
      payload.coverImage = await saveCoverImage(coverImage);
    }

    const newBook = await Book.create(payload);

    return NextResponse.json(
      { success: true, message: 'Book created successfully', data: newBook },
      { status: 201 }
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
      { success: false, message: error.message || 'Error creating book' },
      { status: 500 }
    );
  }
}