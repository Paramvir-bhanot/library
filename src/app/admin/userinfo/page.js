"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ============================================================
   CONFIGURATION – Adjust the API endpoint to match your route
   ============================================================ */
const API_URL = "/api/myProfile/get"; // Change to your actual crew/student profiles endpoint
const ITEMS_PER_PAGE = 12;

/* ============================================================
   THEME TOKENS (matching your Luxury Minimal Dark palette)
   ============================================================ */
const T = {
  gold: "#D4AF37",
  goldHover: "#C9A227",
  bg: "#000000",
  surface: "#111111",
  surfaceLight: "#1A1A1A",
  border: "#333333",
  borderGold: "#D4AF37",
  text: "#FFFFFF",
  textSecondary: "#BFBFBF",
  textGold: "#D4AF37",
  success: "#4CAF50",
  error: "#E53935",
};

/* ============================================================
   HELPER – Format date
   ============================================================ */
function formatDate(dateString) {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ============================================================
   SKELETON CARD – Shown during loading
   ============================================================ */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-[1px]"
      style={{ background: `linear-gradient(145deg, ${T.border} 0%, ${T.surface} 100%)` }}
    >
      <div
        className="rounded-2xl p-5 animate-pulse"
        style={{ background: T.surface }}
      >
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-full flex-shrink-0"
            style={{ background: T.surfaceLight }}
          />
          <div className="flex-1 space-y-2">
            <div className="h-4 rounded w-3/4" style={{ background: T.surfaceLight }} />
            <div className="h-3 rounded w-1/2" style={{ background: T.surfaceLight }} />
          </div>
        </div>
        {/* Info lines */}
        <div className="space-y-2 mt-4">
          <div className="h-3 rounded w-full" style={{ background: T.surfaceLight }} />
          <div className="h-3 rounded w-5/6" style={{ background: T.surfaceLight }} />
          <div className="h-3 rounded w-2/3" style={{ background: T.surfaceLight }} />
        </div>
        {/* Tags */}
        <div className="flex gap-2 mt-4">
          <div className="h-6 rounded-full w-16" style={{ background: T.surfaceLight }} />
          <div className="h-6 rounded-full w-20" style={{ background: T.surfaceLight }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   EMPTY STATE
   ============================================================ */
function EmptyState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      {/* Decorative ring */}
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2"
        style={{ borderColor: T.border }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.gold}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
          <path d="M11 8v6" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: T.text }}>
        No Crew Members Found
      </h3>
      <p className="mb-6 max-w-md" style={{ color: T.textSecondary }}>
        It looks like there are no profiles to display yet. Try adjusting your
        search or check back later.
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onReset}
        className="px-6 py-2.5 rounded-full font-medium text-sm transition-colors duration-300"
        style={{
          background: T.gold,
          color: T.bg,
        }}
      >
        Clear Search
      </motion.button>
    </motion.div>
  );
}

/* ============================================================
   ERROR STATE
   ============================================================ */
function ErrorState({ message, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div
        className="w-24 h-24 rounded-full flex items-center justify-center mb-6 border-2"
        style={{ borderColor: T.error }}
      >
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke={T.error}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-2" style={{ color: T.text }}>
        Something Went Wrong
      </h3>
      <p className="mb-6 max-w-md" style={{ color: T.textSecondary }}>
        {message || "Failed to load crew members. Please try again."}
      </p>
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onRetry}
        className="px-6 py-2.5 rounded-full font-medium text-sm transition-colors duration-300"
        style={{
          background: T.gold,
          color: T.bg,
        }}
      >
        Try Again
      </motion.button>
    </motion.div>
  );
}

/* ============================================================
   PROFILE DETAIL MODAL
   ============================================================ */
