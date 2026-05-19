import React from "react";
import { Title } from "@components/HomePage";
import { steps } from "@/app/constants";

const HowItWorksStep = ({
  number,
  title,
  description,
  invert = false,
}: {
  number: number;
  title: string;
  description: string;
  invert?: boolean;
}) => {
  return (
    <div className={`text-center ${invert ? "text-white" : "text-main"}`}>
      <div
        className={`w-16 h-16 ${
          invert ? "bg-white text-main" : "bg-main text-white"
        }   rounded-full flex items-center justify-center mx-auto mb-4`}
      >
        <span className="text-2xl font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default function HowItWorkSection({
  invert = false,
}: {
  invert?: boolean;
}) {
  return (
    <section
      className={`py-16 md:px-20 px-4 ${
        invert ? "bg-main text-white" : "bg-white text-black"
      }`}
    >
      <div className="container mx-auto px-4 space-x-4">
        <Title className={invert ? "text-white" : "text-main"}>
          How It Works
        </Title>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map(({ number, title, description }, index) => (
            <HowItWorksStep
              key={index}
              number={number}
              title={title}
              description={description}
              invert={invert}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
