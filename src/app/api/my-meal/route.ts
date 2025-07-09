import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { uid, calories, intolerances } = await req.json();

    if (!uid || !calories) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing Spoonacular API key" },
        { status: 500 }
      );
    }

    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const diet = userData?.diet || [];
    const today = new Date().toISOString().split("T")[0];

    const isMealCreatedToday = diet.some((mealEntry: any) =>
      mealEntry.createdAt?.startsWith(today)
    );

    if (isMealCreatedToday) {
      return NextResponse.json(
        { message: "Meals already created today." },
        { status: 400 }
      );
    }

    const caloriePerMeal = Math.floor(calories / 3);
    const mealTypes = ["breakfast", "lunch", "dinner"];

    const mealPromises = mealTypes.map((type) =>
      axios.get("https://api.spoonacular.com/recipes/complexSearch", {
        params: {
          type,
          intolerances,
          number: 1,
          minCalories: caloriePerMeal, // slight variation
          addRecipeInformation: true,
          addRecipeNutrition: true,
          sort: "random",
          apiKey,
        },
      })
    );

    const mealResponses = await Promise.all(mealPromises);

    const getFirstMeal = (res: any, type: string) => {
      if (!res?.data?.results?.length) {
        throw new Error(`No ${type} meal found`);
      }
      return res.data.results[0];
    };

    const extractMealData = (meal: any) => {
      const nutrients = meal.nutrition?.nutrients || [];
      const nutrientsPerServing = nutrients.map((nutrient: any) => ({
        name: nutrient.name,
        amount: Number((nutrient.amount / meal.servings).toFixed(2)),
        unit: nutrient.unit,
      }));

      return {
        id: meal.id,
        title: meal.title,
        image: meal.image,
        readyInMinutes: meal.readyInMinutes,
        summary: meal.summary,
        healthScore: meal.healthScore,
        sourceUrl: meal.sourceUrl,
        servings: meal.servings,
        nutrients: nutrientsPerServing,
      };
    };

    const meals = {
      breakfast: extractMealData(getFirstMeal(mealResponses[0], "breakfast")),
      lunch: extractMealData(getFirstMeal(mealResponses[1], "lunch")),
      dinner: extractMealData(getFirstMeal(mealResponses[2], "dinner")),
    };

    await updateDoc(userRef, {
      diet: arrayUnion({
        createdAt: new Date().toISOString(),
        meals,
      }),
    });

    return NextResponse.json(
      { message: "Meals saved", meals },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error generating meals:", error.message);
    return NextResponse.json(
      { error: "Failed to generate meals" },
      { status: 500 }
    );
  }
}
