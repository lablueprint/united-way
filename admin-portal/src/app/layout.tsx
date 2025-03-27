import type { Metadata } from "next";
import "./globals.css";
import ReduxProvider from "./_utils/redux/reduxProvider"

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
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
