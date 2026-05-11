"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import axios from "axios";

const DetailComic = () => {
  const router = useRouter();
  const { slug } = useParams();
  const searchParams = useSearchParams();

  const comic = {
    title: searchParams.get("title") || "",
    image: searchParams.get("image") || "",
    chapter: searchParams.get("chapter") || "",
    source: searchParams.get("source") || "",
    link: searchParams.get("link") || "",
    popularity: searchParams.get("popularity") || "",
  };
  const processedLink = searchParams.get("processedLink") || "";

  const [comicDetail, setComicDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [expandedSynopsis, setExpandedSynopsis] = useState(false);
  // New states for chapter view
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [chapterSearch, setChapterSearch] = useState("");

  useEffect(() => {
    const fetchComicDetail = async () => {
      try {
        const cleanProcessedLink = processedLink?.startsWith("/") ? processedLink.substring(1) : processedLink;
        const response = await axios.get(`https://www.sankavollerei.com/comic/comic/${cleanProcessedLink}`);
        if (!response.data) throw new Error("Tidak ada data");
        setComicDetail(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || err.message || "Terjadi kesalahan");
        setLoading(false);
        setComicDetail({ synopsis: "Synopsis tidak tersedia.", chapters: [], creator: "Unknown" });
      }
    };

    const fetchRecommendations = async () => {
      try {
        const response = await axios.get("https://www.sankavollerei.com/comic/recommendations");
        const processed = response.data.recommendations.map((item) => {
          const recSlug = item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
          const link = item.link.replace("/manga/", "").replace("/comic/", "");
          return {
            ...item,
            slug: recSlug,
            processedLink: link,
            source: item.reason || "-",
            popularity: item.recommendation_score ? item.recommendation_score.toFixed(2) : "-",
            image: item.image.includes("lazy.jpg") ? "https://via.placeholder.com/300x450?text=No+Cover" : item.image,
          };
        });
        const filtered = processed.filter(
          (item) => !item.title.toLowerCase().includes("apk") && !item.chapter.toLowerCase().includes("download"),
        );
        setRecommendations(filtered.filter((r) => r.slug !== slug).slice(0, 6));
      } catch (err) {
        console.error("Error fetching recommendations:", err);
      }
    };

    if (processedLink) {
      fetchComicDetail();
    } else {
      setError("Link komik tidak valid");
      setLoading(false);
    }
    fetchRecommendations();

    try {
      const historyData = JSON.parse(localStorage.getItem("comicHistory"));
      if (historyData && historyData[slug]) setHistory(historyData[slug]);
    } catch (e) {}
  }, [processedLink, slug]);

  const handleReadComic = (chapterData = null) => {
    let chapterToRead;
    if (chapterData) {
      chapterToRead = chapterData;
    } else if (comicDetail?.chapters?.length > 0) {
      // Find chapter 1, or the chapter with the lowest number
      const chapter1 = comicDetail.chapters.find(
        (ch) => String(ch.chapter).toLowerCase() === "1" || String(ch.chapter).toLowerCase() === "chapter 1",
      );

      if (chapter1) {
        chapterToRead = chapter1;
      } else {
        // If chapter 1 not found, sort and find the lowest chapter number
        const sortedChapters = [...comicDetail.chapters].sort((a, b) => {
          const numA = parseFloat(String(a.chapter).replace(/\D/g, "")) || Infinity;
          const numB = parseFloat(String(b.chapter).replace(/\D/g, "")) || Infinity;
          return numA - numB;
        });
        chapterToRead = sortedChapters[0];
      }
    } else {
      alert("Tidak ada chapter tersedia");
      return;
    }
    const queryParams = new URLSearchParams({
      chapterLink: chapterToRead.link,
      comicTitle: comic.title,
      chapterNumber: chapterToRead.chapter,
      comicImage: comic.image,
      comicChapter: comic.chapter,
      comicSource: comic.source,
      comicLink: comic.link,
      comicPopularity: comic.popularity,
      processedLink,
    }).toString();
    router.push(`/comic/read/${slug}?${queryParams}`);
  };

  const handleContinueReading = () => {
    if (history) handleReadComic({ link: history.lastChapterLink, chapter: history.lastChapter });
  };

  const handleRecommendationDetail = (item) => {
    const queryParams = new URLSearchParams({
      title: item.title,
      image: item.image,
      chapter: item.chapter,
      source: item.source,
      link: item.link,
      popularity: item.popularity,
      processedLink: item.processedLink,
    }).toString();
    router.push(`/comic/${item.slug}?${queryParams}`);
    window.location.reload();
  };

  const handleGenreClick = (genreSlug) => {
    router.push(`/genre/${genreSlug}`);
  };

  // Data final dengan prioritas dari API
  const displayTitle = comicDetail?.title || comic.title;
  const displayImage = comicDetail?.image || comic.image;
  const displayAltTitle = comicDetail?.title_indonesian || null;
  const displaySynopsis = comicDetail?.synopsis_full || comicDetail?.synopsis || "Synopsis tidak tersedia.";
  const metadata = comicDetail?.metadata || {};
  const genres = comicDetail?.genres || [];
  const similarManga = comicDetail?.similar_manga || [];
  const isSynopsisLong = displaySynopsis.length > 300;

  // Filter chapters based on search query
  const chapters = comicDetail?.chapters || [];
  const filteredChapters = chapters.filter((ch) => ch.chapter.toLowerCase().includes(chapterSearch.toLowerCase()));

  /* ─── Loading ─── */
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

  /* ─── Error ─── */
  if (error && !comicDetail?.chapters) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-xs">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  if (!displayTitle) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-sm text-neutral-500">Komik tidak ditemukan.</p>
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

  const isLatestChapter = history?.lastChapter === comic.chapter;

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100">
      {/* HERO BANNER */}
      <div className="relative h-56 sm:h-64 md:h-42 overflow-hidden">
        <img
          src={displayImage}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover scale-110"
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-xs font-medium">Beranda</span>
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* COVER + META */}
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-7 -mt-20 sm:-mt-24 relative z-10">
          <div className="w-28 sm:w-36 flex-shrink-0 mx-auto sm:mx-0">
            <div className="aspect-[2/3] overflow-hidden shadow-2xl shadow-neutral-900/40 ring-1 ring-white/10 rounded-sm">
              <img
                src={displayImage}
                alt={displayTitle}
                width="160"
                height="240"
                loading="eager"
                className="w-full h-full object-cover"
                onError={(e) => (e.target.src = "https://via.placeholder.com/300x450?text=No+Cover")}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-2 sm:pt-12 pb-4 text-center sm:text-left">
            {comic.source && (
              <p className="text-[10px] font-semibold tracking-wide uppercase text-neutral-400 dark:text-neutral-500 mb-1">
                {comic.source}
              </p>
            )}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight text-neutral-900 dark:text-neutral-50">
              {displayTitle}
            </h1>
            {displayAltTitle && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 italic">{displayAltTitle}</p>
            )}

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 my-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                {comic.chapter}
              </span>
              {comic.popularity && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full">
                  ★ {comic.popularity}
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
                {expandedSynopsis ? displaySynopsis : `${displaySynopsis.slice(0, 300)}${isSynopsisLong ? "..." : ""}`}
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
                      {metadata.concept && (
                        <div>
                          <span className="text-neutral-400">Konsep</span>
                          <p className="font-medium">{metadata.concept}</p>
                        </div>
                      )}
                      {metadata.age_rating && (
                        <div>
                          <span className="text-neutral-400">Rating Usia</span>
                          <p className="font-medium">{metadata.age_rating}</p>
                        </div>
                      )}
                      {metadata.reading_direction && (
                        <div>
                          <span className="text-neutral-400">Arah Baca</span>
                          <p className="font-medium">{metadata.reading_direction}</p>
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

            <div className="border-t border-neutral-100 dark:border-neutral-800" />

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
                  Terakhir dibaca: <span className="font-bold">Chapter {history.lastChapter}</span>
                </p>
                <button
                  onClick={handleContinueReading}
                  className="ml-auto text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Lanjutkan →
                </button>
              </div>
            )}

            {/* DAFTAR CHAPTER dengan mode dan search */}
            <section>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500">
                  Daftar Chapter
                </h2>
                <div className="flex items-center gap-2">
                  {/* Search input */}
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
                  {/* Toggle buttons */}
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
                      const isCurrent = String(chapter.chapter) === String(history?.lastChapter);
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
                          {chapter.date && <span className="text-[9px] opacity-70 mt-0.5">{chapter.date}</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {filteredChapters.map((chapter, index) => {
                      const isCurrent = String(chapter.chapter) === String(history?.lastChapter);
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
                          {chapter.date && <span className="text-xs opacity-70">{chapter.date}</span>}
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
              {chapters.length > 0 && filteredChapters.length !== chapters.length && (
                <p className="text-[10px] text-neutral-400 mt-2 text-center">
                  Menampilkan {filteredChapters.length} dari {chapters.length} chapter
                </p>
              )}
            </section>

            {/* SIMILAR MANGA */}
            {similarManga.length > 0 && (
              <section className="pt-2">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                  Manga Terkait
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {similarManga.map((item, idx) => {
                    const similarSlug = item.title
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, "");
                    const similarProcessed = item.link?.replace("/manga/", "").replace("/comic/", "") || "";
                    return (
                      <div
                        key={idx}
                        className="group flex gap-3 cursor-pointer bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                        onClick={() => {
                          const params = new URLSearchParams({
                            title: item.title,
                            image: item.image,
                            chapter: item.chapter || "-",
                            source: comic.source,
                            link: item.link,
                            popularity: "-",
                            processedLink: similarProcessed,
                          }).toString();
                          router.push(`/comic/${similarSlug}?${params}`);
                          window.location.reload();
                        }}
                      >
                        <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-200 dark:bg-neutral-700">
                          <img
                            src={item.image}
                            alt={item.title}
                            width="48"
                            height="64"
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/300x450?text=No+Cover")}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <h3 className="text-xs font-semibold line-clamp-2 leading-snug text-neutral-800 dark:text-neutral-100 group-hover:text-neutral-500">
                            {item.title}
                          </h3>
                          {item.chapter && <p className="text-[10px] text-neutral-400 mt-1">{item.chapter}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR REKOMENDASI */}
          {recommendations.length > 0 && (
            <aside className="w-full lg:w-60 xl:w-64 flex-shrink-0">
              <div className="lg:sticky lg:top-6">
                <h2 className="text-[10px] font-bold tracking-wider uppercase text-neutral-400 dark:text-neutral-500 mb-4">
                  Mungkin Kamu Suka
                </h2>
                <div className="space-y-4">
                  {recommendations.map((item, index) => (
                    <div
                      key={index}
                      className="group flex gap-3 cursor-pointer"
                      onClick={() => handleRecommendationDetail(item)}
                    >
                      <div className="w-12 h-16 flex-shrink-0 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800">
                        <img
                          src={item.image}
                          alt={item.title}
                          width="48"
                          height="64"
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          onError={(e) => (e.target.src = "https://via.placeholder.com/300x450?text=No+Cover")}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="text-xs font-semibold line-clamp-2 leading-snug text-neutral-800 dark:text-neutral-100 group-hover:text-neutral-500">
                          {item.title}
                        </h3>
                        <p className="text-[10px] text-neutral-400">
                          Ch.{item.chapter.split(" ").pop()}
                          {item.popularity !== "-" && <> · ★{item.popularity}</>}
                        </p>
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
