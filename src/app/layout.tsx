import type { Metadata, Viewport } from "next";
import { Cinzel_Decorative, Nunito } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

const cinzel = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  variable: "--font-heading",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "JomKahwin!",
  description: "Apps perancang perkahwinan yang minimalis, teratur, dan memudahkan.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#F4ACB7",
};

import QueryProvider from "@/components/providers/query-provider";
import { UserProvider } from "@/components/providers/user-provider";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ms" suppressHydrationWarning>
      <body className={clsx(cinzel.variable, nunito.variable, "antialiased font-body bg-background text-foreground")}>
        <QueryProvider>
          <ToastProvider>
            <UserProvider>
              {children}
              <Toaster />
            </UserProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
