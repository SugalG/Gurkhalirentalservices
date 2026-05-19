"use client";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import React, { useState } from "react";
import { createNewEmailSubscription } from "./api";
import toast from "react-hot-toast";
import Link from "next/link";

type SocialIconProps = {
  Icon: React.ElementType;
};

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

type QuickLinksProps = {
  links: { label: string; route: string }[];
};

type ContactInfoProps = {
  info: string[];
};

const SocialIcon: React.FC<SocialIconProps> = ({ Icon }) => (
  <Icon className="w-5 h-5 cursor-pointer hover:text-white transition-colors" />
);

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <div>
    <h3 className="font-semibold text-white mb-4">{title}</h3>
    {children}
  </div>
);

const QuickLinks: React.FC<QuickLinksProps> = ({ links }) => (
  <ul className="space-y-2 text-sm">
    {links.map((link, index) => (
      <li key={index}>
        <Link href={link.route} className="hover:text-white transition-colors">
          {link.label}
        </Link>
      </li>
    ))}
  </ul>
);

const ContactInfo: React.FC = () => (
  <ul className="space-y-2 text-sm">
    <li>
      <a href="tel:7202438077" className="hover:text-white transition-colors">
        720-243-8077
      </a>
    </li>
    <li>
      <a
        href="mailto:info@gurkhaliluxuryrides.com"
        className="hover:text-white transition-colors"
      >
        info@gurkhaliluxuryrides.com
      </a>
    </li>
    <li>Longmont, Colorado, 80501</li>
  </ul>
);

const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export default function Footer() {
  const [email, setEmail] = useState<string>();

  const onSubscribe = () => {
    const sendEmailSubscription = async () => {
      if (!email) return;
      const response = await createNewEmailSubscription(email);
      if (!response) toast.error("Failed to subscribe");
      else toast.success("Subscribed successfully");
      setEmail("");
    };

    sendEmailSubscription();
  };

  return (
    <footer className="bg-[#111827] text-gray-300">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 py-10">
        <Section title="LLC">
          <p className="text-sm mb-4">
            Premium transportation services for discerning clients.
          </p>
          <div className="flex gap-4">
            {[
              { Icon: Facebook, href: "#" },
              { Icon: Instagram, href: "#" },
              { Icon: Linkedin, href: "#" },
            ].map(({ Icon, href }, index) => (
              <Link key={index} href={href} target="_blank">
                <SocialIcon key={index} Icon={Icon} />
              </Link>
            ))}
          </div>
        </Section>

        <Section title="Quick Links">
          <QuickLinks
            links={[
              { label: "Services", route: "/services" },
              { label: "Fleet", route: "/fleet" },
              { label: "Help", route: "/help" },
            ]}
          />
        </Section>

        <Section title="Contact">
          <ContactInfo />
        </Section>

        <Section title="Newsletter">
          <p className="text-sm mb-4">
            Subscribe for updates and exclusive offers
          </p>
          <div className="space-y-3">
            <input
              type="email"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded bg-white/10 border border-gray-700 focus:outline-none focus:border-white transition-colors"
            />
            <button
              onClick={onSubscribe}
              className="w-full px-4 py-2 text-base rounded bg-white text-[#151823] hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </div>
        </Section>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-4 border-t border-gray-800 text-center text-sm">
        © {getCurrentYear()} LLC. All rights reserved.
      </div>
    </footer>
  );
}
