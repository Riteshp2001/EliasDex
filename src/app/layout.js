import { Nunito } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import ClientLayout from "./ClientLayout";

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900", "1000"],
  variable: "--font-nunito",
});

const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: "EliasDex | Watch Free Anime, Online Anime Streaming - eliasdex",
  description:
    "eliasdex is a free no ads anime site to watch free anime. Online anime streaming at eliasdex with DUB, SUB in HD eliasdex, Anix, 9anime, Zoro, Animixplay.",
  keywords:
    "eliasdex, eliasdex to, aniwatch, zorox, zoro anime, zoro to, zoroxtv, watch anime online free, free watch anime, anime online to watch",
  robots: "index, follow",
  openGraph: {
    title: "EliasDex | Watch Free Anime, Online Anime Streaming - eliasdex",
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
    <html lang="en" className={nunito.variable}>
      <body className={nunito.className} suppressHydrationWarning={true}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
