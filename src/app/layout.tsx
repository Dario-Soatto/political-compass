import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Political Compass",
  description: "Analyze political alignment through Twitter data and social media insights",
  keywords: ["political compass", "twitter analysis", "political alignment", "social media"],
  authors: [{ name: "Your Name" }],
  creator: "Your Name",
  openGraph: {
    title: "Political Compass",
    description: "Analyze political alignment through Twitter data and social media insights",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Political Compass",
    description: "Analyze political alignment through Twitter data and social media insights",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
