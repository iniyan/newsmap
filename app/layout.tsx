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
  title: "NewsMap — Tamil News on the Map",
  description: "Explore Tamil news events geographically in real-time. News from BBC Tamil, Vikatan, Kalki, Puthiya Thalaimurai — visualised as hotspots on a live map.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_SITE_URL : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'http://localhost:3000'),
  openGraph: {
    title: "NewsMap — Tamil News on the Map",
    description: "Explore Tamil news events geographically in real-time.",
    type: "website",
    locale: "ta_IN",
    siteName: "NewsMap",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "NewsMap" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NewsMap — Tamil News on the Map",
    description: "Tamil news visualised as live hotspots on a map.",
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
      lang="ta"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full w-full overflow-hidden bg-gray-950">{children}</body>
    </html>
  );
}
