import axiosInstance from "@/app/lib/axiosConfig";

export const getSupportTickets = async (sessionToken: string) => {
  const response = await axiosInstance.get(
    "api/llc-marketing/support",

    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return response.data;
};
