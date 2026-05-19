import axiosInstance from "@/app/lib/axiosConfig";

export const isAuth = async (sessionToken: string) => {
  const response = await axiosInstance.get("/api/auth/is-auth", {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data;
};
