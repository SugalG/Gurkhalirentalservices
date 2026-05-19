import React from "react";
import { Title } from "@components/HomePage";
import { features } from "@/app/constants";

const FeatureCard = ({
  Icon,
  title,
  description,
  invert = false,
}: {
  Icon: any;
  title: string;
  description: string;
  invert?: boolean;
}) => {
  return (
    <div className="flex flex-col items-center text-center p-4 border-2 rounded-xl border-gray-200">
      <div
        className={`md:w-16 w-10 md:h-16 h-10 ${
          invert ? "bg-main text-white" : "bg-white text-main"
        }  rounded-full flex items-center justify-center mb-4`}
      >
        <Icon className="md:w-8 md:h-8" />
      </div>
      <h3 className="md:text-xl text-lg font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
};

export default function WhyChooseUs({ invert = false }: { invert?: boolean }) {
  return (
    <section
      className={`md:p-20 p-5 ${
        invert ? "bg-white text-main" : "bg-main text-white"
      }`}
    >
      <div className="container mx-auto px-4">
        <Title className={`${invert ? "text-main" : "text-white"}`}>
          Why Choose Us
        </Title>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map(({ Icon, title, description }, index) => (
            <FeatureCard
              key={index}
              Icon={Icon}
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
