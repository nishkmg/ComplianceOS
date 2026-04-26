// @ts-nocheck
import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "ComplianceOS | Precision in Indian Accounting",
  description: "Double-entry accounting, GST, payroll and ITR — built from scratch for how Indian businesses actually work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
