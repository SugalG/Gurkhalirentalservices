import {
  Car,
  Clock1,
  DollarSignIcon,
  Headset,
  IdCard,
  Tag,
  User,
} from "lucide-react";

export const features = [
  {
    Icon: User,
    title: "Professional Chauffeurs",
    description: "Experienced, vetted, and professionally trained drivers",
  },
  {
    Icon: Clock1,
    title: "Punctual Service",
    description: "Always on time, every time",
  },
  {
    Icon: Car,
    title: "Luxury Fleet",
    description: "Premium vehicles for every occasion",
  },
  {
    Icon: Tag,
    title: "Transparent Pricing",
    description: "No hidden fees, clear upfront rates",
  },
];

export const steps = [
  {
    number: 1,
    title: "Select Your Ride",
    description: "Choose from our premium fleet of vehicles",
  },
  {
    number: 2,
    title: "Enter Details",
    description: "Provide pickup location and schedule",
  },
  {
    number: 3,
    title: "Confirm Booking",
    description: "Secure your ride with instant confirmation",
  },
];

export const fleet = [
  {
    imageSrc: "/images/fleet1.png",
    title: "Cadillac Escalade ESV",
    subTitle: "Perfect for business travel and airport",
    price: "$89/hour",
    CTA: "#",
  },
  {
    imageSrc: "/images/fleet2.png",
    title: "Tesla Model Y",
    subTitle: "Spacious comfort for groups and families",
    price: "$129/hour",
    CTA: "#",
  },
  {
    imageSrc: "/images/fleet3.png",
    title: "Volvo XC90",
    subTitle: "The ultimate in luxury transportation",
    price: "$249/hour",
    CTA: "#",
  },
];

export const testimonials = [
  {
    name: "Michael Roberts",
    image: "/images/client/client1.png",
    comment:
      "Exceptional service! The chauffeur was professional, punctual, and the vehicle was immaculate. Will definitely use again.",
    rating: 5,
  },
  {
    name: "Sarah Johnson",
    image: "/images/client/client2.png",
    comment:
      "Perfect for business travel. Reliable, comfortable, and always on time. The booking process is seamless.",
    rating: 5,
  },
  {
    name: "David Chen",
    image: "/images/client/client3.png",
    comment:
      "Top-notch luxury service. The attention to detail and customer service is unmatched. Highly recommended!",
    rating: 5,
  },
];

export const faqData = [
  {
    question: "How do I edit my booking?",
    answer:
      "Go to your email, where you will find a booking ID. Copy that, click on “Already Booked?” on our website’s homepage, enter your booking ID, and make the necessary edits.",
  },
  {
    question: "Can I cancel my booking?",
    answer:
      "Yes, you can cancel your booking and receive a full refund if done within 24 hours of making the payment. ",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept PayPal, debit cards, and credit cards for secure and convenient transactions.",
  },
];

export const services = [
  {
    title: "Airport Transfers",
    description:
      "Reliable and punctual airport transfers to ensure you catch your flight on time.",
    image: "/images/service1.png",
    features: [
      "Meet-and-greet service",
      "Luggage assistance",
      "Real-time flight tracking",
    ],
  },
  {
    title: "City-to-City Rides",
    description:
      "Seamless intercity travel with luxury and convenience at the forefront.",
    image: "/images/service2.png",
    features: ["Comfortable seating", "Scenic routes", "Customizable stops"],
  },
  {
    title: "Hourly Services",
    description:
      "Flexible chauffeur services tailored to your schedule and preferences.",
    image: "/images/service3.png",
    features: ["As-directed travel", "Business meetings", "Special events"],
  },
];

export const fleets = [
  {
    name: "Tesla Model X",
    vehicleType: "EV",
    occasion: "Business",
    price: 500,
    specs: { passengers: 5, suitcases: 4, hasWifi: true },
    description: "Luxury electric vehicle with all modern features.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
  {
    name: "Audi A6",
    vehicleType: "Fuel",
    occasion: "First class",
    price: 400,
    specs: { passengers: 4, suitcases: 2, hasWifi: true },
    description: "Comfortable fuel vehicle for first-class travel.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
  {
    name: "BMW 7 Series",
    vehicleType: "Fuel",
    occasion: "Economy",
    price: 300,
    specs: { passengers: 5, suitcases: 3, hasWifi: false },
    description: "Economy fuel vehicle offering excellent value.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
  {
    name: "Nissan Leaf",
    vehicleType: "EV",
    occasion: "Economy",
    price: 250,
    specs: { passengers: 4, suitcases: 3, hasWifi: true },
    description: "Electric vehicle ideal for budget-conscious travelers.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
  {
    name: "Mercedes S-Class",
    vehicleType: "EV",
    occasion: "First class",
    price: 700,
    specs: { passengers: 5, suitcases: 5, hasWifi: true },
    description: "Premium electric vehicle for a luxurious experience.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
  {
    name: "Mercedes S-Class",
    vehicleType: "EV",
    occasion: "First class",
    price: 700,
    specs: { passengers: 5, suitcases: 5, hasWifi: true },
    description: "Premium electric vehicle for a luxurious experience.",
    image:
      "https://images.unsplash.com/photo-1549925862-990ac5b34e35?auto=format&fit=crop&q=80&w=800&h=500",
  },
];
