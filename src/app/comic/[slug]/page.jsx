"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";

const DetailComic = () => {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  const comicParams = {
    title: searchParams.get("title") || "",
    image: searchParams.get("image") || "",
    chapter: searchParams.get("chapter") || "",
    source: searchParams.get("source") || "Komikindo",
    link: searchParams.get("link") || "",
    popularity: searchParams.get("popularity") || "",
  };

  const [loading, setLoading] = useState(true);
  const [comicDetail, setComicDetail] = useState(null);
  const [error, setError] = useState(null);

  const [history, setHistory] = useState(() => {
    try {
      const historyData = JSON.parse(localStorage.getItem("comicHistory"));
      return historyData?.[slug] ?? null;
    } catch {
      return null;
    }
  });

  const [expandedSynopsis, setExpandedSynopsis] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [chapterSearch, setChapterSearch] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchComicDetail = async () => {
      try {
        const response = await axios.get(
          `https://www.sankavollerei.com/comic/komikindo/detail/${slug}`
        );
        if (cancelled) return;

        const apiData = response.data?.data;
        if (!apiData) throw new Error("Data tidak ditemukan");

        const cleanTitle =
          apiData.title?.replace(/\n\s+/g, " ").trim() || comicParams.title;

        const mappedDetail = {
          title: cleanTitle,
          image: apiData.image || comicParams.image,
          rating: apiData.rating || comicParams.popularity,
          votes: apiData.votes,
          synopsis: apiData.description || "",
          metadata: {
            alternativeTitle: apiData.detail?.alternativeTitle || "",
            status: apiData.detail?.status || "",
            author: apiData.detail?.author || "",
            illustrator: apiData.detail?.illustrator || "",
            type: apiData.detail?.type || "",
            theme: apiData.detail?.theme || "",
          },
          genres:
            apiData.genres?.map((g) => ({
              name: g.name,
              slug: g.slug?.replace("/genres/", ""),
            })) || [],
          chapters:
            apiData.chapters?.map((ch) => ({
              chapter: ch.title?.trim() || "",
              link: ch.slug || "",
              date: ch.releaseTime || "",
            })) || [],
          similarManga:
            apiData.similarManga?.map((item) => ({
              title: item.title,
              image: item.image,
              slug: item.slug,
              description: item.description,
            })) || [],
        };

        setComicDetail(mappedDetail);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Gagal memuat detail komik"
          );
          setComicDetail({
            title: comicParams.title || "",
            image: comicParams.image || "",
            synopsis: "Deskripsi tidak tersedia.",
            chapters: [],
            metadata: {},
            genres: [],
            similarManga: [],
          });
          setLoading(false);
        }
      }
    };

    fetchComicDetail();

    return () => {
      cancelled = true;
    };
  }, [slug, comicParams.title, comicParams.image, comicParams.popularity]);

  const handleReadComic = (chapterData = null) => {
    let chapterToRead;
    if (chapterData) {
      chapterToRead = chapterData;
    } else if (comicDetail?.chapters?.length > 0) {
      const chapter1 = comicDetail.chapters.find(
        (ch) =>
          String(ch.chapter).toLowerCase() === "1" ||
          String(ch.chapter).toLowerCase() === "chapter 1"
      );
      chapterToRead = chapter1 || comicDetail.chapters[0];
    } else {
      alert("Tidak ada chapter tersedia");
      return;
    }

    const queryParams = new URLSearchParams({
      chapterLink: chapterToRead.link,
      comicTitle: comicDetail?.title || comicParams.title,
      chapterNumber: chapterToRead.chapter,
      comicImage: comicDetail?.image || comicParams.image,
      comicChapter: comicParams.chapter,
      comicSource: comicParams.source || "Komikindo",
      comicLink: comicParams.link,
      comicPopularity: comicDetail?.rating || comicParams.popularity,
    }).toString();
    router.push(`/comic/read/${slug}?${queryParams}`);
  };

  const handleContinueReading = () => {
    if (history) {
      handleReadComic({
        link: history.lastChapterLink,
        chapter: history.lastChapter,
      });
    }
  };

  const handleGenreClick = (genreSlug) => {
    router.push(`/genre/${genreSlug}`);
  };

  const displayTitle =
    comicDetail?.title || comicParams.title || "Tanpa Judul";
  const displayImage =
    comicDetail?.image ||
    comicParams.image ||
    "https://via.placeholder.com/300x450?text=No+Cover";
  const displaySynopsis = comicDetail?.synopsis || "Synopsis tidak tersedia.";
  const metadata = comicDetail?.metadata || {};
  const genres = comicDetail?.genres || [];
  const similarManga = comicDetail?.similarManga || [];
  const isSynopsisLong = displaySynopsis.length > 300;

  const chapters = comicDetail?.chapters || [];
  const filteredChapters = chapters.filter((ch) =>
    ch.chapter.toLowerCase().includes(chapterSearch.toLowerCase())
  );

  const isLatestChapter = history?.lastChapter === comicParams.chapter;

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="relative h-64 sm:h-42 bg-neutral-100 dark:bg-neutral-900 overflow-hidden">
          <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-neutral-200 to-neutral-100 dark:from-neutral-800 dark:to-neutral-900" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-20 relative z-10">
          <div className="flex gap-6">
            <div className="w-32 sm:w-40 flex-shrink-0 animate-pulse aspect-[2/3] bg-neutral-200 dark:bg-neutral-700 rounded-sm shadow-lg" />
            <div className="flex-1 pt-24 space-y-3">
              <div className="animate-pulse h-6 bg-neutral-200 dark:bg-neutral-700 w-3/4 rounded-sm" />
              <div className="animate-pulse h-4 bg-neutral-200 dark:bg-neutral-700 w-1/3 rounded-sm" />
            </div>
          </div>
          <div className="mt-10 space-y-4">
            <div className="animate-pulse h-4 bg-neutral-100 dark:bg-neutral-800 w-full rounded-sm" />
            <div className="animate-pulse h-4 bg-neutral-100 dark:bg-neutral-800 w-5/6 rounded-sm" />
            <div className="animate-pulse h-4 bg-neutral-100 dark:bg-neutral-800 w-4/6 rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !displayTitle) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto">
            <svg
              className="w-6 h-6 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{error}</p>
          <button
            onClick={() => router.push("/comic")}
            className="text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 underline underline-offset-4 transition-colors"
          >
            ← Kembali ke Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* HERO BANNER */}
      <div className="relative h-56 sm:h-64 md:h-42 overflow-hidden">
        <Image
          src={displayImage}
          alt=""
          aria-hidden="true"
          fill
          className="absolute inset-0 object-cover scale-110"
          style={{ filter: "blur(28px) saturate(1.3)", transform: "scale(1.15)" }}
        />
        <div className="absolute inset-0 bg-neutral-900/60 dark:bg-neutral-950/70" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent" />

        <button
          onClick={() => router.push("/comic")}
          className="absolute top-4 left-4 sm:left-6 z-20 flex items-center gap-1.5 text-white/80 hover:text-white transition-colors group bg-black/20 rounded-full px-2 py-1 backdrop-blur-sm"
        >
          <svg
            className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span className="text-xs font-medium">Beranda</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* COVER + META */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 -mt-20 sm:-mt-24 relative z-10">
          <div className="w-28 sm:w-36 flex-shrink-0 mx-auto sm:mx-0">
            <div className="aspect-[2/3] overflow-hidden shadow-2xl shadow-neutral-900/40 ring-1 ring-white/10 rounded-sm relative">
              <Image
                src={displayImage}
                alt={displayTitle}
                fill
                sizes="(max-width: 640px) 112px, 144px"
                className="object-cover"
                priority
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/300x450?text=No+Cover";
                }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-2 sm:pt-12 pb-4 text-center sm:text-left">
            {comicParams.source && (
              <p className="text-[10px] font-semibold tracking-wide uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                {comicParams.source}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-50">
              {displayTitle}
            </h1>
            {metadata.alternativeTitle && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">
                {metadata.alternativeTitle}
              </p>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 my-3">
              {comicParams.chapter && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  {comicParams.chapter}
                </span>
              )}
              {(comicDetail?.rating || comicParams.popularity) && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                  ★ {comicDetail?.rating || comicParams.popularity}
                </span>
              )}
              {metadata.status && (
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${
                    metadata.status.toLowerCase() === "ongoing"
                      ? "bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400"
                  }`}
                >
                  {metadata.status}
                </span>
              )}
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
              <button
                onClick={() => handleReadComic()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs font-bold rounded-full hover:bg-neutral-700 dark:hover:bg-neutral-300 transition"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Baca Dari Awal
              </button>
              {history && !isLatestChapter && (
                <button
                  onClick={handleContinueReading}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-xs font-bold rounded-full hover:border-neutral-500 dark:hover:border-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Lanjut Ch.{history.lastChapter}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BODY 2 KOLOM */}
        <div className="mt-8 flex flex-col lg:flex-row gap-8 lg:gap-12 pb-12">
          {/* KOLOM UTAMA */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Sinopsis */}
            <section>
              <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-3">
                Sinopsis
              </h2>
              <div className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed whitespace-pre-line">
                {expandedSynopsis
                  ? displaySynopsis
                  : `${displaySynopsis.slice(0, 300)}${isSynopsisLong ? "..." : ""}`}
                {isSynopsisLong && (
                  <button
                    onClick={() => setExpandedSynopsis(!expandedSynopsis)}
                    className="text-xs font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 ml-1 inline-block"
                  >
                    {expandedSynopsis ? "Tutup" : "Baca selengkapnya"}
                  </button>
                )}
              </div>
            </section>

            {/* METADATA & GENRE */}
            {(Object.keys(metadata).length > 0 || genres.length > 0) && (
              <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                {Object.keys(metadata).length > 0 && (
                  <div className="mb-5">
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-3">
                      Informasi
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
                      {metadata.type && (
                        <div>
                          <span className="text-neutral-400">Tipe</span>
                          <p className="font-medium">{metadata.type}</p>
                        </div>
                      )}
                      {metadata.author && (
                        <div>
                          <span className="text-neutral-400">Penulis</span>
                          <p className="font-medium">{metadata.author}</p>
                        </div>
                      )}
                      {metadata.status && (
                        <div>
                          <span className="text-neutral-400">Status</span>
                          <p className="font-medium">{metadata.status}</p>
                        </div>
                      )}
                      {metadata.illustrator && (
                        <div>
                          <span className="text-neutral-400">Ilustrator</span>
                          <p className="font-medium">{metadata.illustrator}</p>
                        </div>
                      )}
                      {metadata.theme && (
                        <div>
                          <span className="text-neutral-400">Tema</span>
                          <p className="font-medium">{metadata.theme}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                {genres.length > 0 && (
                  <div>
                    <h3 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-3">
                      Genre
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {genres.map((genre, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGenreClick(genre.slug)}
                          className="text-xs px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                        >
                          {genre.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* LANJUT BACA NOTIF */}
            {history && !isLatestChapter && (
              <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl">
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Terakhir dibaca:{" "}
                  <span className="font-bold">Chapter {history.lastChapter}</span>
                </p>
                <button
                  onClick={handleContinueReading}
                  className="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Lanjutkan →
                </button>
              </div>
            )}

            {/* DAFTAR CHAPTER */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Daftar Chapter
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Cari chapter..."
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      className="text-xs px-3 py-1.5 pr-8 rounded-full border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-400"
                    />
                    {chapterSearch && (
                      <button
                        onClick={() => setChapterSearch("")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-full p-0.5">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-full transition ${
                        viewMode === "grid"
                          ? "bg-white dark:bg-neutral-700 shadow"
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                      aria-label="Tampilan grid"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-full transition ${
                        viewMode === "list"
                          ? "bg-white dark:bg-neutral-700 shadow"
                          : "text-neutral-500 hover:text-neutral-700"
                      }`}
                      aria-label="Tampilan daftar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {filteredChapters.length > 0 ? (
                viewMode === "grid" ? (
                  <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                    {filteredChapters.map((chapter, index) => {
                      const isCurrent =
                        String(chapter.chapter) === String(history?.lastChapter);
                      return (
                        <button
                          key={index}
                          onClick={() => handleReadComic(chapter)}
                          className={`relative flex flex-col items-center justify-center py-2 px-1 rounded-lg text-xs font-semibold transition ${
                            isCurrent
                              ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow"
                              : "bg-neutral-50 dark:bg-neutral-800/70 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {isCurrent && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                          <span className="leading-tight">{chapter.chapter}</span>
                          {chapter.date && (
                            <span className="text-[9px] opacity-70 mt-0.5">
                              {chapter.date}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {filteredChapters.map((chapter, index) => {
                      const isCurrent =
                        String(chapter.chapter) === String(history?.lastChapter);
                      return (
                        <button
                          key={index}
                          onClick={() => handleReadComic(chapter)}
                          className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition ${
                            isCurrent
                              ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                              : "bg-neutral-50 dark:bg-neutral-800/50 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                          }`}
                        >
                          <span className="font-medium">{chapter.chapter}</span>
                          {chapter.date && (
                            <span className="text-xs opacity-70">{chapter.date}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <p className="text-xs text-neutral-400 py-4 text-center">
                  Tidak ada chapter yang cocok dengan pencarian.
                </p>
              )}
              {chapters.length > 0 &&
                filteredChapters.length !== chapters.length && (
                  <p className="text-[10px] text-neutral-400 mt-2 text-center">
                    Menampilkan {filteredChapters.length} dari {chapters.length} chapter
                  </p>
                )}
            </section>
          </div>

          {/* SIDEBAR: Manga Terkait (hanya similarManga) */}
          {similarManga.length > 0 && (
            <aside className="w-full lg:w-60 xl:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                  Manga Terkait
                </h2>
                <div className="space-y-4">
                  {similarManga.map((item, idx) => (
                    <div
                      key={idx}
                      className="group flex gap-3 cursor-pointer"
                      onClick={() =>
                        router.push(`/comic/${item.slug}`)
                      }
                    >
                      <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800 relative">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/300x450?text=No+Cover";
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-xs font-semibold line-clamp-2 leading-snug text-neutral-800 dark:text-neutral-100 group-hover:text-neutral-500">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="text-[10px] text-neutral-400 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailComic;