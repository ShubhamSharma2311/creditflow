import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "CreditFlow — Loan Management System",
  description: "A modern loan management platform for borrowers and operations teams.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              border: "1px solid #E8DDD0",
              color: "#1C1109",
              fontFamily: "Inter, system-ui, sans-serif",
              fontSize: "14px",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(28,17,9,0.10)",
            },
            classNames: {
              success: "!border-l-4 !border-l-[#2D6A4F]",
              error:   "!border-l-4 !border-l-[#B91C1C]",
              warning: "!border-l-4 !border-l-[#92400E]",
              info:    "!border-l-4 !border-l-[#C8521A]",
            },
          }}
        />
      </body>
    </html>
  );
}
