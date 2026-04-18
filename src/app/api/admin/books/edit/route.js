import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Import your Book model
import Book from '@/src/models/books';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }
  await mongoose.connect(process.env.MONGODB_URI);
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'cover-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Allow only image files
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Middleware to handle multipart form data
const runMiddleware = (req, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, {}, (result) => {
      if (result instanceof Error) {
        reject(result);
      } else {
        resolve(result);
      }
    });
  });
};

export async function PATCH(request, { params }) {
  try {
    await connectDB();

    const id = params?.id || request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid book ID' },
        { status: 400 }
      );
    }

    // Check if book exists
    const existingBook = await Book.findById(id);
    if (!existingBook) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    // Get form data
    const formData = await request.formData();
    const updateData = {};

    // Extract fields from form data
    const fieldsToUpdate = [
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

    fieldsToUpdate.forEach((field) => {
      const value = formData.get(field);
      if (value !== null && value !== '') {
        if (field === 'price' || field === 'pages' || field === 'rating') {
          updateData[field] = Number(value);
        } else if (field === 'publishedDate') {
          updateData[field] = new Date(value);
        } else {
          updateData[field] = value;
        }
      }
    });

    // Handle file upload for cover image
    const file = formData.get('coverImage');
    if (file && file.size > 0) {
      // Create a new FormData with the file for multer processing
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      try {
        // For local file storage, save the file directly
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create uploads directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = 'cover-' + uniqueSuffix + path.extname(file.name);
        const filepath = path.join(uploadDir, filename);

        // Save file
        fs.writeFileSync(filepath, buffer);

        // Set the URL path
        updateData.coverImage = `/uploads/${filename}`;
      } catch (error) {
        return NextResponse.json(
          { success: false, message: 'Error uploading file: ' + error.message },
          { status: 500 }
        );
      }
    }

    // Update book with validation
    const updatedBook = await Book.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Book updated successfully',
        data: updatedBook,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update error:', error);

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return NextResponse.json(
        { success: false, message: 'Validation error', errors: messages },
        { status: 400 }
      );
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return NextResponse.json(
        {
          success: false,
          message: `A book with this ${field} already exists`,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || 'Error updating book' },
      { status: 500 }
    );
  }
}

// Also support PUT method
export async function PUT(request, { params }) {
  return PATCH(request, { params });
}

// GET single book
export async function GET(request, { params }) {
  try {
    await connectDB();

    const id = params?.id || request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid book ID' },
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

    return NextResponse.json(
      { success: true, data: book },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || 'Error fetching book' },
      { status: 500 }
    );
  }
}

// DELETE book
export async function DELETE(request, { params }) {
  try {
    await connectDB();

    const id = params?.id || request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Book ID is required' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid book ID' },
        { status: 400 }
      );
    }

    const book = await Book.findByIdAndDelete(id);

    if (!book) {
      return NextResponse.json(
        { success: false, message: 'Book not found' },
        { status: 404 }
      );
    }

    // Delete cover image if exists
    if (book.coverImage && book.coverImage.startsWith('/uploads/')) {
      const filename = book.coverImage.split('/').pop();
      const filepath = path.join(process.cwd(), 'public/uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    }

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