import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: "Pinboard",
  description: "Discover and save beautiful visual ideas."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Suspense fallback={<div className="h-14 border-b border-white/10" />}>
            <TopNav />
          </Suspense>
          <main className="container-page py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

