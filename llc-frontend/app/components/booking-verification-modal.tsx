"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { getBookingDetails } from "./api";
import { AxiosError } from "axios";
import toast from "react-hot-toast";

export function BookingVerificationModal({
  openModal,
  setOpenModal,
}: {
  openModal: boolean;
  setOpenModal: (open: boolean) => void;
}) {
  const [bookingId, setBookingId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    await getBookingDetails(bookingId)
      .then((response) => {
        if (response._id) {
          const jsonString = JSON.stringify(response);
          const base64String = btoa(jsonString);
          router.push(
            `/book-now/${encodeURIComponent(base64String)}?type=edit`
          );
        } else {
          toast.error("Invalid booking ID");
        }
      })
      .catch((error: AxiosError | any) => {
        toast.error("Invalid booking ID");
      });
  };

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Verify Your Booking
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your booking ID to view or modify your reservation
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bookingId">Booking ID</Label>
            <div className="relative">
              <Input
                id="bookingId"
                placeholder="Enter your booking ID"
                value={bookingId}
                onChange={(e) => {
                  setBookingId(e.target.value);
                  setError("");
                }}
                className="pr-10"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <DialogTrigger asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogTrigger>
            <Button
              type="submit"
              variant={"default"}
              disabled={bookingId.length === 0}
            >
              Verify & Continue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
