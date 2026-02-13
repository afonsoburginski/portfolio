import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CalProvider } from "@/components/cal-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Afonso Burginski - Desenvolvedor Full Stack",
  description: "Portfolio de Afonso Burginski - Desenvolvedor Full Stack especializado em Next.js, React e tecnologias modernas",
  keywords: ["Afonso Burginski", "desenvolvedor", "full stack", "Next.js", "React", "portfolio"],
  authors: [{ name: "Afonso Burginski", url: "https://github.com/afonsoburginski" }],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://www.afonsodev.com",
    title: "Afonso Burginski - Desenvolvedor Full Stack",
    description: "Portfolio de Afonso Burginski - Desenvolvedor Full Stack",
    siteName: "Afonso Burginski",
  },
  twitter: {
    card: "summary_large_image",
    title: "Afonso Burginski - Desenvolvedor Full Stack",
    description: "Portfolio de Afonso Burginski - Desenvolvedor Full Stack",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <CalProvider>
          {children}
        </CalProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
