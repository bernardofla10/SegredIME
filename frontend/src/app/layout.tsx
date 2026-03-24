import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SegredIME | Gestão de Cofres",
  description: "Sistema de Gestão de Criptografia e Cofre de Senhas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className={`${inter.className} min-h-full flex bg-background`}>
        <Sidebar />
        <main className="flex-1 overflow-auto h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
