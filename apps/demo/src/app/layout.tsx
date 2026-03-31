import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AnalyticsWrapper } from "@/components/AnalyticsWrapper";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gems.m3000.io"),
  title: "@m3000/hashed-gems",
  description:
    "Deterministic gemstone avatars, uniquely yours — infinitely shimmering.",
  openGraph: {
    title: "@m3000/hashed-gems",
    description:
      "Deterministic gemstone avatars, uniquely yours — infinitely shimmering.",
    type: "website",
    url: "https://gems.m3000.io",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "@m3000/hashed-gems",
    description:
      "Deterministic gemstone avatars, uniquely yours — infinitely shimmering.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <AnalyticsWrapper />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
