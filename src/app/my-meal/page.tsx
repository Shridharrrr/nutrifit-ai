"use client";
import { useEffect, useState } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import MealBlock from "@/components/mealBlock";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { auth } from "@/config/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/config/firebase";
import { foodItem } from "@/models/foodModel";

export default function Page() {
  const [mealToday, setMealToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [meals, setMeals] = useState<foodItem[]>([]);

  useEffect(() => {
    const checkMealToday = async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          const diet = data.diet || [];

          const today = new Date().toISOString().split("T")[0];
          const todayMeal = diet.find((entry: any) =>
            entry.createdAt.startsWith(today)
          );

          if (todayMeal) {
            setMealToday(true);
            setMeals([
              { ...todayMeal.meals.breakfast, period: "Breakfast" },
              { ...todayMeal.meals.lunch, period: "Lunch" },
              { ...todayMeal.meals.dinner, period: "Dinner" },
            ]);
          }
        }
      } catch (err) {
        console.error("Error checking meals:", err);
      } finally {
        setLoading(false);
      }
    };

    checkMealToday();
  }, []);

  const handleCreate = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      console.error("User not authenticated.");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      let intol = "";

      if (userSnap.exists()) {
        const data = userSnap.data();
        const restrictions = data.restrictions;
        const calories = data.tdee;

        if(restrictions[0] == "None"){
          intol = "";
        }
        else intol = restrictions.join(",");

        const res = await axios.post("/api/my-meal", {
          uid,
          calories,
          intolerances: intol,
        });

        console.log("Meal generated:", res.data);
      setMealToday(true);

      const { breakfast, lunch, dinner } = res.data.meals;

      setMeals([
        { ...breakfast, period: "Breakfast" },
        { ...lunch, period: "Lunch" },
        { ...dinner, period: "Dinner" },
      ]);
      }
    } catch (error: any) {
      const message = error.response?.data?.error || "Error creating meal";
      console.error("Meal creation failed:", message);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Meals</BreadcrumbPage>
                </BreadcrumbItem>
                <Button onClick={handleCreate} disabled={mealToday}>
                  {mealToday ? "Meal Already Created Today" : "Generate Meal"}
                </Button>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {loading ? (
            <p>Loading...</p>
          ) : mealToday ? (
            meals.map((m: foodItem, i: number) => (
              <MealBlock key={i} meal={m} />
            ))
          ) : (
            <p>No meal created yet. Click "Generate Meal" to create one.</p>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
