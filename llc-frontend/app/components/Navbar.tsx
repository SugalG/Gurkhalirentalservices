"use client";

import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { BookingVerificationModal } from "./booking-verification-modal";
import { usePathname } from "next/navigation";
import FeatureBanner from "./FeatureBanner";
import { motion } from "framer-motion";

export default function Navbar({
  withEffect = true,
}: {
  withEffect?: boolean;
}) {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openBookingVerificationModal, setOpenBookingVerificationModal] =
    useState(false);

  const menuItems = [
    { label: "Overview", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Fleet", href: "/fleet" },
    { label: "Help", href: "/help" },
  ];

  useEffect(() => {
    if (!withEffect) return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [withEffect]);

  return (
    <nav
      className={`sticky top-0 w-full z-50 transition-all duration-300  ${
        withEffect
          ? scrolled
            ? "bg-white shadow-sm text-main"
            : "bg-transparent text-white"
          : "bg-white text-main"
      }`}
    >
      <FeatureBanner />

      <div className=" mx-auto px-10 lg:px-20">
        <div className="flex justify-between items-center lg:h-20 h-16">
          {/* Logo */}
          <Link href="/" className="text-2xl font-bold">
            <Image
              src={"/images/logo.png"}
              alt="LLC"
              width={200}
              height={200}
              className="md:w-[70px] w-[40px] md:h-[70px] h-[40px]"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-14">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={`font-medium ${
                  scrolled && "hover:text-gray-700"
                }  transition`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex space-x-2">
            {/* Book Now Button */}
            <Link
              href={"/"}
              className="hidden lg:block bg-main text-white px-6 py-2 rounded transition duration-300"
            >
              Book Now
            </Link>

            {pathName === "/" && (
              <Button
                onClick={() => setOpenBookingVerificationModal(true)}
                className="border-2 hover:bg-main border-main hidden lg:block bg-main text-white px-6 py-2 rounded transition duration-300"
              >
                Already booked?
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setIsOpen(true)}
            aria-label="Toggle Menu"
          >
            <Menu className="h-6 w-6 text-black" />
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="fixed right-0 top-0 w-full h-full bg-white shadow-lg p-6 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="self-end text-black"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center justify-center mb-6">
              <Image
                src={"/images/logo.png"}
                alt="LLC"
                width={60}
                height={60}
                className="w-[50px] h-[50px]"
              />
            </Link>

            {/* Menu Items */}
            <nav className="flex flex-col space-y-6">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-lg font-medium text-gray-800 hover:text-main transition"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Buttons */}
            <div className="mt-auto space-y-4">
              <Link
                href={"/"}
                className="block text-center bg-main text-white text-lg px-6 py-2 rounded transition duration-300"
                onClick={() => setIsOpen(false)}
              >
                Book Now
              </Link>
              {pathName === "/" && (
                <Button
                  onClick={() => {
                    setOpenBookingVerificationModal(true);
                    setIsOpen(false);
                  }}
                  className="w-full bg-main hover:bg-main text-white text-lg px-6 py-2 rounded transition duration-300"
                >
                  Already booked?
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {openBookingVerificationModal && (
        <BookingVerificationModal
          openModal={openBookingVerificationModal}
          setOpenModal={setOpenBookingVerificationModal}
        />
      )}
    </nav>
  );
}
