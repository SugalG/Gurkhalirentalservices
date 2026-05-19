import axiosInstance from "@/app/lib/axiosConfig";

export const getSubscribedEmails = async (sessionToken: string) => {
  const response = await axiosInstance.get(
    "api/llc-marketing/email-subscription",

    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );

  return response.data;
};
