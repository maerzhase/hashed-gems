import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "@m3000/hashed-gems",
  description: "Generative gem avatars for user identification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
