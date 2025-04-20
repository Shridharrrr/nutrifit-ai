import React from 'react';

interface DisplayBMIProps {
  height: number;
  weight: number;
}

const DisplayBMI: React.FC<DisplayBMIProps> = ({ height, weight }) => {
  const calculateBMI = (h: number, w: number): string | null => {
    if (!h || !w) return null;
    const heightInMeters = h / 100;
    const bmi = w / (heightInMeters ** 2);
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
    <div className="p-2 text-center text-lg font-extralight text-gray-700">
      {(bmi !== null) && (
        <>
          Your Body Mass Index(BMI) is <span className="text-blue-600 font-semibold">{bmiStr}</span> and you fall in 
           <span className="text-green-600"> {category} </span> 
           Category
        </>
      )}
    </div>
  );
};

export default DisplayBMI;
