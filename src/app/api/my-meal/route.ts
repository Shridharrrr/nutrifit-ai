
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { uid, calories, intolerances, diet, regenerate, date } = await req.json();

    // Validate input
    if (!uid || !calories) {
      return NextResponse.json(
        { error: "UID and calories are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      console.error("SPOONACULAR_API_KEY is missing in environment variables.");
      return NextResponse.json({ error: "Server configuration error: API Key missing" }, { status: 500 });
    }

    // Check existing meals in subcollection
    // Use client-provided date or fallback to server UTC date
    const targetDate = date || new Date().toISOString().split("T")[0];
    const mealDocRef = doc(db, "users", uid, "meals", targetDate);
    const mealDoc = await getDoc(mealDocRef);

    if (mealDoc.exists() && !regenerate) {
      // Return 409 CONFLICT to signal "Already exists" without implying rate limiting (429)
      return NextResponse.json(
        { error: "Meals already generated today. Use 'Regenerate' to overwrite." },
        { status: 409 }
      );
    }

    // Generate meals
    const baseCaloriesPerMeal = Math.floor(calories / 3);
    const mealTypes = ["breakfast", "lunch", "dinner"];

    // Get recipe IDs first
    let searchResults;
    try {
      searchResults = await Promise.all(
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
              sort: "random"
            }
          })
        )
      );
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 402 || error.response?.status === 429) {
          console.error("Spoonacular API Limit/Quota Exceeded:", error.response?.data);
          return NextResponse.json({
            error: "Daily meal plan generation quota reached. Please try again tomorrow."
          }, { status: 429 });
        }
      }
      console.error("Spoonacular Search Error:", error.message);
      throw error; // Rethrow to main catch
    }

    // Get full recipe details
    const recipes = await Promise.all(
      searchResults.map((res, i) => {
        const recipeId = res.data.results[0]?.id;
        if (!recipeId) throw new Error(`No ${mealTypes[i]} recipe found matching criteria`);

        return axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information`, {
          params: { includeNutrition: true, apiKey }
        });
      })
    );

    // Prepare meal data
    const mealData = {
      date: targetDate,
      meals: recipes.map((res, i) => ({
        type: mealTypes[i],
        recipe: formatRecipeData(res.data)
      })),
      nutrients: calculateTotalNutrients(recipes.map(r => r.data)),
      createdAt: new Date().toISOString()
    };

    // Store in Firestore Subcollection
    // This naturally handles overwrite if regenerate is true
    await setDoc(mealDocRef, mealData);

    // Update lastMealGenerated on user doc for metadata
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      lastMealGenerated: new Date().toISOString()
    });

    return NextResponse.json({ success: true, data: mealData });

  } catch (error: any) {
    console.error("Error generating meals:", error.message);
    if (error.response) {
      console.error("Upstream API Error Details:", error.response.data);
    }
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