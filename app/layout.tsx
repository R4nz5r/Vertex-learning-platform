import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vertex — AI-powered Learning Platform",
    template: "%s | Vertex",
  },
  description:
    "Vertex is an AI-powered learning platform. Search lessons by topic and jump straight to the exact moment in the video where it's taught.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body suppressHydrationWarning>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}