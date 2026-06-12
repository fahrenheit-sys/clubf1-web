import type { Metadata } from "next";
import { Fraunces, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const mono = DM_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Fahrenheit One @ Hakoah White City — Founding Members",
  description:
    "A premium fitness and wellness club opening at Hakoah White City, April 2027. Join the founders list and lock in your rate for life.",
  openGraph: {
    title: "Fahrenheit One @ Hakoah White City — Founding Members",
    description: "Our community's club. Be one of its founders. Opening April 2027.",
    type: "website",
  },
  robots: { index: false, follow: false }, // pre-launch — keep out of search until ready
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
