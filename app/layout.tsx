import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SpaceBackground } from "@/components/SpaceBackground";

export const metadata: Metadata = {
  title: "Springpod Discovery Simulator",
  description: "Interview virtual clients to uncover business requirements",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`min-h-full ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-body antialiased text-white min-h-full">
        <SpaceBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
