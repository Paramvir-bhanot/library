// app/about/page.jsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Link from "next/link";

// --- Icon Components (inline SVG for zero dependencies) ---
const Icons = {
  GraduationCap: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 10.5l-10-5L2 10.5l10 5 10-5z" />
      <path d="M6 12.5v4l6 3 6-3v-4" />
      <path d="M18 13.5v4" />
    </svg>
  ),
  BookOpen: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  Users: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Globe: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Award: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  ),
  ChevronRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Shield: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Clock: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Laptop: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
    </svg>
  ),
  ArrowRight: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
  Sparkle: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l1.5 5.5L19 9l-5.5 1.5L12 16l-1.5-5.5L5 9l5.5-1.5z" />
      <path d="M18 15l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" opacity="0.6" />
    </svg>
  ),
};

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.4, 0.25, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } },
};

// --- Reusable Section Wrapper ---
function AnimatedSection({ children, className = "", id }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.section
      ref={ref}
      id={id}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={staggerContainer}
    >
      {children}
    </motion.section>
  );
}

// --- Glowing Gold Line Divider ---
function GoldDivider() {
  return (
    <div className="flex items-center justify-center gap-3 my-6">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]/60" />
      <Icons.Sparkle className="w-4 h-4 text-[#D4AF37]" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]/60" />
    </div>
  );
}

