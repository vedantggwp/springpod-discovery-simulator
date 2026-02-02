import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SpaceBackground } from "@/components/SpaceBackground";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

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
    <html lang="en">
      <body className={`${inter.variable} font-body antialiased text-white`}>
        <SpaceBackground />
        <div className="relative z-10 min-h-screen">{children}</div>
      </body>
    </html>
  );
}
