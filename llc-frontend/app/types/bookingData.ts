interface ICoordinates {
    type: string;
    coordinates: [number, number];
    _id: string;
  }
  
  interface IClientDetail {
    _id: string;
    email: string;
    __v: number;
    createdAt: string;
    fullName: string;
    phoneNumber: string;
    updatedAt: string;
  }
  
  interface IClientBillingAddress {
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
    __v: number;
  }
  
  interface IVehicleType {
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
    fuelType: string;
    availabilityStatus: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }
  
  export interface IBookingEditResponse {
    _id?: string;
    clientDetail?: IClientDetail;
    destAddress?:string,
    clientBillingAddress?: IClientBillingAddress;
    vehicleType: IVehicleType;
    originAddress: string;
    originCoordinates: ICoordinates;
    destCoordinates: ICoordinates;
    scheduleDate: string;
    status?: string;
    pricingMode?: string;
    estimatedFare?: number;
    distanceKm?: number;
    specialRequests?: string;
    meetAndGreet?: boolean;
    meetName?: string;
    createdAt?: string;
    updatedAt?: string;
    pickupLocation?: { label: string }; 
    destination?: { label: string }; 
  }
  