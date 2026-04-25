"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import knowledge from "@/src/app/data/knowlage.json";

const toSlug = (value) =>
  value
    .toLowerCase()
    .replace(/\./g, "")
    .replace(/&/g, "and")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const departmentLinks = knowledge.departments.map((department) => ({
    name: department.name,
    href: `/course/${toSlug(department.name)}`,
  }));

  const navLinks = [
    { name: "Courses", href: "/course" },
    { name: "Library", href: "/library" },
    { name: "Explore", href: "/explore" },
    { name: "About", href: "/about" },
  ];

  const isActive = (href) => pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <nav className="bg-[#000000] border-b border-[#333333]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold tracking-wider text-[#D4AF37] hover:text-[#C9A227] transition-colors duration-300"
          >
            LUXE
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <div key={link.name} className="relative group">
                <Link
                  href={link.href}
                  className={`relative text-base font-medium transition-colors duration-300 ${
                    isActive(link.href)
                      ? "text-[#D4AF37]"
                      : "text-[#BFBFBF] hover:text-[#D4AF37]"
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#D4AF37] rounded-full" />
                  )}
                </Link>

                {link.name === "Courses" && (
                  <div className="invisible absolute left-0 top-8 z-30 w-72 rounded-xl border border-[#333333] bg-[#0e0e0e] p-3 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <div className="mb-2 border-b border-[#262626] pb-2 text-xs uppercase tracking-widest text-[#D4AF37]">
                      Departments
                    </div>
                    <div className="space-y-1">
                      {departmentLinks.map((department) => (
                        <Link
                          key={department.name}
                          href={department.href}
                          className="block rounded-md px-3 py-2 text-sm text-[#CFCFCF] transition-colors hover:bg-[#171717] hover:text-[#D4AF37]"
                        >
                          {department.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
            {/* Primary CTA Button */}
            <button className="ml-4 px-5 py-2 bg-[#D4AF37] text-[#000000] font-semibold rounded-md hover:bg-[#C9A227] transition-colors duration-300 shadow-lg shadow-[#D4AF37]/20">
              Get Started
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-md text-[#D4AF37] hover:bg-[#111111] transition-colors duration-300 focus:outline-none"
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

      {/* Mobile Menu (Slide Down) */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-3 bg-[#111111] border-t border-[#333333]">
          {navLinks.map((link) => (
            <div key={link.name}>
              <Link
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-base font-medium transition-colors duration-300 ${
                  isActive(link.href)
                    ? "text-[#D4AF37] border-l-4 border-[#D4AF37] pl-3"
                    : "text-[#BFBFBF] hover:text-[#D4AF37] pl-4"
                }`}
              >
                {link.name}
              </Link>

              {link.name === "Courses" && (
                <div className="ml-5 mt-1 space-y-1 rounded-lg border border-[#2a2a2a] bg-[#0c0c0c] p-2">
                  {departmentLinks.map((department) => (
                    <Link
                      key={department.name}
                      href={department.href}
                      onClick={() => setIsOpen(false)}
                      className="block rounded-md px-2 py-1.5 text-sm text-[#BFBFBF] transition-colors hover:bg-[#171717] hover:text-[#D4AF37]"
                    >
                      {department.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <button className="w-full mt-4 px-5 py-3 bg-[#D4AF37] text-[#000000] font-semibold rounded-md hover:bg-[#C9A227] transition-colors duration-300">
            Get Started
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;