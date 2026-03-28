import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Braden.Biz",
  description: "Braden.Biz's virtual plaza.",
  openGraph: {
    title: "Braden.Biz",
    description: "Braden.Biz's virtual plaza.",
    images: ["/favicon.png"],
    url: "https://braden.biz/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navigation />
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
