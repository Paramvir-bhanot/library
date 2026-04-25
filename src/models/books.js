import mongoose from 'mongoose';
import { ALLOWED_BOOK_CATEGORIES } from '@/src/lib/bookCategories';

const BOOK_CLASSES = [
  'B.A',
  'M.A',
  'B.Lib.I.Sc',
  'M.Lib.I.Sc',
  'BCA',
  'MCA',
  'B.COM',
  'M.COM',
  'BBA',
  'MBA',
  'BSC.IT',
  'MSC.IT',
];

const BOOK_LANGUAGES = ['Hindi', 'English', 'Punjabi'];

const BOOK_SUBJECTS = [
  'English',
  'Political Science',
  'History',
  'Sociology',
  'Economics',
  'Punjabi',
  'English Literature',
  'Political Theory',
  'Modern History',
  'Social Research',
  'Public Administration',
  'Library Classification',
  'Cataloguing',
  'Information Sources',
  'Library Management',
  'Digital Libraries',
  'Information Technology in Libraries',
  'Research Methodology',
  'Knowledge Management',
  'Academic Library Systems',
  'Programming in C',
  'Data Structures',
  'Database Management System',
  'Operating System',
  'Computer Networks',
  'Web Development',
  'Advanced Java',
  'Software Engineering',
  'Cloud Computing',
  'Machine Learning',
  'Cyber Security',
  'Financial Accounting',
  'Business Law',
  'Taxation',
  'Auditing',
  'Corporate Finance',
  'Advanced Accounting',
  'International Business',
  'Financial Management',
  'Marketing Management',
  'Human Resource Management',
  'Business Communication',
  'Entrepreneurship',
  'Organizational Behavior',
  'Strategic Management',
  'Finance Management',
  'Operations Management',
  'Digital Marketing',
  'Business Analytics',
  'Computer Fundamentals',
  'Programming',
  'Networking',
  'Database Systems',
  'Web Technologies',
  'Advanced Networking',
  'Artificial Intelligence',
  'Big Data',
  'Information Security',
];

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
bookSchema.index({ uploadedBy: 1, uploadedDate: -1 });
bookSchema.index({ title: 'text', description: 'text' });

// Export model - prevent recompilation in Next.js dev mode
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export default Book;