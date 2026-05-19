import axiosInstance from "@/app/lib/axiosConfig";

export const filterBookings = async (
  sessionToken: string,
  params?: {
    pricingMode?: "hourly" | "distance";
    bookingStatus?:
      | "pending"
      | "booked"
      | "in-progress"
      | "completed"
      | "cancelled";
    scheduleFrom?: Date;
    scheduleTo?: Date;
    id?: string;
    email?: string;
    fullName?: string;
    page?: number;
    limit?: number;
  }
) => {
  const queryParams = Object.entries(params || {}).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    },
    {} as Record<string, any>
  );
  const response = await axiosInstance.get("/api/llc-bookings/", {
    params: queryParams,
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data;
};

export const getBookingById = async (id: string) => {
  const response = await axiosInstance.get(`/api/llc-bookings/${id}`);
  return response.data;
};

export const changeBookingStatus = async (
  id: string,
  status: string,
  sessionToken: string
) => {
  const response = await axiosInstance.patch(
    `/api/llc-bookings/${id}/change-status`,
    { status },
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return response.data;
};

export const forceDeleteBooking = async (sessionToken: string, id: string) => {
  const response = await axiosInstance.patch(
    `/api/llc-bookings/${id}/cancel/force`,
    {},
    { headers: { Authorization: `Bearer ${sessionToken}` } }
  );
  return response.data;
};