// --- Animated Counter ---
function AnimatedCounter({ target, suffix = "+", label, icon: Icon, duration = 2 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  useEffect(() => {
    if (!isInView) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);

  return (
    <motion.div ref={ref} variants={scaleIn} className="text-center p-6">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#D4AF37]" />
      </div>
      <span className="block text-4xl md:text-5xl font-bold text-white mb-1 tabular-nums">
        {count.toLocaleString()}{suffix}
      </span>
      <span className="text-sm uppercase tracking-widest text-[#BFBFBF]">{label}</span>
    </motion.div>
  );
}

// --- Department Card ---
function DepartmentCard({ name, courses, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeInUp}
      custom={index}
      whileHover={{ y: -8, transition: { duration: 0.3, ease: "easeOut" } }}
      className="group relative bg-[#111111] border border-[#333333] rounded-2xl p-6 md:p-8 hover:border-[#D4AF37]/60 transition-all duration-500 overflow-hidden"
    >
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10">
        <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center mb-5 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
          <Icons.BookOpen className="w-5 h-5 text-[#D4AF37]" />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-3">{name}</h3>
        <p className="text-[#BFBFBF] text-sm leading-relaxed mb-4">
          {courses.length} {courses.length === 1 ? "Program" : "Programs"} available in Distance / Online mode
        </p>
        <div className="flex flex-wrap gap-2">
          {courses.map((course, i) => (
            <span
              key={i}
              className="text-xs px-3 py-1.5 rounded-full bg-[#1a1a1a] text-[#BFBFBF] border border-[#333333] group-hover:border-[#D4AF37]/30 group-hover:text-[#D4AF37] transition-all duration-300"
            >
              {course.course_name}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// --- Feature Card ---
function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div
      variants={fadeInUp}
      custom={index}
      whileHover={{ scale: 1.03 }}
      className="bg-[#111111] border border-[#333333] rounded-2xl p-6 md:p-7 hover:border-[#D4AF37]/40 transition-all duration-400 group cursor-default"
    >
      <div className="w-11 h-11 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center mb-4 group-hover:bg-[#D4AF37]/20 transition-colors duration-300">
        <Icon className="w-5 h-5 text-[#D4AF37]" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-[#BFBFBF] text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

// --- Main Page Component ---
export default function AboutPage() {
  const { scrollY } = useScroll();
  const heroRef = useRef(null);
  const heroInView = useInView(heroRef, { once: true });

  // Parallax for hero background
  const heroBgY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0.3]);

  // Department data (from the provided JSON)
  const departments = [
    {
      name: "Arts",
      courses: [
        { course_name: "BA", duration: "3 Years" },
        { course_name: "MA", duration: "2 Years" },
      ],
    },
    {
      name: "Library & Information Science",
      courses: [
        { course_name: "B.Lib.I.Sc", duration: "1 Year" },
        { course_name: "M.Lib.I.Sc", duration: "1 Year" },
      ],
    },
    {
      name: "Computer Applications",
      courses: [
        { course_name: "BCA", duration: "3 Years" },
        { course_name: "MCA", duration: "2 Years" },
      ],
    },
    {
      name: "Commerce",
      courses: [
        { course_name: "B.Com", duration: "3 Years" },
        { course_name: "M.Com", duration: "2 Years" },
      ],
    },
    {
      name: "Management",
      courses: [
        { course_name: "BBA", duration: "3 Years" },
        { course_name: "MBA", duration: "2 Years" },
      ],
    },
    {
      name: "Information Technology",
      courses: [
        { course_name: "B.Sc IT", duration: "3 Years" },
        { course_name: "M.Sc IT", duration: "2 Years" },
      ],
    },
  ];

  const features = [
    {
      icon: Icons.Laptop,
      title: "100% Online Learning",
      description: "Access world-class education from anywhere with our fully digital learning platform designed for modern learners.",
    },
    {
      icon: Icons.Clock,
      title: "Flexible Schedule",
      description: "Study at your own pace with self-paced modules that fit around your professional and personal commitments.",
    },
    {
      icon: Icons.Award,
      title: "UGC-Entitled Degrees",
      description: "All programs are recognized by the University Grants Commission, ensuring your degree holds national value.",
    },
    {
      icon: Icons.Shield,
      title: "Industry-Aligned Curriculum",
      description: "Courses designed in collaboration with industry experts to equip you with skills that employers demand.",
    },
    {
      icon: Icons.Users,
      title: "Dedicated Mentorship",
      description: "One-on-one guidance from experienced faculty and industry mentors throughout your academic journey.",
    },
    {
      icon: Icons.Globe,
      title: "Global Alumni Network",
      description: "Join a community of 30,000+ distance learning alumni spread across 50+ countries worldwide.",
    },
  ];

  const stats = [
    { target: 30000, suffix: "+", label: "Distance Learners", icon: Icons.Users },
    { target: 200, suffix: "+", label: "Faculty Members", icon: Icons.GraduationCap },
    { target: 50, suffix: "+", label: "Countries Represented", icon: Icons.Globe },
    { target: 95, suffix: "%", label: "Placement Rate", icon: Icons.Award },
  ];

  return (
    <main className="min-h-screen bg-[#000000] text-[#F5F5F5] overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-white">
      {/* ==================== NAVBAR ==================== */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.4, 0.25, 1] }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-[#333333]/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <Icons.GraduationCap className="w-7 h-7 md:w-8 md:h-8 text-[#D4AF37] group-hover:scale-110 transition-transform duration-300" />
            <span className="text-lg md:text-xl font-bold text-white tracking-tight">
              LPU<span className="text-[#D4AF37]"> Distance</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider text-[#BFBFBF]">
            {["Home", "Programs", "About", "Admissions", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "About" ? "/about" : `/${item.toLowerCase()}`}
                className={`hover:text-[#D4AF37] transition-colors duration-300 relative py-1 ${
                  item === "About" ? "text-[#D4AF37]" : ""
                }`}
              >
                {item}
                {item === "About" && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#D4AF37] rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>
          <Link
            href="/apply"
            className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-black font-semibold text-sm hover:bg-[#C9A227] transition-all duration-300 hover:shadow-lg hover:shadow-[#D4AF37]/25 active:scale-95"
          >
            Apply Now
            <Icons.ArrowRight className="w-4 h-4" />
          </Link>
          {/* Mobile menu button */}
          <button className="md:hidden p-2 text-[#BFBFBF] hover:text-[#D4AF37] transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </motion.nav>

      {/* ==================== HERO SECTION ==================== */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        {/* Animated background gradient */}
        <motion.div
          style={{ y: heroBgY, opacity: heroOpacity }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[180px]" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#D4AF37]/8 rounded-full blur-[150px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[200px]" />
        </motion.div>

        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.4, 0.25, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-xs md:text-sm uppercase tracking-widest mb-6 md:mb-8"
          >
            <Icons.Sparkle className="w-3.5 h-3.5" />
            Distance & Online Education
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] tracking-tight mb-6"
          >
            Your Future,
            <br />
            <span className="text-[#D4AF37] relative">
              Your Terms
              <motion.span
                initial={{ width: 0 }}
                animate={heroInView ? { width: "100%" } : {}}
                transition={{ duration: 1, delay: 1, ease: [0.25, 0.4, 0.25, 1] }}
                className="absolute -bottom-2 left-0 h-1 bg-[#D4AF37]/60 rounded-full"
              />
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.25, 0.4, 0.25, 1] }}
            className="text-[#BFBFBF] text-base md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Lovely Professional University brings world-class education to your doorstep. 
            Pursue your dreams with our flexible distance and online programs designed for 
            the modern learner.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.25, 0.4, 0.25, 1] }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/programs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#D4AF37] text-black font-semibold text-base hover:bg-[#C9A227] transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 active:scale-95 group"
            >
              Explore Programs
              <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent text-[#D4AF37] font-semibold text-base border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 active:scale-95"
            >
              Talk to an Advisor
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-[#BFBFBF]/60 uppercase tracking-widest">Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-5 h-8 rounded-full border-2 border-[#BFBFBF]/30 flex items-start justify-center p-1"
            >
              <motion.div className="w-1 h-2 rounded-full bg-[#D4AF37]" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ==================== STATS SECTION ==================== */}
      <AnimatedSection className="relative py-16 md:py-20 bg-[#0a0a0a] border-y border-[#333333]/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {stats.map((stat, i) => (
              <AnimatedCounter key={i} {...stat} duration={2.5} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== OUR STORY SECTION ==================== */}
      <AnimatedSection className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Left - Image/Visual */}
            <motion.div variants={fadeInLeft} className="relative">
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] bg-gradient-to-br from-[#111111] to-[#0a0a0a] border border-[#333333]/50">
                {/* Decorative elements */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icons.GraduationCap className="w-24 h-24 md:w-32 md:h-32 text-[#D4AF37]/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-[#000000] via-transparent to-transparent" />
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute bottom-6 left-6 right-6 bg-[#111111]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-2xl p-5"
                >
                  <p className="text-[#D4AF37] text-sm uppercase tracking-widest font-semibold mb-1">Established</p>
                  <p className="text-white text-3xl font-bold">2005</p>
                  <p className="text-[#BFBFBF] text-xs mt-1">Pioneering distance education for over 19 years</p>
                </motion.div>
              </div>
              {/* Glow behind the image */}
              <div className="absolute -inset-4 bg-[#D4AF37]/5 rounded-[2rem] blur-3xl -z-10" />
            </motion.div>

            {/* Right - Content */}
            <motion.div variants={fadeInRight} className="space-y-6">
              <span className="text-[#D4AF37] text-sm uppercase tracking-widest font-semibold">Our Story</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Redefining{" "}
                <span className="text-[#D4AF37]">Distance Education</span> for the Digital Age
              </h2>
              <GoldDivider />
              <p className="text-[#BFBFBF] text-base md:text-lg leading-relaxed">
                At Lovely Professional University, we believe that quality education should have no boundaries. 
                Our distance and online programs are meticulously crafted to deliver the same academic rigor and 
                industry relevance as our on-campus offerings.
              </p>
              <p className="text-[#BFBFBF] text-base leading-relaxed">
                With state-of-the-art digital infrastructure, a curriculum aligned with global standards, and 
                a learner-centric approach, LPU Distance Education empowers students across India and beyond 
                to achieve their academic and professional aspirations without compromising their current commitments.
              </p>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/about/mission"
                  className="inline-flex items-center gap-2 text-[#D4AF37] font-semibold group mt-4"
                >
                  Learn more about our mission
                  <Icons.ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== DEPARTMENTS SECTION ==================== */}
      <AnimatedSection className="py-20 md:py-28 bg-[#0a0a0a] border-y border-[#333333]/30 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-14 md:mb-18">
            <span className="text-[#D4AF37] text-sm uppercase tracking-widest font-semibold">Academic Excellence</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
              Our <span className="text-[#D4AF37]">Departments</span>
            </h2>
            <GoldDivider />
            <p className="text-[#BFBFBF] text-base max-w-2xl mx-auto">
              Explore a diverse range of disciplines offered through our distance and online learning programs, 
              each designed to provide comprehensive knowledge and practical skills.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {departments.map((dept, i) => (
              <DepartmentCard key={i} name={dept.name} courses={dept.courses} index={i} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== WHY CHOOSE US SECTION ==================== */}
      <AnimatedSection className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeInUp} className="text-center mb-14 md:mb-18">
            <span className="text-[#D4AF37] text-sm uppercase tracking-widest font-semibold">The LPU Advantage</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mt-3 mb-4">
              Why Choose <span className="text-[#D4AF37]">LPU Distance</span>?
            </h2>
            <GoldDivider />
            <p className="text-[#BFBFBF] text-base max-w-2xl mx-auto">
              We combine academic excellence with technological innovation to deliver an unparalleled 
              learning experience that fits your lifestyle.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} index={i} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* ==================== TESTIMONIAL / QUOTE SECTION ==================== */}
      <AnimatedSection className="relative py-20 md:py-28 bg-[#0a0a0a] border-y border-[#333333]/30 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div variants={scaleIn}>
            <Icons.Sparkle className="w-8 h-8 text-[#D4AF37] mx-auto mb-6" />
          </motion.div>
          <motion.blockquote variants={fadeInUp} className="text-2xl md:text-3xl lg:text-4xl font-medium text-white leading-relaxed italic mb-8">
            &ldquo;Education is not the filling of a pail, but the lighting of a fire. At LPU Distance Education, 
            we ignite curiosity and empower learners to illuminate their own paths.&rdquo;
          </motion.blockquote>
          <motion.div variants={fadeInUp} className="flex items-center justify-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#C9A227] flex items-center justify-center text-black font-bold text-lg">
              LP
            </div>
            <div className="text-left">
              <p className="text-white font-semibold">Dr. Ashok Kumar Mittal</p>
              <p className="text-[#BFBFBF] text-sm">Chancellor, Lovely Professional University</p>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ==================== CTA SECTION ==================== */}
      <AnimatedSection className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={scaleIn}
            className="relative bg-gradient-to-br from-[#111111] to-[#0d0d0d] border border-[#D4AF37]/20 rounded-3xl p-8 md:p-14 overflow-hidden"
          >
            {/* Decorative corner glows */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/8 rounded-full blur-[80px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-[#D4AF37]/5 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <motion.div variants={fadeInUp}>
                <Icons.GraduationCap className="w-14 h-14 text-[#D4AF37] mx-auto mb-6" />
              </motion.div>
              <motion.h2 variants={fadeInUp} className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to{" "}
                <span className="text-[#D4AF37] relative">
                  Transform
                  <span className="absolute -bottom-1 left-0 right-0 h-1 bg-[#D4AF37]/40 rounded-full" />
                </span>{" "}
                Your Future?
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-[#BFBFBF] text-base md:text-lg max-w-xl mx-auto mb-10">
                Take the first step towards achieving your academic and career goals. Our admission counselors 
                are ready to guide you through the process.
              </motion.p>
              <motion.div
                variants={fadeInUp}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <Link
                  href="/apply"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-[#D4AF37] text-black font-semibold text-base hover:bg-[#C9A227] transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 active:scale-95 group"
                >
                  Start Your Application
                  <Icons.ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
                <Link
                  href="/programs"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-transparent text-[#D4AF37] font-semibold text-base border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all duration-300 active:scale-95"
                >
                  Browse Programs
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-[#0a0a0a] border-t border-[#333333]/50 py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Icons.GraduationCap className="w-6 h-6 text-[#D4AF37]" />
                <span className="text-lg font-bold text-white">LPU Distance</span>
              </div>
              <p className="text-[#BFBFBF] text-sm leading-relaxed">
                Empowering learners worldwide with quality distance and online education from Lovely Professional University.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Quick Links</h4>
              <div className="space-y-2">
                {["Programs", "Admissions", "About Us", "Contact"].map((link) => (
                  <Link
                    key={link}
                    href={`/${link.toLowerCase().replace(/\s/g, "-")}`}
                    className="block text-[#BFBFBF] text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    {link}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Programs</h4>
              <div className="space-y-2">
                {["Undergraduate", "Postgraduate", "Diploma", "Certification"].map((prog) => (
                  <Link
                    key={prog}
                    href={`/programs/${prog.toLowerCase()}`}
                    className="block text-[#BFBFBF] text-sm hover:text-[#D4AF37] transition-colors duration-200"
                  >
                    {prog}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Connect</h4>
              <div className="space-y-2">
                <p className="text-[#BFBFBF] text-sm">admissions@lpu.in</p>
                <p className="text-[#BFBFBF] text-sm">+91 1824 404404</p>
                <p className="text-[#BFBFBF] text-sm">Jalandhar, Punjab, India</p>
              </div>
            </div>
          </div>
          <div className="border-t border-[#333333]/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[#BFBFBF]/60 text-xs">
              &copy; {new Date().getFullYear()} Lovely Professional University. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs text-[#BFBFBF]/60">
              <Link href="/privacy" className="hover:text-[#D4AF37] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-[#D4AF37] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}