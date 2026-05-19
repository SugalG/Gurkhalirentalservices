import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";
import { Button } from "./ui/button";
import { scrollToTop } from "../lib/helper";

export const FleetCard = ({
  imageSrc,
  title,
  subTitle,
  price,
  CTA,
}: {
  imageSrc: string;
  title: string;
  subTitle: string;
  price: string;
  CTA: () => void;
}) => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden">
    <Image
      src={imageSrc}
      alt={title}
      width={250}
      height={250}
      className="w-full h-72 bg-black object-cover"
    />
    <div className="p-6">
      <div className="mb-4">
        <h3 className="md:text-xl text-lg font-bold">{title}</h3>
        <p className="text-gray-500 md:text-base text-sm">{subTitle}</p>
      </div>
      {/* <div className="flex md:flex-row flex-col justify-between md:items-center md:space-y-0 space-y-3">
        <span className="md:text-xl font-medium">From {price}</span>
        <Link
          href={CTA}
          className="bg-black  text-center text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Book Now
        </Link>
      </div> */}
      <div className="flex md:flex-row flex-col md:space-y-0 space-y-4 space-x-2 items-start justify-between">
        <p className="text-gray-600">From {price}</p>
        <Button
          onClick={() => {
            CTA();
            scrollToTop();
          }}
          className="whitespace-nowrap bg-[#0f172a] py-2 text-white px-4 text-base rounded-lg font-medium hover:bg-[#1e293b] transition-colors"
        >
          Book Now
        </Button>
      </div>
    </div>
  </div>
);

export const Title = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={"text-3xl font-bold text-center mb-12 text-main " + className}
    >
      {children}
    </h2>
  );
};
