import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BmrCalculatorProps = {
  age: number;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: string;
};

const activityLevels = [
  { label: "Lightly Active💤", value: 1.375 },
  { label: "Moderately Active🚶", value: 1.55 },
  { label: "Very Active🏃", value: 1.725 },
];

const BmrCalculator: React.FC<BmrCalculatorProps> = ({
  age,
  gender,
  height,
  weight,
  activityLevel,
}) => {
  // Find numerical value for the given activity level
  const activityFactor =
    activityLevels.find((level) => level.label === activityLevel)?.value ||
    1.375;

  const calculateBMR = (): number => {
    return gender === "Male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  };

  const bmr = calculateBMR();
  const tdee = bmr * activityFactor;

  return (
    <div className=" text-center text-xl font-medium text-gray-700 w-full">
      Your BMR is{" "}
      <span className="font-semibold text-blue-600">
        {Math.round(bmr)} kcal/day{" "}
      </span>{" "}
      and TDEE is{" "}
      <span className="font-semibold text-blue-600">
        {" "}
        {Math.round(tdee)} kcal/day{" "}
      </span>
      <div className="flex flex-col ml-1 items-start text-base font-medium text-blue-700 mt-3 hover:text-blue-900 ">
        <AlertDialog>
          <AlertDialogTrigger>BMR ⓘ</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Basal Metabolic Rate</AlertDialogTitle>
              <AlertDialogDescription>
                BMR is the number of calories your body needs to function at
                rest. This includes essential processes like breathing and
                circulation, basically, the energy your body uses just to stay
                alive. Your BMR is influenced by factors like age, weight,
                height, and gender. It's a key part of calculating your TDEE
                because it tells you how many calories you'd burn if you did
                nothing all day. Since TDEE includes all the calories you burn
                daily-including exercise and everyday activities-BMR serves as
                the baseline. The more active you are, the higher your TDEE will
                be, but it all starts with your BMR. The BMR (Basal Metabolic
                Rate) formula is calculated using the Mifflin-St Jeor Equation,
                which is one of the most accurate methods:<br></br>For Men: BMR
                = (10 x weight in kg) + (6.25 × height in cm) - (5 × age in
                years) + 5<br></br>For Women: BMR = (10 x weight in kg) + (6.25
                × height in cm) - (5 × age in years) - 161
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      <div className="flex flex-col ml-1 items-start text-base font-medium text-blue-700  hover:text-blue-900 ">
        <AlertDialog>
          <AlertDialogTrigger>TDEE ⓘ</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Total Daily Energy Expenditure</AlertDialogTitle>
              <AlertDialogDescription>
                TDEE is the total number of calories your body burns in a day,
                including everything from basic functions (like breathing and
                digestion) to physical activities (like walking and exercise).
                It depends on factors like your age, weight, height, and
                activity level. Think of it like your body's fuel budget. If you
                eat this many calories, your weight stays the same.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default BmrCalculator;
