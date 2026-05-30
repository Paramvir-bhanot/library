import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    default: 'Visitor'
  },
  review: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Clear model cache in development to ensure schema changes are reflected
if (process.env.NODE_ENV === 'development' && mongoose.models.Review) {
  delete mongoose.models.Review;
}

export default mongoose.models.Review || mongoose.model('Review', reviewSchema);