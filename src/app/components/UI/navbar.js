"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import knowledge from "@/src/app/data/knowlage.json"; // FIXED: typo "knowlage" -> "knowledge"

// ----------------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------------
const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

// ----------------------------------------------------------------------
// Custom hook: outside click detection
// ----------------------------------------------------------------------
const useOutsideClick = (ref, callback) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [ref, callback]);
};

// ----------------------------------------------------------------------
// Sub‑components
// ----------------------------------------------------------------------

/**
 * Desktop dropdown for "Courses" department links.
 */
const DepartmentDropdown = ({ departmentLinks }) => (
  <div className="invisible absolute left-0 top-full mt-2 z-30 w-64 rounded-lg border border-gray-800 bg-gray-950 p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
    <div className="mb-2 border-b border-gray-800 pb-2 text-xs uppercase tracking-widest text-yellow-500">
      Departments
    </div>
    <div className="space-y-1 max-h-96 overflow-y-auto">
      {departmentLinks.map((dept) => (
        <Link
          key={dept.name}
          href={dept.href}
          className="block rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-900 hover:text-yellow-500"
        >
          {dept.name}
        </Link>
      ))}
    </div>
  </div>
);

/**
 * User avatar + dropdown (desktop).
 */
const UserMenu = ({ session, imageError, setImageError, onLogout }) => {
  const menuRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);

  useOutsideClick(menuRef, () => setIsOpen(false));

  const toggleOpen = useCallback(() => setIsOpen((prev) => !prev), []);

  return (
    <div className="relative ml-4" ref={menuRef}>
      <button
        onClick={toggleOpen}
        className="flex items-center space-x-2 md:space-x-3 group transition-colors hover:text-yellow-500 min-h-10 min-w-10"
      >
        <div className="relative">
          <div className="w-9 h-9 md:w-10 md:h-10 rounded-full border-2 border-yellow-500 overflow-hidden flex items-center justify-center bg-gray-900 flex-shrink-0">
            {session.user.image && !imageError ? (
              <img
                src={session.user.image}
                alt={session.user.name || "User"}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <span className="text-yellow-500 font-bold text-sm md:text-lg">
                {session.user.name?.[0]?.toUpperCase() || "U"}
              </span>
            )}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border-2 border-black bg-green-500" />
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-gray-300 group-hover:text-yellow-500 transition-colors truncate max-w-[120px]">
            {session.user.name || "User"}
          </p>
          <p className="text-xs text-gray-500">
            {session.user.provider === "google" ? "Google" : "User"}
          </p>
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-gray-950 border border-gray-800 rounded-lg shadow-xl py-2 z-50">
          <div className="px-4 py-2 border-b border-gray-800">
            <p className="text-sm font-medium text-gray-300 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.email}
            </p>
          </div>
          <button
            onClick={onLogout}
            className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-900 hover:text-yellow-500 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Login + Get Started buttons (desktop & mobile).
 */
const AuthButtons = ({ onLogin, onRegister, isMobile = false }) => (
  <div className={`flex items-center ${isMobile ? "flex-col gap-2 w-full" : "gap-2 md:gap-3"}`}>
    <button
      onClick={onLogin}
      className={`px-4 md:px-5 py-2 border border-yellow-500 text-yellow-500 font-semibold rounded-md hover:bg-yellow-500/10 transition-colors ${
        isMobile ? "w-full" : ""
      }`}
    >
      Login
    </button>
    <button
      onClick={onRegister}
      className={`px-4 md:px-5 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20 ${
        isMobile ? "w-full" : ""
      }`}
    >
      Get Started
    </button>
  </div>
);

/**
 * Desktop navigation (main links + departments dropdown + auth).
 */
const DesktopNav = ({
  navLinks,
  departmentLinks,
  isActive,
  session,
  isLoggedIn,
  imageError,
  setImageError,
  onLogin,
  onRegister,
  onLogout,
}) => (
  <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
    {navLinks.map((link) => (
      <div key={link.name} className="relative group">
        <Link
          href={link.href}
          className={`relative text-sm lg:text-base font-medium transition-colors py-2 ${
            isActive(link.href)
              ? "text-yellow-500"
              : "text-gray-400 hover:text-yellow-500"
          }`}
        >
          {link.name}
          {isActive(link.href) && (
            <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-yellow-500 rounded-full" />
          )}
        </Link>
        {link.name === "Courses" && (
          <DepartmentDropdown departmentLinks={departmentLinks} />
        )}
      </div>
    ))}

    {isLoggedIn ? (
      <UserMenu
        session={session}
        imageError={imageError}
        setImageError={setImageError}
        onLogout={onLogout}
      />
    ) : (
      <AuthButtons onLogin={onLogin} onRegister={onRegister} />
    )}
  </div>
);

/**
 * Mobile navigation (sliding menu).
 */
const MobileNav = ({
  isOpen,
  navLinks,
  departmentLinks,
  isActive,
  session,
  isLoggedIn,
  imageError,
  setImageError,
  onLogin,
  onRegister,
  onLogout,
  closeMenu,
}) => {
  const [isDepartmentsOpen, setIsDepartmentsOpen] = useState(false);

  // Reset departments menu when mobile menu closes
  useEffect(() => {
    if (!isOpen) {
      setIsDepartmentsOpen(false);
    }
  }, [isOpen]);

  return (
    <div
      className={`md:hidden fixed inset-0 top-20 left-0 right-0 z-40 bg-gray-950 border-t border-gray-800 transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[calc(100vh-80px)] opacity-100 visible" : "max-h-0 opacity-0 invisible"
      }`}
    >
      <div className="h-[calc(100vh-80px)] overflow-y-auto">
        <div className="px-4 pt-4 pb-20 space-y-1">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.name === "Courses" ? (
                <>
                  <button
                    onClick={() => setIsDepartmentsOpen(!isDepartmentsOpen)}
                    className={`w-full text-left py-3 px-4 text-base font-medium transition-all duration-200 flex items-center justify-between rounded-md ${
                      isActive(link.href)
                        ? "text-yellow-500 bg-gray-900"
                        : "text-gray-400 hover:text-yellow-500 hover:bg-gray-900"
                    }`}
                  >
                    <span>{link.name}</span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${
                        isDepartmentsOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </button>

                  {/* Dropdown with smooth animation */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isDepartmentsOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    }`}
                  >
                    <div className="ml-4 mt-2 space-y-1 rounded-md border border-gray-700 bg-gray-900 p-3">
                      {departmentLinks.map((dept) => (
                        <Link
                          key={dept.name}
                          href={dept.href}
                          onClick={() => {
                            closeMenu();
                            setIsDepartmentsOpen(false);
                          }}
                          className="block rounded-md px-3 py-2.5 text-sm text-gray-400 transition-colors duration-200 hover:bg-gray-800 hover:text-yellow-500 active:bg-gray-700"
                        >
                          {dept.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={`block py-3 px-4 text-base font-medium transition-colors duration-200 rounded-md ${
                    isActive(link.href)
                      ? "text-yellow-500 bg-gray-900"
                      : "text-gray-400 hover:text-yellow-500 hover:bg-gray-900"
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          <div className="pt-6 mt-6 border-t border-gray-800">
            {isLoggedIn ? (
              <div>
                <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-900 rounded-md">
                  <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-gray-800 flex items-center justify-center flex-shrink-0">
                    {session.user.image && !imageError ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User"}
                        className="w-full h-full object-cover"
                        onError={() => setImageError(true)}
                      />
                    ) : (
                      <span className="text-yellow-500 font-bold text-lg">
                        {session.user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-300 truncate">
                      {session.user.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {session.user.provider === "google" ? "Google" : "User"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="w-full px-4 py-3 border border-yellow-500 text-yellow-500 font-semibold rounded-md hover:bg-yellow-500/10 transition-colors active:bg-yellow-500/20 min-h-12"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <AuthButtons onLogin={onLogin} onRegister={onRegister} isMobile={true} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// Main Navbar component
// ----------------------------------------------------------------------
const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Static links – can be safely memoized
  const departmentLinks = useMemo(
    () =>
      knowledge.departments.map((dept) => ({
        name: dept.name,
        href: `/course/${toSlug(dept.name)}`,
      })),
    []
  );

  const navLinks = useMemo(
    () => [
      { name: "Courses", href: "/course" },
      { name: "Library", href: "/library" },
      { name: "Explore", href: "/explore" },
      { name: "About", href: "/about" },
    ],
    []
  );

  const isActive = useCallback(
    (href) => pathname === href || pathname?.startsWith(`${href}/`),
    [pathname]
  );

  const isLoggedIn = status === "authenticated" && session?.user;

  // Reset image error when user changes
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.image]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = useCallback(async () => {
    await signOut({ redirect: false });
    window.location.href = "/";
  }, []);

  const handleLogin = useCallback(() => {
    router.push("/auth/userlogin");
  }, [router]);

  const handleRegister = useCallback(() => {
    router.push("/auth/register");
  }, [router]);

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 sm:h-20 md:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl md:text-2xl font-bold tracking-wider text-yellow-500 hover:text-yellow-400 transition-colors flex-shrink-0"
          >
            LUXE
          </Link>

          {/* Desktop navigation */}
          <DesktopNav
            navLinks={navLinks}
            departmentLinks={departmentLinks}
            isActive={isActive}
            session={session}
            isLoggedIn={isLoggedIn}
            imageError={imageError}
            setImageError={setImageError}
            onLogin={handleLogin}
            onRegister={handleRegister}
            onLogout={handleLogout}
          />

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsOpen((prev) => !prev)}
            className="md:hidden p-2 rounded-md text-yellow-500 hover:bg-gray-900 transition-colors active:bg-gray-800 min-h-10 min-w-10 flex items-center justify-center flex-shrink-0 ml-2"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <MobileNav
        isOpen={isOpen}
        navLinks={navLinks}
        departmentLinks={departmentLinks}
        isActive={isActive}
        session={session}
        isLoggedIn={isLoggedIn}
        imageError={imageError}
        setImageError={setImageError}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        closeMenu={() => setIsOpen(false)}
      />
    </nav>
  );
};

export default Navbar;