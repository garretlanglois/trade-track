import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Trade Tracker | Hockey Fantasy League",
  description: "Manage and trade your fantasy hockey draft picks with league members",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
