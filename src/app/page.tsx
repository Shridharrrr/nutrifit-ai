"use client"

import { useState } from 'react';
import { Cherry, Utensils, Clock, HeartPulse, ShoppingCart, ClipboardList, ChefHat, ShoppingBag, UtensilsCrossed, ChevronDown, ChevronUp } from 'lucide-react';
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from 'next/navigation';

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="flex justify-between items-center w-full text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <h3 className="text-lg font-medium text-gray-800">{question}</h3>
        <span className="ml-4 flex-shrink-0 text-gray-500">
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </span>
      </button>
      <div
        className={`mt-2 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="text-gray-600">{answer}</p>
      </div>
    </div>
  );
};


interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white mb-4">
          {icon}
        </div>
        {number < 4 && (
          <div className="hidden md:block absolute top-8 -right-full w-full h-0.5 bg-gray-200">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-green-500"></div>
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-center text-gray-600 max-w-xs">{description}</p>
    </div>
  );
};

interface FeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  index: number
}

const FeatureCard: React.FC<FeatureProps> = ({ icon, title, description, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-20px 0px -20px 0px" }} // Adjust trigger margin
      transition={{ 
        duration: 0.4,
        delay: index * 0.1, // Staggered delay based on index
        ease: [0.25, 0.1, 0.25, 1] // Smooth easing
      }}
      className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center text-center"
    >
      <motion.div 
        whileHover={{ scale: 1.05 }} // Subtle hover effect on icon
        className="mb-4 bg-green-100 p-3 rounded-full text-green-500"
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const faqItems = [
    {
      question: "How are the meal plans customized?",
      answer: "Our meal plans are customized based on your nutritional goals, dietary preferences, allergies, and lifestyle needs. We use a combination of algorithms and nutritionist expertise to create plans that work specifically for you."
    },
    {
      question: "How many meals are included in each plan?",
      answer: "Our standard plans include 3 meals per day (breakfast, lunch, and dinner) plus 2 snacks. However, you can customize this based on your specific needs and preferences."
    },
    {
      question: "Are the recipes easy to follow?",
      answer: "Yes, all our recipes are designed to be simple and easy to follow, even for beginners. Each recipe includes step-by-step instructions, cooking times, and tips to make the process as smooth as possible."
    },
    {
      question: "Do you accommodate food allergies and dietary restrictions?",
      answer: "Absolutely. When you sign up, you can specify any food allergies or dietary restrictions you have, and we'll ensure your meal plans don't include those ingredients."
    }
  ];

  const steps = [
    {
      number: 1,
      title: "Answer Our Quiz",
      description: "Tell us about your dietary preferences, health goals, and lifestyle to customize your plan.",
      icon: <ClipboardList size={24} />
    },
    {
      number: 2,
      title: "Get Your Meal Plan",
      description: "Receive a personalized weekly meal plan designed by nutritionists specifically for you.",
      icon: <ChefHat size={24} />
    },
    {
      number: 3,
      title: "Shop Ingredients",
      description: "Use our auto-generated shopping list to get all the ingredients you'll need for the week.",
      icon: <ShoppingBag size={24} />
    },
    {
      number: 4,
      title: "Cook & Enjoy",
      description: "Follow our simple recipes to prepare delicious and healthy meals in no time.",
      icon: <UtensilsCrossed size={24} />
    }
  ];

  const features = [
    {
      icon: <Utensils size={24} />,
      title: "Personalized Meal Plans",
      description: "Meal plans customized to your dietary preferences, nutritional needs, and health goals."
    },
    {
      icon: <Clock size={24} />,
      title: "Time-Saving Recipes",
      description: "Quick and easy recipes that fit your busy schedule without sacrificing nutrition or taste."
    },
    {
      icon: <HeartPulse size={24} />,
      title: "Nutritionist Approved",
      description: "All meal plans are designed and approved by certified nutritionists for optimal health."
    },
    {
      icon: <ShoppingCart size={24} />,
      title: "Automated Shopping Lists",
      description: "Generate shopping lists based on your meal plan with just one click for easier grocery shopping."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className=" text-green-500 p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
        <h1 className="flex items-center justify-center text-2xl font-bold text-center ml-3">
            <span className="text-gray-800">NutriFit</span>
            <span className="text-green-500">AI</span>
            <span className="text-green-500">
              <Cherry strokeWidth={2.5} size={23} />
            </span>
          </h1>
         
          <button onClick={() => {router.push("/login")}} className=" text-white px-4 py-2 mr-3 w-[120px] rounded-md font-medium text-base bg-green-500 hover:bg-green-600 transition">
              Sign In
            </button>
  
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-green-500 text-white pt-10 overflow-hidden">
      
      <div className="container mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-3 leading-tight">
            Meal Planning Made Simple with <span className='bg-gradient-to-r from-purple-500 to-fuchsia-500 bg-clip-text text-transparent drop-shadow-xs'> AI. </span> 
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto"
          >
            NutriFit helps you create personalized meal plans that fit your lifestyle and nutrition goals.
          </motion.p>
        </motion.div>

        <div className="flex  md:flex-row justify-center items-center z-20">
          <motion.button
            onClick={() => {router.push("/login")}}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Plan Now
          </motion.button>
        </div>

        {/* Floating food images */}
        <div className="mt-16 relative h-48 md:h-64">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute left-[100px] md:left-[430px] -translate-x-1/2 translate-y-[-48px] md:-translate-y-[35px] w-[230px] md:w-[400px] z-0"
          >
            <Image
              src="/Salad.png" // Replace with your image
              alt="Healthy salad"
              width={400}
              height={400}
              className="drop-shadow-lg"
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="absolute left-1/2 md:left-1/2 -translate-x-1/2 -translate-y-[-10px] -top-8 z-10 w-[270px] md:w-[500px]"
          >
            <Image
              src="/Biryani.png" // Replace with your image
              alt="Dish biryani"
              width={500}
              height={500}
              className="drop-shadow-lg "
            />
          </motion.div>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="absolute right-[-110px] md:right-[10px] md:w-[400px] w-[200px] -translate-x-1/2 -translate-y-[40px] md:-translate-y-[24px] z-0"
          >
            <Image
              src="/Paneer.png" // Replace with your image
              alt="Dish paneer"
              width={400}
              height={400}
              className="drop-shadow-lg"
            />
          </motion.div>
        </div>
      </div>
    </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 my-3">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Why Choose NutriFit?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We make healthy eating simple, enjoyable, and accessible for everyone.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>

      {/*How it works Section */}
      <section className="py-16 bg-green-100 border border-green-500">
      <div className="container mx-auto px-4 mb-3">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">How NutriFit Works?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our simple four-step process makes meal planning easy and enjoyable.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative mt-1">
          {steps.map((step) => (
            <Step 
              key={step.number}
              number={step.number}
              title={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </div>
      </div>
    </section>

    {/*FAQ section*/}
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 ">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-gray-600">
              Find answers to common questions about NutriFit meal plans.
            </p>
          </div>
          
          <div className="space-y-1">
            {faqItems.map((item, index) => (
              <FAQItem 
                key={index} 
                question={item.question} 
                answer={item.answer} 
              />
            ))}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Still have questions? <a href="#" className="text-green-500 font-medium hover:underline">Contact our support team</a>
            </p>
          </div>
        </div>
      </div>
    </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="text-2xl font-bold ml-3 mb-4 md:mb-0">NutriFit-AI
            <div className="text-center text-gray-400 text-sm font-medium">
            © {new Date().getFullYear()} NutriFit-AI. All rights reserved.
          </div>
            </div>
           
            <div className="flex space-x-6 mr-3">
              {/* <a href="#" className="hover:text-green-400">Privacy Policy</a>
              <a href="#" className="hover:text-green-400">Terms of Service</a>
              <a href="#" className="hover:text-green-400">Contact Us</a> */}
            </div>
          </div>
          
        </div>
      </footer>
    </div>
  );
}
