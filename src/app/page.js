"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

// Reusable animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-text-primary font-sans">
    
      <HeroSection />
      <FeaturedBooks />
      <CategoriesSection />
      <NewsletterCTA />
      <Footer />
    </main>
  );
}


// ---------- Hero Section ----------
function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          <div>
            <motion.h2
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold leading-tight"
            >
              Discover Your Next{" "}
              <span className="text-primary">Literary Escape</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-text-secondary max-w-lg"
            >
              Explore thousands of books, from timeless classics to modern
              bestsellers. Your personal library, reimagined.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex flex-wrap gap-4"
            >
              <button className="px-6 py-3 bg-primary text-black font-semibold rounded-full hover:bg-accent transition-colors duration-300 shadow-lg shadow-primary/20">
                Browse Collection
              </button>
              <button className="px-6 py-3 bg-surface text-primary border border-primary rounded-full font-semibold hover:bg-primary hover:text-black transition-colors duration-300">
                Join Now
              </button>
            </motion.div>
          </div>
          <motion.div
            variants={fadeInUp}
            className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border border-border-light shadow-2xl"
          >
            {/* Replace with an actual image or keep as abstract gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-surface to-black flex items-center justify-center">
              <span className="text-6xl font-serif text-primary/30">📚</span>
            </div>
            {/* If you have an actual image, use Next/Image:
            <Image
              src="/hero-library.jpg"
              alt="Library ambiance"
              fill
              className="object-cover"
              priority
            />
            */}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Featured Books ----------
function FeaturedBooks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const books = [
    { title: "The Great Gatsby", author: "F. Scott Fitzgerald", year: "1925" },
    { title: "Dune", author: "Frank Herbert", year: "1965" },
    { title: "Sapiens", author: "Yuval Noah Harari", year: "2011" },
    { title: "Atomic Habits", author: "James Clear", year: "2018" },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-serif font-bold"
          >
            Featured <span className="text-primary">Titles</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-text-secondary max-w-2xl mx-auto"
          >
            Hand-picked selections from our curated collection.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {books.map((book, index) => (
            <motion.div
              key={index}
              variants={fadeInUp}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-black border border-border-light rounded-xl p-6 hover:border-primary/50 transition-colors duration-300 group cursor-pointer"
            >
              <div className="h-48 bg-gradient-to-br from-primary/10 to-surface rounded-lg mb-4 flex items-center justify-center group-hover:from-primary/20 transition-all duration-500">
                <span className="text-4xl">📖</span>
              </div>
              <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                {book.title}
              </h3>
              <p className="text-text-secondary">{book.author}</p>
              <p className="text-sm text-text-secondary/60 mt-1">{book.year}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Categories Section ----------
function CategoriesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const categories = [
    { name: "Fiction", icon: "📚", count: "2.4k books" },
    { name: "Non-Fiction", icon: "🔬", count: "1.8k books" },
    { name: "Science Fiction", icon: "🚀", count: "1.2k books" },
    { name: "Mystery", icon: "🕵️", count: "980 books" },
    { name: "Biography", icon: "👤", count: "1.5k books" },
    { name: "History", icon: "🏛️", count: "2.1k books" },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="mb-12 text-center"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl sm:text-4xl font-serif font-bold"
          >
            Browse by <span className="text-primary">Category</span>
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ scale: 1.03 }}
              className="bg-surface border border-border-light rounded-xl p-4 text-center hover:border-primary transition-colors duration-300 cursor-pointer"
            >
              <span className="text-3xl mb-2 block">{cat.icon}</span>
              <h3 className="font-medium text-text-primary">{cat.name}</h3>
              <p className="text-xs text-text-secondary mt-1">{cat.count}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Newsletter CTA ----------
function NewsletterCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-surface">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="bg-black border border-border-light rounded-3xl p-8 md:p-12 text-center shadow-2xl"
        >
          <motion.h2
            variants={fadeInUp}
            className="text-2xl sm:text-3xl font-serif font-bold"
          >
            Stay <span className="text-primary">Updated</span>
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-text-secondary max-w-xl mx-auto"
          >
            Subscribe to our newsletter and be the first to know about new
            arrivals, exclusive deals, and literary events.
          </motion.p>
          <motion.form
            variants={fadeInUp}
            className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-5 py-3 bg-surface border border-border-light rounded-full text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-primary transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-primary text-black font-semibold rounded-full hover:bg-accent transition-colors duration-300"
            >
              Subscribe
            </button>
          </motion.form>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-xs text-text-secondary/60"
          >
            No spam. Unsubscribe anytime.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="bg-black border-t border-border-light py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-serif text-primary text-lg mb-4">My Library Hub</h4>
            <p className="text-text-secondary text-sm">
              Your gateway to infinite stories.
            </p>
          </div>
          <div>
            <h5 className="font-medium mb-3">Explore</h5>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">Catalog</a></li>
              <li><a href="#" className="hover:text-primary transition">New Releases</a></li>
              <li><a href="#" className="hover:text-primary transition">Bestsellers</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-3">Support</h5>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition">FAQs</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-medium mb-3">Legal</h5>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li><a href="#" className="hover:text-primary transition">Privacy</a></li>
              <li><a href="#" className="hover:text-primary transition">Terms</a></li>
              <li><a href="#" className="hover:text-primary transition">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-border-light text-center text-text-secondary/60 text-sm">
          © {new Date().getFullYear()} My Library Hub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}