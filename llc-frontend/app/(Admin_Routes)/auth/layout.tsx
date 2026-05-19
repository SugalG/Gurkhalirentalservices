import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default async function AdminRoutes({ children }: Props) {
  const session = await getServerSession();
  if (session) {
    return redirect("/admin/dashboard");
  }
  return <>{children}</>;
}
