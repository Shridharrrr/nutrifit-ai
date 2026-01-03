"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Utensils, Target, TrendingUp, Clock } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  const features = [
    {
      icon: <Utensils className="w-8 h-8" />,
      title: "Personalized Meal Plans",
      description: "Get customized meal plans based on your dietary preferences and health goals.",
      action: "View My Meals",
      href: "/my-meals"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Track Your Progress",
      description: "Monitor your nutrition goals and see how you're progressing over time.",
      action: "View Profile",
      href: "/profile"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Health Insights",
      description: "Get detailed nutritional analysis and recommendations for better health.",
      action: "View Insights",
      href: "/health-insights"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Quick Recipes",
      description: "Access quick and easy recipes that fit your busy lifestyle.",
      action: "Browse Recipes",
      href: "/recipes"
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <div className="container mx-auto px-4 py-12">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome back, {user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Ready to continue your healthy eating journey? Let's make today nutritious and delicious.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => router.push(feature.href)}
              >
                <div className="text-green-500 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {feature.description}
                </p>
                <button className="text-green-600 font-medium hover:text-green-700 transition-colors">
                  {feature.action} →
                </button>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Utensils className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Meal Plan Generated</p>
                  <p className="text-sm text-gray-600">Your personalized meal plan for today is ready!</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  Just now
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-800">Profile Updated</p>
                  <p className="text-sm text-gray-600">Your health information has been updated.</p>
                </div>
                <div className="ml-auto text-sm text-gray-500">
                  2 days ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
