import { foodItem } from "@/models/foodModel";
import React from "react";
import { Timer,Heart } from "lucide-react";

interface Props {
  meal: foodItem;
}

export default function MealBlock({ meal }: Props) {
  console.log(meal);

  return (
    <div className="bg-white hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-in-out rounded-xl p-4 flex items-center justify-between w-full max-w-4xl mx-auto gap-4 border">
      {/* Left: Image */}
      <div className="w-1/3 h-full">
        <img
          src={meal.image}
          alt={meal.title}
          className="w-full h-full object-cover rounded-lg aspect-square"
        />
      </div>

      {/* Middle: Meal Details */}
      <div className="w-1/2 flex flex-col h-full space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{meal.title}</h2>
          <div className="mt-2">
            <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-1 rounded-lg">
              {meal.period}
            </span>
          </div>
        </div>

        <div className="flex flex-col mt-3 gap-3 text-sm text-gray-700">
          <div className="flex  items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Timer />
            </div>
            <div>
              <p>Cooking Time</p>
              <p className="font-semibold">{meal.readyInMinutes} mins</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Heart />
            </div>
            <div>
              <p>Health Score</p>
              <p className="font-semibold">{meal.healthScore}</p>
            </div>
          </div>
        </div>

        {/* Fixed bottom button */}
        <div className="mt-auto pt-3">
          <button className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold py-2 rounded-xl">
            View Recipe
          </button>
        </div>
      </div>

      {/* Right: Nutrients */}
      <div className="grid grid-rows-4 gap-4 w-1/5 text-sm">
        {[
          {
            label: "Calories",
            value: Math.round(meal.nutrients[0].amount),
            unit: "kcals",
            bg: "bg-green-100",
          },
          {
            label: "Carbs",
            value: Math.round(meal.nutrients[3].amount),
            unit: "gms",
            bg: "bg-yellow-100",
          },
          {
            label: "Proteins",
            value: Math.round(meal.nutrients[10].amount),
            unit: "gms",
            bg: "bg-red-100",
          },
          {
            label: "Fats",
            value: Math.round(meal.nutrients[1].amount),
            unit: "gms",
            bg: "bg-teal-100",
          },
        ].map((nutrient, i) => (
          <div
            key={i}
            className={`${nutrient.bg} rounded-xl p-2 flex items-center gap-2`}
          >
            <div className="bg-white p-2 rounded-lg">
              <Timer />
            </div>
            <div>
              <p>{nutrient.label}</p>
              <p className="font-semibold">
                {nutrient.value} {nutrient.unit}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
