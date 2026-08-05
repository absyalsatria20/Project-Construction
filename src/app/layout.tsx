import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { ToastContainer } from "@/components/ToastContainer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ONELITO PROJECT",
  description: "Aplikasi administrasi proyek pembangunan modern.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen`}
      >
        <ErrorBoundary>
          <AppProvider>
            {children}
            <ToastContainer />
          </AppProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
