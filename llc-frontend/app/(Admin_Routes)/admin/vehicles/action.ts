import axiosInstance from "@/app/lib/axiosConfig";
import { FinalVehicleType } from "@/app/types";

export const addVehicle = async (
  sessionToken: string,
  vehicle: FinalVehicleType
) => {
  const response = await axiosInstance.post("/api/llc-vehicles/", vehicle, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });

  return response.data;
};

export const uploadMedia = async (
  media: File
): Promise<{ message: string; filePath: string }> => {
  const formData = new FormData();
  formData.append("media", media);

  const response = await axiosInstance.post("/api/llc-media", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const updateVehicle = async (
  sessionToken: string,
  id: string | number,
  vehicleData: FinalVehicleType
) => {
  const response = await axiosInstance.patch(
    `/api/llc-vehicles/${id}`,
    vehicleData,
    {
      headers: { Authorization: `Bearer ${sessionToken}` },
    }
  );
  return response.data;
};

export const filterVehicleTypes = async (params?: {
  category?: "luxury" | "economy";
  fuelType?: "gas" | "electric";
  availabilityStatus?: boolean;
  occupancy?: number;
  suitcaseCapacity?: number;
  estimatedDistanceCoverageKm?: number;
  page?: number;
  limit?: number;
}) => {
  const response = await axiosInstance.get("/api/llc-vehicles/", { params });
  return response.data;
};

export const getVehicleById = async (id: string | number) => {
  const response = await axiosInstance.get(`/api/llc-vehicles/${id}`);
  return response.data;
};

export const deleteVehicleById = async (
  sessionToken: string,
  id: string | number
) => {
  const response = await axiosInstance.delete(`/api/llc-vehicles/${id}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data;
};
