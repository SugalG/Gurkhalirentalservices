export const formatFullDateTime = (dateString: string) => {
  const date = new Date(dateString);
  const formattedDate = date.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  });

  return formattedDate;
};

export const formatISODate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const capitalizeFirstLetter = (str: string) => {
  return str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
};

export function isBase64(str: string) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}

export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};
