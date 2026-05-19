"use client";

import { JSX, useEffect, useRef, useState } from "react";
import {
  MapPin,
  Clock,
  Shield,
  Users,
  Lock,
  ArrowLeftCircle,
  ShoppingBag,
  Fuel,
  CassetteTape,
  ChevronDown,
  Pencil,
} from "lucide-react";
import Image from "next/image";
import {
  BookingState,
  PassengerDetails,
  RideDetails,
  Vehicle,
} from "@/app/types";
import { PassengerDetailsForm } from "@/app/components/forms/PassangerDetailForm";
import { StepIndicator } from "@components/StepIndicator";
import Navbar from "@components/Navbar";
import { redirect, useSearchParams } from "next/navigation";
import { capitalizeFirstLetter, formatFullDateTime } from "@/app/lib/helper";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { filterVehicleTypes } from "@/app/(Admin_Routes)/admin/vehicles/action";
import { PaymentForm } from "@/app/components/forms/PaymentForm";
import { getEstimatedFare } from "../../action";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/app/components/ui/collapsible";
import CancelBooking from "@/app/components/CancelOrderModal";
import BookingForm from "@/app/components/forms/BookingForm";
import { IBookingEditResponse } from "@/app/types/bookingData";

const STEPS = [
  { title: "Vehicle" },
  { title: "Details" },
  { title: "Payment" },
];

