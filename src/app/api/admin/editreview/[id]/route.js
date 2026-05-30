import { NextResponse } from 'next/server';
import dbConnect from '@/lib/DBconnection';
import Review from '@/models/review';

const getReviewId = (request, params, bodyId) => {
  if (params?.id) return params.id;
  if (bodyId) return bodyId;

  try {
    const url = new URL(request.url);
    const fromQuery = url.searchParams.get('id');
    if (fromQuery) return fromQuery;

    const segments = url.pathname.split('/').filter(Boolean);
    // Expected: /api/admin/editreview/:id
    const last = segments[segments.length - 1];
    return last || null;
  } catch {
    return null;
  }
};

const normalizeCategory = (category) => {
  if (!category) return null;
  const value = String(category).trim();
  const lower = value.toLowerCase();
  if (lower === 'visitor') return 'Visitor';
  if (lower === 'student') return 'student';
  if (lower === 'staff') return 'staff';
  return value;
};

export async function PUT(request, { params }) {
  try {
    await dbConnect();

    const body = await request.json();
    const { id: bodyId, name, category, review, rating } = body;
    const id = getReviewId(request, params, bodyId);

    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    if (!name || !category || !review || rating === undefined || rating === null) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    const normalizedCategory = normalizeCategory(category);
    if (!normalizedCategory || !['Visitor', 'student', 'staff'].includes(normalizedCategory)) {
      return NextResponse.json({ message: 'Invalid category' }, { status: 400 });
    }

    const ratingNum = Number(rating);
    if (Number.isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json({ message: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const updatedReview = await Review.findByIdAndUpdate(
      id,
      {
        name: String(name).trim(),
        category: normalizedCategory,
        review: String(review).trim(),
        rating: ratingNum,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!updatedReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review updated successfully', review: updatedReview }, { status: 200 });
  } catch (error) {
    console.error('Error updating review:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ message: 'Invalid review ID' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect();

    const id = getReviewId(request, params);
    if (!id) {
      return NextResponse.json({ message: 'Review ID is required' }, { status: 400 });
    }

    const deletedReview = await Review.findByIdAndDelete(id);
    if (!deletedReview) {
      return NextResponse.json({ message: 'Review not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Review deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting review:', error);
    if (error.name === 'CastError') {
      return NextResponse.json({ message: 'Invalid review ID' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}