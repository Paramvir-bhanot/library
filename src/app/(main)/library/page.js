// app/library/page.js
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

// Theme configuration (mirrors your JSON)
const theme = {
  primary: "#D4AF37",
  secondary: "#F5F5F5",
  background: "#000000",
  surface: "#111111",
  accent: "#C9A227",
  text: {
    primary: "#FFFFFF",
    secondary: "#BFBFBF",
    highlight: "#D4AF37",
  },
  buttons: {
    primaryBg: "#D4AF37",
    primaryText: "#000000",
    secondaryBg: "#111111",
    secondaryText: "#D4AF37",
    hoverBg: "#C9A227",
  },
  borders: {
    light: "#333333",
    highlight: "#D4AF37",
  },
  status: {
    success: "#4CAF50",
    error: "#E53935",
    warning: "#FFB300",
    info: "#2196F3",
  },
};

// Sample library items (replace with your own data)
const libraryItems = [
  {
    id: 1,
    title: "The Golden Hour",
    author: "Elena Morris",
    cover: "/placeholder-cover-1.jpg", // replace with actual image
    category: "Fiction",
  },
  {
    id: 2,
    title: "Midnight Algorithms",
    author: "James Chen",
    cover: "/placeholder-cover-2.jpg",
    category: "Technology",
  },
  {
    id: 3,
    title: "Velvet Shadows",
    author: "Isabella Rossi",
    cover: "/placeholder-cover-3.jpg",
    category: "Mystery",
  },
  {
    id: 4,
    title: "Opulent Design",
    author: "Marcus Vane",
    cover: "/placeholder-cover-4.jpg",
    category: "Art & Design",
  },
  {
    id: 5,
    title: "Ethereal Flavors",
    author: "Sofia Laurent",
    cover: "/placeholder-cover-5.jpg",
    category: "Cooking",
  },
  {
    id: 6,
    title: "Digital Renaissance",
    author: "Alex Rivera",
    cover: "/placeholder-cover-6.jpg",
    category: "Technology",
  },
];

