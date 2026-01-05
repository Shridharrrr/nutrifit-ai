"use client";

import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Utensils, Target, TrendingUp, Clock, ArrowRight, Zap, Activity } from "lucide-react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { UserData } from "@/models/userModel";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";
import axios from "axios";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();
  /* New State for Activity */
  const [hasMealPlan, setHasMealPlan] = React.useState(false);
  const [profileComplete, setProfileComplete] = React.useState(false);
  const [dailyTip, setDailyTip] = React.useState<string>("");

  React.useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // 1. Fetch User Data
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        let currentUserData = {};

        if (userSnap.exists()) {
          currentUserData = userSnap.data();
          setProfileComplete(true);
        }

        // 2. Fetch Daily Tip (using the fetched user data)
        try {
          const response = await axios.post("/api/gemini-insights", {
            userData: currentUserData,
            type: "daily-tip"
          });
          if (response.data.tip) {
            setDailyTip(response.data.tip);
          }
        } catch (tipError) {
          console.error("Failed to fetch tip", tipError);
          setDailyTip("Stay consistent with your meals for better health!");
        }

        // 3. Check for Meal Plan
        const today = new Date().toLocaleDateString("en-CA");
        const mealRef = doc(db, "users", user.uid, "meals", today);
        const mealSnap = await getDoc(mealRef);
        if (mealSnap.exists()) {
          setHasMealPlan(true);
        }

      } catch (e) {
        console.error("Error fetching home data", e);
      }
    };

    fetchData();
  }, [user]);

  const features = [
    {
      icon: <Utensils className="w-6 h-6" />,
      title: "Personalized Meals",
      description: "Custom meal plans tailored to your specific dietary needs.",
      action: "View Plans",
      href: "/my-meals",
      color: "bg-emerald-500",
      lightColor: "bg-emerald-50 text-emerald-600",
      hoverBg: "group-hover:bg-emerald-500"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Track Progress",
      description: "Monitor your goals and visualize your health journey.",
      action: "Check Stats",
      href: "/profile",
      color: "bg-blue-500",
      lightColor: "bg-blue-50 text-blue-600",
      hoverBg: "group-hover:bg-blue-500"
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: "Health Insights",
      description: "Deep dive into your nutritional analysis and metrics.",
      action: "Analyze",
      href: "/health-insights",
      color: "bg-purple-500",
      lightColor: "bg-purple-50 text-purple-600",
      hoverBg: "group-hover:bg-purple-500"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Quick Recipes",
      description: "Fast, healthy recipes for your busy lifestyle.",
      action: "Browse",
      href: "/recipes",
      color: "bg-amber-500",
      lightColor: "bg-amber-50 text-amber-600",
      hoverBg: "group-hover:bg-amber-500"
    }
  ];

  /* ... framer motion variants ... */
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50">
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="container mx-auto px-4 py-8">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="max-w-6xl mx-auto space-y-8"
          >
            {/* Header Section */}
            <motion.div variants={item} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">{user?.email?.split('@')[0]}</span>
                </h1>
                <p className="text-gray-500 mt-2 text-lg">
                  Let's keep your nutrition streak going strong today.
                </p>
              </div>
            </motion.div>

            {/* Quick Actions Grid */}
            <motion.div variants={item} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 cursor-pointer overflow-hidden relative"
                  onClick={() => router.push(feature.href)}
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${feature.lightColor} rounded-bl-full opacity-10 transition-transform group-hover:scale-110`} />

                  <div className={`${feature.lightColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:text-white ${feature.hoverBg}`}>
                    {feature.icon}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                    {feature.description}
                  </p>

                  <div className="flex items-center text-sm font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                    {feature.action}
                    <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Dashboard Layout: Activity & Stats */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Activity */}
              <motion.div variants={item} className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-emerald-500" />
                    Today's Overview
                  </h2>
                </div>

                <div className="space-y-6">
                  {hasMealPlan ? (
                    <div className="flex gap-4 items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">Meal Plan Ready</h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">Today</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Your meals for today have been generated.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4 items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors cursor-pointer" onClick={() => router.push('/my-meals')}>
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Utensils className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">Meal Plan Missing</h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">Action Needed</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">You haven't generated a meal plan for today yet.</p>
                      </div>
                    </div>
                  )}

                  {profileComplete && (
                    <div className="flex gap-4 items-start p-4 hover:bg-gray-50 rounded-2xl transition-colors">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-gray-900">Profile Active</h4>
                          <span className="text-xs text-gray-400 whitespace-nowrap">Status</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Your health profile and goals are set.</p>
                      </div>
                    </div>
                  )}

                  {!hasMealPlan && !profileComplete && (
                    <div className="p-4 rounded-2xl bg-gray-50 border border-dashed border-gray-200 text-center">
                      <p className="text-sm text-gray-500">Welcome! Start by setting up your profile.</p>
                    </div>
                  )}

                </div>
              </motion.div>

              {/* Quick Stats / Daily Tip */}
              <motion.div variants={item} className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-black opacity-10 rounded-full blur-2xl -ml-10 -mb-10" />

                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-yellow-300" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Daily Nutrition Tip</h3>
                  <div className="text-emerald-100 text-sm leading-relaxed min-h-[60px]">
                    {dailyTip ? (
                      dailyTip
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="w-5 h-5 border-2 border-emerald-200 border-t-white rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
