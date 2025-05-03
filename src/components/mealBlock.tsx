import { foodItem } from '@/models/foodModel'
import React from 'react'
interface Props {
  meal: foodItem
}
function MealBlock({meal}: Props) {
  console.log(meal);
  
  return (
       <div className="bg-gray-200 rounded-xl p-6 flex items-center justify-between w-full max-w-5xl mx-auto">
         <div className="flex flex-col w-2/5 h-full">
           <div className="text-xl flex-grow-0 font-semibold mb-4">{meal.title}</div>
           <div
              className="aspect-[1] rounded-lg bg-center bg-cover"
              style={{ backgroundImage: `url(${meal.image})` }}
           ></div>

         </div>
         <div className="bg-gray-300 w-2/5 h-full rounded-lg mx-1"></div>
         <div className="flex flex-col justify-between h-full gap-4 w-1/4 lg:w-1/5 lg:scale-90">
           <div className="bg-gray-400 h-16 rounded-md"></div>
           <div className="bg-gray-400 h-16 rounded-md"></div>
           <div className="bg-gray-400 h-16 rounded-md"></div>
           <div className="bg-gray-400 h-16 rounded-md"></div>
         </div>
        </div>
  )
}

export default MealBlock