function ProfileModal({ profile, onClose }) {
  if (!profile) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-2xl p-[1px]"
          style={{
            background: `linear-gradient(160deg, ${T.borderGold}33 0%, ${T.border} 60%)`,
          }}
        >
          <div
            className="rounded-2xl p-6 md:p-8 relative overflow-hidden"
            style={{ background: T.surface }}
          >
            {/* Subtle gold glow */}
            <div
              className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-[0.04] pointer-events-none"
              style={{ background: `radial-gradient(circle, ${T.gold} 0%, transparent 70%)` }}
            />

            {/* Close button */}
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors duration-300"
              style={{ background: T.surfaceLight }}
              aria-label="Close modal"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>

            {/* Header */}
            <div className="flex items-center gap-5 mb-6">
              {/* Avatar */}
              {profile.image ? (
                <img
                  src={profile.image}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 flex-shrink-0"
                  style={{ borderColor: T.borderGold }}
                  onError={(e) => {
                    e.target.style.display = "none";
                    e.target.nextSibling.style.display = "flex";
                  }}
                />
              ) : null}
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 border-2 ${profile.image ? "hidden" : "flex"}`}
                style={{
                  background: T.surfaceLight,
                  borderColor: T.borderGold,
                  color: T.gold,
                }}
              >
                {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
              </div>
              <div className="min-w-0">
                <h3 className="text-xl font-bold truncate" style={{ color: T.text }}>
                  {profile.name || "Unnamed"}
                </h3>
                <p className="text-sm truncate" style={{ color: T.textSecondary }}>
                  {profile.email || "No email"}
                </p>
                {profile.gender && (
                  <span
                    className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      background: `${T.gold}15`,
                      color: T.gold,
                      border: `1px solid ${T.gold}30`,
                    }}
                  >
                    {profile.gender}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              {profile.schoolCollegeUniversityName && (
                <DetailRow icon="🏫" label="Institution" value={profile.schoolCollegeUniversityName} />
              )}
              {profile.degreeOrClass && (
                <DetailRow icon="🎓" label="Degree / Class" value={profile.degreeOrClass} />
              )}
              {profile.session && (
                <DetailRow icon="📅" label="Session" value={profile.session} />
              )}
              {profile.createdAt && (
                <DetailRow icon="🕐" label="Joined" value={formatDate(profile.createdAt)} />
              )}
            </div>

            {/* Languages */}
            {profile.languagesLearning && profile.languagesLearning.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                  Languages Learning
                </p>
                <div className="flex flex-wrap gap-2">
                  {profile.languagesLearning.map((lang, i) => (
                    <motion.span
                      key={lang}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: `${T.gold}12`,
                        color: T.gold,
                        border: `1px solid ${T.gold}25`,
                      }}
                    >
                      {lang}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional images */}
            {profile.images && profile.images.length > 0 && (
              <div>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: T.textSecondary }}>
                  Gallery
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {profile.images.map((img, i) => (
                    <motion.img
                      key={i}
                      src={img}
                      alt={`${profile.name} image ${i + 1}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.05 }}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border cursor-pointer hover:scale-105 transition-transform"
                      style={{ borderColor: T.border }}
                      onClick={() => window.open(img, "_blank")}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-base flex-shrink-0 mt-0.5">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: T.textSecondary }}>
          {label}
        </p>
        <p className="text-sm font-medium truncate" style={{ color: T.text }}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE CARD
   ============================================================ */
