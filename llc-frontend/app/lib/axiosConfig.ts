import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add an interceptor for errors
axiosInstance.interceptors.response.use(
  (response) => response, // For successful responses, just return the data
  (error: any) => {
    toast.error(error.response?.data?.message ?? error.message ?? error.cause);
    throw error;
    // return {
    //   success: false,
    //   message: error.response?.data?.message || "Something went wrong.",
    //   status: error.response?.status || 500,
    //   data: error.response?.data || null,
    // };
  }
);

// Export the Axios instance so it can be used in other files
export default axiosInstance;
