import axiosInstance from "@/app/lib/axiosConfig";

export const signUpUser = async (user: {
  username: string;
  email: string;
  password: string;
}) => {
  const response = await axiosInstance.post("/api/auth/signup", user);
  return response.data;
};

export const signInUser = async (user: { email: string; password: string }) => {
  const response = await axiosInstance.post("/api/auth/signin", user);
  return response.data;
};