function ProfileCard({ profile, index, onClick }) {
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -6 }}
      onClick={() => onClick(profile)}
      className="group cursor-pointer rounded-2xl p-[1px] transition-all duration-500"
      style={{
        background: `linear-gradient(160deg, ${T.border} 0%, ${T.surface} 100%)`,
      }}
    >
      <div
        className="rounded-2xl p-5 h-full relative overflow-hidden transition-all duration-500"
        style={{ background: T.surface }}
      >
        {/* Hover gold glow */}
        <div
          className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full opacity-0 group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${T.gold} 0%, transparent 70%)` }}
        />

        {/* Top section: avatar + name */}
        <div className="flex items-center gap-4 mb-4 relative z-10">
          {/* Avatar */}
          {!imgError && profile.image ? (
            <img
              src={profile.image}
              alt={profile.name}
              className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 transition-all duration-500 group-hover:scale-105"
              style={{ borderColor: T.border }}
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 border-2 transition-all duration-500 group-hover:scale-105"
              style={{
                background: T.surfaceLight,
                borderColor: T.border,
                color: T.gold,
              }}
            >
              {profile.name ? profile.name.charAt(0).toUpperCase() : "?"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <h3
              className="font-semibold text-base truncate transition-colors duration-300 group-hover:text-[#D4AF37]"
              style={{ color: T.text }}
            >
              {profile.name || "Unnamed"}
            </h3>
            <p className="text-xs truncate" style={{ color: T.textSecondary }}>
              {profile.email || "No email"}
            </p>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
            style={{ background: `${T.gold}15` }}
            whileHover={{ scale: 1.1 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </motion.div>
        </div>

        {/* Info rows */}
        <div className="space-y-2 mb-4 relative z-10">
          {profile.schoolCollegeUniversityName && (
            <p className="text-xs truncate flex items-center gap-2" style={{ color: T.textSecondary }}>
              <span className="flex-shrink-0">🏫</span>
              <span className="truncate">{profile.schoolCollegeUniversityName}</span>
            </p>
          )}
          {profile.degreeOrClass && (
            <p className="text-xs truncate flex items-center gap-2" style={{ color: T.textSecondary }}>
              <span className="flex-shrink-0">🎓</span>
              <span className="truncate">{profile.degreeOrClass}</span>
            </p>
          )}
          {profile.session && (
            <p className="text-xs truncate flex items-center gap-2" style={{ color: T.textSecondary }}>
              <span className="flex-shrink-0">📅</span>
              <span className="truncate">{profile.session}</span>
            </p>
          )}
        </div>

        {/* Gender badge */}
        {profile.gender && (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider mb-3 relative z-10"
            style={{
              background: `${T.gold}10`,
              color: T.gold,
              border: `1px solid ${T.gold}20`,
            }}
          >
            {profile.gender}
          </span>
        )}

        {/* Languages tags */}
        {profile.languagesLearning && profile.languagesLearning.length > 0 && (
          <div className="flex flex-wrap gap-1.5 relative z-10">
            {profile.languagesLearning.slice(0, 3).map((lang) => (
              <span
                key={lang}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: T.surfaceLight,
                  color: T.textSecondary,
                  border: `1px solid ${T.border}`,
                }}
              >
                {lang}
              </span>
            ))}
            {profile.languagesLearning.length > 3 && (
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  background: T.surfaceLight,
                  color: T.gold,
                  border: `1px solid ${T.border}`,
                }}
              >
                +{profile.languagesLearning.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ============================================================
   PAGINATION COMPONENT
   ============================================================ */
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="flex items-center justify-center gap-1.5 mt-10 flex-wrap"
    >
      {/* Previous */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: currentPage === 1 ? "transparent" : T.surfaceLight,
          border: `1px solid ${T.border}`,
        }}
        aria-label="Previous page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
      </motion.button>

      {/* First + ellipsis */}
      {start > 1 && (
        <>
          <PageButton page={1} onClick={onPageChange} isActive={false} />
          {start > 2 && <span className="px-1" style={{ color: T.textSecondary }}>…</span>}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          onClick={onPageChange}
          isActive={page === currentPage}
        />
      ))}

      {/* Last + ellipsis */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1" style={{ color: T.textSecondary }}>…</span>}
          <PageButton page={totalPages} onClick={onPageChange} isActive={false} />
        </>
      )}

      {/* Next */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
        style={{
          background: currentPage === totalPages ? "transparent" : T.surfaceLight,
          border: `1px solid ${T.border}`,
        }}
        aria-label="Next page"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6" />
        </svg>
      </motion.button>
    </motion.div>
  );
}

function PageButton({ page, onClick, isActive }) {
  return (
    <motion.button
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.9 }}
      onClick={() => onClick(page)}
      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
      style={{
        background: isActive ? T.gold : T.surfaceLight,
        color: isActive ? T.bg : T.textSecondary,
        border: isActive ? `1px solid ${T.gold}` : `1px solid ${T.border}`,
        boxShadow: isActive ? `0 0 20px ${T.gold}30` : "none",
      }}
    >
      {page}
    </motion.button>
  );
}

/* ============================================================
   MAIN PAGE COMPONENT
   ============================================================ */
export default function CrewMembersPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const debounceRef = useRef(null);
  const gridRef = useRef(null);

  /* ---- Fetch data ---- */
  const fetchProfiles = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}?page=${page}&limit=${ITEMS_PER_PAGE}`);

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const json = await res.json();

      if (json.success) {
        setProfiles(json.data || []);
        setTotalPages(json.pagination?.pages || 1);
        setTotalItems(json.pagination?.total || 0);
        setCurrentPage(page);
      } else {
        throw new Error(json.error || "Failed to fetch data");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message || "An unexpected error occurred");
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfiles(1);
  }, [fetchProfiles]);

  /* ---- Search with debounce ---- */
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      // If searching, reset to page 1 (re-fetch or filter client-side)
      // For simplicity, we re-fetch page 1; the API could support a search param
      if (value.trim() === "") {
        fetchProfiles(1);
      }
      // Client-side filtering note: for production, add ?search= param to API
    }, 400);
  };

  /* ---- Client-side filtered profiles ---- */
  const filteredProfiles = searchQuery.trim()
    ? profiles.filter((p) => {
        const q = searchQuery.toLowerCase();
        return (
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.email && p.email.toLowerCase().includes(q)) ||
          (p.schoolCollegeUniversityName && p.schoolCollegeUniversityName.toLowerCase().includes(q)) ||
          (p.degreeOrClass && p.degreeOrClass.toLowerCase().includes(q)) ||
          (p.languagesLearning && p.languagesLearning.some((l) => l.toLowerCase().includes(q)))
        );
      })
    : profiles;

  /* ---- Handlers ---- */
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    fetchProfiles(page);
    // Scroll to top of grid
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const openModal = (profile) => {
    setSelectedProfile(profile);
    setModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = "";
    setTimeout(() => setSelectedProfile(null), 300);
  };

  const handleRetry = () => {
    fetchProfiles(currentPage);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    fetchProfiles(1);
  };

  /* ---- Derived state ---- */
  const showEmpty = !loading && !error && filteredProfiles.length === 0;
  const showNoResults = showEmpty && searchQuery.trim() !== "";

  /* ============================================================
     RENDER
     ============================================================ */
  return (
    <div
      className="min-h-screen"
      style={{ background: T.bg, color: T.text }}
    >
      {/* ========== HEADER ========== */}
      <header className="relative pt-16 pb-8 px-4 md:pt-24 md:pb-12">
        {/* Subtle background glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center, ${T.gold} 0%, transparent 70%)`,
          }}
        />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Small label */}
            <span
              className="inline-block text-xs font-semibold uppercase tracking-[0.2em] mb-3 px-3 py-1 rounded-full"
              style={{
                background: `${T.gold}12`,
                color: T.gold,
                border: `1px solid ${T.gold}20`,
              }}
            >
              Meet the Crew
            </span>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4"
              style={{ color: T.text }}
            >
              Our{" "}
              <span style={{ color: T.gold }}>Crew Members</span>
            </h1>

            <p
              className="max-w-lg mx-auto text-base md:text-lg"
              style={{ color: T.textSecondary }}
            >
              Discover the talented individuals behind our community. Click any
              card to learn more about their journey.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="mt-8 mx-auto w-24 h-[1px]"
            style={{ background: `linear-gradient(90deg, transparent, ${T.gold}, transparent)` }}
          />
        </div>
      </header>

      {/* ========== SEARCH BAR ========== */}
      <div className="max-w-6xl mx-auto px-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative max-w-md mx-auto"
        >
          {/* Search icon */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by name, institution, language..."
            className="w-full pl-12 pr-12 py-3.5 rounded-full text-sm transition-all duration-300 outline-none focus:ring-2 focus:ring-offset-0"
            style={{
              background: T.surface,
              color: T.text,
              border: `1px solid ${T.border}`,
              ringColor: T.gold,
            }}
            onFocus={(e) => {
              e.target.style.borderColor = T.gold;
              e.target.style.boxShadow = `0 0 0 3px ${T.gold}15`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = T.border;
              e.target.style.boxShadow = "none";
            }}
          />

          {/* Clear button */}
          {searchQuery && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              onClick={handleClearSearch}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center transition-colors duration-200"
              style={{ background: T.surfaceLight }}
              aria-label="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.textSecondary} strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          )}
        </motion.div>

        {/* Result count */}
        {!loading && !error && profiles.length > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mt-4 text-xs"
            style={{ color: T.textSecondary }}
          >
            {searchQuery.trim()
              ? `Showing ${filteredProfiles.length} result${filteredProfiles.length !== 1 ? "s" : ""} for "${searchQuery}"`
              : `${totalItems} crew member${totalItems !== 1 ? "s" : ""} total`}
          </motion.p>
        )}
      </div>

      {/* ========== CONTENT AREA ========== */}
      <div ref={gridRef} className="max-w-6xl mx-auto px-4 pb-20">
        {/* ---- Loading State ---- */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ---- Error State ---- */}
        {!loading && error && <ErrorState message={error} onRetry={handleRetry} />}

        {/* ---- Empty / No Results ---- */}
        {showNoResults && <EmptyState onReset={handleClearSearch} />}
        {showEmpty && !searchQuery.trim() && !error && !loading && (
          <EmptyState onReset={handleClearSearch} />
        )}

        {/* ---- Profiles Grid ---- */}
        {!loading && !error && filteredProfiles.length > 0 && (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            <AnimatePresence mode="popLayout">
              {filteredProfiles.map((profile, index) => (
                <ProfileCard
                  key={profile._id || profile.applicantId || index}
                  profile={profile}
                  index={index}
                  onClick={openModal}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ---- Pagination ---- */}
        {!loading && !error && !searchQuery.trim() && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* ========== MODAL ========== */}
      <AnimatePresence>
        {modalOpen && selectedProfile && (
          <ProfileModal profile={selectedProfile} onClose={closeModal} />
        )}
      </AnimatePresence>

      {/* ========== KEYBOARD SUPPORT ========== */}
      {modalOpen && (
        <div
          role="presentation"
          className="fixed inset-0 z-40"
          onClick={closeModal}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeModal();
          }}
        />
      )}
    </div>
  );
}