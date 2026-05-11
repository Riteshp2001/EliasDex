"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const cleanImageUrl = (url) => {
  if (!url) return "https://via.placeholder.com/300x450?text=No+Cover";
  try {
    const u = new URL(url);
    return u.origin + u.pathname;
  } catch {
    return "https://via.placeholder.com/300x450?text=No+Cover";
  }
};

const SearchComic = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Ref untuk melacak apakah komponen masih terpasang
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fungsi untuk membuat slug (bisa digunakan juga di tempat lain)
  const createSlug = useCallback((title) => {
    if (!title) return "";
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  // Fungsi untuk mereset seluruh state pencarian
  const resetSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
    setError(null);
    setLoading(false);
  }, []);

  // Effect hanya untuk fetch data – TANPA setState langsung saat query kosong
  useEffect(() => {
    if (!searchQuery.trim()) return;

    const abortController = new AbortController();

    // Gunakan fungsi terpisah untuk handle logic asinkron
    const fetchData = async () => {
      // Pindahkan set state ke sini agar tidak dianggap sinkron oleh React
      setLoading(true);
      setError(null);

      try {
        // Berikan sedikit delay (debounce) agar tidak spam API
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (abortController.signal.aborted) return;

        const response = await axios.get(
          `https://www.sankavollerei.com/comic/search?q=${encodeURIComponent(searchQuery)}`,
          { signal: abortController.signal },
        );

        if (!isMountedRef.current) return;

        const comics = response.data?.data ?? [];
        const processedResults = comics.map((comic) => {
          const slug = createSlug(comic.title);
          const cleanedThumb = cleanImageUrl(comic.thumbnail);
          return { ...comic, thumbnail: cleanedThumb, slug };
        });

        setSearchResults(processedResults);
      } catch (err) {
        if (!axios.isCancel(err) && isMountedRef.current) {
          setError("Gagal memuat hasil pencarian.");
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, [searchQuery, createSlug]);

  const handleComicDetail = useCallback(
    (comic) => {
      const processedLink = comic.href.replace("/comic/", "");
      const queryParams = new URLSearchParams({
        title: comic.title,
        image: comic.thumbnail,
        chapter: comic.description || "Chapter Terbaru",
        source: comic.type,
        link: comic.href,
        popularity: comic.genre || "-",
        processedLink,
      }).toString();
      router.push(`/comic/${comic.slug}?${queryParams}`);
    },
    [router],
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      {/* Header */}
      <div className="text-center mb-10 pt-6">
        <p className="text-[11px] tracking-[0.25em] uppercase text-gray-400 dark:text-gray-500 mb-2 font-medium">
          Selamat datang di
        </p>
        <h1
          className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-gray-900 dark:text-gray-50 leading-none mb-3"
          style={{ fontFamily: "'Georgia', serif", letterSpacing: "-0.03em" }}
        >
          EliasDex
        </h1>
        <div className="w-12 h-px bg-gray-900 dark:bg-gray-100 mx-auto mb-4"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">Temukan dan baca ribuan komik favorit Anda</p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-2xl mx-auto">
        <div className="flex items-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none hover:border-gray-900 dark:hover:border-gray-300 transition-colors duration-200 focus-within:border-gray-900 dark:focus-within:border-gray-100">
          <svg
            className="w-4 h-4 text-gray-400 ml-4 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari judul komik..."
            className="flex-1 px-4 py-3.5 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none text-sm"
          />
          {loading && (
            <div className="px-4">
              <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          )}
          {searchQuery && !loading && (
            <button
              onClick={resetSearch}
              className="px-4 text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-2xl mx-auto mt-4">
          <p className="text-xs text-red-500 text-center">{error}</p>
        </div>
      )}

      {/* Results (hanya tampil jika ada hasil dan query tidak kosong) */}
      {searchResults.length > 0 && searchQuery.trim().length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs tracking-widest uppercase text-gray-400 font-medium">
              {searchResults.length} Hasil Ditemukan
            </span>
            <button
              onClick={resetSearch}
              className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 underline underline-offset-2 transition-colors"
            >
              Tutup
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
            {searchResults.map((comic) => (
              <div
                key={comic.href || comic.slug || comic.title}
                className="group cursor-pointer"
                onClick={() => handleComicDetail(comic)}
              >
                {/* CUKUP SATU WRAPPER SAJA DI SINI */}
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800 mb-2">
                  <Image
                    src={comic.thumbnail}
                    alt={comic.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badge Type */}
                  <div className="absolute top-0 left-0 bg-gray-900/80 dark:bg-gray-100/80 backdrop-blur-sm text-white dark:text-gray-900 px-2 py-0.5 z-10 rounded-br-lg">
                    <span className="text-[9px] font-bold tracking-wider uppercase">{comic.type}</span>
                  </div>
                </div>

                {/* Info Teks */}
                <h3 className="text-xs font-semibold line-clamp-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-snug mb-0.5">
                  {comic.title}
                </h3>
                <p className="text-[10px] text-gray-400 line-clamp-1">{comic.genre}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Placeholder ketika tidak ada hasil dan query kosong */}
      {searchQuery.trim() === "" && searchResults.length === 0 && (
        <div className="text-center mt-20 text-gray-400 text-sm">Ketik sesuatu untuk mencari komik favoritmu.</div>
      )}
    </div>
  );
};

export default SearchComic;
