import axiosInstance from "@/app/lib/axiosConfig";

export const createNewEmailSubscription = async (email: string) => {
  const response = await axiosInstance.put(
    `/api/llc-marketing/email-subscription`,
    {
      email,
    }
  );
  return response.data;
};

export const getBookingDetails = async (id: string) => {
  const response = await axiosInstance.get(`/api/llc-bookings/${id}`);
  return response.data;
};
