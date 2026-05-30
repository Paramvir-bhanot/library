import { NextResponse } from 'next/server';
import dbConnect from '@/lib/DBconnection';
import Review from '@/models/review';

export async function GET() {
  try {
    await dbConnect();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ reviews }, { status: 200 });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    const { name, category, review, rating } = await request.json();

    if (!name || !category || !review || rating === undefined || rating === null) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // Ensure category is valid
    if (!['Visitor'].includes(category)) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    // Ensure rating is a number and within valid range
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ message: 'Rating must be a number between 1 and 5' }, { status: 400 });
    }

    const newReview = new Review({ 
      name: name.trim(), 
      category: category.trim(), 
      review: review.trim(), 
      rating: ratingNum 
    });
    const savedReview = await newReview.save();

    return NextResponse.json(
      { message: 'Review added successfully', review: savedReview },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding review:', error);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message).join(', ');
      return NextResponse.json(
        { message: `Validation error: ${validationErrors}` },
        { status: 400 }
      );
    }
    
    // Handle other Mongoose errors
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return NextResponse.json(
        { message: 'Database error occurred' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}