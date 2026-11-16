import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Private PDF Tools | Secure PDF Processing",
  description: "Merge, Split, Compress, and Convert PDFs securely with Cloud Storage.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0f1117] text-gray-100 min-h-screen flex`}>
        <Sidebar />
        <main className="flex-1 flex flex-col p-8 overflow-y-auto">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
