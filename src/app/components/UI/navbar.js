"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import knowledge from "@/src/app/data/knowlage.json";

// Helper to turn a string into a URL‑friendly slug
const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileDepartmentsOpen, setIsMobileDepartmentsOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const userMenuRef = useRef(null);

  // Department links from JSON
  const departmentLinks = knowledge.departments.map((dept) => ({
    name: dept.name,
    href: `/course/${toSlug(dept.name)}`,
  }));

  // Main navigation links
  const navLinks = [
    { name: "Courses", href: "/course" },
    { name: "Library", href: "/library" },
    { name: "Explore", href: "/explore" },
    { name: "About", href: "/about" },
  ];

  // Check if the current route is active
  const isActive = (href) =>
    pathname === href || pathname?.startsWith(`${href}/`);

  const isLoggedIn = status === "authenticated" && session?.user;

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset image error state when the user changes
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.image]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsMobileDepartmentsOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsUserMenuOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-black border-b border-gray-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold tracking-wider text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            LUXE
          </Link>

          {/* Desktop navigation (hidden on mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`relative text-base font-medium transition-colors ${
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

                {/* Desktop dropdown for departments */}
                {link.name === "Courses" && (
                  <div className="invisible absolute left-0 top-8 z-30 w-72 rounded-xl border border-gray-800 bg-gray-950 p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="mb-2 border-b border-gray-800 pb-2 text-xs uppercase tracking-widest text-yellow-500">
                      Departments
                    </div>
                    <div className="space-y-1">
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
                )}
              </div>
            ))}

            {/* Auth section (desktop) */}
            {isLoggedIn ? (
              <div className="relative ml-4" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden flex items-center justify-center bg-gray-900">
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
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black bg-green-500" />
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-yellow-500 transition-colors">
                      {session.user.name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {session.user.provider === "google" ? "Google" : "User"}
                    </p>
                  </div>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-3 w-48 bg-gray-950 border border-gray-800 rounded-xl shadow-xl py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-800">
                      <p className="text-sm font-medium text-gray-300 truncate">
                        {session.user.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {session.user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-900 hover:text-yellow-500 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="ml-4 flex items-center space-x-3">
                <button
                  onClick={() => router.push("/auth/userlogin")}
                  className="px-5 py-2 border border-yellow-500 text-yellow-500 font-semibold rounded-md hover:bg-yellow-500/10 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => router.push("/auth/register")}
                  className="px-5 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger button (visible only on mobile) */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-yellow-500 hover:bg-gray-900 transition-colors active:bg-gray-800 min-h-10 min-w-10 flex items-center justify-center"
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

      {/* Mobile menu (expands with animation) */}
      <div
        className={`md:hidden overflow-hidden border-t border-gray-800 transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-[80vh] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 sm:px-4 pt-3 pb-4 space-y-2 bg-gray-950 overflow-y-auto max-h-[80vh]">
          {navLinks.map((link) => (
            <div key={link.name}>
              {link.name === "Courses" ? (
                <>
                  <button
                    onClick={() => setIsMobileDepartmentsOpen(!isMobileDepartmentsOpen)}
                    className={`w-full text-left block py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-colors flex items-center justify-between ${
                      isActive(link.href)
                        ? "text-yellow-500 border-l-4 border-yellow-500 pl-3"
                        : "text-gray-400 hover:text-yellow-500 pl-4"
                    }`}
                  >
                    <span>{link.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isMobileDepartmentsOpen ? "rotate-180" : ""
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

                  {/* Mobile departments dropdown */}
                  {isMobileDepartmentsOpen && (
                    <div className="ml-3 sm:ml-5 mt-2 space-y-1 rounded-lg border border-gray-800 bg-gray-900 p-2">
                      {departmentLinks.map((dept) => (
                        <Link
                          key={dept.name}
                          href={dept.href}
                          onClick={() => {
                            setIsOpen(false);
                            setIsMobileDepartmentsOpen(false);
                          }}
                          className="block rounded-md px-2 py-1.5 text-xs sm:text-sm text-gray-400 transition-colors hover:bg-gray-800 hover:text-yellow-500"
                        >
                          {dept.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2.5 sm:py-3 text-sm sm:text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? "text-yellow-500 border-l-4 border-yellow-500 pl-3"
                      : "text-gray-400 hover:text-yellow-500 pl-4"
                  }`}
                >
                  {link.name}
                </Link>
              )}
            </div>
          ))}

          {/* Mobile auth section */}
          <div className="pt-3 border-t border-gray-800">
            {isLoggedIn ? (
              <div>
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full border-2 border-yellow-500 overflow-hidden bg-gray-900 flex items-center justify-center flex-shrink-0">
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
                  onClick={handleLogout}
                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 border border-yellow-500 text-yellow-500 text-sm sm:text-base font-semibold rounded-md hover:bg-yellow-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:gap-3">
                <button
                  onClick={() => {
                    router.push("/auth/userlogin");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 border border-yellow-500 text-yellow-500 text-sm sm:text-base font-semibold rounded-md hover:bg-yellow-500/10 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => {
                    router.push("/auth/register");
                    setIsOpen(false);
                  }}
                  className="w-full px-4 sm:px-5 py-2 sm:py-2.5 bg-yellow-500 text-black text-sm sm:text-base font-semibold rounded-md hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/20"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;