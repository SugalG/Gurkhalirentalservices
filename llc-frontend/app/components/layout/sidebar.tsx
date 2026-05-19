"use client";

import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  LayoutDashboard,
  Car,
  CalendarClock,
  Receipt,
  Menu,
  X,
  LogOut,
  Newspaper,
  Contact2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";

const routes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
  },
  {
    label: "Vehicles",
    icon: Car,
    href: "/admin/vehicles",
  },
  {
    label: "Bookings",
    icon: CalendarClock,
    href: "/admin/bookings",
  },
  {
    label: "Payments",
    icon: Receipt,
    href: "/admin/payments",
  },
  {
    label: "Support Tickets",
    icon: Contact2,
    href: "/admin/support-tickets",
  },
  {
    label: "NewsLetter",
    icon: Newspaper,
    href: "/admin/newsletter",
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    signOut();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>
      <div
        className={cn(
          "fixed left-0 top-0 h-full w-64 bg-background border-r border-primary/10 transition-transform duration-300 ease-in-out z-40",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header Section */}
          <Link
            href={"/"}
            className="px-6 py-8 flex flex-col space-y-3 items-center border-b border-primary/10"
          >
            <Image
              src={"/images/logo.png"}
              alt="hllc"
              width={14}
              height={14}
              className="h-14 w-14 text-primary"
            />
            <span className="ml-2 text-xl font-bold text-center">
              Gurkhali Luxury Rides
            </span>
          </Link>

          {/* Routes Section */}
          <ScrollArea className="flex-grow px-3">
            <div className="flex flex-col gap-1 pt-4">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={pathname === route.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    pathname === route.href && "bg-primary/10"
                  )}
                  asChild
                >
                  <Link href={route.href}>
                    <route.icon className="h-4 w-4" />
                    {route.label}
                  </Link>
                </Button>
              ))}
            </div>
          </ScrollArea>

          {/* Logout Button */}
          <div className="px-3 py-4 border-t border-primary/10">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
