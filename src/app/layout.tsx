import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { OfflineBar, Toasts } from "@/components/feedback";
import "./globals.css";

const sans = Geist({ variable: "--f-sans", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--f-mono", subsets: ["latin"] });
const serif = Instrument_Serif({ variable: "--f-serif", subsets: ["latin"], weight: "400" });

export const metadata: Metadata = {
  title: "Delta",
  description: "Meme tokens and tokenized stocks, explained before you trade.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f4" },
    { media: "(prefers-color-scheme: dark)", color: "#14130f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable}`}>
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
