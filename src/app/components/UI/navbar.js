"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: "Library", href: "/library" },
    { name: "Explore", href: "/explore" },
    { name: "About", href: "/about" },
  ];

  const isActive = (href) => pathname === href;

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
              <Link
                key={link.name}
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
            <Link
              key={link.name}
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