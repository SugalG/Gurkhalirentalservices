import { ClientBookingStatus, PricingMode } from "@/models";

export type BookingOverviewPipeline = {
  totalRevenue: number;
  totalBookings: number;
  bookingDistribution: {
    pricingMode: PricingMode;
    count: number;
    revenue: number;
  }[];
  statusOverview: {
    status: ClientBookingStatus;
    count: number;
  }[];
};

export const bookingOverviewPipeline = () => {
  return [
    {
      $facet: {
        totalRevenue: [
          {
            $group: {
              _id: null,
              amount: {
                $sum: "$estimatedFare",
              },
            },
          },
        ],
        totalBookings: [
          {
            $group: {
              _id: null,
              count: {
                $sum: 1,
              },
            },
          },
        ],
        bookingDistribution: [
          {
            $group: {
              _id: "$pricingMode",
              count: {
                $sum: 1,
              },
              amount: {
                $sum: "$estimatedFare",
              },
            },
          },
        ],
        statusOverview: [
          {
            $group: {
              _id: "$status",
              count: {
                $sum: 1,
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        totalRevenue: {
          $ifNull: [
            {
              $arrayElemAt: ["$totalRevenue.amount", 0],
            },
            0,
          ],
        },
        totalBookings: {
          $ifNull: [
            {
              $arrayElemAt: ["$totalBookings.count", 0],
            },
            0,
          ],
        },
        bookingDistribution: {
          $map: {
            input: "$bookingDistribution",
            in: {
              pricingMode: "$$this._id",
              count: "$$this.count",
              revenue: "$$this.amount",
            },
          },
        },
        statusOverview: {
          $map: {
            input: "$statusOverview",
            in: {
              status: "$$this._id",
              count: "$$this.count",
            },
          },
        },
      },
    },
  ];
};
