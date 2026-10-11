import type { Metadata, Viewport } from "next";
import { framerCss } from "@/site/generated/framer-css";
import { siteMeta } from "@/site/generated/meta";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL ?? "https://www.reveliolabs.app"),
  title: siteMeta.title,
  description: siteMeta.description,
  icons: { icon: siteMeta.icon },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: siteMeta.title,
    description: siteMeta.description,
    images: siteMeta.ogImage
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
    images: siteMeta.ogImage
  }
};

export const viewport: Viewport = {
  width: "device-width"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" dir="ltr">
      <head>
        <link rel="preload" href="/assets/fonts/gNMZW3F-SZuj7zOT0IfSjTS16cPhxx-ZtxFMQWXgSQ.woff2" as="font" type="font/woff2" crossOrigin="" />
        <style dangerouslySetInnerHTML={{ __html: framerCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
