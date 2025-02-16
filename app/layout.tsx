import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThirdwebProvider } from "thirdweb/react";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Thirdweb SDK + Next.js Starter",
  description: "Starter template for using Thirdweb SDK with Next.js App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-800 min-h-screen flex flex-col`}>
        <ThirdwebProvider>
          <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container max-w-full mx-auto px-4 py-3">
              <Navbar />
            </div>
          </header>
          <main className="flex-1 container max-w-full mx-auto px-4 py-6">
            {children}
          </main>
          <footer className="bg-gray-800 text-gray-200 py-4 mt-6">
            <div className="container max-w-full mx-auto text-center">
              <p className="text-sm">&copy; {new Date().getFullYear()} Thirdweb SDK Starter. All rights reserved.</p>
            </div>
          </footer>
        </ThirdwebProvider>
      </body>
    </html>
  );
}
