import AuthSession from "@components/AuthSession";
import { ThemeProvider } from "@components/theme-provider";
import type { Metadata } from "next";
import { Lexend } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gurkhali Luxury Rides - Book Your Luxury Vehicle",
  description:
    "Experience luxury travel with Gurkhali Luxury Rides. Book vehicles for hours or miles with ease. Premium rides tailored to your needs.",
  keywords: [
    "Gurkhali Luxury Rides",
    "luxury vehicle booking",
    "book luxury rides",
    "vehicle booking by hours",
    "ride booking platform",
    "premium rides",
    "luxury travel",
    "vehicle rental service",
  ],
  authors: [{ name: "Neo Matrix", url: "https://neomatrix.live/" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lexend.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          storageKey="luxury-theme"
        >
          <AuthSession>{children}</AuthSession>
          <Toaster position="bottom-right" reverseOrder={false} />
        </ThemeProvider>
      </body>
    </html>
  );
}
