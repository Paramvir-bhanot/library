import mongoose from 'mongoose';
import { ALLOWED_BOOK_CATEGORIES } from '@/src/lib/bookCategories';
import { BOOK_CLASSES, BOOK_LANGUAGES, BOOK_SUBJECTS } from '@/src/lib/bookConstants';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
      alias: 'bookName',
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
      alias: 'authorName',
      maxlength: [100, 'Author name cannot be more than 100 characters'],
    },
    bookClass: {
      type: String,
      trim: true,
      enum: {
        values: BOOK_CLASSES,
        message: `Book class must be one of: ${BOOK_CLASSES.join(', ')}`,
      },
    },
    subject: {
      type: String,
      trim: true,
      enum: {
        values: BOOK_SUBJECTS,
        message: 'Subject must be a valid value from book.md',
      },
    },
    semester: {
      type: Number,
      min: [1, 'Semester must be at least 1'],
      max: [12, 'Semester cannot exceed 12'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      trim: true,
      maxlength: [100, 'Category cannot be more than 100 characters'],
      validate: {
        validator(value) {
          if (!value) {
            return true;
          }

          return ALLOWED_BOOK_CATEGORIES.includes(value.trim());
        },
        message: 'Category must match knowlage.json departments/courses',
      },
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
      max: [999999, 'Price is too high'],
    },
    coverImage: {
      type: String,
      trim: true,
      alias: 'pdfCoverPageLink',
      match: [
        /^(https?:\/\/.+|\/uploads\/.+)/,
        'Please provide a valid image URL (http://, https://, or /uploads/ path)',
      ],
    },
    pdfUrl: {
      type: String,
      trim: true,
      alias: 'pdfLink',
    },
    pdfFileName: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
      alias: 'publichdate',
    }, 
     uploadedDate: {
      type: Date,
      alias: 'uploadeddate',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    pages: {
      type: Number,
      alias: 'numberofpages',
      min: [1, 'Pages must be at least 1'],
      max: [10000, 'Pages exceed maximum limit'],
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
      enum: {
        values: BOOK_LANGUAGES,
        message: `Language must be one of: ${BOOK_LANGUAGES.join(', ')}`,
      },
    },
    downloads: {
      type: Number,
      alias: 'numberofdownlord',
      default: 0,
      min: [0, 'Downloads cannot be negative'],
    },
    rating: {
      type: Number,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
      default: 0,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create a compound index for better query performance
bookSchema.index({ author: 1, category: 1 });
bookSchema.index({ bookClass: 1, subject: 1 });
bookSchema.index({ bookClass: 1, subject: 1, semester: 1 });
bookSchema.index({ uploadedBy: 1, uploadedDate: -1 });
bookSchema.index({ title: 'text', description: 'text' });

// Export model - prevent recompilation in Next.js dev mode
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export default Book;