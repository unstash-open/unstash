import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PROJECT } from "../lib/project";
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
    default: "Unstash — turn saved links into next steps",
    template: "%s · Unstash",
  },
  description:
    "Capture a tab or import Reddit saves into a private local-first action queue without an account or remote vault.",
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
    title: "Unstash Capture 0.1 — one permission, private by default",
    description:
      "Capture the active tab or import Reddit CSV files into a private local queue.",
    url: PROJECT.siteUrl,
    siteName: "Unstash",
    images: [
      {
        url: `${PROJECT.siteUrl}/og-extension.png`,
        width: 1536,
        height: 1024,
        alt: "Unstash Capture 0.1 — save the tab and pick what happens next",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Unstash Capture 0.1",
    description:
      "Save the active tab with one permission and no remote vault.",
    images: [`${PROJECT.siteUrl}/og-extension.png`],
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
      </body>
    </html>
  );
}
