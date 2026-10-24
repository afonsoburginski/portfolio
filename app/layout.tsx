import type { Metadata } from "next";
import { Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { CalProvider } from "@/components/cal-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Afonso Burginski — Senior Software Engineer", template: "%s | Afonso Burginski" },
  description: "Senior Software Engineer specializing in video streaming, distributed systems, and platform engineering.",
  keywords: ["Afonso Burginski", "video streaming", "distributed systems", "platform engineering"],
  authors: [{ name: "Afonso Burginski", url: "https://github.com/afonsoburginski" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.afonsodev.com",
    title: "Afonso Burginski — Senior Software Engineer",
    description: "Video streaming, distributed systems, and platform engineering.",
    siteName: "Afonso Burginski",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afonso Burginski — Senior Software Engineer",
    description: "Video streaming, distributed systems, and platform engineering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${plexMono.variable} font-sans antialiased`}>
        <CalProvider>
          {children}
        </CalProvider>
      </body>
    </html>
  );
}
