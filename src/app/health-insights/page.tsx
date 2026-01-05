"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import ProtectedRoute from "@/components/ProtectedRoute";
import { UserData } from "@/models/userModel";
import {
  TrendingUp,
  Target,
  Activity,
  Heart,
  Zap,
  Calendar,
  Award,
  BarChart3,
  PieChart,
  Clock,
  Sparkles
} from "lucide-react";
import axios from "axios";

export default function HealthInsightsPage() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserData();
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        setUserData(userSnap.data() as UserData);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userData && !aiInsights) {
      fetchAiInsights();
    }
  }, [userData]);

  const fetchAiInsights = async () => {
    if (!userData) return;

    try {
      setIsAiLoading(true);
      const response = await axios.post("/api/gemini-insights", {
        userData,
        type: "analysis"
      });

      setAiInsights(response.data);
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setIsAiLoading(false);
    }
  };

  const calculateBMI = (height: number, weight: number) => {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600", bg: "bg-blue-100" };
    if (bmi < 24.9) return { category: "Normal", color: "text-green-600", bg: "bg-green-100" };
    if (bmi < 29.9) return { category: "Overweight", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { category: "Obese", color: "text-red-600", bg: "bg-red-100" };
  };

  const getHealthScore = () => {
    if (!userData) return 0;

    let score = 0;
    const bmi = parseFloat(calculateBMI(userData.height, userData.weight));

    // BMI Score (40 points max)
    if (bmi >= 18.5 && bmi <= 24.9) score += 40;
    else if (bmi >= 17 && bmi <= 30) score += 30;
    else if (bmi >= 15 && bmi <= 35) score += 20;
    else score += 10;

    // Activity Level Score (30 points max)
    if (userData.activityLevel?.includes("Very Active")) score += 30;
    else if (userData.activityLevel?.includes("Moderately Active")) score += 20;
    else if (userData.activityLevel?.includes("Lightly Active")) score += 10;

    // Age Score (20 points max)
    if (userData.age >= 18 && userData.age <= 30) score += 20;
    else if (userData.age >= 31 && userData.age <= 50) score += 15;
    else if (userData.age >= 51 && userData.age <= 70) score += 10;
    else score += 5;

    // Health Conditions Score (10 points max)
    const healthyConditions = userData.healthConditions?.filter(c => c === "None").length || 0;
    score += Math.min(healthyConditions * 10, 10);

    return Math.min(score, 100);
  };

  const getRecommendations = () => {
    if (!userData) return [];

    const recommendations = [];
    const bmi = parseFloat(calculateBMI(userData.height, userData.weight));
    const healthScore = getHealthScore();

    if (bmi < 18.5) {
      recommendations.push({
        icon: <TrendingUp className="w-5 h-5" />,
        title: "Weight Gain Strategy",
        description: "Focus on nutrient-dense foods and strength training to build healthy weight.",
        priority: "high"
      });
    } else if (bmi > 24.9) {
      recommendations.push({
        icon: <Target className="w-5 h-5" />,
        title: "Weight Management",
        description: "Consider a calorie deficit with regular exercise for healthy weight loss.",
        priority: "high"
      });
    }

    if (userData.activityLevel?.includes("Lightly Active")) {
      recommendations.push({
        icon: <Activity className="w-5 h-5" />,
        title: "Increase Activity",
        description: "Try to incorporate 30 minutes of moderate exercise daily.",
        priority: "medium"
      });
    }

    if (healthScore < 70) {
      recommendations.push({
        icon: <Heart className="w-5 h-5" />,
        title: "Health Optimization",
        description: "Focus on balanced nutrition and regular health checkups.",
        priority: "high"
      });
    }

    return recommendations;
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!userData) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Health Insights Not Available</h1>
            <p className="text-gray-600">Please complete your profile setup first.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const bmi = parseFloat(calculateBMI(userData.height, userData.weight));
  const bmiInfo = getBMICategory(bmi);
  const healthScore = getHealthScore();
  const recommendations = getRecommendations();

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Health Insights</h1>
          <p className="text-gray-600">Your personalized health analysis and recommendations</p>
        </div>

        {/* AI Analysis Section */}
        {aiInsights && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-8 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              <h2 className="text-xl font-bold">AI Health Analysis</h2>
            </div>
            <p className="text-lg leading-relaxed opacity-95 mb-6">
              {aiInsights.analysis}
            </p>

            <div className="grid md:grid-cols-3 gap-4">
              {aiInsights.recommendations?.map((rec: any, i: number) => (
                <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center gap-2 mb-2">
                    {rec.type === 'diet' && <Heart className="w-4 h-4 text-pink-300" />}
                    {rec.type === 'exercise' && <Activity className="w-4 h-4 text-green-300" />}
                    {rec.type === 'lifestyle' && <Clock className="w-4 h-4 text-blue-300" />}
                    <span className="font-semibold text-sm uppercase tracking-wider">{rec.type}</span>
                  </div>
                  <h3 className="font-bold mb-1">{rec.title}</h3>
                  <p className="text-sm opacity-90">{rec.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isAiLoading && !aiInsights && (
          <div className="mb-8 p-8 border-2 border-dashed border-purple-200 bg-purple-50 rounded-xl flex flex-col items-center justify-center text-purple-400">
            <Sparkles className="w-8 h-8 mb-3 animate-pulse text-purple-500" />
            <p className="font-medium animate-pulse">Analyzing your health profile...</p>
          </div>
        )}

        {/* Health Score Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Health Score</h3>
              <BarChart3 className="w-6 h-6" />
            </div>
            <div className="text-3xl font-bold mb-2">{healthScore}/100</div>
            <div className="text-blue-100">
              {healthScore >= 80 ? "Excellent" : healthScore >= 60 ? "Good" : "Needs Improvement"}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">BMI</h3>
              <PieChart className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{bmi}</div>
            <div className={`text-sm font-medium ${bmiInfo.color}`}>
              {bmiInfo.category}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Daily Calories</h3>
              <Zap className="w-6 h-6 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-800 mb-2">{userData.tdee}</div>
            <div className="text-sm text-gray-600">kcal/day</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-green-500" />
              Physical Metrics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Height</span>
                <span className="font-medium">{userData.height} cm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Weight</span>
                <span className="font-medium">{userData.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Age</span>
                <span className="font-medium">{userData.age} years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gender</span>
                <span className="font-medium">{userData.gender}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-blue-500" />
              Lifestyle
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Activity Level</span>
                <span className="font-medium">{userData.activityLevel}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dietary Goal</span>
                <span className="font-medium">{userData.dietaryGoal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Restrictions</span>
                <span className="font-medium">{userData.restrictions?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Health Conditions</span>
                <span className="font-medium">{userData.healthConditions?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl p-6 shadow-lg border">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-500" />
            Personalized Recommendations
          </h3>

          {recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-l-4 ${rec.priority === 'high'
                    ? 'border-red-500 bg-red-50'
                    : rec.priority === 'medium'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50'
                    }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${rec.priority === 'high'
                      ? 'bg-red-100 text-red-600'
                      : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-blue-100 text-blue-600'
                      }`}>
                      {rec.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600">{rec.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Heart className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Great Job!</h4>
              <p className="text-gray-600">Your health profile looks excellent. Keep up the good work!</p>
            </div>
          )}
        </div>

        {/* Health Tips */}
        <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-500" />
            Daily Health Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">Stay hydrated by drinking at least 8 glasses of water daily</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">Aim for 7-9 hours of quality sleep each night</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">Include 5 servings of fruits and vegetables in your daily diet</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">Take regular breaks from screens to reduce eye strain</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}


