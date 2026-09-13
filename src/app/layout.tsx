import type { Metadata } from "next";
import { Sora, Public_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora"
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-public-sans"
});

export const metadata: Metadata = {
  title: {
    default: "Goudoussy Diallo",
    template: "%s — Goudoussy Diallo"
  },
  description:
    "Site officiel de Goudoussy Diallo : parcours, responsabilités, engagements sportifs et institutionnels au service de la Guinée et de sa jeunesse.",
  openGraph: {
    title: "Goudoussy Diallo",
    description:
      "Parcours, responsabilités et actions de Goudoussy Diallo au service de la Guinée et de sa jeunesse.",
    type: "website",
    locale: "fr_GN"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${sora.variable} ${publicSans.variable}`}>
      <body className="font-sans antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
