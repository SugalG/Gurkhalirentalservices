import axios from "axios";
import { config } from "@/config";
import { AppError } from "@/middlewares";

export const getDistanceFromGoogleMaps = async (
  pickupCoordinates: [number, number], // [lat, long]
  destinationCoordinates: [number, number] // [lat, long]
): Promise<{
  // destAddress: string;
  // originAddress: string;
  distanceMi: number;
  durationHrs: number;
}> => {
  const baseUrl =
    "https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix";

  try {
    const { data } = await axios.post<
      {
        originIndex: number;
        destinationIndex: number;
        status: any;
        distanceMeters?: number;
        duration?: string;
        condition: "ROUTE_EXISTS" | "ROUTE_NOT_FOUND";
      }[]
    >(
      baseUrl,
      {
        origins: [
          {
            waypoint: {
              location: {
                latLng: {
                  latitude: pickupCoordinates[0],
                  longitude: pickupCoordinates[1],
                },
              },
            },
          },
        ],
        destinations: [
          {
            waypoint: {
              location: {
                latLng: {
                  latitude: destinationCoordinates[0],
                  longitude: destinationCoordinates[1],
                },
              },
            },
          },
        ],
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_UNAWARE",
      },
      {
        headers: {
          "X-Goog-Api-Key": config.googleMapsApiKey,
          "X-Goog-FieldMask":
            "originIndex,destinationIndex,duration,distanceMeters,status,condition",
        },
      }
    );

    if (!Array.isArray(data))
      throw new AppError(`Invalid response format from Google Maps API`, 400);

    if (data.every((route) => route.condition !== "ROUTE_EXISTS"))
      throw new AppError(`No valid route found`, 400);

    const processedRoutes = data.map((route) => {
      const durationSeconds = route.duration
        ? parseInt(route.duration.replace("s", ""), 10)
        : 0;
      if (isNaN(durationSeconds)) {
        throw new AppError(`Invalid duration format: ${route.duration}`, 400);
      }
      const durationHrs = durationSeconds
        ? Number((durationSeconds / 3600).toFixed(3))
        : 0;
      const distanceMi = route.distanceMeters
        ? Number((((route.distanceMeters ?? 0) / 1000) * 0.62).toFixed(3))
        : 0;

      return {
        ...route,
        distanceMi,
        durationHrs,
      };
    });

    const validRoutes = processedRoutes.filter(
      (route) => route.condition === "ROUTE_EXISTS"
    );
    if (validRoutes.length === 0)
      throw new AppError(`No valid route found`, 400);
    const route = validRoutes.sort((a, b) => a.durationHrs - b.durationHrs)[0];

    return {
      // destAddress: route.destinationAddress,
      // originAddress: route.originAddress,
      distanceMi: route.distanceMi,
      durationHrs: route.durationHrs,
    };
  } catch (error) {
    console.error("Error fetching distance:", error);
    throw error;
  }
};
