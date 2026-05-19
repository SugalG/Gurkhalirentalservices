import axiosInstance from "@/app/lib/axiosConfig";

export const filterPayments = async (
  sessionToken: string,
  params?: {
    paymentMethod?: "paypal";
    status?: "pending" | "failed" | "completed" | "refunded";
    paymentFrom?: Date;
    paymentTo?: Date;
    id?: string;
    bookingId?: string;
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
  const response = await axiosInstance.get("/api/llc-payments/", {
    params: queryParams,
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data;
};

export const getPaymentById = async (id: string) => {
  const response = await axiosInstance.get(`/api/llc-payments/${id}`);
  return response.data;
};
