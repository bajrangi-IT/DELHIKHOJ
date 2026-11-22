import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SmoothScroll from "@/components/SmoothScroll";
import { getCurrentUser } from "@/lib/auth";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: "THE DELHI KI KHOJ — Discover Delhi's heritage", template: "%s · THE DELHI KI KHOJ" },
  description: "Discover Delhi. Experience its history. Support its people. Immersive heritage discovery, trip planning, local guides and artisans.",
  openGraph: { title: "THE DELHI KI KHOJ", description: "Discover Delhi. Experience Its History. Support Its People.", type: "website", images: ["/assets/hero/delhi-hero-panoramic.jpg"] },
  alternates: { canonical: "/" },
};
export const viewport: Viewport = { themeColor: "#11100E", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Noto+Sans+Devanagari:wght@400;500;600&family=Noto+Serif+Devanagari:wght@500;600&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Navbar user={user ? { fullName: user.fullName, role: user.role } : null} />
        <SmoothScroll />
        <main id="main" className="min-h-screen pt-16">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
