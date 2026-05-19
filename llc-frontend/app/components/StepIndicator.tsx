"use client";

import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  steps: { title: string }[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="w-full py-4 mb-8">
      <div className="flex items-center justify-center space-x-4">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center">
            <div className="flex items-center sm:flex-row flex-col sm:space-y-0 space-y-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 
                  ${
                    index < currentStep
                      ? "bg-black text-white border-black"
                      : index === currentStep
                      ? "border-black text-black"
                      : "border-gray-300 text-gray-300"
                  }`}
              >
                {index < currentStep ? (
                  <Check className="sm:w-5 w-4 sm:h-5 h-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span
                className={`ml-2 text-sm font-medium ${
                  index <= currentStep ? "text-black" : "text-gray-300"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`sm:w-12 w-8 h-0.5 sm:mx-2 ${
                  index < currentStep ? "bg-black" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
