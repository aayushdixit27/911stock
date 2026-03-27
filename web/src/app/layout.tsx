import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const mono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "911Stock — Your portfolio, watched.",
  description: "AI agent that watches your stocks 24/7 and calls you when something matters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mono.className} bg-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
