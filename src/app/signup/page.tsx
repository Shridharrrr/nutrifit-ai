"use client";

import { useState } from "react";
import { SignupUser, GoogleSignupUser } from "@/methods/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*\d).{6,}$/;
  
    if (!email.trim() || !password.trim()) {
      alert("Please fill in both email and password.");
      return;
    }
  
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }
  
    if (!passwordRegex.test(password)) {
      alert("Password does not fulfill mentioned criteria.");
      return;
    }
  
    try {
      setIsLoading(true);
      await SignupUser(email, password);
      router.push("/details");
    } catch (err) {
      alert("Signup failed: " + (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true);
      await GoogleSignupUser();
      router.push("/details");
    } catch (err) {
      alert("Google Sign-in failed: " + (err as any).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Create an account</h1>
            <p className="text-gray-500">Sign up to get started</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="email"
                placeholder="Email address"
                className="text-black w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="password"
                placeholder="Password"
                className="text-black w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder:text-gray-300"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="text-sm space-y-1 pl-2 pt-1">
              <p className={`flex items-center space-x-1 ${password.length >= 6 ? "text-green-500" : "text-gray-400"}`}>
                <span>•</span> <span>Password must be atleast 6 characters long.</span>
              </p>
              <p className={`flex items-center space-x-1 ${/\d/.test(password) ? "text-green-500" : "text-gray-400"}`}>
                <span>•</span> <span>Password must contain atleast 1 number.</span>
              </p>
            </div>

            <button
              onClick={handleSignup}
              disabled={isLoading}
              className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:bg-blue-700 active:transform active:scale-95"
              }`}
            >
              <span>{isLoading ? "Creating..." : "Create Account"}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={isLoading}
            className={`w-full flex items-center justify-center space-x-2 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all duration-200 ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-gray-600 font-medium">Signup with Google</span>
          </button>

          <div className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
