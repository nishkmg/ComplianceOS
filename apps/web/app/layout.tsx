import type { Metadata } from "next";
import { validateEnv } from "@complianceos/shared/lib/env";
import "./globals.css";

validateEnv();

export const metadata: Metadata = {
  title: "Arthvahi | Precision in Indian Accounting",
  description: "Double-entry accounting, GST, payroll and ITR — built from scratch for how Indian businesses actually work.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        {/* Fonts loaded via @fontsource packages in globals.css — no CDN requests needed */}
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
