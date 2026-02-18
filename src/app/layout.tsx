import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { SHOP_CONFIG } from "../config/shop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: SHOP_CONFIG.shopName,
    template: `%s | ${SHOP_CONFIG.shopName}`,
  },
  description: SHOP_CONFIG.tagline,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: SHOP_CONFIG.shopName,
    description: SHOP_CONFIG.tagline,
    url: "/",
    siteName: SHOP_CONFIG.shopName,
  },
  twitter: {
    card: "summary",
    title: SHOP_CONFIG.shopName,
    description: SHOP_CONFIG.tagline,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
