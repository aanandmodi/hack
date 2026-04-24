import type { Metadata } from "next";
import { Noto_Serif, Manrope } from "next/font/google";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "StadiumIQ — Operational Intelligence Platform",
  description:
    "AI-powered venue intelligence for real-time crowd flow analysis, personnel deployment, and operational decision-making across 65,000+ capacity stadiums.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${notoSerif.variable} ${manrope.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#fbf9f5] text-[#1b1c1a]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
