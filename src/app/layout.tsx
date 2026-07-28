import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Borderline Protocol",
  description: "Synchronization & Signal Network",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