export default function BookNow({
  params: asyncParams,
}: {
  params: Promise<{ id: string }>;
}) {
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);

  const [decodedObject, setDecodedObject] = useState<null | RideDetails>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [bookingState, setBookingState] = useState<BookingState>({
    vehicle: null,
    passengerDetails: null,
    paymentDetails: null,
  });
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehiclesList, setVehiclesList] = useState<Vehicle[] | null>(null);
  const [openCancelBookingModal, setOpenCancelBookingModal] = useState(false);
  const [estimatedFareResult, setEstimatedFareResult] = useState<{
    estimatedFare: number;
    vehicleType: string;
    originCoordinates: [number, number];
    destCoordinates?: [number, number];
    pricingMode: "distance" | "hourly";
    durationHourly?: number;
    distanceMi?: number;
  } | null>(null);
  const [prePaidAmount, setPrePaidAmount] = useState<number>(0);
  const [editWhileBooking, setEditWhileBooking] = useState(false);

  const handleVehicleSelect = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setBookingState((prev) => ({ ...prev, vehicle }));

    if (!decodedObject) return;
    const { pickupCoordinates, destinationCoordinates } = decodedObject;

    const originCoordinates = [pickupCoordinates?.lat, pickupCoordinates?.lng];
    const destCoordinates = [
      destinationCoordinates?.lat,
      destinationCoordinates?.lng,
    ];

    const estimatedFareResult = await getEstimatedFare({
      vehicleType: vehicle._id,
      originCoordinates: originCoordinates as [number, number],
      ...(destinationCoordinates || isEditPage
        ? {
            destCoordinates: destCoordinates as [number, number],
          }
        : {}),
      pricingMode: decodedObject.pricing_mode || decodedObject.pricingMode,
      ...(decodedObject.duration
        ? { durationHourly: Number(decodedObject.duration) }
        : {}),
    });

    if (!estimatedFareResult) return;

    const updatesEstimatedFareResultIfIsEditPage = {
      ...estimatedFareResult,
      estimatedFare: estimatedFareResult.estimatedFare,
    };
    setEstimatedFareResult(updatesEstimatedFareResultIfIsEditPage);
    searchParams.get("type") !== "edit" && handleContinueToDetails();
  };
  const handleVehicleSelectAlready = async (
    vehicle: Vehicle,
    decodedObject: RideDetails
  ) => {
    setSelectedVehicle(vehicle);
    setBookingState((prev) => ({ ...prev, vehicle }));

    if (!decodedObject) return;
    const { pickupCoordinates, destinationCoordinates } = decodedObject;

    const originCoordinates = [pickupCoordinates?.lat, pickupCoordinates?.lng];
    const destCoordinates = [
      destinationCoordinates?.lat,
      destinationCoordinates?.lng,
    ];

    const estimatedFareResult = await getEstimatedFare({
      vehicleType: vehicle._id,
      originCoordinates: originCoordinates as [number, number],
      ...(destinationCoordinates || isEditPage
        ? {
            destCoordinates: destCoordinates as [number, number],
          }
        : {}),
      pricingMode: decodedObject.pricing_mode || decodedObject.pricingMode,
      ...(decodedObject.duration
        ? { durationHourly: Number(decodedObject.duration) }
        : {}),
    });

    if (!estimatedFareResult) return;

    const updatesEstimatedFareResultIfIsEditPage = {
      ...estimatedFareResult,
      estimatedFare: estimatedFareResult.estimatedFare,
    };
    setEstimatedFareResult(updatesEstimatedFareResultIfIsEditPage);
  };

  const handleContinueToDetails = () => {
    setCurrentStep(1);
  };

  const isEditPage = searchParams.get("type") === "edit";

  const handlePassengerDetails = (details: PassengerDetails) => {
    setBookingState((prev) => ({ ...prev, passengerDetails: details }));
    searchParams.get("type") !== "edit" && setCurrentStep(2);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    async function getVehicles() {
      const { vehicleTypes } = await filterVehicleTypes({
        availabilityStatus: true,
      });
      if (vehicleTypes.length > 0) {
        setVehiclesList(vehicleTypes);
      }
    }

    getVehicles();
  }, []);

  const Heading = ({
    title,
    Icon,
    subTitle,
  }: {
    title: string;
    Icon: JSX.Element;
    subTitle: String;
  }) => {
    return (
      <div className="flex md:flex-row flex-col items-center justify-between py-5 px-4">
        <h2 className="text-2xl font-bold md:py-6 py-2">{title}</h2>
        <div className="space-x-2 flex items-center px-4 py-2 bg-black text-white rounded-3xl">
          {Icon}
          <span className="md:text-base text-xs whitespace-nowrap">
            {subTitle}
          </span>
        </div>
      </div>
    );
  };

  const BookingSummary = () => {
    return (
      <>
        <div
          className={`bg-white rounded-lg shadow-md p-6 flex-1 ${
            searchParams.get("type") === "edit" ? " w-full" : "max-h-96"
          } py-10 sticky top-40`}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Order Summary</h2>
          </div>

          <div className="space-y-4">
            {estimatedFareResult?.estimatedFare && (
              <div className="text-sm pb-3 border-b border-gray-200 space-y-2">
                <div className="flex justify-between items-center ">
                  <span className="text-gray-600">
                    {decodedObject?.pricing_mode === "distance"
                      ? `Total distance (mi)`
                      : `Total hours`}
                  </span>
                  <span className="font-semibold">
                    {estimatedFareResult?.pricingMode === "distance"
                      ? estimatedFareResult?.distanceMi + " mi"
                      : estimatedFareResult?.durationHourly}
                  </span>
                </div>

                {selectedVehicle &&
                  estimatedFareResult?.pricingMode === "distance" && (
                    <div className="flex justify-between items-center ">
                      <span className="text-gray-600">Distance Per Price</span>
                      <span className="font-semibold">
                        $ {selectedVehicle?.distancePriceMultiplier}
                      </span>
                    </div>
                  )}
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Base Fare</span>
              <span className="font-semibold">
                ${estimatedFareResult?.estimatedFare?.toFixed(2) || "0.00"}
              </span>
            </div>
            {searchParams.get("type") === "edit" && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Pre-paid Amount</span>
                <span className="font-semibold">
                  ${prePaidAmount || "0.00"}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Taxes & Fees</span>
              <span className="font-semibold">$0.00</span>
            </div>
            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-blue-600">
                $
                {searchParams.get("type") === "edit"
                  ? (
                      Number(estimatedFareResult!?.estimatedFare!?.toFixed(2)) -
                      Number(prePaidAmount)
                    ).toFixed(2)
                  : estimatedFareResult?.estimatedFare?.toFixed(2) || "0.00"}
              </span>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-center mt-3 text-xs text-gray-500">
              <Lock className="h-4 mr-1 text-green-600" />
              <span>Secure, encrypted booking</span>
            </div>
          </div>
          {searchParams.get("type") === "edit" && (
            <>
              <Button
                className="w-full mt-4 text-white "
                variant={"outline"}
                onClick={() => setOpenCancelBookingModal(true)}
              >
                Cancel Booking ?
              </Button>
            </>
          )}
        </div>
      </>
    );
  };

  const BookingDetails = () => {
    return (
      <>
        <div className="flex-[1.8] bg-white rounded-lg shadow-sm p-6 md:max-w-3xl overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold ">Booking Details</h2>
            <button>
              <Pencil
                className="h-4 w-4"
                onClick={() => {
                  setEditWhileBooking(true);
                }}
              />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-500">Pickup Location</p>
                <p className="font-medium">
                  {decodedObject?.pickupLocation?.label}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {formatFullDateTime(decodedObject?.scheduleDate!)}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              {decodedObject?.pricing_mode === "distance" ? (
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400 mt-1" />
              )}
              <div>
                <p className="text-sm text-gray-500">
                  {decodedObject?.pricing_mode === "distance"
                    ? "Drop-off Location"
                    : "Duration"}
                </p>
                <p className="font-medium">
                  {decodedObject?.pricing_mode === "distance"
                    ? decodedObject?.destination.label
                    : `${decodedObject?.duration} hrs`}
                </p>
                {/* {decodedObject?.pricing_mode === "distance" && (
                    <p className="text-sm text-gray-500 mt-2">
                      Est. arrival:{" "}
                      {formatDate(
                        new Date(
                          new Date(
                            `${decodedObject?.date!} ${decodedObject?.time!}`
                          ).getTime() +
                            (Number(decodedObject?.duration ?? 0) ||
                              Number(
                                estimatedFareResult?.durationHourly ?? 0
                              )) *
                              3600_000
                        ).toISOString()
                      )}{" "}
                      (
                      {decodedObject?.duration ??
                        estimatedFareResult?.durationHourly ??
                        0}{" "}
                      h ride)
                    </p>
                  )} */}
              </div>
            </div>
          </div>
        </div>

        <Dialog
          open={editWhileBooking}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setEditWhileBooking(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditWhileBooking(true);
              }}
            ></Button>
          </DialogTrigger>
          <DialogContent className="w-full bg-transparent border-none shadow-none">
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <BookingForm
              label="Update Now"
              editData={
                {
                  ...decodedObject,
                  originCoordinates: {
                    type: "Point",
                    coordinates: [
                      decodedObject?.pickupCoordinates?.lat,
                      decodedObject?.pickupCoordinates?.lng,
                    ],
                  },
                  ...(decodedObject?.destinationCoordinates && {
                    destCoordinates: {
                      type: "Point",
                      coordinates: [
                        decodedObject.destinationCoordinates.lat,
                        decodedObject.destinationCoordinates.lng,
                      ],
                    },
                  }),
                  durationHourly: 2,
                } as any
              }
              setEditData={
                setDecodedObject as unknown as React.Dispatch<
                  React.SetStateAction<IBookingEditResponse>
                >
              }
            />
          </DialogContent>
        </Dialog>
      </>
    );
  };

  const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
    return (
      <div
        className={`bg-white max-w-3xl mx-auto rounded-lg shadow p-4 cursor-pointer transition-all ${
          bookingState.vehicle?._id === vehicle._id ? "ring-2 ring-second" : ""
        }`}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative h-48 md:h-full rounded-lg overflow-hidden">
            <Image
              src={vehicle?.photo || "images/logo.png"}
              alt={vehicle.name}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="md:col-span-2">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                <p className="text-sm text-gray-500">{vehicle.fuelType}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${vehicle.hourlyPriceMultiplier}/hr
                </p>
                <p className="text-sm text-gray-500">All inclusive</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center">
                <Users className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm">
                  Up to {vehicle.maxOccupancy} passengers
                </span>
              </div>
              <div className="flex items-center">
                <CassetteTape className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm">
                  {capitalizeFirstLetter(vehicle.category)}
                </span>
              </div>
              <div className="flex items-center">
                <Fuel className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm">
                  {capitalizeFirstLetter(vehicle.fuelType)}
                </span>
              </div>
              <div className="flex items-center">
                <ShoppingBag className="h-5 w-5 text-gray-400 mr-2" />
                <span className="text-sm">
                  Up to {vehicle.maxSuitcaseCapacity} Suitcase
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                if (searchParams.get("type") === "edit") {
                  return handleVehicleSelectAlready(vehicle, decodedObject!);
                }
                handleVehicleSelect(vehicle);
              }}
              className={`w-full px-6 py-2 rounded-md border-2 border-main ${
                bookingState.vehicle?._id === vehicle._id
                  ? "bg-black text-white"
                  : ""
              }`}
            >
              {bookingState.vehicle?._id === vehicle._id
                ? "Selected "
                : "Select "}
              Vehicle
            </button>
          </div>
        </div>
      </div>
    );
  };

  const SelectedVehicle = () => {
    if (!selectedVehicle) return;
    return (
      <div className="flex-1 md:px-5">
        <div
          className={`w-full items-center justify-between text-white rounded-xl overflow-hidden shadow-md transition-all cursor-pointer`}
          onClick={() => setVehicleModalOpen(true)}
        >
          {/* Vehicle Image */}
          <div className="relative h-[145px] w-full overflow-hidden">
            <Image
              src={selectedVehicle?.photo || "/images/logo.png"}
              alt={selectedVehicle.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex flex-wrap justify-between px-4 py-2 text-main">
            <h3 className="xl:text-lg text-sm font-semibold">
              {selectedVehicle.name}
            </h3>
            <div className="flex justify-center items-center px-3 bg-main text-white md:py-1 rounded-xl xl:text-sm text-xs font-semibold">
              Selected
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderAllContent = () => {
    return (
      <>
        <h2 className="text-2xl font-bold mb-2">Booking Details</h2>
        <div className="flex md:flex-row flex-col md:space-x-10 md:space-y-0 space-y-5 md:py-0 py-10">
          <BookingForm
            editData={decodedObject as any}
            handleChange={() => {
              handleVehicleSelect(selectedVehicle!);
            }}
            setEditData={
              setDecodedObject as unknown as React.Dispatch<
                React.SetStateAction<IBookingEditResponse>
              >
            }
          />
        </div>
        <div>
          <Heading
            title="Your Details"
            Icon={<Lock className="h-4" />}
            subTitle="Secure, encrypted booking"
          />

          <div className="flex lg:flex-row flex-col lg:space-y-0 space-y-6">
            <div className="flex flex-1 flex-col col-span-2">
              <div className="w-full rounded-2xl text-main space-y-5 p-4">
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="border bg-white rounded-lg hover:bg-none"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold">Vehicle Details</h2>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform duration-200 ${
                        isOpen ? "transform rotate-180" : ""
                      }`}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="p-4 pt-0 mx-auto">
                    <div
                      className="space-y-6 mb-8 max-w-3xl py-1 mx-auto p-2 md:pr-10 pr-4"
                      style={{
                        maxHeight: "calc(3 * 16rem + 2.5rem)",
                        overflowY: "auto",
                      }}
                    >
                      {vehiclesList?.map((vehicle, idx) => (
                        <VehicleCard vehicle={vehicle} key={idx} />
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>

              <PassengerDetailsForm
                onSubmit={handlePassengerDetails}
                initialData={bookingState.passengerDetails}
                formType="edit"
              />
              <PaymentForm
                extraAmount={
                  Number(
                    estimatedFareResult!?.estimatedFare!?.toFixed(2) || 0
                  ) - Number(prePaidAmount || 0)
                }
                amount={estimatedFareResult?.estimatedFare || 0}
                bookingDetails={bookingState}
                decodedObject={decodedObject}
                selectedVehicleId={selectedVehicle?._id!}
                formType="edit"
              />
            </div>
            <div className="lg:w-96 w-full lg:px-0 px-4">
              <BookingSummary />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <div className="flex md:flex-row flex-col md:space-x-10 md:space-y-0 space-y-5 md:py-0 py-10">
              <BookingDetails />
              <SelectedVehicle />
            </div>

            <div className="space-y-4">
              <Heading
                title="Choose Your Vehicle"
                Icon={<Clock className="md:w-5 md:h-5 w-3 h-3" />}
                subTitle={"24h Free Cancellation & Commercially Insured"}
              />

              <div className="flex xl:flex-row flex-col xl:space-x-10">
                <div
                  className="space-y-6 mb-8 max-w-3xl py-1 p-2 md:pr-10 pr-4 mx-auto"
                  // style={{
                  //   maxHeight: "calc(3 * 16rem + 2.5rem)",
                  //   overflowY: "auto",
                  // }}
                >
                  {(vehiclesList ?? []).length > 0 ? (
                    vehiclesList?.map((vehicle, idx) => (
                      <VehicleCard vehicle={vehicle} key={idx} />
                    ))
                  ) : (
                    <div className="font-extralight overflow-hidden lg:text-3xl text-xl text-center">
                      No Vehicles Available At The Moment
                    </div>
                  )}
                </div>
                <BookingSummary />
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="flex md:flex-row flex-col md:space-x-10 md:space-y-0 space-y-5 md:py-0 py-10">
              <BookingDetails />
              <SelectedVehicle />
            </div>
            <div>
              <Heading
                title="Fill Your Details"
                Icon={<Lock className="h-4" />}
                subTitle="Secure, encrypted booking"
              />

              <div className="flex md:flex-row flex-col md:space-y-0 space-y-5 space-x-1">
                <PassengerDetailsForm
                  onSubmit={handlePassengerDetails}
                  initialData={bookingState.passengerDetails}
                />
                <BookingSummary />
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="flex md:flex-row flex-col md:space-y-0 space-y-5 md:space-x-10 md:py-0 py-10">
              <BookingDetails />
              <SelectedVehicle />
            </div>
            <div>
              <Heading
                title="Fill Payment Details"
                Icon={<Lock className="h-4" />}
                subTitle="Pay safe with Paypal"
              />

              <div className="flex md:flex-row flex-col md:space-y-0 space-y-5 space-x-1">
                <PaymentForm
                  amount={estimatedFareResult?.estimatedFare || 0}
                  bookingDetails={bookingState}
                  decodedObject={decodedObject}
                  selectedVehicleId={selectedVehicle?._id!}
                />
                <BookingSummary />
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    async function processParams() {
      try {
        const params = await asyncParams;
        const { id } = params;

        const decodedString = decodeURIComponent(id);
        let decodedObj = JSON.parse(atob(decodedString));

        if (!decodedObj || typeof decodedObj !== "object") {
          throw new Error("Invalid object");
        }

        if (searchParams.get("type") === "edit") {
          const passengerDetailsData = {
            email: decodedObj?.clientDetail?.email,
            firstName: decodedObj?.clientDetail?.fullName?.split(" ")[0],
            lastName: decodedObj?.clientDetail?.fullName?.split(" ")[1],
            phone: decodedObj?.clientDetail?.phoneNumber,
          };
          setBookingState((prev) => ({
            ...prev,
            passengerDetails: passengerDetailsData,
            vehicle: decodedObj?.vehicleType,
          }));
        }
        if (isEditPage) {
          decodedObj = {
            ...decodedObj,
            destinationCoordinates: {
              lat: decodedObj?.destCoordinates?.coordinates[0],
              lng: decodedObj?.destCoordinates?.coordinates[1],
            },
            pickupCoordinates: {
              lat: decodedObj?.originCoordinates?.coordinates[0],
              lng: decodedObj?.originCoordinates?.coordinates[1],
            },
            destination: {
              label: decodedObj?.destAddress,
            },
            pickupLocation: {
              label: decodedObj?.originAddress,
            },
            date: decodedObj?.scheduleDate,
          };
          setSelectedVehicle(decodedObj?.vehicleType);
          setPrePaidAmount(decodedObj?.estimatedFare);
        }
        // @ts-expect-error:will fix later for edit decode scenario
        setEstimatedFareResult((prev) => ({
          ...prev,
          estimatedFare: decodedObj.estimatedFare,
        }));

        setDecodedObject(decodedObj);
        const vehicle = localStorage.getItem("vehicle");
        if (vehicle) {
          handleVehicleSelectAlready(JSON.parse(vehicle), decodedObj);
          setCurrentStep(1);
          localStorage.removeItem("vehicle");
        }
      } catch (error) {
        console.error("Decoding failed:", error);
        redirect("/");
      }
    }

    processParams();
  }, [asyncParams]);

  useEffect(() => {
    const backElement = document.getElementById("main");
    if (backElement) {
      backElement.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentStep]);

  if (!decodedObject) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* <FeatureBanner /> */}
      <div id="main" className="min-h-screen bg-gray-50 pb-10">
        <Navbar withEffect={false} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8  pt-16 text-black">
          {!isEditPage && (
            <StepIndicator currentStep={currentStep} steps={STEPS} />
          )}
          <div className="gap-8 space-y-5">
            {!isEditPage && (
              <div className="flex justify-between mt-4 px-1">
                {currentStep >= 0 && (
                  <div
                    id="back"
                    onClick={() => {
                      if (currentStep === 0) {
                        window.location.replace("/");
                      } else {
                        handleBack();
                      }
                    }}
                    className="flex space-x-2 cursor-pointer"
                  >
                    <ArrowLeftCircle />
                    <span>Back</span>
                  </div>
                )}
              </div>
            )}
            <div className="lg:col-span-2">
              {isEditPage ? renderAllContent() : renderStep()}
            </div>
          </div>
        </main>
      </div>
      <div className="w-full text-white overflow-hidden bg-main">
        <div className="flex items-center justify-center gap-6 border-b border-gray-200 p-4 text-sm py-5">
          {[
            { Icon: Lock, text: "Secure Payments" },
            { Icon: Clock, text: "24/7 Support" },
            { Icon: Shield, text: "Commercially Insured" },
            { Icon: Shield, text: "Trusted Service" },
          ].map(({ Icon, text }, index) => (
            <div
              key={index}
              className="flex items-center gap-2 sm:flex-row flex-col sm:gap-3 lg:gap-4 text-center sm:text-left"
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-[10px] lg:text-base">{text}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog
        open={vehicleModalOpen}
        onOpenChange={(isOpen) => setVehicleModalOpen(isOpen)}
      >
        <DialogContent className="lg:max-w-[700px] sm:max-w-[500px] max-w-[350px] p-6 h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {bookingState.vehicle?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-scroll">
            <div className="sm:col-span-2 flex justify-center">
              <Image
                src={bookingState.vehicle?.photo || "/images/logo.png"}
                alt={`${bookingState.vehicle?.name} photo`}
                width={400}
                height={400}
                className="w-full h-48 max-w-xs object-cover rounded-lg"
              />
            </div>

            <p>
              <strong>Category:</strong> {bookingState.vehicle?.fuelType}
            </p>
            <p className="sm:col-span-2">
              <strong>Description:</strong> {bookingState.vehicle?.description}
            </p>
            <p>
              <strong>Price:</strong> $
              {bookingState.vehicle?.hourlyPriceMultiplier}
            </p>
            <p>
              <strong>Passengers:</strong> {bookingState.vehicle?.maxOccupancy}
            </p>
            <p className="sm:col-span-2">
              <strong>Features:</strong>{" "}
              {bookingState.vehicle?.features.join(", ")}
            </p>
          </div>
          <div className="flex justify-end mt-2 px-4">
            <Button
              variant="secondary"
              onClick={() => setVehicleModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {openCancelBookingModal && (
        <CancelBooking
          open={openCancelBookingModal}
          setOpen={setOpenCancelBookingModal}
          bookingId={decodedObject?._id as string}
        />
      )}
    </>
  );
}
