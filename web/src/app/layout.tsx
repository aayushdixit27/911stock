import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "911Stock — Your portfolio, watched.",
  description: "AI agent that watches your stocks 24/7 and calls you when something matters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
