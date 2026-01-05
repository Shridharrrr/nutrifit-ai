"use client";

import { useEffect, useState } from "react";
import MealBlock from "@/components/mealBlock";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/config/firebase";
import { foodItem } from "@/models/foodModel";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useNotification } from "@/hooks/useNotification";
import Notification from "@/components/Notification";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function MealPage() {
  const { user } = useAuth();
  const { notification, showNotification, hideNotification } = useNotification();
  const [hasMealToday, setHasMealToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<foodItem[]>([]);

  // Format date consistently
  const getTodayDateString = () => new Date().toLocaleDateString("en-CA");

  // Fetch user's meals for today
  useEffect(() => {
    if (user) {
      fetchTodayMeals(user.uid);
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchTodayMeals = async (uid: string) => {
    try {
      const today = getTodayDateString();
      const mealRef = doc(db, "users", uid, "meals", today);
      const mealSnap = await getDoc(mealRef);

      if (mealSnap.exists()) {
        setHasMealToday(true);
        const todayMeal = mealSnap.data();
        const formattedMeals: foodItem[] = [
          { ...todayMeal.meals[0].recipe, period: "Breakfast" },
          { ...todayMeal.meals[1].recipe, period: "Lunch" },
          { ...todayMeal.meals[2].recipe, period: "Dinner" },
        ];
        setMeals(formattedMeals);
        localStorage.setItem("todayMeals", JSON.stringify(formattedMeals));
      } else {
        setHasMealToday(false);
        setMeals([]);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      showNotification("Failed to fetch today's meals", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async (regenerate: boolean = false) => {
    if (!user) {
      showNotification("Please sign in to generate a meal plan", 'error');
      return;
    }

    if (hasMealToday && !regenerate) return;

    try {
      setIsLoading(true);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const restrictions = userData.restrictions?.filter((r: string) => r !== "None") || [];
        const calories = userData.tdee;

        const todayDate = getTodayDateString();

        const response = await axios.post("/api/my-meal", {
          uid: user.uid,
          calories,
          intolerances: restrictions,
          diet: restrictions,
          regenerate,
          date: todayDate
        });

        const { data: mealData } = response.data;
        // API returns meals array: [{ type: 'breakfast', recipe: {...} }, ...]
        const formattedMeals = mealData.meals.map((meal: any) => ({
          ...meal.recipe,
          period: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
        }));

        setHasMealToday(true);
        setMeals(formattedMeals);
        showNotification(regenerate ? "Meal plan regenerated!" : "Meal plan generated successfully!", 'success');
      }
    } catch (error) {
      console.error("Error generating meal plan:", error);
      const errorMessage = axios.isAxiosError(error)
        ? error.response?.data?.error || "Failed to generate meal plan"
        : "An unexpected error occurred";

      showNotification(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMealContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 w-full bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      );
    }

    if (hasMealToday) {
      return meals.map((meal, i) => <MealBlock key={i} meal={meal} />);
    }

    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-500">No meal created yet.</p>
        <p className="mt-2 text-gray-600">
          Click "Generate Meal Plan" to create your daily meal plan.
        </p>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Notification */}
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />

        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Meal Plan</h1>
            <p className="text-gray-500">
              {hasMealToday ? "Today's meals" : "Create your meal plan for today"}
            </p>
          </div>

          <div className="flex gap-2">
            {hasMealToday && (
              <button
                onClick={() => generateMealPlan(true)}
                disabled={isLoading}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50"
              >
                Regenerate Plan
              </button>
            )}
            {!hasMealToday && (
              <button
                onClick={() => generateMealPlan(false)}
                disabled={isLoading}
                className="px-4 py-2 rounded-md font-medium transition-colors bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50"
              >
                Generate Meal Plan
              </button>
            )}
          </div>
        </header>

        <div className="space-y-6">
          {renderMealContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}