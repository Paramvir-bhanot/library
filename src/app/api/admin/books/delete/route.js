import mongoose from 'mongoose';
import Book from '@/models/Book';
import { connectDB } from '@/lib/mongodb';

export default async function handler(req, res) {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Connect to MongoDB
    await connectDB();

    const { id } = req.query;

    // Validate if the ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    // Find and delete the book by ID
    const deletedBook = await Book.findByIdAndDelete(id);

    // Check if book exists
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found' });
    }

    // Return success response with deleted book details
    return res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
      data: deletedBook,
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message,
    });
  }
}