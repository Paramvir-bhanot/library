"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import courseData from "@/data/knowlage.json";

// ------------------- Skeleton Card -------------------
const SkeletonCard = () => (
  <div className="bg-[#111111] rounded-2xl p-6 border border-white/5 animate-pulse">
    <div className="h-7 w-3/4 bg-white/10 rounded mb-4" />
    <div className="h-4 w-1/3 bg-white/10 rounded mb-3" />
    <div className="h-4 w-full bg-white/10 rounded mb-2" />
    <div className="h-4 w-5/6 bg-white/10 rounded mb-5" />
    <div className="flex gap-2 mb-4">
      <div className="h-6 w-16 bg-white/10 rounded-full" />
      <div className="h-6 w-16 bg-white/10 rounded-full" />
    </div>
    <div className="flex justify-between items-center">
      <div className="h-8 w-24 bg-white/10 rounded-lg" />
      <div className="h-8 w-24 bg-white/10 rounded-lg" />
    </div>
  </div>
);

const toSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

// ------------------- Course Card -------------------
const CourseCard = ({ course, isExpanded, onToggleExpand }) => {
  const {
    id,
    course_name,
    duration,
    description,
    subjects = [],
  } = course;

  const previewSubjects = subjects.slice(0, 3);
  const hasMoreSubjects = subjects.length > 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6, scale: 1.01 }}
      className="group relative bg-[#111111]/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-[#D4AF37]/40 shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* Course Name */}
      <h3 className="text-2xl font-bold text-white mb-2 tracking-tight">
        {course_name}
      </h3>

      {/* Duration Badge */}
      <span className="inline-block px-3 py-1 text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37] rounded-full border border-[#D4AF37]/20 mb-3">
        {duration}
      </span>

      {/* Description with expand/collapse */}
      <div className="mb-4">
        <p
          className={`text-gray-300 text-sm leading-relaxed ${
            !isExpanded ? "line-clamp-2" : ""
          }`}
        >
          {description}
        </p>
        <button
          onClick={onToggleExpand}
          className="mt-1 text-xs font-medium text-[#D4AF37] hover:text-[#C9A227] transition-colors"
        >
          {isExpanded ? "Show less" : "Read more"}
        </button>
      </div>

      {/* Subjects Preview */}
      {previewSubjects.length > 0 && (
        <div className="mb-5">
          <p className="text-xs uppercase tracking-wider text-gray-500 mb-2">
            Key Subjects
          </p>
          <div className="flex flex-wrap gap-2">
            {previewSubjects.map((subject, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-white/5 text-gray-300 rounded-md border border-white/10"
              >
                {subject}
              </span>
            ))}
            {hasMoreSubjects && (
              <span className="px-2 py-1 text-xs bg-white/5 text-gray-400 rounded-md border border-white/10">
                +{subjects.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-end">
        <Link href={`/course/${id}`}>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center px-5 py-2 bg-[#D4AF37] text-black font-semibold text-sm rounded-lg hover:bg-[#C9A227] transition-colors shadow-lg shadow-[#D4AF37]/20"
          >
            View Details
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

// ------------------- Main Page Component -------------------
export default function AllCoursesPage() {
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState("All");
  const [expandedCards, setExpandedCards] = useState({});

  // Simulate data loading (replace with actual data fetch if needed)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  // Extract departments and flatten courses
  const { departments, allCourses } = useMemo(() => {
    const deptList = courseData?.departments || [];
    const courses = deptList.flatMap((dept) =>
      (dept?.courses || []).map((course) => ({
        ...course,
        id: toSlug(course.course_name),
        department: dept.name,
      }))
    );
    return {
      departments: ["All", ...deptList.map((dept) => dept.name)],
      allCourses: courses,
    };
  }, []);

  // Filter courses based on search and department
  const filteredCourses = useMemo(() => {
    let courses = allCourses;
    if (activeDepartment !== "All") {
      courses = courses.filter((c) => c.department === activeDepartment);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      courses = courses.filter((c) =>
        c.course_name.toLowerCase().includes(term)
      );
    }
    return courses;
  }, [allCourses, activeDepartment, searchTerm]);

  const toggleExpand = (courseId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [courseId]: !prev[courseId],
    }));
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header Section */}
      <section className="pt-24 pb-8 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4"
        >
          Explore{" "}
          <span className="text-[#D4AF37] relative inline-block">
            All Courses
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-[#D4AF37] to-transparent rounded-full" />
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 text-lg max-w-2xl mx-auto"
        >
          Discover distance learning programs designed for your success at
          Lovely Professional University.
        </motion.p>
      </section>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-20 bg-black/90 backdrop-blur-md border-b border-white/10 py-4 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-4 md:mb-0 md:max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#111111] border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]/50 focus:ring-2 focus:ring-[#D4AF37]/20 transition-all"
            />
          </div>

          {/* Department Filter Tabs */}
          <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 md:gap-3 pb-1 min-w-max">
              {departments.map((dept) => (
                <motion.button
                  key={dept}
                  onClick={() => setActiveDepartment(dept)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeDepartment === dept
                      ? "text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30"
                      : "text-gray-400 hover:text-white bg-transparent border border-transparent hover:bg-white/5"
                  }`}
                >
                  {dept}
                  {activeDepartment === dept && (
                    <motion.span
                      layoutId="activeFilter"
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-[#D4AF37] rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <section className="px-4 md:px-8 py-12 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            // Skeleton Loading State
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {[...Array(8)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            // Empty State
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 mb-6 rounded-full bg-[#111111] flex items-center justify-center border border-white/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-10 w-10 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                No courses found
              </h3>
              <p className="text-gray-400 max-w-md">
                We couldn't find any courses matching your criteria. Try adjusting
                your search or filter.
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveDepartment("All");
                }}
                className="mt-6 px-6 py-2 bg-[#D4AF37] text-black font-semibold rounded-lg hover:bg-[#C9A227] transition-colors"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            // Course Cards with Stagger Animation
            <motion.div
              key="results"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              <AnimatePresence>
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isExpanded={!!expandedCards[course.id]}
                    onToggleExpand={() => toggleExpand(course.id)}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}