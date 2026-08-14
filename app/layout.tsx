import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") || requestHeaders.get("host") || "srveloso.adv.br";
  const protocol = requestHeaders.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return {
  metadataBase: new URL(`${protocol}://${host}`),
  title: { default: "Salomão Rezende Veloso Advocacia", template: "%s | SRV Advocacia" },
  description: "Estratégia jurídica, profundidade técnica e visão de contexto para decisões que movem negócios e instituições.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Salomão Rezende Veloso Advocacia",
    description: "Direito em movimento. Estratégia para decisões relevantes.",
    locale: "pt_BR",
    type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Salomão Rezende Veloso Advocacia — Direito em movimento" }],
  },
  twitter: { card: "summary_large_image", title: "Salomão Rezende Veloso Advocacia", description: "Direito em movimento. Estratégia para decisões relevantes.", images: ["/og.png"] },
  icons: { icon: "/srv-logo.png", shortcut: "/srv-logo.png" },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={geist.variable}>{children}</body>
    </html>
  );
}
