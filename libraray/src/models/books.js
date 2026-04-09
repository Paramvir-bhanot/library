import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a book title'],
      trim: true,
      maxlength: [200, 'Title cannot be more than 200 characters'],
    },
    author: {
      type: String,
      required: [true, 'Please provide an author name'],
      trim: true,
      maxlength: [100, 'Author name cannot be more than 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: {
        values: ['Fiction', 'Non-Fiction', 'Science Fiction', 'Mystery', 'Biography', 'History'],
        message: 'Category must be one of: Fiction, Non-Fiction, Science Fiction, Mystery, Biography, History',
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
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid image URL (starting with http:// or https://)',
      ],
    },
    publishedDate: {
      type: Date,
    },
    isbn: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents without ISBN
      trim: true,
      match: [
        /^(?:ISBN(?:-1[03])?:?[ ]?)?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[X0-9]/,
        'Please provide a valid ISBN',
      ],
    },
    pages: {
      type: Number,
      min: [1, 'Pages must be at least 1'],
      max: [10000, 'Pages exceed maximum limit'],
    },
    language: {
      type: String,
      default: 'English',
      trim: true,
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
bookSchema.index({ title: 'text', description: 'text' });

// Export model - prevent recompilation in Next.js dev mode
const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);

export default Book;