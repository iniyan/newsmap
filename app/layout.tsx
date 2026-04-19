import type { Metadata, Viewport } from "next";
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
  title: "NewsMap — World News on the Map",
  description: "Explore breaking news from around the world, geographically. Reuters, BBC, Al Jazeera, NY Times and more — visualised as live hotspots on a global map.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_SITE_URL : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'http://localhost:3000'),
  openGraph: {
    title: "NewsMap — World News on the Map",
    description: "Breaking news from every corner of the globe, visualised in real-time.",
    type: "website",
    locale: "en_US",
    siteName: "NewsMap",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NewsMap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsMap — World News on the Map",
    description: "World news as live hotspots on a map. Powered by Reuters, BBC, Al Jazeera & more.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-gray-950">{children}</body>
    </html>
  );
}
