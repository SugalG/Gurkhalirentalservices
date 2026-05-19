"use client";

import { Title } from "@components/HomePage";
import { services } from "@/app/constants";
import HeroSection from "@components/HeroSection";
import Navbar from "@components/Navbar";
import SecuritySection from "@components/SecuritySection";
import { Check } from "lucide-react";
import HowItWorkSection from "@components/HowItWorkSection";
import TestimonialSection from "@components/TestimonialSection";
import Footer from "@components/Footer";
import Image from "next/image";

export default function Services() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection image="/images/service-hero.jpg" />
      <SecuritySection />
      <div className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <Title>Our Premium Services</Title>
          </div>

          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="flex flex-col bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    height={200}
                    width={200}
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {service.description}
                  </p>
                  <ul className="space-y-3">
                    {service.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-2"
                      >
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <HowItWorkSection invert={false} />
      {/* <TestimonialSection /> */}
      <Footer />
    </div>
  );
}
