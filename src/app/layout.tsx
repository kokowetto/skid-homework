import "../index.css";
import type { Metadata } from "next";
import Providers from "./providers";

import "@/css/jsxgraph.css";

export const metadata: Metadata = {
  title: "Skid Homework",
  description:
    "The open source workaround for self-learners. Time-saving, no telemetry, free.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
