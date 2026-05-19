import axiosInstance from "@/app/lib/axiosConfig";

export const createNewSupportTicket = async (params: {
  fullName: string;
  email: string;
  subject: string;
  message: string;
}) => {
  const response = await axiosInstance.put(
    "/api/llc-marketing/support",
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
