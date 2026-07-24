import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Fraunces é a fonte de headline da marca (itálico incluso).
const fraunces = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
  style: ["italic", "normal"],
  axes: ["opsz", "SOFT", "WONK"],
});

// General Sans (Fontshare) ainda não foi entregue — Inter é um
// substituto temporário só na variável de fonte, mesma solução do
// mixa-catalogo. Trocar depois: baixar os arquivos da General Sans,
// servir via next/font/local e apontar --font-body para eles.
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mixa",
  description: "Seu look do dia, pronto — todo dia.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Mixa",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f1ece1" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1b19" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fraunces.variable} ${bodyFont.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
