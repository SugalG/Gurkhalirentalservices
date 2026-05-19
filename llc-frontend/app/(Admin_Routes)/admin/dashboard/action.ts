import axiosInstance from "@/app/lib/axiosConfig";

export const getDashboardDataClient = async (sessionToken: string) => {
  const response = await axiosInstance.get(
    "api/llc-marketing/client-overview",

    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return response.data;
};
export const getDashboardDataVehicle = async (sessionToken: string) => {
  const response = await axiosInstance.get(
    "api/llc-vehicles/overview",

    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return response.data;
};
export const getDashboardDataBooking = async (sessionToken: string) => {
  const response = await axiosInstance.get(
    "api/llc-bookings/overview",

    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return response.data;
};
