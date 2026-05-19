"use client";

import React, { useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";

interface CustomDatePickerProps {
  date: Date;
  setDate: (date: Date) => void;
}

export function CustomDatePicker({ date, setDate }: CustomDatePickerProps) {
  const datePickerRef = useRef<DatePicker | null>(null);

  const CustomInput = ({
    value,
    onClick,
  }: {
    value?: string;
    onClick?: () => void;
  }) => (
    <input
      type="text"
      value={value || ""}
      onClick={onClick}
      readOnly
      className="w-full px-3 py-2 bg-white rounded-md shadow-sm text-gray-700 focus:outline-none cursor-pointer"
      placeholder="MM/DD/YYYY"
    />
  );

  return (
    <div className="relative w-full border border-gray-300 hover:border-black rounded-lg bg-white">
      <DatePicker
        selected={date}
        onChange={(date) => {
          if (date) {
            setDate(date);
          }
        }}
        dateFormat="MM/dd/yyyy"
        placeholderText="MM/DD/YYYY"
        minDate={new Date()}
        customInput={<CustomInput />}
        ref={datePickerRef}
      />
      <span
        className="absolute top-2.5 right-3 cursor-pointer text-gray-500"
        onClick={() => datePickerRef.current?.setOpen(true)}
      >
        <CalendarIcon className="w-5 h-5" />
      </span>
    </div>
  );
}
