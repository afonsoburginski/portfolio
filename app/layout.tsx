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
  title: "Afonso Burginski — Senior Software Engineer | Video Streaming & Platform Engineering",
  description: "Afonso Burginski is a Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering.",
  keywords: ["Afonso Burginski", "Senior Software Engineer", "video streaming", "distributed systems", "platform engineering", "WebRTC", "Kubernetes"],
  authors: [{ name: "Afonso Burginski", url: "https://github.com/afonsoburginski" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.afonsodev.com",
    title: "Afonso Burginski — Senior Software Engineer | Video Streaming & Platform Engineering",
    description: "Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering.",
    siteName: "Afonso Burginski",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afonso Burginski — Senior Software Engineer | Video Streaming & Platform Engineering",
    description: "Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <CalProvider>
          {children}
        </CalProvider>
      </body>
    </html>
  );
}
