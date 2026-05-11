"use client";

import Head from "next/head";
import SearchComic from "@/components/comic/Home/SearchComic";
import CardTerbaruComic from "@/components/comic/Home/CardTerbaruComic";
import CardTrendingComic from "@/components/comic/Home/CardTrendingComic";
import Footer from "@/components/Footer";

export default function Home() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <Head>
        <title>EliasDex — Baca Komik Gratis Bahasa Indonesia</title>
        <meta
          name="description"
          content="Baca komik online gratis di EliasDex. Koleksi lengkap komik terbaru, trending, dan populer dalam bahasa Indonesia."
        />
        <meta
          name="keywords"
          content="komik indonesia, baca komik gratis, komik online, manga indonesia, manhwa indonesia"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="canonical" href="https://eliasdex.farelhanafi.my.id/" />
      </Head>

      <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 transition-colors">
        {/* Thin top accent line */}
        <div className="w-full h-px bg-gray-900 dark:bg-gray-100"></div>

        <div className="relative">
          {/* Search / Hero */}
          <div className="pt-6 pb-2">
            <SearchComic />
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          {/* Terbaru */}
          <div className="py-2">
            <CardTerbaruComic />
          </div>

          {/* Divider */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="border-t border-gray-100 dark:border-gray-800"></div>
          </div>

          {/* Trending */}
          <div className="py-2">
            <CardTrendingComic />
          </div>

          <Footer />
        </div>
      </div>
    </>
  );
}
