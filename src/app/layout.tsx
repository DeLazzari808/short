import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/ClientLayout";

export const metadata: Metadata = {
  title: "Short - Swipe. Predict. Earn.",
  description: "O Tinder com mecânica de prediction. Faça previsões, ganhe pontos e troque por ativos digitais.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased bg-neutral-950 text-white">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
