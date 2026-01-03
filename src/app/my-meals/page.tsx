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
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const diet = userSnap.data().diet || [];
        const todayMeal = diet.find(
          (entry: any) => 
            new Date(entry.createdAt).toLocaleDateString("en-CA") === getTodayDateString()
        );

        if (todayMeal) {
          setHasMealToday(true);
          const formattedMeals: foodItem[] = [
            { ...todayMeal.meals.breakfast, period: "Breakfast" },
            { ...todayMeal.meals.lunch, period: "Lunch" },
            { ...todayMeal.meals.dinner, period: "Dinner" },
          ];
          setMeals(formattedMeals);
          localStorage.setItem("todayMeals", JSON.stringify(formattedMeals));
        }
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
      showNotification("Failed to fetch today's meals", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMealPlan = async () => {
    if (!user) {
      showNotification("Please sign in to generate a meal plan", 'error');
      return;
    }

    try {
      setIsLoading(true);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const restrictions = userData.restrictions?.filter((r: string) => r !== "None") || [];
        const calories = userData.tdee;

        const response = await axios.post("/api/my-meal", {
          uid: user.uid,
          calories,
          intolerances: restrictions,
          diet: restrictions,
        });

        const { data: mealData } = response.data;
        const formattedMeals = mealData.meals.map((meal: any) => ({
          ...meal.recipe,
          period: meal.type.charAt(0).toUpperCase() + meal.type.slice(1),
        }));

        await updateDoc(userRef, {
          diet: arrayUnion({
            createdAt: getTodayDateString(),
            meals: {
              breakfast: mealData.meals[0].recipe,
              lunch: mealData.meals[1].recipe,
              dinner: mealData.meals[2].recipe,
            },
          }),
        });

        setHasMealToday(true);
        setMeals(formattedMeals);
        showNotification("Meal plan generated successfully!", 'success');
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
          
          <button
            onClick={generateMealPlan}
            disabled={hasMealToday || isLoading}
            className={`w-full sm:w-auto px-4 py-2 rounded-md font-medium transition-colors ${
              hasMealToday || isLoading
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            {hasMealToday ? "Meal Plan Generated" : "Generate Meal Plan"}
          </button>
        </header>

        <div className="space-y-6">
          {renderMealContent()}
        </div>
      </div>
    </ProtectedRoute>
  );
}