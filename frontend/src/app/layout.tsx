import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RealState AI",
  description: "AI-powered real estate platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
