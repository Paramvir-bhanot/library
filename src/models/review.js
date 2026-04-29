import mongoose from 'mongoose';

const bookReviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a reviewer name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide a comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      minlength: [10, 'Comment must be at least 10 characters'],
    },
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Review must be associated with a book'],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Status must be pending, approved, or rejected',
      },
      default: 'pending',
    },
    helpful: {
      type: Number,
      default: 0,
      min: [0, 'Helpful count cannot be negative'],
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Create indexes for better query performance
bookReviewSchema.index({ book: 1, status: 1 });
bookReviewSchema.index({ rating: 1 });
bookReviewSchema.index({ createdAt: -1 });
bookReviewSchema.index({ reviewedBy: 1 });

// Export model - prevent recompilation in Next.js dev mode
const BookReview = mongoose.models.BookReview || mongoose.model('BookReview', bookReviewSchema);

export default BookReview;