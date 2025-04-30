"use client";

import { auth } from "@/config/firebase";
import { useState, useEffect } from "react";
import { Cherry,ThumbsUpIcon } from "lucide-react";
import DisplayBMI from "@/components/CalculateBMI";
import { saveUserData } from "@/methods/userdata";
import BmrCalculator from "@/components/ActivityProps";
import { UserData } from "@/models/userModel";

export default function GoalSetupForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<UserData>({
    uid: "",
    email: "",
    gender: "",
    age: 25,
    height: 170,
    weight: 60,
    dietaryGoal: "",
    activityLevel: "",
    restrictions: ["None"],
    healthConditions: ["None"],
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setFormData((prev) => ({
        ...prev,
        uid: user.uid,
        email: user.email || "",
      }));
    }
  }, []);

  const steps = [
    {
      label: "Select your Gender and Age!",
      name: "gender-age",
      render: () => (
        <div className="flex flex-col w-full space-y-6 ">
          <div className="flex space-x-4 items-center justify-center">
            {[
              { label: "/Male.png", value: "Male" },
              { label: "/Female.png", value: "Female" },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setFormData({ ...formData, gender: g.value })}
                className={`flex justify-center cursor-pointer w-32 h-32 p-2 overflow-hidden rounded-xl border-2 transition-all ${
                  formData.gender === g.value
                    ? "border-green-500 bg-green-50 scale-105 shadow-md"
                    : "bg-white border-gray-200 hover:border-gray-300"
                }`}
              >
                <img
                  src={g.label}
                  alt={g.value}
                  className="w-20 h-full object-center object-contain"
                />
              </button>
            ))}
          </div>
          
          <div className="space-y-1 md:space-y-2">
            <div className="flex justify-between items-center">
            <label className="block text-gray-700 font-medium text-lg">
                  Age : <span className="text-blue-600 font-semibold">{formData.age} years</span> 
                </label>
            </div>
            <input
              type="range"
              min={10}
              max={80}
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600"
            />
          </div>
          
          {step==0 && (
            <p className="text-sm text-center text-gray-500">
              We use your gender to design the best diet plan for you. If you
              don't identify with these options, please select the gender closest
              to your hormonal profile.
            </p>
          )}
        </div>
      ),
    },
    {
      label: "Enter your Height and Weight!",
      name: "height-weight",
      render: () => (
        <div className="flex flex-col items-center w-full space-y-6">
          <div className="space-y-6 w-full">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium text-lg">
                  Height : <span className="text-blue-600 font-semibold">{formData.height} cm</span> 
                </label>
              </div>
              <input
                type="range"
                min={100}
                max={220}
                value={formData.height}
                onChange={(e) =>
                  setFormData({ ...formData, height: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium text-lg">
                  Weight : <span className="text-blue-600 font-semibold">{formData.weight} kg</span> 
                </label>
              </div>
              <input
                type="range"
                min={30}
                max={150}
                value={formData.weight}
                onChange={(e) =>
                  setFormData({ ...formData, weight: Number(e.target.value) })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:accent-green-600"
              />
            </div>
          </div>
          
          <DisplayBMI 
            height={formData.height} 
            weight={formData.weight} 
          />
        </div>
      ),
    },
    {
      label: "What is your Health Goal?",
      name: "dietaryGoal-activitylevel",
      render: () => (
        <div className="flex flex-col items-center w-full space-y-5">
          <div className="w-full space-y-2">
            <h3 className="text-lg font-medium text-gray-700">Dietary Goal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Weight loss", emoji: "⚖️", value: "Weight loss⚖️" },
                { label: "Improved health", emoji: "🌿", value: "Improved health🌿" },
                { label: "Weight gain", emoji: "💪", value: "Weight gain💪" },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setFormData({ ...formData, dietaryGoal: d.value })}
                  className={`py-3 px-4 rounded-xl border transition-all flex flex-col items-center ${
                    formData.dietaryGoal === d.value
                      ? "bg-green-500 text-white border-green-500 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                  }`}
                >
                  <span>{d.label}{d.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full space-y-2">
            <h3 className="text-lg font-medium text-gray-700">Activity Level</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { label: "Lightly Active", emoji: "💤", value: "Lightly Active💤" },
                { label: "Moderately Active", emoji: "🚶", value: "Moderately Active🚶" },
                { label: "Very Active", emoji: "🏃", value: "Very Active🏃" },
              ].map((d) => (
                <button
                  key={d.value}
                  onClick={() => setFormData({ ...formData, activityLevel: d.value })}
                  className={`py-3 px-4 rounded-xl border transition-all flex flex-col items-center ${
                    formData.activityLevel === d.value
                      ? "bg-green-500 text-white border-green-500 shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                  }`}
                >
                  <span>{d.label}{d.emoji}</span>
                </button>
              ))}
            </div>
          </div>
          
          <BmrCalculator 
            age={formData.age} 
            gender={formData.gender} 
            height={formData.height} 
            weight={formData.weight} 
            activityLevel={formData.activityLevel}
          />
        </div>
      ),
    },
    {
      label: "Any Food-Restrictions or Health issues?",
      name: "restrictions-conditions",
      render: () => (
        <div className="flex flex-col items-center w-full space-y-8">
          <div className="w-full space-y-2">
            <h3 className="text-lg font-medium text-gray-700">Food Restrictions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Kosher", "Halal", "Pescatarian", "Nut-free"].map((restriction) => (
                <button
                  key={restriction}
                  onClick={() => {

                    let newRestrictions;
                    if (formData.restrictions.includes(restriction)) {
                    newRestrictions = formData.restrictions.filter(r => r !== restriction);
                    } else {
                    newRestrictions = [...formData.restrictions.filter(r => r !== "None"), restriction];
                    }
                    if (newRestrictions.length === 0) {
                    newRestrictions = ["None"];
                    }   
                    setFormData({ ...formData, restrictions: newRestrictions });
                  }}

                  className={`py-2 px-3 rounded-lg border transition-all flex gap-4 text-sm ${
                    formData.restrictions.includes(restriction)
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                  }`}
                >
                  <ThumbsUpIcon/>
                  {restriction}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full space-y-2">
            <h3 className="text-lg font-medium text-gray-700">Health Conditions</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {["Diabetes", "Hypertension", "Heart Disease", "PCOS", "Thyroid", "IBS", "Celiac", "Cholesterol"].map((condition) => (
                <button
                  key={condition}
                  onClick={() => {

                    let newConditions;
                    if (formData.healthConditions.includes(condition)) {
                      newConditions = formData.healthConditions.filter(c => c !== condition);
                    } else {
                      newConditions = [...formData.healthConditions.filter(c => c !== "None"), condition];
                    }
                    if (newConditions.length === 0) {
                      newConditions = ["None"];
                    }
                    setFormData({ ...formData, healthConditions: newConditions });
                  }}

                  className={`py-2 px-3 rounded-lg border transition-all text-sm ${
                    formData.healthConditions.includes(condition)
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                  }`}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const currentStep = steps[step];
  const progress = Math.round(((step + 1) / totalSteps) * 100);

  const handleNext = () => {
    if (step === 0 && !formData.gender) {
      alert("Please select your gender.");
      return;
    }
    if (step === 2) {
      if (!formData.dietaryGoal) {
        alert("Please select your dietary goal.");
        return;
      }
      if (!formData.activityLevel) {
        alert("Please select your activity level.");
        return;
      }
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      saveUserData(formData);
      alert("Thanks! Your answers have been saved.");
      // Optionally redirect or close the form
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center  bg-green-500 p-4">
      <div className="bg-white p-6 md:p-8 rounded-xl shadow-xl h-auto max-h-[90vh] w-full max-w-2xl flex flex-col">
        {/* Header */}
        <div className="mb-4">
          <h1 className="flex items-center justify-center text-3xl font-bold text-center">
            <span className="text-gray-800">NutriFit</span>
            <span className="text-green-500">AI</span>
            <span className="text-green-500">
              <Cherry strokeWidth={2.5} size={30} />
            </span>
          </h1>
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-black">
              Step {step + 1} of {totalSteps}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current step content */}
        <div className="flex-grow overflow-y-auto px-2 py-4">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-gray-800 mb-5">
            {currentStep.label}
          </h2>
          {currentStep.render()}
        </div>

        {/* Navigation buttons */}
        <div className="flex justify-between space-x-4 w-full mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={step === 0}
            className={`w-full py-3 rounded-lg font-semibold transition ${
              step === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Back
          </button>
          <button
            onClick={handleNext}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition shadow-md hover:shadow-lg"
          >
            {step === totalSteps - 1 ? "Finish Setup" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}