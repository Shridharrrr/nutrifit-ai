import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/firebase";
import { doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const { uid, calories, intolerances } = await req.json();

    if (!uid || !calories) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if a diet entry already exists for today
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userData = userDoc.data();
    const diet = userData?.diet || [];

    const today = new Date().toISOString().split("T")[0]; 
    const isMealCreatedToday = diet.some((mealEntry: any) => mealEntry.createdAt?.startsWith(today));

    if (isMealCreatedToday) {
      return NextResponse.json({ message: "Meals already created today. No more meals can be added." }, { status: 400 });
    }

    const apiKey = process.env.SPOONACULAR_API_KEY;
    const caloriePerMeal = Math.floor(calories / 3);
    const mealTypes = ["breakfast", "lunch", "dinner"];

    const mealPromises = mealTypes.map((type) =>
      axios.get("https://api.spoonacular.com/recipes/complexSearch", {
        params: {
          type,
          intolerances,
          number: 1,
          maxCalories: caloriePerMeal,
          addRecipeInformation: true,
          addRecipeNutrition: true,
          apiKey,
        },
      })
    );

    const mealResponses = await Promise.all(mealPromises);

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
      breakfast: extractMealData(mealResponses[0].data.results[0]),
      lunch: extractMealData(mealResponses[1].data.results[0]),
      dinner: extractMealData(mealResponses[2].data.results[0]),
    };

    // Save meals to Firestore under diet array
    await updateDoc(userRef, {
      diet: arrayUnion({
        createdAt: new Date().toISOString(),
        meals,
      }),
    });

    return NextResponse.json({ message: "Meals saved", meals }, { status: 200 });
  } catch (error: any) {
    console.error("Error generating meals:", error.message);
    return NextResponse.json({ error: "Failed to generate meals" }, { status: 500 });
  }
}
