"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import SkeletonLoader from "../SkeletonLoader";

const CardTrendingComic = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false; // flag unmount

    const fetchTrending = async () => {
      try {
        // loading sudah true di awal, jadi tidak perlu set lagi
        const response = await axios.get("https://www.sankavollerei.com/comic/trending");
        if (cancelled) return;

        const rawComics = response.data.trending || [];
        const processedComics = rawComics
          .filter(
            (item) =>
              !item.title.toLowerCase().includes("apk") &&
              !item.chapter.toLowerCase().includes("download")
          )
          .map((comic) => {
            const slug = comic.title
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-+|-+$/g, "");
            const link = comic.link.replace("/manga/", "/").replace("/plus/", "/");
            return {
              ...comic,
              image:
                comic.image && !comic.image.includes("lazy.jpg")
                  ? comic.image
                  : "https://via.placeholder.com/300x450?text=No+Cover",
              processedLink: link,
              slug,
              source: comic.timeframe || "-",
              popularity: comic.trending_score || 0,
            };
          });

        if (!cancelled) setComics(processedComics);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrending();

    return () => {
      cancelled = true;
    };
  }, []); // hanya dijalankan sekali saat mount

  const handleComicDetail = (comic) => {
    const queryParams = new URLSearchParams({
      title: comic.title,
      image: comic.image,
      chapter: comic.chapter,
      source: comic.source,
      processedLink: comic.processedLink,
      popularity: comic.popularity,
    }).toString();
    router.push(`/comic/${comic.slug}?${queryParams}`);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SkeletonLoader count={12} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 text-center text-red-500">
        Gagal memuat data trending.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1 font-medium">
            Chart
          </p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            Trending
          </h2>
        </div>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800 mx-6 hidden sm:block"></div>
        <span className="text-xs text-gray-400">{comics.length} komik</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {comics.map((comic, index) => (
          <div
            key={comic.slug}
            className="group cursor-pointer"
            onClick={() => handleComicDetail(comic)}
          >
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-2">
              <Image
                src={comic.image}
                alt={comic.title}
                fill
                sizes="(max-width: 640px) 50vw, 15vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={index < 6}
              />
              {index < 3 && (
                <div className="absolute top-0 left-0 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 w-7 h-7 flex items-center justify-center z-10 rounded-br-lg font-black text-[11px]">
                  #{index + 1}
                </div>
              )}
              <div className="absolute top-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1 z-10 rounded-bl-lg">
                <span className="text-[9px] text-gray-200 font-bold">
                  {comic.popularity}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-all duration-300 z-10">
                <p className="text-[9px] text-gray-100 font-medium truncate">
                  {comic.chapter}
                </p>
              </div>
            </div>
            <h3 className="text-xs font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-snug mb-0.5">
              {comic.title}
            </h3>
            <p className="text-[10px] text-gray-400 italic opacity-70 uppercase">
              {comic.source}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardTrendingComic;