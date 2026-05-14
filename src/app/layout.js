import { Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-nunito",
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "EliasDex Watch Free Anime, Online Anime Streaming",
  description:
    "Nonton anime & baca komik gratis di eliasdex! Streaming HD Sub/Dub tanpa iklan. Akses cepat manga & komunitas anime terbaik. Platform karya Irvan Farel Hanafi.",
  keywords:
    "eliasdex, aniwatch, zorox, zoro anime, zoro to, zoroxtv, watch anime online free, free watch anime, anime online to watch, anime indonesia, anime sub indo, streaming anime gratis, manga online gratis, baca komik, Irvan Farael Hanafi, Farel Hanafi, Irvan Farel, Irvan Farael",
  robots: "index, follow",
  alternates: {
    canonical: "/",
  },
  verification: {
    google: "HoZgwYJz6Z5gjLcl6I91BN6MIOZDP9jMApEHGsJidqM",
  },
  openGraph: {
    title: "EliasDex Watch Free Anime, Online Anime Streaming",
    description:
      "Nonton anime & baca komik gratis di eliasdex! Streaming HD Sub/Dub tanpa iklan. Akses cepat manga & komunitas anime terbaik. Platform karya Irvan Farel Hanafi.",
    images: ["/images/preview.jpg"],
    type: "website",
    url: baseUrl,
  },
  icons: {
    icon: "/images/favicon1.png",
  },
};

export default function RootLayout({ children }) {
  // Data Terstruktur dalam bentuk Object
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EliasDex",
    "url": baseUrl,
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${baseUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    },
    "author": {
      "@type": "Person",
      "name": "Irvan Farel Hanafi"
    }
  };

  return (
    <html lang="id" className={nunito.variable}>
      <body className={nunito.className} suppressHydrationWarning={true}>
        {/* Injeksi Structured Data ke dalam Head secara otomatis via script tag */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>

        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
