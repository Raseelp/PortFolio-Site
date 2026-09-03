import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { GradualBlur } from "@/components/ui/GradualBlur";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { GrainOverlay } from "@/components/ui/GrainOverlay";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { SnakeToggle } from "@/components/ui/SnakeToggle";
import { siteUrl } from "@/lib/content";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Muhammed Raseel P | Flutter Developer";
const description =
  "Flutter developer curious about how software actually works — from native Android internals to offline machine learning and audio systems.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL(siteUrl),
  openGraph: {
    title,
    description,
    type: "website",
    url: siteUrl,
    siteName: title,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      {/* General Sans: the closest free match to the reference site's
          Degular (a paid commercial face we're not licensed to embed). */}
      <link rel="preconnect" href="https://api.fontshare.com" />
      <link
        rel="stylesheet"
        href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700,800&display=swap"
        precedence="default"
      />
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        <SmoothScroll />
        <CustomCursor />
        <SoundToggle />
        <SnakeToggle />
        {children}
        <GradualBlur />
        <GrainOverlay />
      </body>
    </html>
  );
}
