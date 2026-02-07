import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Swipe & Gamble - Tinder x Game Theory x Gambling",
  description: "A game where you swipe like Tinder, but every choice has game theory payoffs and you can bet on outcomes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-neutral-950 text-white">
        {children}
      </body>
    </html>
  );
}
