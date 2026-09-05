import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CrmProvider } from "@/context/CrmContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "PAKMEC CRM — Precision Engineering & Multi-Trade Pipeline",
  description: "Internal CRM, Auto-Quoting, Reference Board & Invoicing for PAKMEC Precision Engineering (CNC, 3D Printing, Laser Cutting & CAD).",
  icons: {
    icon: "/pakmec-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0b0e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body className={`${plusJakartaSans.variable} ${jetbrainsMono.variable} antialiased min-h-screen transition-colors duration-200`}>
        <CrmProvider>
          {children}
        </CrmProvider>
      </body>
    </html>
  );
}
