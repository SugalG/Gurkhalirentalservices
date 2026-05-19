"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/app/components/layout/sidebar";
import { getSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { isAuth } from "./action";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const session = await getSession();
      if (!session) {
        router.replace("/auth/login");
        return;
      }

      const { isAuthenticated } = await isAuth(session.user.sessionToken);

      if (!isAuthenticated) {
        await signOut({ callbackUrl: "/auth/login" });
      } else {
        setLoading(false);
      }
    }

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="h-screen w-full flex justify-center items-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="h-full relative">
      <Sidebar />
      <main className="md:pl-64 pt-16 md:pt-0 min-h-screen">
        <div className="p-6 h-full">{children}</div>
      </main>
    </div>
  );
}
