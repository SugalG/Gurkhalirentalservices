import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import * as Tabs from "@radix-ui/react-tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import GooglePlacesAutocomplete, {
  geocodeByAddress,
  getLatLng,
} from "react-google-places-autocomplete";
import { redirect, useSearchParams } from "next/navigation";
import { getMapDataFromCoordinates } from "@/app/(Home_Routes)/action";
import { extractDateTime } from "@/app/lib/utils";
import { IBookingEditResponse } from "@/app/types/bookingData";
import "react-time-picker/dist/TimePicker.css";
import TimePicker from "../TimePicker";
import { CustomDatePicker } from "../DatePicker";

const bookingSchema = z.object({
  pickupLocation: z.object({ label: z.string(), value: z.any() }).optional(),
  destination: z.object({ label: z.string(), value: z.any() }).optional(),
  duration: z.string().optional(),
  date: z.string(),
  // .refine((value) => {
  //   const selectedDate = new Date(value);
  //   const today = new Date();

  //   today.setHours(0, 0, 0, 0);
  //   selectedDate.setHours(0, 0, 0, 0);

  //   const isValid = selectedDate.getTime() >= today.getTime();
  //   if (!isValid) toast.error("Cannot select past dates");
  //   return isValid;
  // }),

  // time: z.string().min(1, "Time is required"),
  time: z.string(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingForm({
  editData,
  setEditData,
  handleChange,
  label,
}: {
  editData?: IBookingEditResponse;
  setEditData?: React.Dispatch<React.SetStateAction<IBookingEditResponse>>;
  handleChange?: () => void;
  label?: string;
}) {
  const searchParams = useSearchParams();
  const isEditPage = searchParams.get("type") === "edit";

  const [activeTab, setActiveTab] = useState<"distance" | "hourly">("distance");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [pickupCoordinates, setPickupCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [destinationCoordinates, setDestinationCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showPickupError, setShowPickupError] = useState(false);
  const [showDestinationError, setShowDestinationError] = useState(false);
  const [showDurationError, setShowDurationError] = useState(false);
  const [time, setTime] = useState("");
  const [previousTime, setPreviousTime] = useState("");
  const [busy, setBusy] = useState<boolean>(false);

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: "",
      date: "",
      time: "",
    },
  });

  const handleLocationSelect = async (
    location: any,
    type: "pickup" | "destination"
  ) => {
    try {
      const results = await geocodeByAddress(location.label);
      const latLng = await getLatLng(results[0]);

      if (type === "pickup") {
        setPickupCoordinates(latLng);
        setShowPickupError(false);
      } else {
        setDestinationCoordinates(latLng);
        setShowDestinationError(false);
      }
    } catch (error) {
      console.error("Error getting coordinates:", error);
    }
  };

  const onSubmit = async (data: BookingFormData) => {
    const date = new Date(selectedDate);
    const [hour, minute] = time.split(":");

    date.setUTCHours(parseInt(hour, 10));
    date.setUTCMinutes(parseInt(minute, 10));

    const isoString = date.toISOString();

    let isValid = true;

    if (!pickupCoordinates) {
      setShowPickupError(true);
      isValid = false;
    }

    if (activeTab === "distance" && !destinationCoordinates) {
      setShowDestinationError(true);
      isValid = false;
    }

    if (activeTab === "hourly" && !data.duration) {
      setShowDurationError(true);
      isValid = false;
    }

    if (!selectedDate || !time) {
      isValid = false;
    }

    if (!isValid) return;

    setBusy(true);
    const finalObj = {
      pricing_mode: activeTab,
      ...data,
      date: selectedDate.toString(),
      scheduleDate: isoString,
      pickupCoordinates,
      destinationCoordinates,
    };

    if (searchParams.get("type") !== "edit") {
      const jsonString = JSON.stringify(finalObj);
      const base64String = btoa(jsonString);
      redirect(`/book-now/${encodeURIComponent(base64String)}`);
    } else {
      setEditData &&
        setEditData((prevData) => ({
          ...prevData,
          scheduleDate: finalObj.scheduleDate,
          date: finalObj.scheduleDate,
          destAddress: finalObj.destination?.label ?? "",
          destCoordinates: finalObj.destinationCoordinates ?? (null as any),
          originAddress: finalObj.pickupLocation?.label ?? "",
          pickupCoordinates: finalObj.pickupCoordinates ?? null,
          pickupLocation: {
            label: finalObj.pickupLocation?.label ?? "",
          },
          destination: {
            label: finalObj.destination?.label ?? "",
          },
        }));
      setBusy(false);
      handleChange && handleChange();
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const selectedTime = watch("time");
  const isToday = selectedDate?.toISOString().split("T")[0] === today;

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  };

  useEffect(() => {
    if (isToday) {
      const currentTime = getCurrentTime();
      setValue("time", currentTime);
    } else {
      setValue("time", selectedTime);
    }
  }, [selectedDate, setValue]);

  useEffect(() => {
    async function getData() {
      if (
        editData?.originCoordinates?.coordinates &&
        Array.isArray(editData?.originCoordinates?.coordinates) &&
        editData?.originCoordinates?.coordinates.length === 2 &&
        editData?.originCoordinates?.coordinates.every(
          (coord: number) => coord !== 0
        )
      ) {
        const pickupLocationData = await getMapDataFromCoordinates(
          editData?.originCoordinates?.coordinates[0],
          editData?.originCoordinates?.coordinates[1]
        );
        setValue("pickupLocation", pickupLocationData);
        setShowPickupError(false);
        const pickupCoordinates = {
          lat: editData?.originCoordinates?.coordinates[0],
          lng: editData?.originCoordinates?.coordinates[1],
        };
        setPickupCoordinates(pickupCoordinates);
      }
      if (
        editData?.destCoordinates?.coordinates &&
        Array.isArray(editData?.destCoordinates?.coordinates) &&
        editData?.destCoordinates?.coordinates.length === 2 &&
        editData?.destCoordinates?.coordinates.every(
          (coord: number) => coord !== 0
        )
      ) {
        const pickupLocationData = await getMapDataFromCoordinates(
          editData?.destCoordinates?.coordinates[0],
          editData?.destCoordinates?.coordinates[1]
        );
        setValue("destination", pickupLocationData);
        setShowDestinationError(false);
        const destinationCoordinates = {
          lat: editData?.destCoordinates?.coordinates[0],
          lng: editData?.destCoordinates?.coordinates[1],
        };
        setDestinationCoordinates(destinationCoordinates);
      }
    }
    if (editData) {
      getData();
      const { date, time } = extractDateTime(editData?.scheduleDate);
      setValue("date", date);
      setValue("time", time);
      setPreviousTime(time);
      setSelectedDate(new Date(date));
    }
  }, []);

  return (
    <div
      className={`bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full ${
        isEditPage ? "" : "max-w-md sm:max-w-lg mx-auto"
      }`}
    >
      {/* <div className="space-y-2 px-4 py-3 text-sm text-gray-600">
        <p className="flex items-center gap-2 text-[16px] text-black font-medium">
          <Shield className=" text-[black] text-[16px]" />
          Commercially insured
        </p>
        <p className="flex items-center gap-2 text-[16px] text-black font-medium">
          <Clock className="text-[16px] text-[black]" />
          Free cancellation within 24 hours
        </p>
      </div> */}
      <Tabs.Root
        defaultValue="distance"
        onValueChange={(value) => {
          setActiveTab(value as "distance" | "hourly");
          setShowPickupError(false);
          setShowDestinationError(false);
          setShowDurationError(false);
        }}
      >
        <Tabs.List className="flex mb-6 border-b">
          <Tabs.Trigger
            value="distance"
            className={`flex-1 pb-4 text-center lg:text-base text-xs sm:text-base font-medium border-b-2 transition-colors ${
              activeTab === "distance"
                ? "border-black text-black"
                : "border-transparent text-gray-500"
            }`}
          >
            Distance
          </Tabs.Trigger>
          <Tabs.Trigger
            value="hourly"
            className={`flex-1 pb-4 text-center lg:text-base text-xs sm:text-base font-medium border-b-2 transition-colors ${
              activeTab === "hourly"
                ? "border-black text-black"
                : "border-transparent text-gray-500"
            }`}
          >
            By the hour
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label
            className={`block lg:text-base text-xs mb-2 ${
              errors.pickupLocation || showPickupError
                ? "text-red-500"
                : "text-gray-600"
            }`}
          >
            Pickup Location *
          </label>
          <Controller
            name="pickupLocation"
            control={control}
            render={({ field }) => (
              <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                selectProps={{
                  value: field.value
                    ? { ...field.value, value: field.value.label }
                    : undefined,
                  onChange: (location) => {
                    field.onChange(location);
                    handleLocationSelect(location, "pickup");
                  },
                  placeholder: "Enter pickup location",
                  className:
                    "places-autocomplete text-main bg-white md:text-sm text-xs",
                  classNames: {
                    control: (state) =>
                      `!pl-2 !pr-4 md:py-1 text-main !border !rounded-lg !shadow-none ${
                        errors.pickupLocation || showPickupError
                          ? "!border-red-500"
                          : state.isFocused
                          ? "!border-black"
                          : "!border-gray-200"
                      }`,
                    input: () => "!text-sm",
                    option: () => "!text-sm",
                  },
                }}
                autocompletionRequest={{
                  componentRestrictions: { country: "us" },
                }}
              />
            )}
          />
        </div>

        {activeTab === "distance" && (
          <div>
            <label
              className={`block lg:text-base text-xs mb-2 ${
                showDestinationError ? "text-red-500" : "text-gray-600"
              }`}
            >
              Destination *
            </label>
            <Controller
              name="destination"
              control={control}
              render={({ field }) => (
                <GooglePlacesAutocomplete
                  apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                  selectProps={{
                    value: field.value
                      ? { ...field.value, value: field.value.label }
                      : undefined,
                    onChange: (location) => {
                      field.onChange(location);
                      handleLocationSelect(location, "destination");
                    },
                    placeholder: "Enter destination",
                    className:
                      "places-autocomplete text-main bg-white md:text-sm text-xs",
                    classNames: {
                      control: (state) =>
                        `!pl-2 !pr-4 md:!py-1 !border text-main !rounded-lg !shadow-none ${
                          showDestinationError
                            ? "!border-red-500"
                            : state.isFocused
                            ? "!border-black"
                            : "!border-gray-200"
                        }`,
                      input: () => "!text-sm",
                      option: () => "!text-sm",
                    },
                  }}
                  autocompletionRequest={{
                    componentRestrictions: { country: "us" },
                  }}
                />
              )}
            />
          </div>
        )}

        {activeTab === "hourly" && (
          <div>
            <label
              className={`block lg:text-base text-xs mb-2 ${
                showDurationError ? "text-red-500" : "text-gray-600"
              }`}
            >
              Duration *
            </label>
            <input
              type="number"
              min="1"
              onKeyDown={(e) => {
                const inputValue = e.currentTarget.value;
                if (!inputValue && e.key === "0") {
                  e.preventDefault();
                }
                if (e.key === "-") {
                  e.preventDefault();
                }
              }}
              placeholder="Enter duration (e.g., 2 hourlys)"
              className={`w-full px-4 lg:py-3 py-2 border rounded-lg focus:outline-none bg-white text-main text-sm ${
                showDurationError
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-black"
              }`}
              {...register("duration")}
            />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              className={`block lg:text-base text-xs text-gray-600 mb-2 ${
                errors.date ? "text-red-500" : ""
              }`}
            >
              Date
            </label>
            {/* <input
              type="date"
              className={`w-full px-4 lg:py-3 py-2 border rounded-lg bg-white text-main text-sm ${
                errors.date
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-200 focus:border-black"
              }`}
              {...register("date")}
            /> */}

            <CustomDatePicker date={selectedDate} setDate={setSelectedDate} />
          </div>
          <div>
            <label
              className={`block lg:text-base text-xs text-gray-600 mb-2 ${
                errors.time ? "text-red-500" : ""
              }`}
            >
              Time
            </label>

            <TimePicker
              onChange={setTime}
              date={selectedDate.toString()}
              time={previousTime}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white lg:py-3 py-2 text-sm rounded-lg font-medium hover:bg-gray-800 transition-colors mt-4"
        >
          {busy
            ? "Loading..."
            : label || (isEditPage ? "Update Booking" : "Book Now")}
        </button>
      </form>
    </div>
  );
}
