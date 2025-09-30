import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Discord modal builder",
  description: "Generate JSON for discord modals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className='antialiased'
      >
        {children}
      </body>
    </html>
  );
}
