import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

// Montserrat self-hosted via next/font; exposed as the CSS var the tokens use
// as a fallback for the licensed brand font (Avenir LT Pro).
const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global Trade — Catálogo mayorista de pesca, camping y viajes",
  description:
    "Tu socio estratégico en pesca, camping y viajes. Catálogo mayorista con envíos a todo el país.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={montserrat.variable}>
      <body>{children}</body>
    </html>
  );
}
