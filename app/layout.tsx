import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://blablagym.netlify.app"),
  title: "Bla Bla GYM",
  description: "Ameliore ton expression orale en francais",
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    images: ["/favicon.svg"],
  },
  twitter: {
    images: ["/favicon.svg"],
  },
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