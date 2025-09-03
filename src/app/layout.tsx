import type { Metadata } from "next";
import "./globals.css";
import { Providers } from './providers'

export const metadata: Metadata = {
  title: "Knowledge Library",
  description: "Personal AI coding knowledge library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <main className="container-center py-10 md:py-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
