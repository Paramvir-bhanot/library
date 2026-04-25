import { NextResponse } from 'next/server';
import { mkdir, unlink, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';

const PDF_DIR = path.join(process.cwd(), 'public/uploads/pdfs');
const MAX_PDF_SIZE = 100 * 1024 * 1024;

async function removeLocalUpload(fileUrl) {
  if (!fileUrl || typeof fileUrl !== 'string' || !fileUrl.startsWith('/uploads/')) {
    return;
  }

  const filePath = path.join(process.cwd(), 'public', fileUrl.replace(/^\//, ''));
  if (existsSync(filePath)) {
    await unlink(filePath);
  }
}

export async function POST(request) {
  try {
    await connectDB();

    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book id is required' },
        { status: 400 }
      );
    }

    const { file, fileName } = await request.json();
    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, message: 'file and fileName are required' },
        { status: 400 }
      );
    }

    if (!fileName.toLowerCase().endsWith('.pdf')) {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are allowed' },
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

    const buffer = Buffer.from(file, 'base64');
    if (!buffer.length) {
      return NextResponse.json(
        { success: false, message: 'Invalid PDF payload' },
        { status: 400 }
      );
    }

    if (buffer.length > MAX_PDF_SIZE) {
      return NextResponse.json(
        { success: false, message: 'PDF size exceeds 100MB limit' },
        { status: 413 }
      );
    }

    if (!existsSync(PDF_DIR)) {
      await mkdir(PDF_DIR, { recursive: true });
    }

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const savedName = `pdf-${uniqueSuffix}.pdf`;
    const savedPath = path.join(PDF_DIR, savedName);

    await writeFile(savedPath, buffer);

    await removeLocalUpload(book.pdfUrl);

    book.pdfUrl = `/uploads/pdfs/${savedName}`;
    book.pdfFileName = fileName;
    await book.save();

    return NextResponse.json(
      {
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          pdfUrl: book.pdfUrl,
          pdfFileName: book.pdfFileName,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'PDF upload failed' },
      { status: 500 }
    );
  }
}

