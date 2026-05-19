"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { cancelBooking } from "../(Home_Routes)/action";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function CancelBooking({
  open,
  setOpen,
  bookingId,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  bookingId: string;
}) {
  const router = useRouter();

  const handleCancel = async () => {
    await cancelBooking(bookingId)
      .then((response) => {
        if (response?.status === "error") {
          toast.error(
            `${response.message} - Please contact admin for further assistance`
          );
          setOpen(false);
          return;
        } else {
          toast.success("Booking cancelled");
          router.push("/");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error(`Failed to cancel booking - ${error.message}`);
      });
    // Add your cancel booking logic here
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="w-full bg-black text-white hover:bg-black/90"
        >
          Cancel Booking ?
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cancel Booking</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this booking? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            No, keep booking
          </Button>
          <Button variant="default" onClick={handleCancel}>
            Yes, cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
