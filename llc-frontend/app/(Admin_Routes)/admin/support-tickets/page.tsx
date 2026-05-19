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
import { Eye } from "lucide-react";
import { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { useSession } from "next-auth/react";
import { getSupportTickets } from "./action";
import { SupportTicket } from "@/app/types";

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const { data } = useSession();
  const [selectedTicket, setSelectedTicket] = useState<null | SupportTicket>(
    null
  );

  const fetchTickets = async () => {
    if (!data?.user.sessionToken) return;
    try {
      const response = await getSupportTickets(data.user.sessionToken);
      setTickets(response || []);
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
      setTickets([]);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [data?.user.sessionToken]);

  const handleViewClick = (ticket: (typeof tickets)[0]) => {
    setSelectedTicket(ticket);
  };

  const handleCloseDialog = () => {
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Support Tickets</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.length > 0 ? (
              tickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>{ticket.fullName}</TableCell>
                  <TableCell>{ticket.email}</TableCell>
                  <TableCell>{ticket.subject}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleViewClick(ticket)}
                      variant="ghost"
                      size="sm"
                    >
                      <Eye />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  No tickets available
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedTicket && (
        <Dialog open={true} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl">Ticket Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                <strong>Id:</strong> {selectedTicket._id}
              </p>
              <p>
                <strong>Full Name:</strong> {selectedTicket.fullName}
              </p>
              <p>
                <strong>Email:</strong> {selectedTicket.email}
              </p>
              <p>
                <strong>Subject:</strong> {selectedTicket.subject}
              </p>
              <p>
                <strong>Message:</strong> {selectedTicket.message}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {new Date(selectedTicket.createdAt).toLocaleString()}
              </p>

              <div className="flex justify-end">
                <Button
                  onClick={handleCloseDialog}
                  className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-500 text-white rounded-md"
                >
                  Close
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
