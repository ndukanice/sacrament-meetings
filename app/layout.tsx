import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteDescription =
  "Plan, review, and print sacrament meeting programs for the Isolo Ward, Lagos-Ikotun Stake of Zion.";

// Site-wide defaults. Pages can override any of these; a page's `title`
// fills the %s in the template ("All Meetings · Sacrament Meetings").
export const metadata: Metadata = {
  metadataBase: new URL("https://sacrament-meeting-azure.vercel.app"),
  title: {
    default: "Sacrament Meetings · Isolo Ward",
    template: "%s · Sacrament Meetings",
  },
  description: siteDescription,
  applicationName: "Sacrament Meetings",
  openGraph: {
    type: "website",
    siteName: "Sacrament Meetings · Isolo Ward",
    title: "Sacrament Meetings · Isolo Ward",
    description: siteDescription,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-slate-100 text-slate-800 antialiased">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
