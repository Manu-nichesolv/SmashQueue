import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "animate.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmashQueue",
  description: "Fair badminton rotations for the court you booked.",
  applicationName: "SmashQueue",
  appleWebApp: {
    capable: true,
    title: "SmashQueue",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1f7a4d",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
