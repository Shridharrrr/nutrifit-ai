"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/config/firebase";
import { useEffect, useState } from "react";
import { Menu, X, User, Utensils, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you're using shadcn/ui

export default function Navbar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const navLinks = [
    { name: "My Meals", href: "/my-meals", icon: <Utensils className="w-4 h-4" /> },
    { name: "Recipes", href: "/recipes", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const toggleMenu = () => setMenuOpen(!menuOpen);

  if (loading) {
    return (
      <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Skeleton className="h-8 w-32 rounded-lg" />
            <div className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Skeleton key={link.href} className="h-8 w-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-6 lg:px-10">
        <div className="flex justify-between h-18 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-400 bg-clip-text text-transparent">
              Nutrifit-AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3"> 
                <button
                  onClick={() => auth.signOut()}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm rounded-lg mx-1 ${
                  pathname === link.href
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            ))}
            <div className="border-t border-gray-100 mt-2 pt-2 px-1">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      auth.signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg"
                  >
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className="block px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}