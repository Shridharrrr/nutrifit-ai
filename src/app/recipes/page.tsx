"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Search,
  Clock,
  Users,
  Star,
  ChefHat,
  Heart,
  Zap,
  TrendingUp,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import RecipeModal from "@/components/RecipeModal";
import { foodItem } from "@/models/foodModel";

export default function RecipesPage() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState<foodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiet, setSelectedDiet] = useState("");
  const [selectedDishType, setSelectedDishType] = useState("");
  const [sortBy, setSortBy] = useState("popularity");

  const [selectedRecipe, setSelectedRecipe] = useState<foodItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dietOptions = [
    "vegetarian",
    "vegan",
    "gluten free",
    "ketogenic",
    "paleo",
    "pescetarian",
    "dairy free",
    "low carb",
  ];

  const dishTypeOptions = [
    "main course",
    "side dish",
    "dessert",
    "appetizer",
    "salad",
    "soup",
    "breakfast",
    "lunch",
    "dinner",
  ];

  // State for quick recipes
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [quickRecipes, setQuickRecipes] = useState<foodItem[]>([]);

  const fetchQuickRecipes = async () => {
    const apiKey =
      process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY ||
      "1b31bfd183fa49b88576cfdf62f7d5dd";
    if (!apiKey) return;

    try {
      // Fetch quick recipes (e.g., ready in 20 mins or less, or type snack/breakfast)
      const response = await axios.get(
        "https://api.spoonacular.com/recipes/complexSearch",
        {
          params: {
            apiKey,
            number: 4,
            maxReadyTime: 20,
            addRecipeNutrition: true,
            fillIngredients: true,
            addRecipeInformation: true,
            sort: "random",
          },
        }
      );

      if (response.data.results) {
        setQuickRecipes(response.data.results.map(formatRecipeData));
      }
    } catch (error) {
      console.error("Failed to fetch quick recipes", error);
    }
  };

  useEffect(() => {
    fetchQuickRecipes();
  }, []);

  const formatRecipeData = (recipe: any): foodItem => {
    return {
      id: recipe.id,
      title: recipe.title,
      image: recipe.image,
      readyInMinutes: recipe.readyInMinutes,
      summary: recipe.summary?.replace(/<[^>]*>/g, "") || "",
      instructions:
        recipe.instructions?.replace(/<[^>]*>/g, "") ||
        "No instructions provided",
      ingredients:
        recipe.extendedIngredients?.map((i: any) => ({
          id: i.id,
          name: i.name,
          amount: i.amount,
          unit: i.unit,
          original: i.original,
        })) || [],
      nutrients:
        recipe.nutrition?.nutrients?.map((n: any) => ({
          name: n.name,
          amount: parseFloat(n.amount.toFixed(2)),
          unit: n.unit,
          percentOfDailyNeeds: n.percentOfDailyNeeds,
        })) || [],
      servings: recipe.servings,
      sourceUrl: recipe.sourceUrl,
      diets: recipe.diets || [],
      dishTypes: recipe.dishTypes || [],
      healthScore: recipe.healthScore,
      period: "Any", // Default period
    };
  };

  const searchRecipes = async () => {
    if (!searchQuery.trim()) return;

    // Use environment variable or keep it here if env not set up in this context (Assuming env is better but falling back to string if needed, user had string before)
    const apiKey =
      process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY ||
      "1b31bfd183fa49b88576cfdf62f7d5dd";
    if (!apiKey) {
      toast.error("API key not configured");
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(
        "https://api.spoonacular.com/recipes/complexSearch",
        {
          params: {
            query: searchQuery,
            diet: selectedDiet,
            type: selectedDishType,
            sort: sortBy,
            number: 12,
            apiKey: apiKey,
            addRecipeNutrition: true, // Ask for nutrition directly
            fillIngredients: true, // Ask for ingredients
            addRecipeInformation: true, // Ask for full info to avoid 2nd call loop if possible?
            // ComplexSearch with addRecipeInformation=true returns most info.
          },
        }
      );

      // Optimization: complexSearch can return valid data if we ask nicely, avoiding N+1 calls
      // But user's previous code did N+1. Let's try to stick to efficient single call if possible.
      // If addRecipeInformation: true is used, results have most fields.

      let results = response.data.results;

      // Map to our format
      const formattedRecipes = results.map(formatRecipeData);
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error("Error searching recipes:", error);
      toast.error("Failed to search recipes. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchRecipes();
  };

  const handleRecipeClick = (recipe: foodItem | Partial<foodItem>) => {
    // Cast partial to full if needed or ensuring partial has enough for modal
    setSelectedRecipe(recipe as foodItem);
    setIsModalOpen(true);
  };

  const getDifficultyColor = (minutes: number) => {
    if (minutes <= 15) return "text-green-600 bg-green-100";
    if (minutes <= 30) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Quick Recipes
          </h1>
          <p className="text-gray-600">
            Discover delicious, healthy recipes that fit your busy lifestyle
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search for recipes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>Search</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diet
                </label>
                <select
                  value={selectedDiet}
                  onChange={(e) => setSelectedDiet(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="">All Diets</option>
                  {dietOptions.map((diet) => (
                    <option key={diet} value={diet}>
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dish Type
                </label>
                <select
                  value={selectedDishType}
                  onChange={(e) => setSelectedDishType(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="">All Types</option>
                  {dishTypeOptions.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                >
                  <option value="popularity">Popularity</option>
                  <option value="healthiness">Healthiness</option>
                  <option value="time">Cooking Time</option>
                  <option value="random">Random</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        {/* Quick Recipe Cards */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Zap className="w-6 h-6 mr-2 text-yellow-500" />
            Quick & Easy Recipes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickRecipes.map((recipe) => (
              <div
                key={recipe.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => handleRecipeClick(recipe)}
              >
                <div className="h-48 bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center">
                  {recipe.image ? (
                    <img
                      src={recipe.image}
                      alt={recipe.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <ChefHat className="w-16 h-16 text-gray-400" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-2 truncate">
                    {recipe.title}
                  </h3>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-1 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{recipe.readyInMinutes}m</span>
                    </div>
                    {recipe.nutrients && recipe.nutrients[0] && (
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Zap className="w-4 h-4" />
                        <span>
                          {recipe.nutrients[0].amount}{" "}
                          {recipe.nutrients[0].unit}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                        recipe.readyInMinutes || 30
                      )}`}
                    >
                      {recipe.readyInMinutes > 15 ? "Medium" : "Easy"}
                    </span>
                  </div>
                  <button className="w-full mt-4 bg-green-100 text-green-700 hover:bg-green-200 py-2 rounded-lg font-medium transition-colors text-sm">
                    View Instructions
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {recipes.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
              Search Results
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group"
                  onClick={() => handleRecipeClick(recipe)}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center overflow-hidden">
                    {recipe.image ? (
                      <img
                        src={recipe.image}
                        alt={recipe.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <ChefHat className="w-16 h-16 text-gray-400" />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <p
                      className="text-sm text-gray-600 mb-3 line-clamp-2"
                      dangerouslySetInnerHTML={{ __html: recipe.summary }}
                    />

                    <div className="flex items-center justify-between text-sm mb-3">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.readyInMinutes}m</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{recipe.servings}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart
                          className={`w-4 h-4 ${getHealthScoreColor(
                            recipe.healthScore
                          )}`}
                        />
                        <span
                          className={getHealthScoreColor(recipe.healthScore)}
                        >
                          {recipe.healthScore}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {recipe.diets?.slice(0, 2).map((diet, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                        >
                          {diet}
                        </span>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                        View Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results */}
        {searchQuery && recipes.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <ChefHat className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or search for something else.
            </p>
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Recipe Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Prep ingredients ahead of time for faster cooking
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Use fresh herbs to enhance flavor without extra calories
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Batch cook on weekends for quick weekday meals
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-gray-700">
                Keep your pantry stocked with healthy staples
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedRecipe && (
        <RecipeModal
          meal={selectedRecipe}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </ProtectedRoute>
  );
}
