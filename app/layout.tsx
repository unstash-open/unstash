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
      "A private, local-first knowledge queue for saved posts—built in public and voluntarily funded.",
    applicationName: "Unstash",
    openGraph: {
      type: "website",
      title: "Saved ≠ used. Unstash fixes the loop.",
      description:
        "Try the private prototype and follow the transparent 10,000 USDT open-source roadmap.",
      url: origin,
      siteName: "Unstash",
      images: [
        {
          url: `${origin}/og.png`,
          width: 1536,
          height: 1024,
          alt: "Unstash — saved does not mean used",
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
