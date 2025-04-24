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

interface DisplayBMIProps {
  height: number;
  weight: number;
}

const DisplayBMI: React.FC<DisplayBMIProps> = ({ height, weight }) => {
  const calculateBMI = (h: number, w: number): string | null => {
    if (!h || !w) return null;
    const heightInMeters = h / 100;
    const bmi = w / heightInMeters ** 2;
    return bmi.toFixed(2);
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return "Underweight";
    else if (bmi < 24.9) return "Normal";
    else if (bmi < 29.9) return "Overweight";
    else return "Obese";
  };

  const bmiStr = calculateBMI(height, weight);
  const bmi = bmiStr ? parseFloat(bmiStr) : null;
  const category = bmi !== null ? getBMICategory(bmi) : null;

  return (
    <div className="ml-1 text-center text-xl font-medium text-gray-700">
      {bmi !== null && (
        <>
          Your Body Mass Index(BMI) is{" "}
          <span className="text-blue-600 font-semibold">
            {bmiStr}
          </span>{" "}
          and you fall in
          <span className="text-green-600 font-semibold"> {category} </span>
          Category!
        </>
      )}
      <div className="flex justify-start text-lg font-medium text-blue-700 mt-5 hover:text-blue-900">
        <AlertDialog>
          <AlertDialogTrigger>BMI ⓘ</AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Body Mass Index</AlertDialogTitle>
              <AlertDialogDescription>
                Body Mass Index (BMI) is a numerical value derived from an
                individual’s weight and height, used to assess whether a person
                has a healthy body weight for a given height. It is calculated
                by dividing a person’s weight in kilograms by the square of
                their height in meters (kg/m²).
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

export default DisplayBMI;
