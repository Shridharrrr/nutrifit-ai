"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Menu, X, User, Utensils, BookOpen, Cherry, TrendingUp, ChefHat } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    {
      name: "My Meals",
      href: "/my-meals",
      icon: <Utensils className="w-4 h-4" />,
    },
    {
      name: "Recipes",
      href: "/recipes",
      icon: <ChefHat className="w-4 h-4" />,
    },
    {
      name: "Health Insights",
      href: "/health-insights",
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      name: "Profile",
      href: "/profile",
      icon: <User className="w-4 h-4" />,
    },
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
    <nav className="bg-white backdrop-blur-md border-b sticky top-0 z-50">
      <div className="max-w-screen mx-auto px-6 sm:px-6 lg:px-10">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1">
            <h1 className="text-2xl font-bold flex items-center">
              <span className="text-gray-800">NutriFit</span>
              <span className="text-green-500">AI</span>
              <span className="text-green-500 ml-1">
                <Cherry strokeWidth={2.5} size={23} />
              </span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          {user && (
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
          )}

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-600">
                  <User className="w-4 h-4" />
                </div>
                <button
                  onClick={signOut}
                  className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="text-white px-4 py-2 rounded-md font-medium text-base bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
              >
                Sign In
              </button>
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
            {user && (
              <div className="space-y-2">
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
              </div>
            )}
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
                      signOut();
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-3 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg"
                  >
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    router.push("/login");
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-white bg-gradient-to-r from-green-500 to-green-600 rounded-lg hover:from-green-600 hover:to-green-700 transition-all"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}