import axios from "axios";

export const getDistanceFromGoogleMaps = async (
  pickupCoordinates: { lat: number; lng: number },
  destinationCoordinates: { lat: number; lng: number }
) => {
  const origin = `${pickupCoordinates.lat},${pickupCoordinates.lng}`;
  const destination = `${destinationCoordinates.lat},${destinationCoordinates.lng}`;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destination}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    const distance = response.data.rows[0].elements[0].distance.text;
    const distanceInKm =
      response.data.rows[0].elements[0].distance.value / 1000;
    return distanceInKm;
  } catch (error) {
    console.error("Error fetching distance:", error);
    return 0;
  }
};
