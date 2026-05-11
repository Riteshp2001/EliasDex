// src/app/layout.js
import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "EliasDex | Watch Free Anime, Online Anime Streaming - eliasdex",
  description:
    "eliasdex to is a free no ads anime site to watch free anime. Online anime streaming at eliasdex with DUB, SUB in HD eliasdex.shop, Anix, 9anime, Zoro, Animixplay.",
  keywords:
    "eliasdex, eliasdex to, aniwatch, zorox, zoro anime, zoro to, zoroxtv, watch anime online free, free watch anime, anime online to watch",
  robots: "index, follow",
  openGraph: {
    title: "eliasdex | Watch Free Anime, Online Anime Streaming - eliasdex",
    description:
      "eliasdex to is a free no ads anime site to watch free anime. Online anime streaming at eliasdex with DUB, SUB in HD.",
    images: ["/images/preview.jpg"],
    type: "website",
  },
  icons: {
    icon: "/images/favicon1.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
