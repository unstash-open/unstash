import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwardedHost ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (host.startsWith("localhost") ? "http" : "https");
  const origin = `${protocol}://${host}`;

  return {
    metadataBase: new URL(origin),
    title: {
      default: "Unstash — turn saved posts into things you use",
      template: "%s · Unstash",
    },
    description:
      "A private, local-first queue that turns saved links into clear next steps.",
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
      canonical: origin,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      title: "Saved ≠ used. Unstash fixes the loop.",
      description:
        "Turn saved links into a private queue of things you will actually read, make and keep.",
      url: origin,
      siteName: "Unstash",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1536,
          height: 1024,
          alt: "Unstash — private local-first queue with a 500 USDT Reddit import milestone",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Saved ≠ used. Unstash fixes the loop.",
      description:
        "A private, local-first knowledge queue for the posts you meant to use.",
      images: [`${origin}/og.png`],
    },
  };
}

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
