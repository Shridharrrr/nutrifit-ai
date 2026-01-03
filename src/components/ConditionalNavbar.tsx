"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { useEffect, useState } from "react";

export default function ConditionalNavbar() {
  const pathname = usePathname();
  const { loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Pages where navbar should NOT be shown
  const hideNavbarOn = [
    '/login',
    '/signup', 
    '/details'
  ];

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  // Don't show navbar on auth and details pages
  if (hideNavbarOn.includes(pathname)) {
    return null;
  }

  // Show navbar with loading state if auth is still loading
  return <Navbar />;
}
