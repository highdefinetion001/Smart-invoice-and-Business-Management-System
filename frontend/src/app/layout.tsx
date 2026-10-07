import type { Metadata } from "next";
import "./globals.css";
import { Inter, Playfair_Display, JetBrains_Mono } from "next/font/google";
import ClientLayout from "./ClientLayout";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontSerif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Smart Invoice — Business Management System",
  description: "Professional invoicing and business management system for managing materials, customers, invoices, payments, expenses, and reports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
