import { foodItem } from "@/models/foodModel";
import React, { useState } from "react";
import { Timer, Heart } from "lucide-react";
import RecipeModal from "./RecipeModal";

interface Props {
  meal: foodItem;
}

export default function MealBlock({ meal }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="bg-white hover:scale-[1.02] hover:shadow-xl transition-all duration-300 ease-in-out rounded-xl p-4 flex flex-col md:flex-row items-stretch justify-between w-full max-w-4xl mx-auto gap-4 border">
      {/* Left: Image */}
      <div className="w-full md:w-1/3 h-48 md:h-auto">
        <img
          src={meal.image}
          alt={meal.title}
          className="w-full h-full object-cover rounded-lg aspect-square"
        />
      </div>

      {/* Middle: Meal Details */}
      <div className="w-full md:w-1/2 flex flex-col space-y-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{meal.title}</h2>
          <div className="mt-2">
            <span className="bg-amber-100 text-amber-800 text-sm font-semibold px-4 py-1 rounded-lg">
              {meal.period}
            </span>
          </div>
        </div>

        <div className="flex flex-col mt-3 gap-3 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <div className="bg-gray-100 p-2 rounded-lg">
              <Timer />
            </div>
            <div>
              <p>Cooking Time</p>
              <p className="font-semibold">{meal.readyInMinutes} mins</p>
            </div>
          </div>
        </div>

        {/* Fixed bottom button */}
        <div className="mt-4 md:mt-auto">
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-green-500 hover:bg-green-600 transition-colors text-white font-semibold py-2 rounded-xl"
          >
            View Recipe
          </button>
        </div>
      </div>

      {/* Right: Nutrients */}
      <div className="w-full md:w-1/5 grid grid-cols-2 md:grid-cols-1 gap-4 text-sm">
        {(() => {
          // Find nutrients by name to avoid index issues
          const findNutrient = (name: string) =>
            meal.nutrients?.find(n => n.name.toLowerCase().includes(name.toLowerCase())) || { amount: 0 };

          return [
            {
              label: "Calories",
              value: Math.round(findNutrient("calories").amount),
              unit: "kcal",
              bg: "bg-green-100",
            },
            {
              label: "Carbs",
              value: Math.round(findNutrient("carbohydrates").amount),
              unit: "g",
              bg: "bg-yellow-100",
            },
            {
              label: "Protein",
              value: Math.round(findNutrient("protein").amount),
              unit: "g",
              bg: "bg-red-100",
            },
            {
              label: "Fat",
              value: Math.round(findNutrient("fat").amount),
              unit: "g",
              bg: "bg-teal-100",
            },
          ];
        })().map((nutrient, i) => (
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

      {/* Recipe Modal */}
      <RecipeModal
        meal={meal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
