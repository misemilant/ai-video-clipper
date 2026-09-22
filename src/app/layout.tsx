import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Short Video Clipper",
  description: "Ubah video panjang menjadi klip viral secara otomatis dengan AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
