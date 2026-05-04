import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Morpho Yield Agent — Dashboard",
  description: "Live monitoring for the Morpho yield optimizer agent on Base.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
