"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import SkeletonLoader from "../SkeletonLoader";
import Image from "next/image";

const CardTerbaruComic = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false; // flag untuk unmount

    const fetchComics = async () => {
      try {
        const response = await axios.get("https://www.sankavollerei.com/comic/terbaru");
        if (cancelled) return;

        const rawComics = response.data.comics || [];
        const filteredComics = rawComics.filter(
          (item) => !item.title.toLowerCase().includes("apk") && !item.chapter.toLowerCase().includes("download"),
        );

        const processedComics = filteredComics.map((comic) => {
          const slug = comic.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const link = comic.link.replace("/manga/", "/").replace("/plus/", "/");
          const imageUrl =
            comic.image && !comic.image.includes("lazy.jpg")
              ? comic.image
              : "https://via.placeholder.com/300x450?text=No+Cover";
          return {
            ...comic,
            image: imageUrl,
            processedLink: link,
            slug,
            source: "Terbaru",
            popularity: "N/A",
          };
        });

        if (!cancelled) setComics(processedComics);
      } catch (err) {
        if (!cancelled) setError(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchComics();

    return () => {
      cancelled = true;
    };
  }, []);

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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">Komik</p>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Terbaru Hari Ini</h2>
          </div>
        </div>
        <SkeletonLoader count={12} type="card" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="border border-red-200 dark:border-red-900 p-6 text-center">
          <p className="text-sm text-red-500">Gagal memuat data. Coba lagi nanti.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase text-gray-400 dark:text-gray-500 mb-1">Komik</p>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Terbaru Hari Ini</h2>
        </div>
        <div className="h-px flex-1 bg-gray-200 dark:bg-gray-800 mx-6"></div>
        <span className="text-xs text-gray-400 flex-shrink-0">{comics.length} komik</span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {comics.map((comic, index) => (
          <div key={comic.slug} className="group cursor-pointer" onClick={() => handleComicDetail(comic)}>
            {/* Cover Container */}
            <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-2">
              <Image
                src={comic.image}
                alt={comic.title}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 20vw, 15vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                priority={index < 6}
              />

              {/* Chapter Overlay (Muncul saat hover) */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-sm px-2 py-1.5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                <p className="text-[9px] text-gray-100 font-medium truncate">{comic.chapter}</p>
              </div>

              {/* Accent Bar (Muncul saat hover) */}
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20"></div>
            </div>

            {/* Info Section */}
            <div className="px-0.5">
              <h3 className="text-xs font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors leading-snug mb-0.5">
                {comic.title}
              </h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate tracking-tight">
                {comic.chapter}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardTerbaruComic;
