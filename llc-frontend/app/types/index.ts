export interface Booking {
  _id: string;
  clientDetail: Client;
  clientBillingAddress: Billing;
  vehicleType: Vehicle;
  originAddress: string;
  destAddress: string;
  originCoordinates: { type: string; coordinates: number[] };
  destCoordinates: { type: string; coordinates: number[] };
  scheduleDate: string;
  status: "booked" | "in-progress" | "completed" | "cancelled";
  pricingMode: string;
  estimatedFare: number;
  distanceKm: number;
  durationHourly: number;
  specialRequests: string;
  meetAndGreet: boolean;
  meetName: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  _id: number;
  fullName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface Billing {
  _id: string;
  clientDetail: string;
  fullName: string;
  affiliation: string;
  addressLine_1: string;
  addressLine_2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vehicle {
  _id: string;
  name: string;
  description: string;
  photo: string;
  vehiclePlateNumber: string;
  category: string;
  features: string[];
  maxOccupancy: number;
  maxStorageCapacityLtr: number;
  maxEstimatedDistanceCoverageKm: number;
  distancePriceMultiplier: number;
  hourlyPriceMultiplier: number;
  maxSuitcaseCapacity: number;
  fuelType: string;
  availabilityStatus: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FinalVehicleType {
  name: string;
  description: string;
  photo: string;
  vehiclePlateNumber: string;
  category: string;
  features: string[];
  distancePriceMultiplier: number;
  hourlyPriceMultiplier: number;
  maxOccupancy: number;
  maxStorageCapacityLtr: number;
  maxSuitcaseCapacity: number;
  maxEstimatedDistanceCoverageKm: number;
  fuelType: string;
  availabilityStatus: boolean;
}

export interface Payment {
  _id: string;
  bookingDetail: Booking;
  paymentMethod: string;
  status: string;
  amount: number;
  paymentDate: string;
  transactionId: string;
  paymentMetadata: any;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRefund {
  booking_id: number;
  payment_id: number;
  transaction_id: number;
  amount: number;
  reason: string;
  status: "requested" | "approved" | "processed" | "rejected";
  refund_date: string;
  date_field: string;
}

export interface PassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialInstructions?: string;
  meetAndGreetName?: string;
}

export interface PaymentDetails {
  cardHolder: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  country: string;
}

//Booking Details
type MatchedSubstring = {
  length: number;
  offset: number;
};

type StructuredFormatting = {
  main_text: string;
  main_text_matched_substrings: MatchedSubstring[];
  secondary_text: string;
};

type Term = {
  offset: number;
  value: string;
};

type LocationValue = {
  description: string;
  matched_substrings: MatchedSubstring[];
  place_id: string;
  reference: string;
  structured_formatting: StructuredFormatting;
  terms: Term[];
  types: string[];
};

type Location = {
  label: string;
  value: LocationValue;
};

type Coordinates = {
  lat: number;
  lng: number;
};

export interface RideDetails {
  _id?: string;
  pricing_mode: string;
  pickupLocation: Location;
  destination: Location;
  duration: string;
  date: string;
  scheduleDate: string;
  time: string;
  pickupCoordinates: Coordinates;
  destinationCoordinates: Coordinates;
  distanceKm: number;
  pricingMode: "distance" | "hourly";
}

export interface LoginCredential {
  email: string;
  password: string;
}

export interface PersonalDetails {
  fullName: string;
  email: string;
  phoneNumber: string;
}

export interface BillingAddress {
  fullName: string;
  addressLine_1: string;
  addressLine_2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  affiliation?: string;
}

export interface BookingDetails {
  vehicleType: string;
  originAddress: string;
  destAddress?: string;
  originCoordinates: number[];
  destCoordinates: number[];
  scheduleDate: string;
  pricingMode: "distance" | "hourly";
  durationHourly: number;
  distanceKm: number;
  specialRequests: string;
  meetAndGreet: boolean;
  meetName: string;
}

export interface BookingInfo {
  personalDetails: PersonalDetails;
  billingAddress: BillingAddress;
  bookingDetails: BookingDetails;
}
export interface PaymentDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  paymentMethod: string;
  termsAccepted: boolean;
}
export interface BookingState {
  vehicle: Vehicle | null;
  passengerDetails: PassengerDetails | null;
  paymentDetails: PaymentDetails | null;
}

export interface PaymentFormProps {
  extraAmount?: number;
  estimatedFare?: number;
  amount: number;
  bookingDetails: BookingState | null;
  decodedObject: RideDetails | null;
  selectedVehicleId: string;
  formType?: string;
}

export interface SubscribedEmails {
  _id: string;
  email: string;
  createdAt: string;
}

export interface SupportTicket {
  _id: string;
  fullName: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}
