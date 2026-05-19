"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Search, MapPin, Eye, Filter, Trash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Booking, PaymentRefund } from "@/app/types";
import { formatISODate } from "@/app/lib/helper";
import {
  changeBookingStatus,
  filterBookings,
  forceDeleteBooking,
} from "./action";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const defaultFilters = {
  pricingMode: "",
  bookingStatus: "",
  scheduleFrom: "",
  scheduleTo: "",
  id: "",
  email: "",
  fullName: "",
};
export default function Bookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [openFilter, setOpenFilter] = useState(false);
  const [openAction, setOpenAction] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  );
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [filters, setFilters] = useState({ ...defaultFilters });

  const { data: session } = useSession();

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };
  const applyFilters = async () => {
    if (!session?.user?.sessionToken) return;

    const filteredParams: Record<string, any> = {};

    if (filters.pricingMode) {
      filteredParams.pricingMode = filters.pricingMode as "hourly" | "distance";
    }
    if (filters.bookingStatus) {
      filteredParams.bookingStatus = filters.bookingStatus as
        | "pending"
        | "booked"
        | "in-progress"
        | "completed"
        | "cancelled";
    }
    if (filters.scheduleFrom) {
      filteredParams.scheduleFrom = new Date(filters.scheduleFrom);
    }
    if (filters.scheduleTo) {
      filteredParams.scheduleTo = new Date(filters.scheduleTo);
    }
    if (filters.id) {
      filteredParams.id = filters.id;
    }
    if (filters.email) {
      filteredParams.email = filters.email;
    }
    if (filters.fullName) {
      filteredParams.fullName = filters.fullName;
    }

    const { bookings } = await filterBookings(
      session?.user.sessionToken,
      filteredParams
    );
    setBookings(bookings);
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters });
  };

  const handleStatusChange = async (id: string) => {
    if (!currentStatus) return;
    const { _id } = await changeBookingStatus(
      id,
      currentStatus,
      session?.user.sessionToken!
    );
    if (!_id) return toast.error("Couldn't change status");
    window.location.reload();
  };

  const handleDelete = (id: string) => {
    setSelectedBookingId(id);
    setDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (!selectedBookingId) return toast.error("Failed to delete booking");
    await forceDeleteBooking(session?.user.sessionToken!, selectedBookingId!);

    setDeleteModalOpen(false);
    setSelectedBookingId("");
    toast.success("Booking deleted successfully");
    window.location.reload();
  };

  const statusColors = {
    booked: "blue-500",
    "in-progress": "yellow-500",
    completed: "green-500",
    cancelled: "red-500",
    refunded: "white",
    pending: "gray-500",
  };

  useEffect(() => {
    async function getBookings() {
      if (!session?.user?.sessionToken) return;
      const { bookings } = await filterBookings(session?.user.sessionToken);
      setBookings(bookings);
    }

    getBookings();
  }, [session]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Booking Management</h1>
        <Dialog
          open={openFilter}
          onOpenChange={(isOpenFilter) => {
            if (!isOpenFilter) {
              setOpenFilter(false);
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setOpenFilter(true)}>
              <Filter className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] overflow-y-auto px-6 py-4">
            <DialogHeader>
              <DialogTitle>Filters</DialogTitle>
            </DialogHeader>

            {/* Filters Container */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {/* Pricing Mode Filter */}
              <div className="flex flex-col">
                <Select
                  value={filters.pricingMode}
                  onValueChange={(value) =>
                    handleFilterChange("pricingMode", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pricing Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="distance">Distance</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Booking Status Filter */}
              <div className="flex flex-col">
                <Select
                  value={filters.bookingStatus}
                  onValueChange={(value) =>
                    handleFilterChange("bookingStatus", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Booking Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Schedule From Filter */}
              <div className="flex flex-col">
                <input
                  type="date"
                  value={filters.scheduleFrom || ""}
                  onChange={(e) =>
                    handleFilterChange("scheduleFrom", e.target.value)
                  }
                  className="border p-2 rounded-md"
                  placeholder="Schedule From"
                />
              </div>

              {/* Schedule To Filter */}
              <div className="flex flex-col">
                <input
                  type="date"
                  value={filters.scheduleTo || ""}
                  onChange={(e) =>
                    handleFilterChange("scheduleTo", e.target.value)
                  }
                  className="border p-2 rounded-md"
                  placeholder="Schedule To"
                />
              </div>

              {/* ID Filter */}
              <div className="flex flex-col">
                <input
                  type="text"
                  value={filters.id || ""}
                  onChange={(e) => handleFilterChange("id", e.target.value)}
                  className="border p-2 rounded-md"
                  placeholder="Booking ID"
                />
              </div>

              {/* Email Filter */}
              <div className="flex flex-col">
                <input
                  type="email"
                  value={filters.email || ""}
                  onChange={(e) => handleFilterChange("email", e.target.value)}
                  className="border p-2 rounded-md"
                  placeholder="User Email"
                />
              </div>

              {/* Full Name Filter */}
              <div className="flex flex-col">
                <input
                  type="text"
                  value={filters.fullName || ""}
                  onChange={(e) =>
                    handleFilterChange("fullName", e.target.value)
                  }
                  className="border p-2 rounded-md"
                  placeholder="Full Name"
                />
              </div>

              {/* Apply Filters Button */}
              <div className="flex items-center justify-end space-x-2 sm:col-span-3">
                <Button onClick={clearFilters}>Clear Filters</Button>
                <Button
                  onClick={() => {
                    setOpenFilter(false);
                    applyFilters();
                  }}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Booking ID</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Destination</TableHead>
              <TableHead>Scheduled Time</TableHead>
              <TableHead>Total Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((item) => {
              const {
                clientDetail: client,
                clientBillingAddress: billing,
                ...booking
              } = item;
              return (
                <TableRow key={booking._id}>
                  <TableCell className="font-medium">{booking._id}</TableCell>
                  <TableCell>{booking.vehicleType.name}</TableCell>
                  <TableCell>{booking.originAddress}</TableCell>
                  <TableCell>{booking.destAddress || "N/A"}</TableCell>
                  <TableCell>{formatISODate(booking.scheduleDate)}</TableCell>
                  <TableCell>${booking.estimatedFare.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`bg-${statusColors[booking.status]} text-white
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye
                              className="h-4"
                              onClick={() => {
                                setCurrentStatus("");
                                setOpenAction(false);
                              }}
                            />
                          </Button>
                        </DialogTrigger>

                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Booking Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 h-[70vh] overflow-y-scroll">
                            {/* Vehicle Name */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Vehicle Name
                              </h4>
                              <div>{booking.vehicleType.name}</div>
                            </div>
                            {/* Client Details */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Client Details
                              </h4>
                              <div>
                                <strong>Full Name:</strong> {client.fullName}
                              </div>
                              <div>
                                <strong>Email:</strong> {client.email}
                              </div>
                              <div>
                                <strong>Phone Number:</strong>{" "}
                                {client.phoneNumber}
                              </div>
                              <div>
                                <strong>Date:</strong>{" "}
                                {formatISODate(client.createdAt)}
                              </div>
                            </div>
                            {/* Origin Address */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Origin Address
                              </h4>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.originAddress}</span>
                              </div>
                            </div>
                            {/* Destination Address */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Destination Address
                              </h4>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{booking.destAddress || "N/A"}</span>
                              </div>
                            </div>
                            {/* Coordinates */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Coordinates
                              </h4>
                              <div className="text-sm">
                                <strong>Origin:</strong>{" "}
                                {booking.originCoordinates.coordinates.join(
                                  ", "
                                )}
                              </div>
                              <div className="text-sm">
                                <strong>Destination:</strong>{" "}
                                {booking.destCoordinates.coordinates.join(
                                  ", "
                                ) || "N/A"}
                              </div>
                            </div>
                            {/* Billing Address */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Billing Address
                              </h4>
                              <div>
                                <strong>Full Name:</strong> {billing.fullName}
                              </div>
                              <div>
                                <strong>Affiliation:</strong>{" "}
                                {billing.affiliation}
                              </div>
                              <div>
                                <strong>Address Line 1:</strong>{" "}
                                {billing.addressLine_1}
                              </div>
                              <div>
                                <strong>Address Line 2:</strong>{" "}
                                {billing.addressLine_2 || "N/A"}
                              </div>
                              <div>
                                <strong>City:</strong> {billing.city}
                              </div>
                              <div>
                                <strong>State:</strong> {billing.state || "N/A"}
                              </div>
                              <div>
                                <strong>Postal Code:</strong>{" "}
                                {billing.postalCode}
                              </div>
                              <div>
                                <strong>Country:</strong> {billing.country}
                              </div>
                              <div>
                                <strong>Date:</strong>{" "}
                                {formatISODate(billing.createdAt)}
                              </div>
                            </div>
                            {/* Scheduled Time */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Scheduled Time
                              </h4>
                              <div>{formatISODate(booking.scheduleDate)}</div>
                            </div>
                            {/* Status */}
                            <div>
                              <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                Status
                              </h4>
                              <div>{booking.status}</div>
                            </div>
                            {/* Pricing Mode */}
                            {booking.pricingMode === "distance" ? (
                              <>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Distance (KM)
                                  </h4>
                                  <div>{booking.distanceKm} km</div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Estimated Fare
                                  </h4>
                                  <div>${booking.estimatedFare}</div>
                                </div>
                              </>
                            ) : (
                              <>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Duration (Hours)
                                  </h4>
                                  <div>{booking.durationHourly} hours</div>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                    Estimated Fare
                                  </h4>
                                  <div>${booking.estimatedFare}</div>
                                </div>
                              </>
                            )}

                            <div>
                              <label className="block font-medium mb-2.5">
                                Change Status
                              </label>
                              <Select
                                onValueChange={(value) =>
                                  setCurrentStatus(value)
                                }
                                defaultValue={booking.status}
                              >
                                <SelectTrigger className="w-11/12 ml-1 border rounded-lg px-2 py-1">
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">
                                    Pending
                                  </SelectItem>
                                  <SelectItem value="booked">Booked</SelectItem>

                                  <SelectItem value="in-progress">
                                    In Progress
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end">
                              <Button
                                onClick={() => {
                                  setOpenAction(false);
                                  handleStatusChange(booking._id);
                                }}
                              >
                                Save Changes
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(booking._id)}
                      >
                        <Trash className="h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {deleteModalOpen && (
        <Dialog
          open={deleteModalOpen}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setDeleteModalOpen(false);
              setSelectedBookingId("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[400px] p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Confirm Deletion
              </DialogTitle>
            </DialogHeader>
            <p>Are you sure you want to force delete this booking?</p>
            <div className="flex justify-end mt-4 space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedBookingId(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
