import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { OfflineBar, Toasts } from "@/components/feedback";
import "./globals.css";

const inter = Inter({ variable: "--f-inter", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Delta",
  description: "Meme tokens and tokenized stocks, explained before you trade.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f4f8" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1017" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <StoreProvider>
          <div className="frame">
            <a href="#content" className="skip-link">Skip to content</a>
            <OfflineBar />
            {children}
            <Toasts />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
