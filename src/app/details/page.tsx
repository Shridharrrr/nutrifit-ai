"use client";

import { auth } from "@/config/firebase";
import { useState, useEffect } from "react";
import { Cherry } from "lucide-react";
import DisplayBMI from "@/components/CalculateBMI";
import { saveUserData } from "@/methods/userdata";
import BmrCalculator from "@/components/ActivityProps";

export default function GoalSetupForm() {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    uid: "",
    email: "",
    gender: "",
    age: 25,
    height: 170,
    weight: 60,
    dietaryGoal: "",
    goalDeadline: "",
    activityLevel: "",
    restrictions: [],
    healthConditions: [],
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
      label: "Select your Gender and Age?",
      name: "gender-age",
      render: () => (
        <div className="flex-col flex w-full md:w-5/6">
          <div className="flex space-x-4 items-center justify-center">
            {[
              { label: "/Male.png", value: "Male" },
              { label: "/Female.png", value: "Female" },
            ].map((g) => (
              <button
                key={g.value}
                onClick={() => setFormData({ ...formData, gender: g.value })}
                className={`w-35 h-35 px-4 py-2 overflow-hidden rounded-lg border-2 text-lg font-medium flex items-center justify-center mb-5 ${
                  formData.gender === g.value
                    ? "border-green-500 bg-green-50"
                    : "bg-white border-gray-400"
                }`}
              >
                <img
                  src={g.label}
                  alt={g.value}
                  className="w-20 bg-center object-cover "
                />
              </button>
            ))}
          </div>
            <label className="block text-black font-medium text-lg mb-2 ml-1">
              Age: {formData.age} years
            </label>
            <input
              type="range"
              min={10}
              max={80}
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500"
            />
        </div>
      ),
    },
    {
      label: "Select your Height and Weight!",
      name: "height-weight",
      render: () => (
        <div className="flex flex-col items-center overflow-auto">
        <div className="space-y-5 w-full md:w-5/6">
          <div>
            <label className="block text-gray-800 font-medium text-lg ml-1 mt-2">
              Height: {formData.height} cm
            </label>
            <input
              type="range"
              min={100}
              max={220}
              value={formData.height}
              onChange={(e) =>
                setFormData({ ...formData, height: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500"
            />
          </div>

          <div>
            <label className="block text-gray-800 font-medium text-lg ml-1">
              Weight: {formData.weight} kg
            </label>
            <input
              type="range"
              min={30}
              max={150}
              value={formData.weight}
              onChange={(e) =>
                setFormData({ ...formData, weight: Number(e.target.value) })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500 mb-6"
            />

          </div>
        </div>
        <DisplayBMI height={formData.height} weight={formData.weight} />
        </div>
      ),
    },
    {
      label: "What is your Dietary Goal?",
      name: "dietaryGoal-activitylevel",
      render: () => (
        <div className="flex flex-col items-center w-full">
          <div className="md:flex-row flex-col md:space-y-0 space-y-2 space-x-2 mb-2 items-center justify-center">
            {["Weight loss⚖️", "Improved health🌿", "Weight gain💪"].map(
              (d) => (
                <button
                  key={d}
                  onClick={() => setFormData({ ...formData, dietaryGoal: d })}
                  className={`py-2 w-full md:w-[185px] rounded-lg border ${
                    formData.dietaryGoal === d
                      ? "bg-green-500 text-white border-0"
                      : "bg-white text-gray-700 border-gray-400"
                  }`}
                >
                  {d}
                </button>
              )
            )}
          </div>
          <h3 className="text-2xl font-medium text-center mb-3 mt-4">How Active are you on daily basis?</h3>
          <div className="md:flex-row flex-col md:space-y-0 space-y-2 space-x-2 mb-5 items-center justify-center">
            {["Lightly Active💤", "Moderately Active🚶", "Very Active🏃"].map((d) => (
              <button
                key={d}
                onClick={() => setFormData({ ...formData, activityLevel: d })}
                className={`py-2 w-full md:w-[185px] rounded-lg border ${
                  formData.activityLevel === d
                    ? "bg-green-500 text-white border-0"
                    : "bg-white text-gray-700 border-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <BmrCalculator age={formData.age} gender={formData.gender} height={formData.height} weight={formData.weight} activityLevel={formData.activityLevel}/>
        </div>
      ),
    },
    {
      label:
        "Do you have any Food Restrictions or Health Issues?",
      name: "activityLevel",
      render: () => (
        <div className="flex flex-col items-center w-full">
          <div className="flex items-center justify-between text-black text-2xl">
              <div>
              <span>Food Restrictions :</span>
              </div>
              <div>
              <span>Health Issues :</span>
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
    }
    if (step === 3 && !formData.activityLevel) {
      alert("Please select your activity level.");
      return;
    }

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      saveUserData(formData);
      alert("Thanks! Your answers have been saved.");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
  <div className="bg-white p-8 rounded-xl shadow-lg h-auto md:h-[550px] w-full max-w-2xl flex flex-col">
    
    {/* Top content */}
    <div className="flex flex-col items-center justify-start space-y-5 overflow-auto">
      <h1 className="text-3xl text-center flex items-center">
        <span className="text-gray-800 font-medium">Nutrifit</span>
        <span className="text-green-500 font-semibold">AI</span>
        <span className="text-green-500 font-semibold">
          <Cherry strokeWidth={2} />
        </span>
      </h1>

      <div className="w-full md:w-3/4 bg-gray-200 rounded-full h-3">
        <div
          className="bg-green-500 h-3 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <label className="block text-black text-2xl font-medium text-center mb-3 mt-3">
        {currentStep.label}
      </label>
      {currentStep.render()}

      {step === 0 && (
        <span className="text-xs font-medium text-center text-gray-500 block md:mt-2">
          We use your gender to design the best diet plan for you. If you
          don't identify yourself as any of these options, please select the
          gender closest to your hormonal profile.
        </span>
      )}
    </div>

    <div className="flex justify-between space-x-4 w-full mt-auto pt-4">
      <button
        onClick={handleBack}
        disabled={step === 0}
        className={`w-full py-3 rounded-lg font-semibold transition ${
          step === 0
            ? "bg-gray-300 text-gray-500"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
      >
        Back
      </button>
      <button
        onClick={handleNext}
        className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition"
      >
        {step === totalSteps - 1 ? "Finish" : "Next"}
      </button>
    </div>
  </div>
</div>

  );
}
