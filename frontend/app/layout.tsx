import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { NavbarWrapper } from "@/components/navbar-wrapper";
import "./globals.css";

export const metadata: Metadata = {
  title: "HealthCare Pro - Your Digital Health Partner",
  description: "Book appointments, access pharmacy, chat with AI, and manage your digital health records",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <NavbarWrapper />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
