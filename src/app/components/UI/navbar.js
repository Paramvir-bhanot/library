// app/components/UI/navbar.jsx
"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  FolderKanban,
  Info,
  BookOpen,
  TrendingUp,
  FileText,
  LogOut,
  LogIn,
  ChevronDown,
  User,
  Star,
  Zap,
  ChevronRight,
  X,
  Menu,
} from "lucide-react";
import knowledge from "@/src/app/data/knowlage.json";

// Helper to create URL‑safe slugs
function toSlug(value) {
  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/(^-|-$)/g, "");
}

// Generate department links from knowledge.json
const departmentNavLinks = (knowledge.departments || []).map((department) => ({
  name: department.name,
  href: `/course/${toSlug(department.name)}`,
  icon: FolderKanban,
  badge: `${department.courses.length}`,
  category: "departments",
}));

// Primary navigation links
const mainNavLinks = [
  { name: "Home", href: "/", icon: Home, category: "main" },
  { name: "About", href: "/about", icon: Info, category: "main" },
  { name: "Courses", href: "/course", icon: BookOpen, category: "main" },
  { name: "Explore", href: "/explore", icon: TrendingUp, category: "main" },
  { name: "Library", href: "/library", icon: FileText, category: "main" },
];

// All links for mobile
const allNavLinks = [...mainNavLinks, ...departmentNavLinks];

// Quick actions for mobile
const quickActions = [
  { name: "Courses", icon: BookOpen, href: "/course", color: "primary" },
  { name: "Departments", icon: FolderKanban, href: "/course", color: "secondary" },
  { name: "Explore", icon: TrendingUp, href: "/explore", color: "accent" },
  { name: "About", icon: Info, href: "/about", color: "muted" },
];

const quickActionIconColors = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  muted: "var(--muted)",
};

const menuCategories = {
  all: { title: "All", icon: Home },
  main: { title: "Main", icon: Home },
  departments: { title: "Departments", icon: FolderKanban },
};

// Memoised desktop link list
const DesktopNavLinks = memo(({ pathname }) => (
  <>
    {mainNavLinks.map((link) => {
      const Icon = link.icon;
      const isActive = pathname === link.href;
      return (
        <Link
          key={link.name}
          href={link.href}
          className={`relative px-4 py-2 rounded-xl transition-all duration-300 group whitespace-nowrap ${
            isActive
              ? "bg-primary/10 text-primary border border-primary/20"
              : "text-text hover:text-primary hover:bg-muted/10"
          }`}
        >
          <span className="flex items-center space-x-2 text-sm font-semibold">
            <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5px]" : "stroke-2"}`} />
            <span>{link.name}</span>
          </span>
        </Link>
      );
    })}
  </>
));
DesktopNavLinks.displayName = "DesktopNavLinks";

