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
  title: "Muhammed Raseel P | Flutter Developer",
  description:
    "Flutter developer shipping production jewellery ERP apps, building offline machine learning and native Android systems on the side.",
  metadataBase: new URL("https://raseel.dev"),
  openGraph: {
    title: "Muhammed Raseel P | Flutter Developer",
    description:
      "Flutter developer shipping production jewellery ERP apps, building offline machine learning and native Android systems on the side.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg font-sans">
        {children}
      </body>
    </html>
  );
}
