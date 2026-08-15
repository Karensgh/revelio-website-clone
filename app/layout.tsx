import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Revelio - Help your fintech stay compliant automatically",
  description:
    "Real-time AI agents watch global regulations, auto-update your controls, execute complex tasks, and keep you audit-ready.",
  openGraph: {
    title: "Revelio - Launch Faster. Stay Compliant Forever.",
    description:
      "Automated AML regulatory compliance for fintech startups and enterprises.",
    url: "https://www.reveliolabs.app/",
    siteName: "Revelio",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
