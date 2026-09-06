import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Global Reserve Currency | Educational Slide Deck",
  description:
    "An interactive educational presentation on FX rates, inflation, the gold standard, Bretton Woods, and why the dollar remains the world’s reserve currency.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
