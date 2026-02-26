import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Parole Libre",
  description: "Ameliore ton expression orale en francais",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}