const Navbar = memo(() => {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMoreMenuClicked, setIsMoreMenuClicked] = useState(false);
  const [swipeStartX, setSwipeStartX] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState(0);
  const [activeCategory, setActiveCategory] = useState("all");

  const mobileMenuRef = useRef(null);
  const sheetRef = useRef(null);
  const userMenuRef = useRef(null);
  const moreMenuRef = useRef(null);
  const moreDropdownRef = useRef(null);
  const navContainerRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const isLoggedIn = status === "authenticated" && session?.user;

  // Filtered mobile links
  const filteredLinks = useMemo(() => {
    if (activeCategory === "all") return allNavLinks;
    return allNavLinks.filter((link) => link.category === activeCategory);
  }, [activeCategory]);

  // Reset image error on session change
  useEffect(() => {
    setImageError(false);
  }, [session?.user?.image, session?.user?.email]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Scroll behavior
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    setIsScrolled(currentScrollY > 20);
    setShowNavbar(currentScrollY <= lastScrollY || currentScrollY <= 100);
    if (currentScrollY > lastScrollY + 10) {
      setIsUserMenuOpen(false);
      setIsMoreMenuOpen(false);
      setIsMoreMenuClicked(false);
    }
    setLastScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  // Mouse‑leave detection for department dropdown
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!navContainerRef.current || !isMoreMenuOpen || isMoreMenuClicked) return;
      const navRect = navContainerRef.current.getBoundingClientRect();
      const isInside =
        e.clientX >= navRect.left &&
        e.clientX <= navRect.right &&
        e.clientY >= navRect.top &&
        e.clientY <= navRect.bottom;
      if (!isInside) setIsMoreMenuOpen(false);
    };
    if (isMoreMenuOpen && !isMoreMenuClicked) {
      document.addEventListener("mousemove", handleMouseMove);
    }
    return () => document.removeEventListener("mousemove", handleMouseMove);
  }, [isMoreMenuOpen, isMoreMenuClicked]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (
        isMoreMenuOpen &&
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target) &&
        !moreDropdownRef.current?.contains(event.target)
      ) {
        setIsMoreMenuOpen(false);
        setIsMoreMenuClicked(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isMoreMenuOpen]);

  // Swipe gestures
  const handleTouchStart = useCallback((e) => {
    setSwipeStartX(e.touches[0].clientX);
    setTouchStartTime(Date.now());
    setSwipeDistance(0);
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isOpen) return;
      const currentX = e.touches[0].clientX;
      const distance = currentX - swipeStartX;
      if (distance < 0) {
        setSwipeDistance(Math.abs(distance));
        if (sheetRef.current) {
          const translateX = Math.min(Math.abs(distance) * 0.5, 100);
          sheetRef.current.style.transform = `translateX(-${translateX}px)`;
          sheetRef.current.style.opacity = `${1 - translateX / 200}`;
        }
      }
    },
    [isOpen, swipeStartX]
  );

  const handleTouchEnd = useCallback(() => {
    const swipeDuration = Date.now() - touchStartTime;
    if ((swipeDuration < 300 && swipeDistance > 30) || swipeDistance > 80) {
      setIsOpen(false);
    }
    if (sheetRef.current) {
      sheetRef.current.style.transform = "translateX(0)";
      sheetRef.current.style.opacity = "1";
    }
    setSwipeDistance(0);
  }, [swipeDistance, touchStartTime]);

  // Logout
  const handleLogout = async () => {
    await signOut({ redirect: false });
    setIsUserMenuOpen(false);
    router.push("/");
  };

  // Dropdown handlers
  const handleMoreEnter = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    if (!isMoreMenuClicked) setIsMoreMenuOpen(true);
  };

  const handleMoreLeave = () => {
    if (!isMoreMenuClicked) {
      closeTimeoutRef.current = setTimeout(() => setIsMoreMenuOpen(false), 150);
    }
  };

  const handleMoreClick = () => {
    if (isMoreMenuOpen && !isMoreMenuClicked) {
      setIsMoreMenuClicked(true);
    } else {
      setIsMoreMenuClicked(!isMoreMenuClicked);
      setIsMoreMenuOpen(!isMoreMenuOpen);
    }
  };

  const handleMoreLinkClick = () => {
    setIsMoreMenuOpen(false);
    setIsMoreMenuClicked(false);
  };

  // Prevent body scroll on mobile menu
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className="h-16 bg-card-bg">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-32 bg-muted/20 rounded-lg animate-pulse" />
          <div className="flex items-center space-x-4">
            <div className="h-8 w-8 bg-muted/20 rounded-full animate-pulse" />
            <div className="h-8 w-8 bg-muted/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <nav
        ref={navContainerRef}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          showNavbar ? "translate-y-0" : "-translate-y-full"
        } ${
          isScrolled
            ? "bg-card-bg/95 backdrop-blur-md shadow-lg border-b border-border"
            : "bg-card-bg border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group shrink-0">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center transform group-hover:rotate-[360deg] transition-all duration-700 shadow-lg"
                style={{ background: "var(--primary)", boxShadow: "0 10px 15px -3px var(--shadow)" }}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex flex-col justify-center">
                <h1 className="text-lg sm:text-3xl font-bold leading-tight" style={{ color: "var(--primary)" }}>
                  Books Junction
                </h1>
                <p className="hidden sm:block text-xs text-muted -mt-0.5 font-medium tracking-wide">
                  Distance / Online
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1 px-8">
              <div className="flex items-center space-x-1 bg-card-bg p-1.5 rounded-2xl border border-border">
                <DesktopNavLinks pathname={pathname} />

                {/* Departments Dropdown */}
                <div
                  className="relative"
                  ref={moreMenuRef}
                  onMouseEnter={handleMoreEnter}
                  onMouseLeave={handleMoreLeave}
                >
                  <button
                    onClick={handleMoreClick}
                    aria-expanded={isMoreMenuOpen}
                    aria-haspopup="true"
                    className={`flex items-center space-x-1 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      isMoreMenuOpen || pathname.startsWith("/course")
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-text hover:text-primary hover:bg-muted/10"
                    }`}
                  >
                    <span>Departments</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isMoreMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isMoreMenuOpen && (
                    <div ref={moreDropdownRef} className="absolute right-0 top-full mt-2 w-56 origin-top-right z-50 animate-dropdown">
                      <div className="py-2 bg-card-bg rounded-2xl shadow-xl border border-border overflow-hidden max-h-80 overflow-y-auto">
                        {departmentNavLinks.map((link) => (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={handleMoreLinkClick}
                            className={`flex items-center justify-between px-4 py-3 transition-all duration-200 group/item ${
                              pathname === link.href ? "bg-primary/5" : "hover:bg-muted/10"
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                className={`p-1.5 rounded-lg transition-colors ${
                                  pathname === link.href ? "bg-primary" : "bg-muted/10 group-hover/item:bg-primary/20"
                                }`}
                              >
                                <link.icon
                                  className={`w-4 h-4 ${
                                    pathname === link.href ? "text-white" : "text-muted group-hover/item:text-primary"
                                  }`}
                                />
                              </div>
                              <span
                                className={`text-sm font-medium ${
                                  pathname === link.href ? "text-primary font-bold" : "text-text"
                                }`}
                              >
                                {link.name}
                              </span>
                            </div>
                            {link.badge && (
                              <span className="text-xs text-muted bg-muted/10 px-1.5 py-0.5 rounded-full">
                                {link.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* User Avatar / Login */}
              {isLoggedIn ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-3 group"
                  >
                    <div className="relative">
                      <div
                        className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl p-0.5 shadow-md group-hover:shadow-lg transition-all duration-300"
                        style={{ background: "var(--primary)" }}
                      >
                        <div className="w-full h-full rounded-[10px] bg-card-bg overflow-hidden flex items-center justify-center">
                          {session?.user?.image && !imageError ? (
                            <Image
                              src={session.user.image}
                              alt={session.user.name || "User"}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                              onError={() => setImageError(true)}
                              onLoad={() => imageError && setImageError(false)}
                            />
                          ) : (
                            <div
                              className="w-full h-full flex items-center justify-center text-white text-lg font-bold"
                              style={{ background: "var(--primary)" }}
                            >
                              {session?.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div
                        className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-card-bg"
                        style={{ background: "var(--secondary)" }}
                      />
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-bold text-text group-hover:text-primary transition-colors">
                        {session?.user?.name || "Student"}
                      </p>
                      <p className="text-xs text-muted font-medium">
                        {["google", "facebook", "github"].includes(session?.user?.provider)
                          ? `${session.user.provider.charAt(0).toUpperCase()}${session.user.provider.slice(1)} Login`
                          : "Premium Student"}
                      </p>
                    </div>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-4 w-80 origin-top-right animate-dropdown z-50">
                      <div className="p-3 bg-card-bg rounded-3xl shadow-xl border border-border">
                        <div className="p-4 rounded-2xl mb-2 border border-border" style={{ background: "var(--background)" }}>
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-14 h-14 rounded-2xl p-0.5" style={{ background: "var(--primary)" }}>
                              <div className="w-full h-full rounded-[14px] bg-card-bg overflow-hidden flex items-center justify-center">
                                {session?.user?.image && !imageError ? (
                                  <Image src={session.user.image} alt="Profile" width={56} height={56} className="object-cover" onError={() => setImageError(true)} />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: "var(--primary)" }}>
                                    {session?.user?.name?.[0]?.toUpperCase() || "U"}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div>
                              <p className="font-bold text-lg text-text">{session?.user?.name || "Student"}</p>
                              <p className="text-sm text-muted font-medium">{session?.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="px-3 py-1 text-xs font-bold text-white rounded-full" style={{ background: "var(--primary)" }}>
                              Premium Member
                            </span>
                            <Star className="w-4 h-4 text-warning" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <Link
                            href="/myProfile"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-muted/10 transition-all duration-200 group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                                <User className="w-5 h-5" />
                              </div>
                              <span className="font-semibold text-text">My Profile</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted" />
                          </Link>

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-primary/5 transition-all duration-200 group"
                          >
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                              <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                            <span className="font-semibold text-primary">Logout</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => router.push("/auth/userlogin")}
                  className="hidden sm:flex items-center space-x-2 px-6 py-2.5 text-white font-bold rounded-xl transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
                  style={{ background: "var(--primary)", boxShadow: "0 4px 6px -1px var(--shadow)" }}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Login</span>
                </button>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsOpen((prev) => !prev)}
                aria-label="Toggle menu"
                aria-expanded={isOpen}
                className="lg:hidden relative w-10 h-10 flex items-center justify-center"
              >
                {isOpen ? <X className="w-6 h-6 text-primary" /> : <Menu className="w-6 h-6 text-primary" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-[99] lg:hidden">
          <div
            className={`absolute inset-0 transition-all duration-300 ${isOpen ? "bg-black/60 backdrop-blur-sm" : "bg-transparent"}`}
            onClick={() => setIsOpen(false)}
          />
          <div
            ref={(el) => {
              sheetRef.current = el;
              mobileMenuRef.current = el;
            }}
            className="absolute bottom-0 left-0 right-0 h-[90vh] bg-card-bg rounded-t-3xl shadow-2xl animate-slideUp overflow-hidden flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="flex justify-center pt-3 pb-2 cursor-pointer" onClick={() => setIsOpen(false)}>
              <div className="w-12 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
            </div>

            <div className="flex-1 overflow-y-auto px-6">
              <div className="pt-4 pb-6">
                {isLoggedIn ? (
                  <div className="flex items-center space-x-4 p-4 rounded-2xl mb-6 border border-border animate-fadeIn" style={{ background: "var(--background)" }}>
                    <div className="relative">
                      <div className="w-14 h-14 rounded-2xl p-0.5" style={{ background: "var(--primary)" }}>
                        <div className="w-full h-full rounded-xl bg-card-bg overflow-hidden flex items-center justify-center">
                          {session?.user?.image && !imageError ? (
                            <Image src={session.user.image} alt="Profile" width={56} height={56} className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold" style={{ background: "var(--primary)" }}>
                              {session?.user?.name?.[0]?.toUpperCase() || "U"}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-card-bg flex items-center justify-center" style={{ background: "var(--secondary)" }}>
                        <Star className="w-2.5 h-2.5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-text">{session?.user?.name || "Student"}</h3>
                      <p className="text-sm text-muted mb-2">{session?.user?.email}</p>
                      <span className="text-xs px-2 py-1 rounded-full text-white" style={{ background: "var(--primary)" }}>
                        Premium Member
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl mb-6 border border-border animate-fadeIn" style={{ background: "var(--background)" }}>
                    <h3 className="font-bold text-lg text-text mb-2">Welcome to Books Junction</h3>
                    <p className="text-sm text-muted mb-4">Explore courses, departments, and study options in Distance / Online mode.</p>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => { router.push("/auth/userlogin"); setIsOpen(false); }}
                        className="flex-1 py-3 text-white font-semibold rounded-xl shadow-lg active:scale-95 transition-transform duration-200"
                        style={{ background: "var(--primary)", boxShadow: "0 10px 15px -3px var(--shadow)" }}
                      >
                        Login
                      </button>
                      <button
                        onClick={() => { router.push("/auth/register"); setIsOpen(false); }}
                        className="flex-1 py-3 text-primary font-semibold rounded-xl border-2 border-primary/30 active:scale-95 transition-transform duration-200"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-muted mb-3 flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-primary" />
                    Quick Access
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {quickActions.map((action) => (
                      <Link
                        key={action.name}
                        href={action.href}
                        onClick={() => setIsOpen(false)}
                        className="flex flex-col items-center p-3 bg-card-bg rounded-xl hover:shadow-lg transition-all duration-300 active:scale-95 border border-border group"
                      >
                        <div className="p-2 rounded-lg mb-2 transition-colors group-hover:bg-primary/20">
                          <action.icon className="w-5 h-5" style={{ color: quickActionIconColors[action.color] || "var(--primary)" }} />
                        </div>
                        <span className="text-xs font-medium text-text text-center">{action.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="mb-6">
                  <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                    {Object.entries(menuCategories).map(([key, category]) => (
                      <button
                        key={key}
                        onClick={() => setActiveCategory(key)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all duration-200 ${
                          activeCategory === key ? "bg-primary text-white shadow-lg" : "bg-muted/10 text-text hover:bg-muted/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <category.icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{category.title}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-2 pb-20">
                  {filteredLinks.map((link, index) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-muted/10 transition-all duration-300 group active:scale-[0.98] border border-transparent hover:border-border animate-fadeIn"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${isActive ? "bg-primary" : "bg-muted/10"}`}>
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-muted"}`} />
                          </div>
                          <span className={`font-medium ${isActive ? "text-primary" : "text-text"}`}>{link.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {link.badge && (
                            <span className="px-2 py-1 text-xs font-bold text-white rounded-full" style={{ background: "var(--primary)" }}>
                              {link.badge}
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-muted group-hover:translate-x-1 transition-transform" />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-border p-4 bg-card-bg">
              {!isLoggedIn && (
                <button
                  onClick={() => { router.push("/auth/userlogin"); setIsOpen(false); }}
                  className="text-sm text-primary font-medium w-full text-left"
                >
                  Sign in for more →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="h-16" /> {/* Navbar spacer */}

      {/* Global Styles */}
      <style jsx global>{`
        :root {
          --primary: #D4AF37;
          --secondary: #F5F5F5;
          --background: #000000;
          --surface: #111111;
          --card-bg: #111111;
          --accent: #C9A227;
          --text: #FFFFFF;
          --muted: #BFBFBF;
          --border: #333333;
          --shadow: rgba(212, 175, 55, 0.18);
          --warning: #FFB300;
        }

        body {
          background-color: var(--background);
          color: var(--text);
        }

        button, a, input, select, textarea { outline: none; }
        button:focus, a:focus, input:focus, select:focus, textarea:focus { outline: none; box-shadow: none; }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes dropdown {
          0% { opacity: 0; transform: scale(0.95) translateY(-10px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }

        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-dropdown { animation: dropdown 0.2s ease-out forwards; }

        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }

        ::selection { background-color: var(--primary); color: white; }
        button:focus-visible, a:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: 0.375rem; }

        @media (max-width: 1024px) {
          button, [role="button"], a { min-height: 44px; -webkit-tap-highlight-color: transparent; }
        }
      `}</style>
    </>
  );
});

Navbar.displayName = "Navbar";
export default Navbar;