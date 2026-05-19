"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@components/Navbar";
import { FleetCard, Title } from "@components/HomePage";
import HeroSection from "@components/HeroSection";
import SecuritySection from "@components/SecuritySection";
import HowItWorkSection from "@components/HowItWorkSection";
import Footer from "@components/Footer";
import WhyChooseUs from "@components/WhyChooseUs";
import { Vehicle } from "../types";
import { filterVehicleTypes } from "../(Admin_Routes)/admin/vehicles/action";

export default function Home() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[] | null>(null);

  useEffect(() => {
    async function getVehicles() {
      const { vehicleTypes } = await filterVehicleTypes({
        availabilityStatus: true,
        page: 1,
        limit: 3,
      });
      if (vehicleTypes.length > 0) {
        setVehiclesList(vehicleTypes);
      }
    }
    localStorage.removeItem("vehicle");
    getVehicles();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection image={"/images/home-hero.png"} />
      <SecuritySection />
      <HowItWorkSection />

      {/* Our Premium Fleet */}
      <section className="py-20 bg-gray-50 text-black md:px-20 px-5">
        <div className="container mx-auto px-4">
          <Title>Our Premium Fleet</Title>
          {!vehiclesList || vehiclesList.length === 0 ? (
            <div className="font-extralight overflow-hidden lg:text-3xl text-xl text-center text-gray-600">
              No Vehicles Available At The Moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehiclesList.map((vehicle, index) => (
                <FleetCard
                  key={index}
                  imageSrc={vehicle.photo}
                  title={vehicle.name}
                  subTitle={vehicle.description}
                  price={`$${vehicle.hourlyPriceMultiplier}/hour`}
                  CTA={() => {
                    localStorage.setItem("vehicle", JSON.stringify(vehicle));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <WhyChooseUs invert={true} />

      {/* <TestimonialSection /> */}

      <Footer />
    </div>
  );
}
