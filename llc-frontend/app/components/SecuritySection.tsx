import { Check, Star } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

const securityData = [
  {
    title: "End-to-End Encryption",
    description: "Your messages and files are fully encrypted and secure.",
    points: ["Secure payment processing", "Protected personal data"],
    image: "/images/secure.png",
  },
  {
    title: "24/7 Customer Support",
    description: "Our team is always here to help you.",
    points: ["Email & phone assistance"],
    image: "/images/secure2.png",
  },
  {
    title: "Trusted by Thousands",
    description: "4.9 out of 5 based on 100+ reviews.",
    points: (
      <div className="flex items-center gap-1 text-yellow-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} className="w-5 h-5" fill="currentColor" />
        ))}
      </div>
    ),
    image: "/images/secure3.png",
  },
];

export default function SecuritySection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);

      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % securityData.length);
        setIsFading(false);
      }, 1000);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const { title, description, points, image } = securityData[currentIndex];

  return (
    <section className="bg-black p-6 md:px-20 py-5 md:pt-0 pt-10 w-full">
      <div
        className={`relative flex flex-col md:flex-row items-start justify-between md:items-center gap-6 transition-opacity duration-500 md:min-h-[250px] min-h-[200px] ${
          isFading ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="flex-grow pl-10 pr-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
            {title}
          </h2>

          <p className="text-gray-400 text-sm md:text-base mb-6">
            {description}
          </p>

          <div className="space-y-3 h-20">
            {Array.isArray(points)
              ? points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-second" />
                    <span className="text-gray-300 text-sm md:text-base">
                      {point}
                    </span>
                  </div>
                ))
              : points}
          </div>
        </div>

        <div className="flex-shrink-0 md:block hidden ">
          <div className="flex items-center justify-center">
            <Image
              src={image}
              alt="Security"
              width={150}
              height={150}
              className="w-20 h-20 md:w-[129px] md:h-[140px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
