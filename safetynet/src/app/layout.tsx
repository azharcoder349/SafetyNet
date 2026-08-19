import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SafetyProvider } from "@/context/SafetyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SafetyNet",
  description: "AI Check-In & SOS Copilot",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} state-safe transition-colors duration-500 min-h-screen`}>
        <SafetyProvider>
          {children}
        </SafetyProvider>
      </body>
    </html>
  );
}
