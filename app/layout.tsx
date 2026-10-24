import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CalProvider } from "@/components/cal-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Afonso Burginski — Senior Software Engineer | Video Streaming · Distributed Systems · Platform Engineering",
  description: "Senior Software Engineer specializing in video streaming, real-time media, and distributed systems. I design, build, and operate software end to end, connecting backend architecture, platform engineering, and user-facing applications with a focus on reliability, performance, and sustainable complexity.",
  keywords: ["Afonso Burginski", "Senior Software Engineer", "video streaming", "real-time media", "distributed systems", "platform engineering", "WebRTC", "Kubernetes"],
  authors: [{ name: "Afonso Burginski", url: "https://github.com/afonsoburginski" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.afonsodev.com",
    title: "Afonso Burginski — Senior Software Engineer | Video Streaming · Distributed Systems · Platform Engineering",
    description: "Senior Software Engineer specializing in video streaming, real-time media, and distributed systems. I design, build, and operate software end to end, connecting backend architecture, platform engineering, and user-facing applications with a focus on reliability, performance, and sustainable complexity.",
    siteName: "Afonso Burginski",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afonso Burginski — Senior Software Engineer | Video Streaming · Distributed Systems · Platform Engineering",
    description: "Senior Software Engineer specializing in video streaming, real-time media, and distributed systems. I design, build, and operate software end to end, connecting backend architecture, platform engineering, and user-facing applications with a focus on reliability, performance, and sustainable complexity.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <CalProvider>
          {children}
        </CalProvider>
      </body>
    </html>
  );
}
