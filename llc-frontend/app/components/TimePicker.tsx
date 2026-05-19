"use client";

import { useState, useEffect } from "react";
import { Listbox } from "@headlessui/react";

const hours12 = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
); // Hours 1–12
const minutes = ["00", "15", "30", "45"];
const periods = ["AM", "PM"];

type TimePickerProps = {
  onChange: (time: string) => void;
  date: string; // Date string format: Tue Feb 11 2025 11:19:31 GMT+0545 (Nepal Time)
  time?: string;
};

export default function TimePicker({ onChange, date, time }: TimePickerProps) {
  const now = new Date();
  const currentHour24 = now.getHours();
  const currentMinute = String(now.getMinutes()).padStart(2, "0");
  const currentPeriod = currentHour24 >= 12 ? "PM" : "AM";

  // Convert 24-hour format to 12-hour format (e.g., 16 -> 4 PM)
  const convertTo12Hour = (hour: number) => {
    if (hour === 0) return 12; // Midnight (00:00 -> 12:00 AM)
    if (hour > 12) return hour - 12; // PM times
    return hour; // AM times
  };

  const convertTo24Hour = (hour: string, period: string) => {
    let hour24 = parseInt(hour, 10);
    if (period === "PM" && hour24 !== 12) hour24 += 12;
    if (period === "AM" && hour24 === 12) hour24 = 0;
    return String(hour24).padStart(2, "0");
  };

  const [selectedHour, setSelectedHour] = useState(
    convertTo12Hour(currentHour24)
  );
  const [selectedMinute, setSelectedMinute] = useState(currentMinute);
  const [selectedPeriod, setSelectedPeriod] = useState(currentPeriod);
  const [isSelectedHour, setIsSelectedHour] = useState(false);
  const [isSelectedMinute, setIsSelectedMinute] = useState(false);
  const [isSelectedPeriod, setIsSelectedPeriod] = useState(false);

  // Check if the date is today
  const isToday = new Date(date).toDateString() === now.toDateString();

  useEffect(() => {
    if (time) {
      const [hour, minute] = time.split(":");
      const period = parseInt(hour, 10) >= 12 ? "PM" : "AM";
      setSelectedHour(parseInt(hour) % 12 || 12); // Convert 24-hour hour to 12-hour format
      setSelectedMinute(minute);
      setSelectedPeriod(period);
    }
  }, [time]); // This will update the state whenever `time` prop changes

  useEffect(() => {
    const hour24 = convertTo24Hour(String(selectedHour), selectedPeriod);
    const selectedTime = `${hour24}:${selectedMinute}`;

    if (isToday) {
      const selectedDateTime = new Date();
      selectedDateTime.setHours(
        parseInt(hour24, 10),
        parseInt(selectedMinute, 10)
      );

      const currentDateTime = new Date();
      currentDateTime.setHours(currentHour24, parseInt(currentMinute, 10));

      // If the selected time is earlier than the current time, reset the time to current time
      if (selectedDateTime < currentDateTime) {
        setSelectedHour(convertTo12Hour(currentHour24));
        setSelectedMinute(currentMinute);
        setSelectedPeriod(currentPeriod);
        onChange(`${currentHour24}:${currentMinute}`);
        return;
      }
    }

    onChange(`${hour24}:${selectedMinute}`);
  }, [
    selectedHour,
    selectedMinute,
    selectedPeriod,
    onChange,
    currentHour24,
    currentMinute,
    currentPeriod,
    isToday,
  ]);

  return (
    <div
      className={`flex gap-2 p-1 bg-white border-[1px] text-sm z-50 rounded-lg w-full hover:border-black focus-within:border-black ${
        isSelectedHour || isSelectedMinute || isSelectedPeriod
          ? "border-black"
          : "border-gray-300"
      }`}
    >
      {/* Hours */}
      <Listbox
        value={selectedHour}
        onChange={(val) => {
          setSelectedHour(val);
          setIsSelectedHour(true);
        }}
      >
        <div
          className={`relative flex-1 ${
            isSelectedHour ? "border-black" : "border-gray-300"
          }`}
        >
          <Listbox.Button className="w-full py-2 text-gray-800 rounded-md">
            {selectedHour}
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 max-h-40 w-full overflow-auto bg-gray-800 text-white rounded-md shadow-lg">
            {hours12.map((hour) => (
              <Listbox.Option
                key={hour}
                value={hour}
                className="cursor-pointer px-4 py-1 hover:bg-blue-400"
              >
                {hour}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* Minutes */}
      <Listbox
        value={selectedMinute}
        onChange={(val) => {
          setSelectedMinute(val);
          setIsSelectedMinute(true);
        }}
      >
        <div className={`relative flex-1 border-1 custom-border `}>
          <Listbox.Button className="w-full py-2 text-gray-800 rounded-md">
            {selectedMinute}
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 max-h-40 w-full overflow-auto bg-gray-800 text-white rounded-md shadow-lg">
            {minutes.map((minute) => (
              <Listbox.Option
                key={minute}
                value={minute}
                className="cursor-pointer px-4 py-1 hover:bg-blue-400"
              >
                {minute}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>

      {/* AM/PM */}
      <Listbox
        value={selectedPeriod}
        onChange={(val) => {
          setSelectedPeriod(val);
          setIsSelectedPeriod(true);
        }}
      >
        <div
          className={`relative w-14 ${
            isSelectedPeriod ? "border-black" : "border-gray-300"
          }`}
        >
          <Listbox.Button className="w-full py-2 text-gray-800 rounded-md">
            {selectedPeriod}
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 max-h-40 w-full overflow-auto bg-gray-800 text-white rounded-md shadow-lg">
            {periods.map((period) => (
              <Listbox.Option
                key={period}
                value={period}
                className="cursor-pointer px-4 py-1 hover:bg-blue-400"
              >
                {period}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
