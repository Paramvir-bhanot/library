import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import mega from 'megajs';
import Book from '@/src/models/books';
import connectDB from '@/src/lib/DBconnection';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');

async function ensureUploadDir() {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true });
  }
}

async function uploadToMega(filePath, fileName) {
  try {
    // Initialize Mega storage
    const storage = new mega.Storage({
      email: process.env.MEGA_EMAIL,
      password: process.env.MEGA_PASSWORD,
    });

    await storage.ready;

    // Read file and upload
    const file = await readFile(filePath);
    const uploadedFile = await storage.upload({
      name: fileName,
      size: file.length,
    }, file).complete;

    // Get the download link
    const downloadLink = uploadedFile.downloadUrl;

    return downloadLink;
  } catch (error) {
    console.error('Mega upload error:', error);
    throw new Error('Failed to upload file to Mega storage');
  }
}

export async function POST(request) {
  try {
    // Connect to MongoDB
    await connectDB();

    const id = request.nextUrl.searchParams.get('id');

    // Validate book ID
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Check if book exists
    const book = await Book.findById(id);
    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    // Get the file from request body
    const { file, fileName } = await request.json();

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, message: 'File and fileName are required' },
        { status: 400 }
      );
    }

    // Validate file type (PDF only)
    const fileExtension = fileName.split('.').pop().toLowerCase();
    if (fileExtension !== 'pdf') {
      return NextResponse.json(
        { success: false, message: 'Only PDF files are allowed' },
        { status: 400 }
      );
    }

    // Create unique file name
    const uniqueFileName = `${id}_${uuidv4()}.pdf`;
    const filePath = join(UPLOAD_DIR, uniqueFileName);

    // Ensure upload directory exists
    await ensureUploadDir();

    // Convert base64 to buffer and write file
    const buffer = Buffer.from(file, 'base64');
    await writeFile(filePath, buffer);

    // Upload to Mega
    const megaDownloadLink = await uploadToMega(filePath, uniqueFileName);

    // Update book with PDF link
    book.pdfUrl = megaDownloadLink;
    book.pdfFileName = fileName;
    await book.save();

    return NextResponse.json(
      {
        success: true,
        message: 'PDF uploaded successfully',
        data: {
          bookId: id,
          fileName,
          megaLink: megaDownloadLink,
          pdfUrl: megaDownloadLink,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error uploading file',
        error: error.message,
      },
      { status: 500 }
    );
  }
}