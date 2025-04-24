"use client";

import { auth } from "@/config/firebase";
import { useState, useEffect } from "react";
import { Cherry } from "lucide-react";
import DisplayBMI from "@/components/CalculateBMI";
import { saveUserData } from "@/methods/userdata";
import { useRouter } from "next/navigation";

export default function GoalSetupForm() {
  const router = useRouter()
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
    restrictions: '',
    healthConditions: '',
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
    // step 1 for gender and age
    {
      label: "What is your gender?",
      name: "gender",
      render: () => (
        <div className="flex flex-col space-x-4">
          <div className="flex mb-7 gap-9">
          {[
            { label: "/Male.png", value: "Male" },
            { label: "/Female.png", value: "Female" },
          ].map((g) => (
            <button
              key={g.value}
              onClick={() => setFormData({ ...formData, gender: g.value })}
              className={`w-40 h-55 px-4 py-2 overflow-hidden rounded-lg border-2 text-lg font-medium flex items-center justify-center ${
                formData.gender === g.value
                  ? "border-green-500 bg-green-50"
                  : "bg-white border-gray-400"
              }`}
            >
              <img
                src={g.label}
                alt={g.value}
                className="w-full bg-center object-cover "
              />
            </button>
          ))}
          </div>
          <div>
            <label className="block text-black font-medium text-lg mb-1">
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
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500"
            />
          </div>
        </div>
      ),
    },
    // step 2 height and weight
    {
      label: "Select your Height and Weight!",
      name: "height-weight",
      render: () => (
        <div className="space-y-5 w-full">
          

          <div>
            <label className="block text-black font-medium text-lg mb-1">
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
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500"
            />
          </div>

          <div>
            <label className="block text-black font-medium text-lg mb-1">
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
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500 hover:green-800 active:accent-green-500 mb-6"
            />

            <DisplayBMI height={formData.height} weight={formData.weight} />
          </div>
        </div>
      ),
    },
    // step 3 goal and activity
    {
      label: "What is your dietary goal and your target timeline?",
      name: "dietaryGoal-goalDeadline",
      render: () => (
        <div className="flex flex-col items-center">
          <div className="flex space-x-4 mb-4">
            {["Weight loss ⚖️", "Improved health 🌿", "Weight gain 💪" ].map(
              (d) => (
                <button
                  key={d}
                  onClick={() => setFormData({ ...formData, dietaryGoal: d })}
                  className={`px-4 py-2 w-[175px] rounded-lg border ${
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
          <div className="w-1/2 ">
            <input
              type="date"
              value={formData.goalDeadline}
              onChange={(e) =>
                setFormData({ ...formData, goalDeadline: e.target.value })
              }
              className="w-full border border-gray-400 text-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex space-x-4 m-4">
            {["Lightly active 🛌", "Active 🚶", "Very Active 🏃"].map((d) => (
              <button
                key={d}
                onClick={() => setFormData({ ...formData, activityLevel: d })}
                className={`px-4 py-2 w-[155px] rounded-lg border ${
                  formData.activityLevel === d
                    ? "bg-green-500 text-white border-0"
                    : "bg-white text-gray-700 border-gray-400"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      ),
    },
    // step 4 allergy and issues
    {
      label:
        "any food restrictions/allergies or any health issues?",
      name: "activityLevel",
      render: () => (
        <div className="flex flex-col items-center w-full">
          <input
            type="text"
            placeholder="Any food restrictions or allergies?"
            value={formData.restrictions}
            onChange={(e) =>
              setFormData({ ...formData, restrictions: e.target.value})
            }
            className="w-5/6 border  border-gray-400 rounded-lg px-4 py-2 text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="text"
            placeholder="Any health issues?"
            value={formData.healthConditions}
            onChange={(e) =>
              setFormData({ ...formData, healthConditions: e.target.value })
            }
            className="w-5/6 mt-4 border  border-gray-400 rounded-lg px-4 py-2 text-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
          />
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
      if (!formData.goalDeadline) {
        alert("Please select your goal deadline.");
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
      router.push("/home")
    }
  };
  

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg h-auto w-full max-w-2xl space-y-6 flex flex-col items-center ">
        <h1 className="text-3xl text-center flex items-center">
          <span className="text-gray-800 font-medium">Nutrifit</span>
          <span className="text-green-500 font-semibold">AI</span>
          <span className="text-green-500 font-semibold">
            <Cherry strokeWidth={2} />
          </span>
        </h1>

        <div className="w-3/4 bg-gray-200 rounded-full h-3 ">
          <div
            className="bg-green-500 h-3 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <label className="block text-black text-2xl font-medium text-center mb-3">
          {currentStep.label}
        </label>
        {currentStep.render()}

        {step === 0 && (
          <span className="text-xs font-light text-center text-gray-600 block">
            We use your gender to design the best diet plan for you. If you
            don't identify yourself as any of these options, please select the
            gender closest to your hormonal profile.
          </span>
        )}

        <div className="flex justify-between space-x-4 w-full">
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
