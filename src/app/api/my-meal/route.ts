// app/api/generate-meals/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { uid, calories, intolerances, diet } = await req.json();

    // Validate input
    if (!uid || !calories) {
      return NextResponse.json(
        { error: "UID and calories are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) throw new Error("API key not configured");

    // Check existing meals
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const today = new Date().toISOString().split("T")[0];
    if (userDoc.data()?.meals?.some((m: any) => m.date === today)) {
      return NextResponse.json(
        { error: "Meals already generated today" },
        { status: 429 }
      );
    }

    // Generate meals
    const baseCaloriesPerMeal = Math.floor(calories / 3);
    const mealTypes = ["breakfast", "lunch", "dinner"];

    // Get recipe IDs first
    const searchResults = await Promise.all(
      mealTypes.map(type => 
        axios.get("https://api.spoonacular.com/recipes/complexSearch", {
          params: {
            type,
            intolerances: intolerances?.join(","),
            diet: diet?.join(","),
            number: 1,
            minCalories: Math.floor(baseCaloriesPerMeal * 0.8),
            maxCalories: Math.floor(baseCaloriesPerMeal * 1.2),
            apiKey,
          }
        })
      )
    );

    // Get full recipe details
    const recipes = await Promise.all(
      searchResults.map((res, i) => {
        const recipeId = res.data.results[0]?.id;
        if (!recipeId) throw new Error(`No ${mealTypes[i]} recipe found`);
        
        return axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
          params: { includeNutrition: true, apiKey }
        });
      })
    );

    // Prepare meal data
    const mealData = {
      date: today,
      meals: recipes.map((res, i) => ({
        type: mealTypes[i],
        recipe: formatRecipeData(res.data)
      })),
      nutrients: calculateTotalNutrients(recipes.map(r => r.data))
    };

    // Store in Firestore
    await updateDoc(userRef, {
      meals: arrayUnion(mealData),
      lastMealGenerated: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: mealData });

  } catch (error: any) {
    console.error("Error generating meals:", error.message);
    return NextResponse.json(
      { error: error.message || "Meal generation failed" },
      { status: 500 }
    );
  }
}

function formatRecipeData(recipe: any) {
  return {
    id: recipe.id,
    title: recipe.title,
    image: recipe.image,
    readyInMinutes: recipe.readyInMinutes,
    summary: recipe.summary?.replace(/<[^>]*>/g, ''),
    instructions: recipe.instructions?.replace(/<[^>]*>/g, '') || "No instructions provided",
    ingredients: recipe.extendedIngredients?.map((i: any) => ({
      id: i.id,
      name: i.name,
      amount: i.amount,
      unit: i.unit,
      original: i.original
    })),
    nutrients: recipe.nutrition?.nutrients?.map((n: any) => ({
      name: n.name,
      amount: parseFloat(n.amount.toFixed(2)),
      unit: n.unit,
      percentOfDailyNeeds: n.percentOfDailyNeeds
    })),
    servings: recipe.servings,
    sourceUrl: recipe.sourceUrl,
    diets: recipe.diets || [],
    dishTypes: recipe.dishTypes || []
  };
}

function calculateTotalNutrients(recipes: any[]) {
  const totals: Record<string, any> = {};
  
  recipes.forEach(recipe => {
    recipe.nutrition?.nutrients?.forEach((nutrient: any) => {
      if (!totals[nutrient.name]) {
        totals[nutrient.name] = {
          amount: 0,
          unit: nutrient.unit
        };
      }
      totals[nutrient.name].amount += nutrient.amount;
    });
  });

  return Object.entries(totals).map(([name, data]) => ({
    name,
    amount: parseFloat(data.amount.toFixed(2)),
    unit: data.unit
  }));
}