"use client";

import { useEffect, useState } from "react";
import MealBlock from "@/components/mealBlock";
import axios from "axios";
import { auth } from "@/config/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/config/firebase";
import { foodItem } from "@/models/foodModel";

export default function MealPage() {
  const [hasMealToday, setHasMealToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [meals, setMeals] = useState<foodItem[]>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Format date consistently
  const getTodayDateString = () => new Date().toLocaleDateString("en-CA");

  // Show notification and auto-hide after 3 seconds
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch user's meals for today
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        await fetchTodayMeals(user.uid);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

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
    const user = auth.currentUser;
    if (!user) {
      showNotification("Please sign in to generate a meal plan", 'error');
      return;
    }

    try {
      setIsLoading(true);
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        const restrictions = data.restrictions?.filter((r: string) => r !== "None") || [];
        const calories = data.tdee;

        const response = await axios.post("/api/my-meal", {
          uid: user.uid,
          calories,
          intolerances: restrictions.join(","),
        });

        const { breakfast, lunch, dinner } = response.data.meals;
        const formattedMeals = [
          { ...breakfast, period: "Breakfast" },
          { ...lunch, period: "Lunch" },
          { ...dinner, period: "Dinner" },
        ];

        await updateDoc(userRef, {
          diet: arrayUnion({
            createdAt: getTodayDateString(),
            meals: { breakfast, lunch, dinner },
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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
          notification.type === 'success' 
            ? 'bg-green-100 text-green-800 border border-green-200'
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          {notification.message}
        </div>
      )}

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
  );
}