export default function LibraryPage() {
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedItem(null), 300); // wait for exit animation
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: theme.background, color: theme.text.primary }}
    >
  

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Hero / Special Button Section */}
        <section className="mb-12 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2
              className="text-3xl md:text-5xl font-light mb-4"
              style={{ color: theme.text.primary }}
            >
              Discover <span style={{ color: theme.primary }}>Rare</span>{" "}
              Editions
            </h2>
            <p className="max-w-2xl mx-auto mb-8" style={{ color: theme.text.secondary }}>
              Immerse yourself in a curated collection of timeless works,
              presented with unparalleled elegance.
            </p>
            {/* 3D Animated "Vegan" / Special Button */}
            <SpecialButton onClick={() => handleOpenModal(libraryItems[0])} />
          </motion.div>
        </section>

        {/* Library Grid */}
        <section>
          <h3
            className="text-2xl font-medium mb-6 border-b pb-2 inline-block"
            style={{ borderColor: theme.primary }}
          >
            Featured Works
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {libraryItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="group cursor-pointer"
                onClick={() => handleOpenModal(item)}
              >
                <div
                  className="rounded-xl overflow-hidden border transition-all duration-300"
                  style={{
                    backgroundColor: theme.surface,
                    borderColor: theme.borders.light,
                  }}
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden">
                    {/* Placeholder gradient if no image */}
                    <div
                      className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center"
                      style={{ backgroundColor: theme.surface }}
                    >
                      <span
                        className="text-4xl font-serif"
                        style={{ color: theme.primary }}
                      >
                        {item.title.charAt(0)}
                      </span>
                    </div>
                    {/* Uncomment when you have actual images */}
                    {/* <Image
                      src={item.cover}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    /> */}
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-500" />
                  </div>
                  <div className="p-4">
                    <h4
                      className="text-lg font-medium mb-1"
                      style={{ color: theme.text.primary }}
                    >
                      {item.title}
                    </h4>
                    <p
                      className="text-sm mb-2"
                      style={{ color: theme.text.secondary }}
                    >
                      {item.author}
                    </p>
                    <span
                      className="inline-block px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: theme.surface,
                        color: theme.primary,
                        border: `1px solid ${theme.borders.light}`,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      {/* 3D Modal with "Opening" Animation */}
      <AnimatePresence>
        {isModalOpen && selectedItem && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-80"
              onClick={handleCloseModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Content - 3D Flip/Open Effect */}
            <motion.div
              className="relative w-full max-w-2xl rounded-2xl overflow-hidden"
              style={{
                backgroundColor: theme.surface,
                border: `1px solid ${theme.borders.highlight}`,
                perspective: "1500px",
              }}
              initial={{
                rotateX: 90,
                rotateY: 15,
                scale: 0.8,
                opacity: 0,
              }}
              animate={{
                rotateX: 0,
                rotateY: 0,
                scale: 1,
                opacity: 1,
              }}
              exit={{
                rotateX: -90,
                rotateY: -15,
                scale: 0.8,
                opacity: 0,
                transition: { duration: 0.3 },
              }}
              transition={{
                type: "spring",
                damping: 20,
                stiffness: 300,
                mass: 0.8,
              }}
              
            >
              <div className="p-6 md:p-8">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-opacity-10 hover:bg-white transition"
                  style={{ color: theme.text.secondary }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/3">
                    <div
                      className="relative aspect-[2/3] w-full rounded-lg overflow-hidden"
                      style={{ backgroundColor: theme.background }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-black flex items-center justify-center">
                        <span
                          className="text-5xl font-serif"
                          style={{ color: theme.primary }}
                        >
                          {selectedItem.title.charAt(0)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="md:w-2/3">
                    <h3
                      className="text-2xl md:text-3xl font-light mb-2"
                      style={{ color: theme.primary }}
                    >
                      {selectedItem.title}
                    </h3>
                    <p
                      className="text-lg mb-4"
                      style={{ color: theme.text.secondary }}
                    >
                      by {selectedItem.author}
                    </p>
                    <div
                      className="h-px w-full my-4"
                      style={{ backgroundColor: theme.borders.light }}
                    />
                    <p className="mb-6" style={{ color: theme.text.primary }}>
                      A masterpiece of contemporary literature, this edition
                      features exclusive insights and a foreword by renowned
                      critics. Limited to 500 copies worldwide.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        className="px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105"
                        style={{
                          backgroundColor: theme.buttons.primaryBg,
                          color: theme.buttons.primaryText,
                        }}
                      >
                        Reserve Copy
                      </button>
                      <button
                        className="px-6 py-3 rounded-full font-medium transition-all duration-300 hover:bg-opacity-20"
                        style={{
                          backgroundColor: "transparent",
                          color: theme.buttons.secondaryText,
                          border: `1px solid ${theme.buttons.secondaryText}`,
                        }}
                      >
                        Preview
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Special 3D Animated Button Component
 * Inspired by a realistic "unfolding" motion, similar to organic opening.
 */
function SpecialButton({ onClick }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative px-8 py-4 rounded-full text-lg font-medium tracking-wider overflow-hidden"
      style={{
        backgroundColor: theme.buttons.primaryBg,
        color: theme.buttons.primaryText,
        boxShadow: `0 10px 25px -5px ${theme.primary}40`,
        transformStyle: "preserve-3d",
        perspective: "1000px",
      }}
      whileTap={{
        scale: 0.95,
        rotateX: 10,
        rotateY: -5,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      animate={{
        rotateX: isHovered ? 5 : 0,
        rotateY: isHovered ? 3 : 0,
        boxShadow: isHovered
          ? `0 20px 30px -8px ${theme.primary}80`
          : `0 10px 25px -5px ${theme.primary}40`,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Animated background effect */}
      <motion.span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20"
        initial={{ x: "-100%" }}
        animate={{ x: isHovered ? "100%" : "-100%" }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      {/* 3D "petal" layers that unfold on click */}
      <motion.span
        className="absolute inset-0 rounded-full border-2 opacity-0"
        style={{ borderColor: theme.accent }}
        initial={{ scale: 1, opacity: 0 }}
        whileTap={{
          scale: [1, 1.8, 2],
          opacity: [0, 0.6, 0],
          transition: { duration: 0.6, times: [0, 0.5, 1] },
        }}
      />
      <motion.span
        className="absolute inset-0 rounded-full border opacity-0"
        style={{ borderColor: theme.primary }}
        initial={{ scale: 1, opacity: 0 }}
        whileTap={{
          scale: [1, 1.5, 1.8],
          opacity: [0, 0.4, 0],
          transition: { duration: 0.5, delay: 0.1 },
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        <span>Explore Collection</span>
        <motion.span
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          →
        </motion.span>
      </span>
    </motion.button>
  );
}