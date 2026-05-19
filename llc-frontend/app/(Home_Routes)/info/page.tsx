"use client";

import { Card } from "@/app/components/ui/card";
import { Mail, Phone, Globe, Save } from "lucide-react";

const contactInfo = [
  {
    href: "mailto:booking@gurkhaliluxuryrides.com",
    icon: Mail,
    text: "booking@gurkhaliluxuryrides.com",
  },
  { href: "tel:720-243-8077", icon: Phone, text: "720-243-8077" },
  {
    href: "https://www.gurkhaliluxuryrides.com",
    icon: Globe,
    text: "www.gurkhaliluxuryrides.com",
  },
];

export default function Home() {
  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center p-4 sm:p-6 text-main"
      style={{ backgroundImage: "url('/images/home-hero.png')" }}
    >
      <Card className="w-full max-w-sm sm:max-w-md bg-white shadow-xl p-6 sm:p-8">
        <div className="flex flex-col items-center text-center">
          {/* Profile Photo */}
          <div className="w-32 sm:w-40 h-32 sm:h-40 rounded-full overflow-hidden mb-4 sm:mb-6 ring-4 ring-primary/10">
            <img
              src="/images/info.jpg"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-main">
            Binod Gurung
          </h1>

          <div className="w-full space-y-3 sm:space-y-4 text-main">
            {contactInfo.map(({ href, icon: Icon, text }, index) => (
              <a
                key={index}
                href={href}
                className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3"
              >
                <Icon className="w-5 sm:block hidden h-5 flex-shrink-0" />
                <span className="text-sm sm:text-base whitespace-break-spaces">
                  {text}
                </span>
              </a>
            ))}
          </div>
          <a
            href={"https://hamroluxuryrides.com/public/contact.vcf"}
            className="flex items-center justify-center sm:justify-start px-8 space-x-2 sm:space-x-3 bg-slate-900 text-white rounded-lg p-3 mt-4 sm:mt-6"
          >
            <Save className="w-5 sm:block hidden h-5 flex-shrink-0" />
            <span className="text-sm sm:text-base whitespace-break-spaces">
              Save Contact Details
            </span>
          </a>
        </div>
      </Card>
    </div>
  );
}
