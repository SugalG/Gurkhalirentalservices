"use client";

import { StatsCard } from "@/app/components/stats-card";
import { Card } from "@/app/components/ui/card";
import {
  DollarSign,
  Users,
  Car,
  CalendarCheck,
  Ban,
  CircleX,
  TicketCheck,
  BookCheck,
  CircleDotDashed,
  LoaderPinwheel,
  FileQuestion,
  Check,
  Construction,
  Fuel,
  Zap,
  BatteryCharging,
  Banknote,
  Gem,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  getDashboardDataBooking,
  getDashboardDataClient,
  getDashboardDataVehicle,
} from "./action";

const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 5000 },
  { name: "Apr", revenue: 4500 },
  { name: "May", revenue: 6000 },
  { name: "Jun", revenue: 5500 },
];

const BookingOverviewData: Record<string, { icon: any; color: string }> = {
  cancelled: { icon: CircleX, color: "text-red-500" },
  booked: { icon: TicketCheck, color: "text-blue-500" },
  completed: { icon: BookCheck, color: "text-green-500" },
  pending: { icon: CircleDotDashed, color: "text-yellow-500" },
  "in-progress": { icon: LoaderPinwheel, color: "text-purple-500" },
  "admin-cancelled": { icon: Ban, color: "text-gray-500" },
};

const CarAvailabilityData: Record<string, { icon: any; color: string }> = {
  available: { icon: Check, color: "text-green-500" },
  maintenance: { icon: Construction, color: "text-yellow-500" },
  gas: { icon: Fuel, color: "text-orange-500" },
  electric: { icon: BatteryCharging, color: "text-blue-500" },
  economy: { icon: Banknote, color: "text-green-200" },
  luxury: { icon: Gem, color: "text-purple-500" },
};

export default function Dashboard() {
  const { data } = useSession();
  const [clientCount, setClientCount] = useState("");
  const [vehicleData, setVehicleData] = useState<null | any>(null);
  const [bookingData, setBookingData] = useState<null | any>(null);

  const fetchTickets = async () => {
    if (!data?.user.sessionToken) return;
    try {
      const { count } = await getDashboardDataClient(data.user.sessionToken);
      const booking = await getDashboardDataBooking(data.user.sessionToken);
      const vehicle = await getDashboardDataVehicle(data.user.sessionToken);

      setClientCount(count || "");
      setVehicleData(vehicle);
      setBookingData(booking);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setClientCount("");
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [data?.user.sessionToken]);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue"
          value={"$ " + (bookingData?.totalRevenue || 0).toFixed(2)}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="Rent. Ride. Revenue."
        />
        <StatsCard
          title="Total Bookings"
          value={bookingData?.totalBookings || "0"}
          icon={<CalendarCheck className="h-4 w-4 text-muted-foreground" />}
          description="Book. Drive. Go."
        />
        <StatsCard
          title="Active Users"
          value={clientCount || "0"}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description={`${clientCount || "0"} new this week`}
        />
        <StatsCard
          title="Available Vehicles"
          value={vehicleData?.availabilityStatus[0].count || 0}
          icon={<Car className="h-4 w-4 text-muted-foreground" />}
          description={`${
            vehicleData?.availabilityStatus[1].count || 0
          } in maintenance`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={revenueData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="name"
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#888" }}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#888" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Booking Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={bookingData?.bookingDistribution}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis
                  dataKey="pricingMode"
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#888" }}
                />
                <YAxis
                  stroke="#888"
                  tick={{ fill: "#888" }}
                  axisLine={{ stroke: "#888" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(var(--primary))"
                  name="Bookings Count"
                />
                <Bar
                  dataKey="revenue"
                  fill="hsl(var(--primary))"
                  name="Revenue"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Booking Status Overview
          </h2>
          <div className="grid md:grid-cols-2 grid-col-1 gap-6">
            {bookingData?.statusOverview?.map(
              (
                { status, count }: { status: string; count: number },
                idx: number
              ) => {
                const IconComponent = BookingOverviewData[status]?.icon;
                const iconColor = BookingOverviewData[status]?.color;

                return (
                  <div key={idx} className="flex items-center gap-2">
                    <IconComponent className={`h-5 w-5 ${iconColor}`} />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{status}</p>
                      <p className="text-2xl font-bold">{count}</p>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">
            Car Availability & Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vehicleData?.availabilityStatus.map(
              (
                { status, count }: { status: string; count: string },
                idx: number
              ) => {
                const IconComponent =
                  CarAvailabilityData[status]?.icon || FileQuestion;
                const iconColor = CarAvailabilityData[status]?.color || "";
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{status}</p>
                        <p className="text-base font-semibold">{count}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
            {vehicleData?.fuelType.map(
              (
                { fueltype, count }: { fueltype: string; count: string },
                idx: number
              ) => {
                const IconComponent =
                  CarAvailabilityData[fueltype]?.icon || FileQuestion;
                const iconColor = CarAvailabilityData[fueltype]?.color || "";
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{fueltype}</p>
                        <p className="text-lg font-semibold">{count}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
            {/* Category */}
            {vehicleData?.category.map(
              (
                { category, count }: { category: string; count: string },
                idx: number
              ) => {
                const IconComponent =
                  CarAvailabilityData[category]?.icon || FileQuestion;
                const iconColor = CarAvailabilityData[category]?.color || "";
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-muted/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`h-5 w-5 ${iconColor}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium"> {category}</p>
                        <p className="text-lg font-semibold">{count}</p>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
