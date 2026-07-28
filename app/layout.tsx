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
      default: "Unstash — local Reddit import is live",
      template: "%s · Unstash",
    },
    description:
      "Import Reddit saves into a private, local-first action queue without login, OAuth or upload.",
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
      title: "Reddit import is live — private, local and open source",
      description:
        "Import Reddit's official saved-post CSV locally. No login, OAuth token or upload.",
      url: origin,
      siteName: "Unstash",
      images: [
        {
          url: `${origin}/og-reddit-import.png`,
          width: 1536,
          height: 1024,
          alt: "Unstash — Reddit import is live, private and local-first",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Reddit import is live — private, local and open source",
      description:
        "Import Reddit saves locally without login, OAuth or upload.",
      images: [`${origin}/og-reddit-import.png`],
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
