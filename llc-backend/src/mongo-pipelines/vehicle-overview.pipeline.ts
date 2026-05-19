export type VehicleOverviewPipeline = {
  availabilityStatus: {
    status: "available" | "maintenance";
    count: number;
  }[];
  fuelType: {
    fuelType: string;
    count: number;
  }[];
  category: {
    category: string;
    count: number;
  }[];
};

export const vehicleOverviewPipeline = () => {
  return [
    {
      $facet: {
        available: [
          {
            $group: {
              _id: "$availabilityStatus",
              count: {
                $sum: 1,
              },
            },
          },
        ],
        fuelType: [
          {
            $group: {
              _id: "$fuelType",
              count: {
                $sum: 1,
              },
            },
          },
        ],
        category: [
          {
            $group: {
              _id: "$category",
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
        availabilityStatus: {
          $map: {
            input: "$available",
            in: {
              status: {
                $cond: ["$$this._id", "available", "maintenance"],
              },
              count: "$$this.count",
            },
          },
        },
        fuelType: {
          $map: {
            input: "$fuelType",
            in: {
              fueltype: "$$this._id",
              count: "$$this.count",
            },
          },
        },
        category: {
          $map: {
            input: "$category",
            in: {
              category: "$$this._id",
              count: "$$this.count",
            },
          },
        },
      },
    },
  ];
};
