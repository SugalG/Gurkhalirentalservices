import { Clock, CreditCard, HeadphonesIcon, Shield, Truck } from "lucide-react";
import Marquee from "react-fast-marquee";

// Features data
const features = [
  {
    icon: <Clock className="md:w-4 md:h-6 w-3 h-5" />,
    text: "Free cancellation",
  },
  {
    icon: <CreditCard className="md:w-4 md:h-6 w-3 h-5" />,
    text: "Pay safe with PayPal",
  },
  {
    icon: <Truck className="md:w-4 md:h-6 w-3 h-5" />,
    text: "Licensed Drivers",
  },
  {
    icon: <HeadphonesIcon className="md:w-4 md:h-6 w-3 h-5" />,
    text: "24/7 Support",
  },
  {
    icon: <Shield className="md:w-4 md:h-6 w-3 h-5" />,
    text: "Commercial Insurance",
  },
];

export default function FeatureBanner() {
  return (
    <div className="bg-main text-white md:py-4 py-2 overflow-hidden">
      {/* Marquee effect using react-fast-marquee */}
      <Marquee speed={60}>
        {[...features, ...features].map((feature, index) => (
          <div
            key={index}
            className="inline-flex items-center justify-center gap-2 px-4"
          >
            {feature.icon}
            <span className="md:text-base text-xs font-medium">
              {feature.text}
            </span>
          </div>
        ))}
      </Marquee>
    </div>
  );
}
