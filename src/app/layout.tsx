import type { Metadata } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { SoundToggle } from "@/components/ui/SoundToggle";
import { SnakeToggle } from "@/components/ui/SnakeToggle";
import { siteUrl } from "@/lib/content";

// Bricolage Grotesque for headings (a characterful, slightly quirky
// grotesque) over Plus Jakarta Sans for body copy; both self-hosted by
// next/font (no third-party stylesheet request).
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

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
    <html lang="en" className={`${bricolage.variable} ${jakarta.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        <SmoothScroll />
        <CustomCursor />
        <SoundToggle />
        <SnakeToggle />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
