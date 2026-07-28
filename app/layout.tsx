import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PROJECT } from "../lib/project";
import { PrivacyAnalytics } from "./components/PrivacyAnalytics";
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
  metadataBase: new URL(PROJECT.siteUrl),
  title: {
    default: "Unstash — one tab, one next step",
    template: "%s · Unstash",
  },
  description:
    "Capture the current tab or import Reddit saves into a private local-first action queue with activeTab only.",
  applicationName: "Unstash",
  keywords: [
    "bookmark manager",
    "local-first",
    "saved links",
    "personal knowledge management",
    "productivity",
    "open source",
  ],
  alternates: {
    canonical: PROJECT.siteUrl,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    title: "Unstash 0.1 — one tab, one next step",
    description:
      "Capture the current tab or import Reddit CSV files into a private local queue with activeTab only.",
    url: PROJECT.siteUrl,
    siteName: "Unstash",
    images: [
      {
        url: `${PROJECT.siteUrl}/og-launch.jpg`,
        width: 1536,
        height: 1024,
        alt: "Unstash 0.1 — one tab, one next step",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstash 0.1 — one tab, one next step",
    description:
      "Save the current tab with one permission and no remote vault.",
    images: [`${PROJECT.siteUrl}/og-launch.jpg`],
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f0e6",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <PrivacyAnalytics />
      </body>
    </html>
  );
}
