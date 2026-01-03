import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Clock, Users, ChefHat, ExternalLink } from "lucide-react";
import { foodItem } from "@/models/foodModel";

interface RecipeModalProps {
  meal: foodItem;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecipeModal({ meal, isOpen, onClose }: RecipeModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-start z-10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{meal.title}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{meal.readyInMinutes} mins</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{meal.servings} servings</span>
              </div>
              <div className="flex items-center space-x-1">
                <ChefHat className="w-4 h-4" />
                <span>Health Score: {meal.healthScore}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Image and Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <img
                src={meal.image}
                alt={meal.title}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-3">About this dish</h3>
              <p
                className="text-gray-700 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: meal.summary }}
              />
            </div>
          </div>

          {/* Ingredients */}
          {meal.ingredients && meal.ingredients.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Ingredients</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {meal.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">
                      {ingredient.amount} {ingredient.unit}
                    </span>
                    <span className="text-sm text-gray-800">{ingredient.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {meal.instructions && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Instructions</h3>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{ __html: meal.instructions }}
              />
            </div>
          )}

          {/* Nutrition Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Nutrition Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {meal.nutrients?.slice(0, 8).map((nutrient, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg text-center">
                  <div className="text-lg font-semibold text-gray-800">
                    {Math.round(nutrient.amount)}
                  </div>
                  <div className="text-sm text-gray-600">{nutrient.unit}</div>
                  <div className="text-xs text-gray-500">{nutrient.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Source Link */}
          {meal.sourceUrl && (
            <div className="border-t pt-6">
              <a
                href={meal.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Original Recipe</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

