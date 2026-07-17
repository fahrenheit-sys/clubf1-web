import type { Metadata } from "next";
import { Fraunces, Inter, DM_Mono } from "next/font/google";
import "./globals.css";
import Analytics from "./analytics";

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
  metadataBase: new URL("https://www.clubf1.com.au"),
  title: "Fahrenheit One @ Hakoah Paddington — Launching Soon",
  description:
    "A premium fitness and wellness club coming to Hakoah Paddington, April 2027. Follow the journey and be first through the doors.",
  openGraph: {
    title: "Fahrenheit One @ Hakoah Paddington — Launching Soon",
    description: "Something extraordinary is coming. Opening April 2027.",
    type: "website",
    url: "https://www.clubf1.com.au",
  },
  // Root brand page is public/indexable; campaign pages (/community, /local)
  // set their own robots:noindex.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
