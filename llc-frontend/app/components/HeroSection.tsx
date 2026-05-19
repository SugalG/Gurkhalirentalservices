"use client";
import React from "react";
import dynamic from "next/dynamic";
import Image from "next/image";

const BookingForm = dynamic(
  () => import("@/app/components/forms/BookingForm"),
  {
    ssr: false,
  }
);

export default function HeroSection({ image }: { image: string }) {
  return (
    <section
      className="relative min-h-[110vh] sm:min-h-screen -mt-36"
      id="hero"
    >
      <Image
        src={image}
        alt="Luxury car on road"
        width={500}
        height={500}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm">
        <div className="container mx-auto h-full px-4">
          <div className="h-full flex flex-col lg:flex-row items-center justify-center lg:space-x-20 pt-40">
            <div className="max-w-xl text-white text-center lg:text-left md:space-y-0 space-y-2">
              <h1 className="text-3xl lg:text-5xl font-bold lg:mb-6 md:whitespace-nowrap">
                Your Journey, Redefined
              </h1>
              <p className="text-sm md:text-base lg:text-xl lg:mb-8 md:px-0 px-5">
                Experience luxury transportation with our premium service,
                <br className="hidden lg:block" /> where comfort meets
                sophistication.
              </p>
            </div>
            <div className="w-full max-w-md mt-4 lg:mt-0 px-4 sm:px-0">
              <BookingForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
