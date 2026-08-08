import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Sans,
  IBM_Plex_Mono,
  IBM_Plex_Serif,
  IBM_Plex_Sans_Devanagari,
} from "next/font/google";
import { validateEnv } from "@complianceos/shared/lib/env";
import "./globals.css";

validateEnv();

// IBM Plex family — self-hosted via next/font (no render-blocking, subsets,
// font-display: swap). The display serif is reserved for marketing + statutory
// report letterheads; Devanagari covers the `hi` locale (next-intl).
const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui-family",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono-family",
  display: "swap",
});

const plexSerif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-display-family",
  display: "swap",
});

const plexDevanagari = IBM_Plex_Sans_Devanagari({
  subsets: ["devanagari"],
  weight: ["400", "600"],
  variable: "--font-devanagari-family",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Arthvahi | Precision in Indian Accounting",
  description:
    "Double-entry accounting, GST, payroll and ITR — built from scratch for how Indian businesses actually work.",
};

export const viewport: Viewport = {
  themeColor: "#18181B",
  colorScheme: "light dark",
};

// No-flash theme bootstrap: applies stored theme before first paint.
// The toggle (components/app/theme-toggle.tsx) writes localStorage + data-theme.
const themeBootstrap = `(function(){try{var t=localStorage.getItem("theme");var d=document.documentElement;if(!t)t="light";d.dataset.theme=t==="system"?(window.matchMedia&&window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t;}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} ${plexSerif.variable} ${plexDevanagari.variable} scroll-smooth`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
