import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgentPay",
  description: "Agent-native API discovery, comparison, and x402 payment on Base.",
  other: {
    "talentapp:project_verification":
      "8692270485abc6191234e5fd2d861ee7514c87884a8b12e1123099f0185580a0bce23acf4b75952cea63a5e2a6300ede9a0c4e3c57d94f0da42b6ced8a10e839",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
