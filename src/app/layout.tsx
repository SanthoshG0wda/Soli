import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Soli — Legal Research Intelligence",
  description: "Professional legal research workstation for Indian law firms. Grounded answers with citations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0B0C0F] text-[#F1F2F3] antialiased selection:bg-[#6366F1]/30`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
