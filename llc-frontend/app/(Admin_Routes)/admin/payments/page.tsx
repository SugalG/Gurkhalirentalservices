"use client";

import { Button } from "@/app/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { Check, Eye, Filter, X } from "lucide-react";
import { Payment, PaymentRefund } from "@/app/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useSession } from "next-auth/react";
import { filterPayments } from "./action";

const defaultFilters = {
  paymentMethod: "paypal",
  status: "",
  paymentFrom: "",
  paymentTo: "",
  id: "",
  bookingId: "",
};

const formSchema = z.object({
  booking_id: z.number(),
  amount: z.number(),
  payment_method: z.enum(["paypal", "credit-card"]),
  transaction_id: z.string().min(6, {
    message: "Transaction ID must be at least 6 characters.",
  }),
  status: z.enum(["completed", "failed", "refund"]),
  payment_date: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format.",
  }),
  date_field: z.string().refine((val) => !isNaN(new Date(val).getTime()), {
    message: "Invalid date format.",
  }),
});

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [openFilter, setOpenFilter] = useState(false);
  const [refundDetailsOpen, setRefundDetailsOpen] =
    useState<PaymentRefund | null>(null);
  const { data: session } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      booking_id: 0,
      amount: 0,
      payment_method: "paypal",
      transaction_id: "",
      status: "completed",
      payment_date: "",
      date_field: "",
    },
  });

  function getRefundDetails(bookingId: string) {
    setRefundDetailsOpen({
      booking_id: 3,
      payment_id: 101,
      transaction_id: 23,
      amount: 200,
      reason: "Personal Reason",
      status: "requested",
      refund_date: "2024-01-12",
      date_field: "2024-01-12",
    });
  }

  function closeRefundDetails() {
    setRefundDetailsOpen(null);
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "refund":
        return "text-yellow-500";
      default:
        return "";
    }
  }

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [filterName]: value,
    }));
  };

  const applyFilters = async () => {
    if (!session?.user?.sessionToken) return;

    const filteredParams: Record<string, any> = {};

    if (filters.paymentMethod) {
      filteredParams.paymentMethod = filters.paymentMethod as "paypal";
    }
    if (filters.status) {
      filteredParams.status = filters.status as
        | "pending"
        | "failed"
        | "completed"
        | "refunded";
    }
    if (filters.paymentFrom) {
      filteredParams.paymentFrom = new Date(filters.paymentFrom);
    }
    if (filters.paymentTo) {
      filteredParams.paymentTo = new Date(filters.paymentTo);
    }
    if (filters.id) {
      filteredParams.id = filters.id;
    }
    if (filters.bookingId) {
      filteredParams.bookingId = filters.bookingId;
    }

    const { payments } = await filterPayments(
      session?.user.sessionToken,
      filteredParams
    );
    setPayments(payments);
  };

  const clearFilters = () => {
    setFilters({ ...defaultFilters });
  };

  useEffect(() => {
    async function getPayments() {
      if (!session?.user?.sessionToken) return;
      const { payments } = await filterPayments(session?.user.sessionToken);
      setPayments(payments);
    }

    getPayments();
  }, [session]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payment Management</h1>
        {/* <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Payment</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block font-medium">Booking ID</label>
                <Input
                  type="number"
                  placeholder="1"
                  {...form.register("booking_id")}
                />
              </div>
              <div>
                <label className="block font-medium">Amount</label>
                <Input
                  type="number"
                  placeholder="150"
                  {...form.register("amount")}
                />
              </div>
              <div>
                <label className="block font-medium">Payment Method</label>
                <select
                  {...form.register("payment_method")}
                  className="w-full border"
                >
                  <option value="paypal">PayPal</option>
                  <option value="credit-card">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Transaction ID</label>
                <Input
                  placeholder="PAYPAL123456"
                  {...form.register("transaction_id")}
                />
              </div>
              <div>
                <label className="block font-medium">Status</label>
                <select {...form.register("status")} className="w-full border">
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refund">Refund</option>
                </select>
              </div>
              <div>
                <label className="block font-medium">Payment Date</label>
                <Input type="date" {...form.register("payment_date")} />
              </div>
              <div>
                <label className="block font-medium">Date Field</label>
                <Input type="date" {...form.register("date_field")} />
              </div>
              <div className="flex justify-end">
                <Button type="submit">Add Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog> */}
        <Dialog
          open={openFilter}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Payment Method */}
              <div className="flex flex-col">
                <Select
                  value={filters.paymentMethod}
                  onValueChange={(value) =>
                    handleFilterChange("paymentMethod", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex flex-col">
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Payment From */}
              <div className="flex flex-col">
                <label
                  htmlFor="paymentFrom"
                  className="text-sm font-medium text-white  pb-1.5 pl-1"
                >
                  Payment From
                </label>
                <input
                  id="paymentFrom"
                  type="date"
                  value={filters.paymentFrom}
                  onChange={(e) =>
                    handleFilterChange("paymentFrom", e.target.value)
                  }
                  className="border p-2 rounded-md bg-transparent"
                />
              </div>

              {/* Payment To */}
              <div className="flex flex-col">
                <label
                  htmlFor="paymentTo"
                  className="text-sm font-medium text-white pb-1.5 pl-1"
                >
                  Payment To
                </label>
                <input
                  id="paymentTo"
                  type="date"
                  value={filters.paymentTo}
                  onChange={(e) =>
                    handleFilterChange("paymentTo", e.target.value)
                  }
                  className="border p-2 rounded-md bg-transparent"
                />
              </div>

              {/* ID */}
              <div className="flex flex-col">
                <Input
                  type="text"
                  value={filters.id}
                  onChange={(e) => handleFilterChange("id", e.target.value)}
                  placeholder="PaymentID"
                />
              </div>

              {/* Booking ID */}
              <div className="flex flex-col">
                <Input
                  type="text"
                  value={filters.bookingId}
                  onChange={(e) =>
                    handleFilterChange("bookingId", e.target.value)
                  }
                  placeholder="Booking ID"
                />
              </div>

              {/* Apply & Clear Buttons */}
              <div className="flex items-center justify-end space-x-2 sm:col-span-2">
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
              <TableHead>Payment ID</TableHead>
              <TableHead>Booking ID</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments?.map((payment) => (
              <TableRow key={payment._id}>
                <TableCell>{payment._id}</TableCell>
                <TableCell>{payment.bookingDetail?._id}</TableCell>
                <TableCell>{payment.transactionId}</TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>

                <TableCell>{payment.paymentDate}</TableCell>
                <TableCell className={getStatusColor(payment.status)}>
                  {payment.status}
                </TableCell>
                <TableCell>
                  {payment.status === "refund" ? (
                    <Button
                      variant="outline"
                      onClick={() =>
                        getRefundDetails(payment.bookingDetail._id)
                      }
                    >
                      <Eye />
                    </Button>
                  ) : payment.status === "failed" ? (
                    <Button variant="outline" disabled>
                      <X className="text-red-500" />
                    </Button>
                  ) : (
                    <Button variant="outline" disabled>
                      <Check className="text-green-500" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {refundDetailsOpen && (
        <Dialog open={true} onOpenChange={closeRefundDetails}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Refund Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Booking ID:</strong> {refundDetailsOpen.booking_id}
              </p>
              <p>
                <strong>Amount:</strong> ${refundDetailsOpen.amount}
              </p>
              <p>
                <strong>Transaction ID:</strong>{" "}
                {refundDetailsOpen.transaction_id}
              </p>
              <p>
                <strong>Reason:</strong> {refundDetailsOpen.reason}
              </p>
              <p>
                <strong>Refund Date:</strong> {refundDetailsOpen.refund_date}
              </p>
              <p>
                <strong>Date Field:</strong> {refundDetailsOpen.date_field}
              </p>
              <div>
                <label className="block font-medium mb-2.5">Status</label>
                <Select
                  onValueChange={(value) =>
                    setRefundDetailsOpen((prev) =>
                      prev
                        ? { ...prev, status: value as PaymentRefund["status"] }
                        : null
                    )
                  }
                  defaultValue={refundDetailsOpen.status}
                >
                  <SelectTrigger className="w-full border rounded-lg px-2 py-1">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requested">Requested</SelectItem>
                    <SelectItem value="processed">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    closeRefundDetails();
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
