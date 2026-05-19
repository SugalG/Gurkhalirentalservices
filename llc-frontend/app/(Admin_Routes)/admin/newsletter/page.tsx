"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { formatISODate } from "@/app/lib/helper";

import { useSession } from "next-auth/react";
import { getSubscribedEmails } from "./action";
import toast from "react-hot-toast";
import { SubscribedEmails } from "@/app/types";
export default function Newsletter() {
  const [emails, setEmails] = useState<SubscribedEmails[]>([]);
  const { data } = useSession();

  const fetchEmails = async (token: string) => {
    try {
      const response = await getSubscribedEmails(token);
      setEmails(response || []);
    } catch (error) {
      console.error("Failed to fetch emails:", error);
      toast.error("Failed to load newsletter subscribers.");
    }
  };

  useEffect(() => {
    if (data?.user.sessionToken) {
      fetchEmails(data.user.sessionToken);
    }
  }, [data?.user.sessionToken]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Newsletter Management</h1>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {emails.length > 0 ? (
              emails.map((email) => (
                <TableRow key={email._id}>
                  <TableCell>{email.email}</TableCell>
                  <TableCell>{formatISODate(email.createdAt)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  No subscribers found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
