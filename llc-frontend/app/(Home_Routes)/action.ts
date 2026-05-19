import { Axios, AxiosError } from "axios";
import axiosInstance from "../lib/axiosConfig";
import { BookingInfo } from "../types";
import { extractLocationData } from "../lib/utils";

export const createBookingOrder = async (orderDetail: BookingInfo) => {
  const response = await axiosInstance.post(
    `/api/llc-bookings/create-order`,
    orderDetail,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const completeOrder = async (id: string) => {
  const response = await axiosInstance.patch(
    `/api/llc-bookings/${id}/complete-order`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const completeOrderWithExtraPay = async (id: string, txId: string) => {
  const response = await axiosInstance.patch(
    `/api/llc-bookings/${id}/transaction/${txId}/complete-update-order`
  );
  return response.data;
};

export const getEstimatedFare = async (params: {
  vehicleType: string;
  pricingMode: string;
  durationHourly?: number;
  destCoordinates?: [number, number]; // lat, long
  originCoordinates: [number, number];
}) => {
  const response = await axiosInstance.post(
    "/api/llc-bookings/pricing/estimated-fare",
    {
      ...params,
    },
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const updateBooking = async (id: string, orderDetail: BookingInfo) => {
  const response = await axiosInstance.patch(
    `/api/llc-bookings/${id}`,
    orderDetail,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

export const cancelBooking = async (id: string) => {
  try {
    const response = await axiosInstance.patch(
      `/api/llc-bookings/${id}/cancel`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: AxiosError | any) {
    throw new Error(error);
  }
};

export const getMapDataFromCoordinates = async (lat: number, lng: number) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();

    return extractLocationData(data);
  } catch (error: any) {
    console.error("Error fetching location:", error);
    throw new Error(error);
  }
};
