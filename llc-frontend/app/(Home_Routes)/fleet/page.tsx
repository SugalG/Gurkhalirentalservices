"use client";
import { useEffect, useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@components/ui/select";
import { User, BaggageClaim } from "lucide-react";
import Navbar from "@components/Navbar";
import HeroSection from "@components/HeroSection";
import SecuritySection from "@components/SecuritySection";
import { Title } from "@components/HomePage";
import { cn } from "@/app/lib/utils";
import WhyChooseUs from "@components/WhyChooseUs";
import Footer from "@components/Footer";
import Image from "next/image";
import { filterVehicleTypes } from "@/app/(Admin_Routes)/admin/vehicles/action";
import { Vehicle } from "@/app/types";
import Link from "next/link";
import { Button } from "@/app/components/ui/button";
import { scrollToTop } from "@/app/lib/helper";

const defaultFilter = {
  fuelType: "electric",
  category: "luxury",
  occupancy: "4",
};

export default function Fleet() {
  const [vehiclesList, setVehiclesList] = useState<Vehicle[] | null>(null);
  const [filters, setFilters] = useState({ ...defaultFilter });

  const [appliedFilters, setAppliedFilters] = useState<{
    fuelType?: string;
    category?: string;
    occupancy?: string;
  }>({ ...defaultFilter });

  const handleApplyFilters = () => {
    setAppliedFilters(filters);
  };

  const handleResetFilter = () => {
    setAppliedFilters({ ...defaultFilter });
    setFilters({ ...defaultFilter });
  };

  const scrollToHero = () => {
    const heroSection = document.getElementById("hero");
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    async function getVehicles() {
      const { vehicleTypes } = await filterVehicleTypes({
        availabilityStatus: true,
        ...(appliedFilters?.fuelType &&
          appliedFilters?.fuelType.length > 0 &&
          appliedFilters.fuelType !== "all" &&
          ({
            fuelType: appliedFilters.fuelType,
          } as any)),
        ...(appliedFilters.category &&
          appliedFilters.category.length > 0 &&
          appliedFilters.category !== "all" &&
          ({
            category: appliedFilters.category,
          } as any)),
        ...(appliedFilters.occupancy &&
          appliedFilters.occupancy.length > 0 &&
          appliedFilters.occupancy !== "all" &&
          ({
            occupancy: parseInt(appliedFilters.occupancy),
          } as any)),
      });

      if (vehicleTypes.length > 0) {
        setVehiclesList(vehicleTypes);
      } else {
        setVehiclesList(null);
      }
    }
    if (
      appliedFilters.fuelType ||
      appliedFilters.category ||
      appliedFilters.occupancy
    ) {
      getVehicles();
    }
    localStorage.removeItem("vehicle");
  }, [appliedFilters]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection image="/images/fleet-hero.jpg" />
      <SecuritySection />
      <div className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          <div className="flex flex-wrap gap-4 bg-white">
            <Select
              value={filters.fuelType}
              onValueChange={(value) =>
                setFilters({ ...filters, fuelType: value })
              }
            >
              <SelectTrigger className="flex-1 bg-white text-main">
                <SelectValue placeholder="Vehicle Type" className="bg-white" />
              </SelectTrigger>
              <SelectContent className="bg-white text-main">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="electric">EV</SelectItem>
                <SelectItem value="gas">Fuel</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.category}
              onValueChange={(value) =>
                setFilters({ ...filters, category: value })
              }
            >
              <SelectTrigger className="flex-1 bg-white text-main">
                <SelectValue placeholder="Category" className="bg-white" />
              </SelectTrigger>
              <SelectContent className="bg-white text-main">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="luxury">Luxury</SelectItem>
                <SelectItem value="economy">Economy</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.occupancy}
              onValueChange={(value) =>
                setFilters({ ...filters, occupancy: value })
              }
            >
              <SelectTrigger className="flex-1 bg-white text-main">
                <SelectValue
                  placeholder="Passenger Capacity"
                  className="bg-white"
                />
              </SelectTrigger>
              <SelectContent className="bg-white text-main">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="3">Up to 3</SelectItem>
                <SelectItem value="4">Up to 4</SelectItem>
                <SelectItem value="5">Up to 5</SelectItem>
              </SelectContent>
            </Select>
            <button
              onClick={handleApplyFilters}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Apply Filters
            </button>{" "}
            <button
              onClick={handleResetFilter}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Title>Our Premium Fleet</Title>

          {!vehiclesList || vehiclesList.length === 0 ? (
            <div className="font-extralight overflow-hidden lg:text-3xl text-xl text-center text-gray-600">
              No Vehicles Available At The Moment
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {vehiclesList.map((vehicle, index) => (
                <div
                  key={index}
                  className={cn(
                    "bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-sm"
                  )}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      height={200}
                      width={200}
                      src={vehicle.photo}
                      alt={vehicle.name}
                      className="w-full h-full object-cover bg-black/5"
                    />
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="flex items-start justify-between">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {vehicle.name}
                      </h3>
                      <div className="flex items-baseline gap-1">
                        <span className="font-medium text-gray-800">
                          ${vehicle.hourlyPriceMultiplier}/hour
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-600 flex-wrap">
                      <div className="flex items-center gap-2 px-2 bg-gray-200 rounded-3xl py-1">
                        <User className="w-3 h-3" />
                        <span className="whitespace-nowrap text-xs">
                          {vehicle.maxOccupancy} passengers
                        </span>
                      </div>
                      <div className="flex items-center gap-2 px-2 bg-gray-200 rounded-3xl py-1">
                        <BaggageClaim className="w-3 h-3" />
                        <span className="whitespace-nowrap text-xs">
                          {vehicle.maxSuitcaseCapacity} suitcases
                        </span>
                      </div>
                    </div>
                    <div className="flex md:flex-row flex-col md:space-y-0 space-y-4 space-x-2 items-start justify-between">
                      <p className="text-gray-600">{vehicle.description}</p>

                      <Button
                        onClick={() => {
                          localStorage.setItem(
                            "vehicle",
                            JSON.stringify(vehicle)
                          );
                          scrollToTop();
                        }}
                        className="whitespace-nowrap bg-[#0f172a] py-2 text-base text-white px-4 rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
                      >
                        Book Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <WhyChooseUs invert />

        <div className="text-center py-10 text-main md:px-0 px-5">
          <h2 className="md:text-3xl text-2xl font-bold mb-4">
            Experience Luxury on Wheels
          </h2>
          <p className="text-gray-600 mb-8">Book Your Perfect Ride Today</p>
          <Link
            href="#"
            className="bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800 transition-colors"
            onClick={scrollToHero}
          >
            Book Now
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
