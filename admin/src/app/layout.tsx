import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "PhysioAdmin — Super Admin Panel", template: "%s | PhysioAdmin" },
  description: "Multi-tenant SaaS management panel for PhysioClinic platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </head>
      <body className="antialiased min-h-screen" style={{ fontFamily: "var(--font-jakarta, sans-serif)" }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
