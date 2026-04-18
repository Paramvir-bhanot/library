'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('view');
  const [editingBook, setEditingBook] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    category: '',
    price: '',
    pages: '',
    language: 'English',
    rating: '',
    publishedDate: '',
    coverImage: null,
    coverImagePreview: null,
    pdfFile: null,
    pdfFileName: '',
  });

  // Fetch books on mount
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/books');
      const data = await response.json();
      if (data.success) {
        setBooks(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching books:', error);
      showError('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setTimeout(() => setErrorMessage(''), 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          coverImage: file,
          coverImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.pdf')) {
        showError('Please select a PDF file');
        return;
      }
      setFormData(prev => ({
        ...prev,
        pdfFile: file,
        pdfFileName: file.name
      }));
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== 'string') {
          reject(new Error('Invalid file content'));
          return;
        }
        const base64 = result.includes(',') ? result.split(',')[1] : result;
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      showError('Title and Author are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('pages', formData.pages);
      data.append('language', formData.language);
      data.append('rating', formData.rating);
      data.append('publishedDate', formData.publishedDate);
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      const response = await fetch('/api/admin/books', {
        method: 'POST',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        const newBook = result.data;

        // Upload PDF if provided
        if (formData.pdfFile && newBook?._id) {
          const file = await fileToBase64(formData.pdfFile);

          const pdfResponse = await fetch(`/api/admin/books/upload?id=${newBook._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file,
              fileName: formData.pdfFileName,
            }),
          });

          const pdfResult = await pdfResponse.json();
          if (!pdfResult.success) {
            showError('Book created but PDF upload failed');
          }
        }

        showSuccess('Book added successfully!');
        resetForm();
        fetchBooks();
        setActiveTab('view');
      } else {
        const detailedMessage =
          result.errors?.[0] ||
          (Array.isArray(result.errors) ? result.errors.join(', ') : null) ||
          result.message ||
          'Failed to add book';
        showError(detailedMessage);
      }
    } catch (error) {
      console.error('Error adding book:', error);
      showError('Error adding book');
    }
  };

  const handleEditBook = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title || '',
      author: book.author || '',
      description: book.description || '',
      category: book.category || '',
      price: book.price || '',
      pages: book.pages || '',
      language: book.language || 'English',
      rating: book.rating || '',
      publishedDate: book.publishedDate?.split('T')[0] || '',
      coverImage: null,
      coverImagePreview: book.coverImage || null,
      pdfFile: null,
      pdfFileName: book.pdfFileName || '',
    });
    setActiveTab('edit');
  };

  const handleUpdateBook = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.author) {
      showError('Title and Author are required');
      return;
    }

    try {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('author', formData.author);
      data.append('description', formData.description);
      data.append('category', formData.category);
      data.append('price', formData.price);
      data.append('pages', formData.pages);
      data.append('language', formData.language);
      data.append('rating', formData.rating);
      data.append('publishedDate', formData.publishedDate);
      if (formData.coverImage) {
        data.append('coverImage', formData.coverImage);
      }

      const response = await fetch(`/api/admin/books/${editingBook._id}`, {
        method: 'PATCH',
        body: data,
      });

      const result = await response.json();

      if (result.success) {
        // Upload PDF if provided
        if (formData.pdfFile && editingBook?._id) {
          const file = await fileToBase64(formData.pdfFile);

          const pdfResponse = await fetch(`/api/admin/books/upload?id=${editingBook._id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              file,
              fileName: formData.pdfFileName,
            }),
          });

          const pdfResult = await pdfResponse.json();
          if (!pdfResult.success) {
            showError('Book updated but PDF upload failed');
          }
        }

        showSuccess('Book updated successfully!');
        resetForm();
        fetchBooks();
        setActiveTab('view');
      } else {
        const detailedMessage =
          result.errors?.[0] ||
          (Array.isArray(result.errors) ? result.errors.join(', ') : null) ||
          result.message ||
          'Failed to update book';
        showError(detailedMessage);
      }
    } catch (error) {
      console.error('Error updating book:', error);
      showError('Error updating book');
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        showSuccess('Book deleted successfully!');
        fetchBooks();
        setShowDeleteConfirm(null);
      } else {
        showError(result.message || 'Failed to delete book');
      }
    } catch (error) {
      console.error('Error deleting book:', error);
      showError('Error deleting book');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      description: '',
      category: '',
      price: '',
      pages: '',
      language: 'English',
      rating: '',
      publishedDate: '',
      coverImage: null,
      coverImagePreview: null,
      pdfFile: null,
      pdfFileName: '',
    });
    setEditingBook(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-[#D4AF37]/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-[#D4AF37]/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-b border-[#333333] backdrop-blur-lg bg-black/50 sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  <span className="bg-gradient-to-r from-[#D4AF37] to-[#F5F5F5] bg-clip-text text-transparent">
                    Book Library
                  </span>
                </h1>
                <p className="text-[#BFBFBF] mt-2">Manage your digital book collection</p>
              </div>
              <div className="text-sm text-[#BFBFBF]">
                {books.length} {books.length === 1 ? 'book' : 'books'} in library
              </div>
            </div>
          </div>
        </motion.header>

        {/* Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm bg-[#4CAF50]/10 border border-[#4CAF50] rounded-lg p-4 text-[#4CAF50] z-50"
            >
              ✓ {successMessage}
            </motion.div>
          )}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-20 left-4 right-4 sm:left-auto sm:right-8 sm:max-w-sm bg-[#E53935]/10 border border-[#E53935] rounded-lg p-4 text-[#E53935] z-50"
            >
              ✕ {errorMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="flex flex-wrap gap-3 mb-8">
            {[
              { id: 'view', label: 'View Books', icon: '📚' },
              { id: 'add', label: 'Add Book', icon: '➕' },
            ].map(tab => (
              <motion.button
                key={tab.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'view') resetForm();
                }}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20'
                    : 'bg-[#111111] text-[#D4AF37] border border-[#333333] hover:border-[#D4AF37]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <AnimatePresence mode="wait">
            {/* View Books Tab */}
            {activeTab === 'view' && (
              <motion.div
                key="view"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {loading ? (
                  <div className="flex justify-center items-center py-16">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      className="w-12 h-12 border-4 border-[#333333] border-t-[#D4AF37] rounded-full"
                    />
                  </div>
                ) : books.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 bg-[#111111]/50 rounded-xl border border-[#333333]"
                  >
                    <div className="text-5xl mb-4">📭</div>
                    <h3 className="text-xl font-semibold text-white mb-2">No books yet</h3>
                    <p className="text-[#BFBFBF] mb-6">Start by adding your first book to the library</p>
                    <button
                      onClick={() => setActiveTab('add')}
                      className="px-6 py-3 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#C9A227] transition-colors"
                    >
                      Add First Book
                    </button>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {books.map((book, index) => (
                      <BookCard
                        key={book._id}
                        book={book}
                        index={index}
                        onEdit={handleEditBook}
                        onDelete={() => setShowDeleteConfirm(book._id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Add/Edit Book Tab */}
            {(activeTab === 'add' || activeTab === 'edit') && (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <BookForm
                  formData={formData}
                  onInputChange={handleInputChange}
                  onCoverImageChange={handleCoverImageChange}
                  onPdfChange={handlePdfChange}
                  onSubmit={editingBook ? handleUpdateBook : handleAddBook}
                  isEditing={!!editingBook}
                  fileInputRef={fileInputRef}
                  pdfInputRef={pdfInputRef}
                  onCancel={() => {
                    resetForm();
                    setActiveTab('view');
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border border-[#333333] rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-semibold text-white mb-2">Delete Book?</h3>
              <p className="text-[#BFBFBF] mb-6">
                This action cannot be undone. The book and all associated files will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleDeleteBook(showDeleteConfirm);
                  }}
                  className="flex-1 px-4 py-2 bg-[#E53935] text-white rounded-lg hover:bg-[#D32F2F] transition-colors font-semibold"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Book Card Component
function BookCard({ book, index, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8 }}
      className="group bg-[#111111] border border-[#333333] rounded-xl overflow-hidden hover:border-[#D4AF37] transition-all duration-300 shadow-lg hover:shadow-[#D4AF37]/10"
    >
      {/* Cover Image */}
      <div className="relative h-48 sm:h-56 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] overflow-hidden">
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
          {book.title}
        </h3>
        <p className="text-sm text-[#BFBFBF] mb-4">{book.author}</p>

        {/* Book Details */}
        <div className="space-y-2 mb-4 text-xs sm:text-sm text-[#BFBFBF]">
          {book.category && (
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37]">📂</span>
              <span>{book.category}</span>
            </div>
          )}
          {book.rating && (
            <div className="flex items-center gap-2">
              <span className="text-[#FFB300]">⭐</span>
              <span>{book.rating}/5</span>
            </div>
          )}
          {book.price && (
            <div className="flex items-center gap-2">
              <span className="text-[#4CAF50]">💲</span>
              <span>${book.price}</span>
            </div>
          )}
          {book.pages && (
            <div className="flex items-center gap-2">
              <span>📄</span>
              <span>{book.pages} pages</span>
            </div>
          )}
        </div>

        {book.pdfUrl && (
          <div className="mb-4 inline-block px-3 py-1 bg-[#2196F3]/10 border border-[#2196F3] rounded text-xs text-[#2196F3]">
            📄 PDF Available
          </div>
        )}

        {/* Description */}
        {book.description && (
          <p className="text-xs sm:text-sm text-[#BFBFBF] mb-4 line-clamp-3">
            {book.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[#333333]">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(book)}
            className="flex-1 px-3 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors text-sm font-semibold border border-[#D4AF37]/30 hover:border-[#D4AF37]"
          >
            ✏️ Edit
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete()}
            className="flex-1 px-3 py-2 bg-[#E53935]/10 text-[#E53935] rounded-lg hover:bg-[#E53935]/20 transition-colors text-sm font-semibold border border-[#E53935]/30 hover:border-[#E53935]"
          >
            🗑️ Delete
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Book Form Component
function BookForm({
  formData,
  onInputChange,
  onCoverImageChange,
  onPdfChange,
  onSubmit,
  isEditing,
  fileInputRef,
  pdfInputRef,
  onCancel,
}) {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    details: false,
    media: false,
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={onSubmit}
      className="max-w-4xl bg-[#111111] border border-[#333333] rounded-xl p-6 sm:p-8"
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
        {isEditing ? 'Edit Book' : 'Add New Book'}
      </h2>

      {/* Form Sections */}
      <div className="space-y-6">
        {/* Basic Information */}
        <FormSection
          title="Basic Information"
          sectionId="basic"
          expanded={expandedSections.basic}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField label="Title *" required>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={onInputChange}
                placeholder="Enter book title"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </FormField>

            <FormField label="Author *" required>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={onInputChange}
                placeholder="Enter author name"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
                required
              />
            </FormField>

            <FormField label="Category">
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={onInputChange}
                placeholder="e.g., Fiction, Science, History"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </FormField>

            <FormField label="Language">
              <select
                name="language"
                value={formData.language}
                onChange={onInputChange}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              >
                <option>English</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
                <option>Chinese</option>
                <option>Hindi</option>
                <option>Other</option>
              </select>
            </FormField>
          </div>

          <FormField label="Description">
            <textarea
              name="description"
              value={formData.description}
              onChange={onInputChange}
              placeholder="Enter book description"
              rows="4"
              className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
            />
          </FormField>
        </FormSection>

        {/* Book Details */}
        <FormSection
          title="Book Details"
          sectionId="details"
          expanded={expandedSections.details}
          onToggle={toggleSection}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <FormField label="Pages">
              <input
                type="number"
                name="pages"
                value={formData.pages}
                onChange={onInputChange}
                placeholder="Number of pages"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </FormField>

            <FormField label="Price ($)">
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={onInputChange}
                placeholder="0.00"
                step="0.01"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </FormField>

            <FormField label="Rating (0-5)">
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={onInputChange}
                placeholder="0.0"
                min="0"
                max="5"
                step="0.1"
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </FormField>

            <FormField label="Published Date">
              <input
                type="date"
                name="publishedDate"
                value={formData.publishedDate}
                onChange={onInputChange}
                className="w-full bg-[#0a0a0a] border border-[#333333] rounded-lg px-4 py-3 text-white placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </FormField>
          </div>
        </FormSection>

        {/* Media Upload */}
        <FormSection
          title="Media & Files"
          sectionId="media"
          expanded={expandedSections.media}
          onToggle={toggleSection}
        >
          {/* Cover Image Upload */}
          <FormField label="Cover Image">
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#333333] hover:border-[#D4AF37] rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors bg-[#0a0a0a]/50"
              >
                {formData.coverImagePreview ? (
                  <div className="space-y-4">
                    <div className="relative w-full h-40 rounded-lg overflow-hidden">
                      <Image
                        src={formData.coverImagePreview}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({
                          ...prev,
                          coverImage: null,
                          coverImagePreview: null,
                        }));
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-sm text-[#E53935] hover:text-[#D32F2F]"
                    >
                      Remove image
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl">🖼️</div>
                    <p className="text-[#BFBFBF]">Click to upload cover image</p>
                    <p className="text-xs text-[#666666]">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onCoverImageChange}
                className="hidden"
              />
            </div>
          </FormField>

          {/* PDF Upload */}
          <FormField label="PDF File">
            <div className="space-y-4">
              <div
                onClick={() => pdfInputRef.current?.click()}
                className="border-2 border-dashed border-[#333333] hover:border-[#2196F3] rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-colors bg-[#0a0a0a]/50"
              >
                {formData.pdfFileName ? (
                  <div className="space-y-4">
                    <div className="inline-block p-4 bg-[#2196F3]/10 rounded-lg">
                      <span className="text-3xl">📄</span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{formData.pdfFileName}</p>
                      <p className="text-xs text-[#BFBFBF] mt-1">
                        {(formData.pdfFile?.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData(prev => ({
                          ...prev,
                          pdfFile: null,
                          pdfFileName: '',
                        }));
                        if (pdfInputRef.current) pdfInputRef.current.value = '';
                      }}
                      className="text-sm text-[#E53935] hover:text-[#D32F2F]"
                    >
                      Remove PDF
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-3xl">📤</div>
                    <p className="text-[#BFBFBF]">Click to upload PDF</p>
                    <p className="text-xs text-[#666666]">PDF files only</p>
                  </div>
                )}
              </div>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf"
                onChange={onPdfChange}
                className="hidden"
              />
            </div>
          </FormField>
        </FormSection>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-8 border-t border-[#333333]">
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onCancel}
          className="flex-1 px-6 py-3 bg-[#333333] text-white rounded-lg hover:bg-[#444444] transition-colors font-semibold"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex-1 px-6 py-3 bg-[#D4AF37] text-black rounded-lg hover:bg-[#C9A227] transition-colors font-semibold"
        >
          {isEditing ? 'Update Book' : 'Add Book'}
        </motion.button>
      </div>
    </motion.form>
  );
}

// Form Field Component
function FormField({ label, required, children }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-white">
          {label}
          {required && <span className="text-[#E53935] ml-1">*</span>}
        </label>
      )}
      {children}
    </div>
  );
}

// Form Section Component
function FormSection({ title, sectionId, expanded, onToggle, children }) {
  return (
    <div className="border border-[#333333] rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(sectionId)}
        className="w-full flex items-center justify-between p-4 sm:p-6 bg-[#0a0a0a]/50 hover:bg-[#0a0a0a] transition-colors"
      >
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#D4AF37]"
        >
          ▼
        </motion.div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-[#333333] p-4 sm:p-6 space-y-4 sm:space-y-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}