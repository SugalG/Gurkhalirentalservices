import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function extractLocationData(googleResponse: any) {
  const result = googleResponse.results[0]; // Usually the most relevant result
  const addressComponents = result.address_components;

  let city = "";
  let state = "";
  let country = "";

  // Loop through address components to find locality, state, and country
  addressComponents.forEach((component: any) => {
    if (component.types.includes("locality")) {
      city = component.long_name;
    } else if (component.types.includes("administrative_area_level_1")) {
      state = component.short_name;
    } else if (component.types.includes("country")) {
      country = component.short_name;
    }
  });

  return {
    label: `${city}, ${state}, ${country}`,
    value: {
      description: `${city}, ${state}, ${country}`,
      place_id: result.place_id,
      reference: result.place_id,
      structured_formatting: {
        main_text: city,
        secondary_text: `${state}, ${country}`,
      },
      terms: [
        { offset: 0, value: city },
        { offset: city.length + 2, value: state },
        { offset: city.length + state.length + 4, value: country },
      ],
      types: result.types,
    },
  };
}

export function extractDateTime(isoString: string) {
  const date = isoString.split("T")[0]; // Extract YYYY-MM-DD
  const time =
    isoString.split("T")[1].split(".")[0] === "00:00:00"
      ? "00:00"
      : isoString.split("T")[1].split(".")[0]; // for handling previous data with no time

  return { date, time };
}
