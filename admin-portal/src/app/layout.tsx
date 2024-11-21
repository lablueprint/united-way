import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "United Way Admin Portal",
  description: "Organization front to manage event organization and view logistical data.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
