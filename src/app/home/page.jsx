"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  FaPlay,
  FaStar,
  FaFire,
  FaCalendarAlt,
  FaTv,
  FaClock,
  FaChevronLeft,
  FaChevronRight,
  FaHeart,
  FaInfoCircle,
  FaExclamationTriangle,
  FaRedo,
} from "react-icons/fa";
import Head from "next/head";
import Footer from "@/components/Footer";
import Image from "next/image";
import AnimeCard from "@/components/AnimeCard";
import Pagination from "@/components/Pagination";

/* ═══════════════════════════════════════════════════════════
   JIKAN API QUEUE — solves the rate-limit / inconsistency bug.
   Jikan allows ~3 req/s. We serialize every call through a
   queue with 350 ms gap + exponential-backoff retry on 429.
═══════════════════════════════════════════════════════════ */
const BASE = "https://api.jikan.moe/v4";
const QUEUE_GAP_MS = 350;

const queue = (() => {
  let pending = Promise.resolve();
  const delay = (ms) => new Promise((r) => setTimeout(r, ms));

  const fetchWithRetry = async (url, retries = 3, backoff = 1000) => {
    for (let attempt = 0; attempt < retries; attempt++) {
      const res = await fetch(url);
      if (res.status === 429) {
        // Rate limited — wait and retry
        await delay(backoff * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    }
    throw new Error("Max retries exceeded");
  };

  return {
    add: (path) => {
      const task = pending.then(() => delay(QUEUE_GAP_MS)).then(() => fetchWithRetry(`${BASE}${path}`));
      // Next queued task waits for this one, even if this fails
      pending = task.catch(() => {});
      return task;
    },
  };
})();

/* ── Custom hook built on the queue (no synchronous setState) ── */
function useJikan(path, enabled = true) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const pathRef = useRef(path);
  const enabledRef = useRef(enabled);
  const retryRef = useRef(() => {});

  // Derived loading state – true only when we expect data and haven't received it yet
  const loading = enabled && !!path && data === null && error === null;

  useEffect(() => {
    mounted.current = true;
    pathRef.current = path;
    enabledRef.current = enabled;

    if (!enabled || !path) {
      return;
    }

    const doFetch = () => {
      queue
        .add(path)
        .then((json) => {
          if (mounted.current && pathRef.current === path && enabledRef.current) {
            setData(json);
            setError(null); // clear any previous error
          }
        })
        .catch((err) => {
          if (mounted.current && pathRef.current === path && enabledRef.current) {
            setError(err.message);
          }
        });
    };

    doFetch();

    retryRef.current = () => {
      if (!mounted.current) return;
      // Reset data & error to trigger loading state
      setData(null);
      setError(null);
      queue
        .add(pathRef.current)
        .then((json) => {
          if (mounted.current && pathRef.current === path && enabledRef.current) {
            setData(json);
            setError(null);
          }
        })
        .catch((err) => {
          if (mounted.current && pathRef.current === path && enabledRef.current) {
            setError(err.message);
          }
        });
    };

    return () => {
      mounted.current = false;
    };
  }, [path, enabled]);

  const retry = useCallback(() => retryRef.current(), []);

  return { data, loading, error, retry };
}

/* ═══════════════════════════════════════════════════════════
   SKELETON COMPONENTS
═══════════════════════════════════════════════════════════ */
const SkeletonCard = () => (
  <div className="flex items-center gap-3 px-2 py-2 animate-pulse">
    <div className="w-5 h-4 bg-white/10 rounded shrink-0" />
    <div className="w-10 h-14 bg-white/10 rounded-lg shrink-0" />
    <div className="flex-1 space-y-2 min-w-0">
      <div className="h-3 bg-white/10 rounded w-4/5" />
      <div className="h-3 bg-white/10 rounded w-3/5" />
    </div>
  </div>
);

const SkeletonSpotlight = () => (
  <div className="relative w-full h-[48vh] sm:h-[54vh] md:h-[60vh] bg-gray-900 animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/50 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 pb-12 sm:pb-14">
      <div className="h-3 bg-white/10 rounded w-28 mb-3" />
      <div className="h-8 sm:h-10 md:h-12 bg-white/10 rounded w-3/4 mb-3" />
      <div className="h-3 bg-white/10 rounded w-full mb-2" />
      <div className="h-3 bg-white/10 rounded w-5/6 mb-5" />
      <div className="h-10 bg-white/10 rounded w-36" />
    </div>
  </div>
);

const SkeletonScheduleCard = () => (
  <div className="flex items-center gap-3 bg-white/[0.04] border border-white/[0.07] rounded-xl p-2.5 animate-pulse">
    <div className="shrink-0 w-12 h-16 sm:w-14 sm:h-20 bg-white/10 rounded-lg" />
    <div className="flex-1 space-y-2">
      <div className="h-3 bg-white/10 rounded w-4/5" />
      <div className="h-3 bg-white/10 rounded w-3/5" />
      <div className="h-3 bg-white/10 rounded w-2/5" />
    </div>
    <div className="shrink-0 w-7 h-7 bg-white/10 rounded-full" />
  </div>
);

/* ═══════════════════════════════════════════════════════════
   ERROR BANNER
═══════════════════════════════════════════════════════════ */
const ErrorBanner = ({ message = "Failed to load data.", onRetry }) => (
  <div className="flex items-center gap-3 bg-red-900/30 border border-red-700/40 text-red-300 rounded-xl px-4 py-3 my-4 text-sm">
    <FaExclamationTriangle className="shrink-0 text-red-400" />
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        onClick={onRetry}
        className="shrink-0 flex items-center gap-1.5 text-xs bg-red-700/40 hover:bg-red-700/70 border border-red-600/40 px-2.5 py-1.5 rounded-lg transition-all"
      >
        <FaRedo size={10} /> Retry
      </button>
    )}
  </div>
);

/* ═══════════════════════════════════════════════════════════
   SECTION META
═══════════════════════════════════════════════════════════ */
const SECTION_META = {
  "Top Airing": { icon: <FaFire className="text-orange-400" />, accent: "text-orange-400" },
  "Most Popular": { icon: <FaStar className="text-yellow-400" />, accent: "text-yellow-400" },
  "Most Favorite": { icon: <FaHeart className="text-rose-400" />, accent: "text-rose-400" },
  "Coming Soon": { icon: <FaCalendarAlt className="text-sky-400" />, accent: "text-sky-400" },
};

/* ═══════════════════════════════════════════════════════════
   ANIME SECTION COLUMN
═══════════════════════════════════════════════════════════ */
const AnimeSection = ({ title, data, loading, error, onRetry }) => {
  const meta = SECTION_META[title] || {};
  return (
    <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-sm h-full">
      <h3 className="text-xs sm:text-sm font-bold mb-4 flex items-center gap-2 uppercase tracking-wider">
        {meta.icon}
        <span className={meta.accent}>{title}</span>
      </h3>

      {error && <ErrorBanner message="Failed to load list." onRetry={onRetry} />}

      {loading && !error && (
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && !error && !data?.length && (
        <p className="text-white/30 text-center py-8 text-sm">No data available.</p>
      )}

      {!loading && !error && !!data?.length && (
        <div className="space-y-0.5">
          {data
            .filter((a, i, arr) => arr.findIndex((x) => x.mal_id === a.mal_id) === i)
            .slice(0, 5)
            .map((anime, idx) => (
              <Link
                key={anime.mal_id}
                href={`/anime/${anime.mal_id}`}
                className="flex items-center gap-3 hover:bg-white/[0.06] px-2 py-2 rounded-xl transition-all duration-200 group"
              >
                <span
                  className={`font-black text-xs w-5 text-center ${meta.accent} opacity-60 group-hover:opacity-100 shrink-0`}
                >
                  {idx + 1}
                </span>
                <div className="relative w-9 h-[52px] sm:w-10 sm:h-[56px] shrink-0 shadow-md overflow-hidden rounded-lg">
                  <Image
                    src={anime.images?.jpg?.small_image_url || "/placeholder.jpg"}
                    alt={anime.title}
                    fill
                    sizes="(max-width: 640px) 36px, 40px"
                    className="object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-xs sm:text-sm leading-tight line-clamp-2 text-white/80 group-hover:text-white transition-colors">
                    {anime.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[10px] sm:text-xs text-white/40">
                    <span>{anime.episodes ? `${anime.episodes} eps` : "Ongoing"}</span>
                    {anime.score && <span className="text-yellow-400/80">⭐ {anime.score}</span>}
                  </div>
                </div>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   SCHEDULE CARD
═══════════════════════════════════════════════════════════ */
const ScheduleCard = ({ item }) => (
  <Link
    href={`/anime/${item.mal_id}`}
    className="group flex items-center gap-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.07] hover:border-violet-500/30 rounded-xl p-2.5 transition-all duration-200"
  >
    {/* Thumbnail */}
    <div className="relative shrink-0 w-12 h-16 sm:w-14 sm:h-20 rounded-lg overflow-hidden bg-white/10">
      <Image
        src={item.images?.jpg?.large_image_url || "/placeholder.jpg"}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 48px, 56px"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        style={{ willChange: "transform" }}
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.jpg";
        }}
      />
      {item.score && (
        <div className="absolute bottom-0 inset-x-0 bg-black/70 text-center text-[9px] text-yellow-400 font-bold py-0.5 flex items-center justify-center gap-0.5">
          <FaStar size={6} /> {item.score}
        </div>
      )}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm font-semibold line-clamp-2 text-white/80 group-hover:text-white transition-colors leading-tight mb-1">
        {item.title}
      </p>
      <div className="flex items-center gap-2 text-[10px] text-white/40">
        {item.episodes && <span>{item.episodes} eps</span>}
        {item.type && <span className="bg-white/10 px-1.5 py-0.5 rounded">{item.type}</span>}
      </div>
    </div>

    {/* Play icon */}
    <div className="shrink-0 w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-violet-600/70 flex items-center justify-center transition-all duration-200">
      <FaPlay size={8} className="text-white/50 group-hover:text-white ml-0.5" />
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════════════════
   HOME PAGE
═══════════════════════════════════════════════════════════ */
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const Home = () => {
  /* ── Spotlight (top airing for hero) ── */
  const {
    data: spotlightData,
    loading: spotlightLoading,
    error: spotlightError,
    retry: retrySpotlight,
  } = useJikan("/top/anime?filter=airing&limit=5");
  const spotlightList = spotlightData?.data || [];

  const [currentSpotlight, setCurrentSpotlight] = useState(0);
  const [autoSlide, setAutoSlide] = useState(true);

  // Safe index derived from state – no need to reset via effect
  const safeIndex = spotlightList.length > 0 ? currentSpotlight % spotlightList.length : 0;

  // Auto‑slide effect
  useEffect(() => {
    if (!autoSlide || spotlightList.length < 2) return;
    const id = setInterval(() => {
      setCurrentSpotlight((p) => (p + 1) % spotlightList.length);
    }, 5500);
    return () => clearInterval(id);
  }, [autoSlide, spotlightList.length]);

  const pauseThenResume = () => {
    setAutoSlide(false);
    setTimeout(() => setAutoSlide(true), 10000);
  };
  const nextSpot = () => {
    pauseThenResume();
    setCurrentSpotlight((p) => (p + 1) % spotlightList.length);
  };
  const prevSpot = () => {
    pauseThenResume();
    setCurrentSpotlight((p) => (p - 1 + spotlightList.length) % spotlightList.length);
  };

  /* ── Genre + Producer marquee ── */
  const { data: genresData } = useJikan("/genres/anime");
  const { data: producersData } = useJikan("/producers?limit=20");
  const genres = genresData?.data || [];
  const producers = producersData?.data || [];

  /* ── Ranking columns — staggered intentionally by queue ── */
  const { data: topAiringData, loading: l1, error: e1, retry: r1 } = useJikan("/top/anime?filter=airing&limit=8");
  const {
    data: topPopularData,
    loading: l2,
    error: e2,
    retry: r2,
  } = useJikan("/top/anime?filter=bypopularity&limit=8");
  const { data: topFavoriteData, loading: l3, error: e3, retry: r3 } = useJikan("/top/anime?filter=favorite&limit=8");
  const { data: upcomingData, loading: l4, error: e4, retry: r4 } = useJikan("/top/anime?filter=upcoming&limit=8");

  /* ── Weekly schedule ── */
  const [selectedDay, setSelectedDay] = useState(() => {
    const d = new Date().getDay(); // 0=Sun
    return DAYS[d === 0 ? 6 : d - 1];
  });
  const {
    data: scheduleData,
    loading: scheduleLoading,
    error: scheduleError,
    retry: retrySchedule,
  } = useJikan(`/schedules?filter=${selectedDay}&limit=14`);
  const scheduleAnime = scheduleData?.data || [];

  /* ── NEW: Top Airing by Score (paginated) ── */
  const [topScorePage, setTopScorePage] = useState(1);
  const {
    data: topScoreData,
    loading: topScoreLoading,
    error: topScoreError,
    retry: retryTopScore,
  } = useJikan(`/top/anime?filter=airing&sfw=true&order_by=score&type=tv&page=${topScorePage}`);

  const getYear = (aired) => aired?.prop?.from?.year || "TBA";

  return (
    <div className="bg-[#09090b] text-white min-h-screen">
      <Head>
        <title>Watch Anime Online – Free HD Streaming | EliasDex</title>
        <meta
          name="description"
          content="Stream the latest anime episodes in HD for free. Daily updates, no ads. Your ultimate anime hub!"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      {/* ══════════════ SPOTLIGHT ══════════════ */}
      {spotlightLoading && <SkeletonSpotlight />}

      {spotlightError && !spotlightLoading && (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4">
          <FaExclamationTriangle className="text-red-400 text-4xl" />
          <p className="text-white/50 text-center text-sm max-w-sm">
            Failed to load spotlight anime. Please check your connection and try again.
          </p>
          <button
            onClick={retrySpotlight}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            <FaRedo size={11} /> Try Again
          </button>
        </div>
      )}

      {!spotlightLoading && !spotlightError && spotlightList.length > 0 && (
        <div className="relative w-full h-[48vh] sm:h-[54vh] md:h-[60vh] overflow-hidden">
          {/* BG */}
          <div className="absolute inset-0 z-0">
            <Image
              src={spotlightList[safeIndex]?.images?.jpg?.large_image_url || "/placeholder.jpg"}
              alt={spotlightList[safeIndex]?.title}
              fill
              priority
              className="w-full h-full object-cover object-top"
              style={{ willChange: "auto" }}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#09090b]/90 via-[#09090b]/25 to-transparent" />
          </div>

          {/* Content — pinned to bottom so height never shifts with content */}
          <div className="absolute bottom-0 left-0 right-0 z-10">
            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-10 pb-12 sm:pb-14">
              <div className="max-w-xs sm:max-w-md md:max-w-xl">
                {/* Badge */}
                <div className="spotlight-badge inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1 text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  Airing Now · {safeIndex + 1}/{spotlightList.length}
                </div>

                {/* Title — line-clamp-2 so long titles never push content down */}
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight mb-3 drop-shadow-xl line-clamp-2">
                  {spotlightList[safeIndex]?.title}
                </h1>

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2.5">
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1 text-[10px] sm:text-xs">
                    <FaTv size={9} /> TV
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1 text-[10px] sm:text-xs">
                    <FaCalendarAlt size={9} /> {getYear(spotlightList[safeIndex]?.aired)}
                  </span>
                  <span className="flex items-center gap-1 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg px-2 py-1 text-[10px] sm:text-xs">
                    <FaClock size={9} /> HD
                  </span>
                  {spotlightList[safeIndex]?.score && (
                    <span className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-bold">
                      <FaStar size={9} /> {spotlightList[safeIndex]?.score}
                    </span>
                  )}
                </div>

                {/* Genres */}
                <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5">
                  {spotlightList[safeIndex]?.genres?.slice(0, 4).map((g) => (
                    <span
                      key={g.mal_id}
                      className="bg-violet-600/25 border border-violet-500/25 text-violet-200 rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Synopsis — strict 2-line clamp */}
                <p className="text-white/60 text-xs sm:text-sm leading-relaxed mb-5 line-clamp-2">
                  {spotlightList[safeIndex]?.synopsis}
                </p>

                {/* CTA */}
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  <Link
                    href={`/anime/${spotlightList[safeIndex]?.mal_id}`}
                    className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-violet-900/50 hover:shadow-violet-700/50 hover:scale-[1.02] text-xs sm:text-sm"
                    style={{ willChange: "transform" }}
                  >
                    <FaPlay size={10} /> Watch Now
                  </Link>
                  <Link
                    href={`/anime/${spotlightList[safeIndex]?.mal_id}`}
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm"
                  >
                    <FaInfoCircle size={10} /> More Info
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Prev / Next — hidden on very small screens */}
          <button
            onClick={prevSpot}
            aria-label="Previous spotlight"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/10 p-2 sm:p-2.5 rounded-full transition-all hidden xs:flex"
          >
            <FaChevronLeft size={14} />
          </button>
          <button
            onClick={nextSpot}
            aria-label="Next spotlight"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/70 backdrop-blur-sm border border-white/10 p-2 sm:p-2.5 rounded-full transition-all hidden xs:flex"
          >
            <FaChevronRight size={14} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {spotlightList.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  pauseThenResume();
                  setCurrentSpotlight(i);
                }}
                aria-label={`Spotlight ${i + 1}`}
                className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                  i === safeIndex ? "bg-violet-400 w-5 sm:w-6" : "bg-white/25 w-1 sm:w-1.5 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* ══════════════ MARQUEE TAG CLOUD ══════════════ */}
      {(genres.length > 0 || producers.length > 0) && (
        <div className="py-4 sm:py-5 overflow-hidden border-y border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
          {genres.length > 0 && (
            <div className="relative flex overflow-hidden mb-2 sm:mb-3 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex gap-2 sm:gap-3 animate-scrollLeft whitespace-nowrap">
                {["a", "b"].flatMap((copy) =>
                  genres.map((g) => (
                    <Link
                      key={`genre-${copy}-${g.mal_id}`}
                      href={`/search?order_by=end_date&sfw=false&genres=${g.mal_id}`}
                      className="shrink-0 bg-white/[0.06] hover:bg-violet-700/60 border border-white/[0.08] hover:border-violet-500/40 text-white/60 hover:text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-200"
                    >
                      {g.name}
                    </Link>
                  )),
                )}
              </div>
            </div>
          )}
          {producers.length > 0 && (
            <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div className="flex gap-2 sm:gap-3 animate-scrollRight whitespace-nowrap">
                {["a", "b"].flatMap((copy) =>
                  producers.map((p) => (
                    <span
                      key={`producer-${copy}-${p.mal_id}`}
                      className="shrink-0 bg-white/[0.06] border border-white/[0.08] text-white/60 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs transition-all duration-200 cursor-default"
                    >
                      {p.titles?.[0]?.title || p.name}
                    </span>
                  )),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══════════════ RANKING COLUMNS ══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-5 sm:mb-6 tracking-tight flex items-center gap-2">
          <span>📊</span>
          <span className="text-violet-400">Anime Rankings</span>
        </h2>

        {/* Responsive grid: 1 col mobile → 2 col tablet → 4 col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <AnimeSection title="Top Airing" data={topAiringData?.data} loading={l1} error={e1} onRetry={r1} />
          <AnimeSection title="Most Popular" data={topPopularData?.data} loading={l2} error={e2} onRetry={r2} />
          <AnimeSection title="Most Favorite" data={topFavoriteData?.data} loading={l3} error={e3} onRetry={r3} />
          <AnimeSection title="Coming Soon" data={upcomingData?.data} loading={l4} error={e4} onRetry={r4} />
        </div>
      </section>

      {/* ══════════════ WEEKLY SCHEDULE ══════════════ */}
      <section className="py-10 sm:py-12 px-4 sm:px-6 md:px-8 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-4 sm:mb-5 tracking-tight flex items-center gap-2">
            <FaCalendarAlt className="text-violet-400 shrink-0" />
            <span>Weekly Schedule</span>
          </h2>

          {/* Day picker — scrollable on mobile */}
          <div className="flex gap-1.5 sm:gap-2 mb-5 sm:mb-6 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
            {DAYS.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`shrink-0 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full capitalize text-[10px] sm:text-xs font-semibold transition-all duration-200 ${
                  selectedDay === day
                    ? "bg-violet-600 text-white shadow-lg shadow-violet-900/50"
                    : "bg-white/[0.06] text-white/50 hover:bg-white/[0.10] hover:text-white"
                }`}
              >
                <span className="hidden sm:inline">{day.slice(0, 3).toUpperCase()}</span>
                <span className="sm:hidden">{day.slice(0, 2).toUpperCase()}</span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {scheduleLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonScheduleCard key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {scheduleError && !scheduleLoading && (
            <ErrorBanner message={`Failed to load schedule for ${selectedDay}.`} onRetry={retrySchedule} />
          )}

          {/* Empty */}
          {!scheduleLoading && !scheduleError && scheduleAnime.length === 0 && (
            <div className="text-center py-10 sm:py-12 text-white/30 text-sm">
              No anime scheduled for {selectedDay}.
            </div>
          )}

          {/* Cards */}
          {!scheduleLoading && !scheduleError && scheduleAnime.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {scheduleAnime
                .filter((a, i, arr) => arr.findIndex((x) => x.mal_id === a.mal_id) === i)
                .map((item) => (
                  <ScheduleCard key={item.mal_id} item={item} />
                ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════ TOP AIRING BY SCORE (PAGINATED) ══════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-10 sm:py-12">
        <h2 className="text-lg sm:text-xl md:text-2xl font-black mb-5 sm:mb-6 tracking-tight flex items-center gap-2">
          <FaStar className="text-yellow-400 shrink-0" />
          <span>Top Airing by Score</span>
        </h2>

        {/* Loading state */}
        {topScoreLoading && (
          <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-white/[0.04] rounded-2xl h-64" />
            ))}
          </div>
        )}

        {/* Error state */}
        {topScoreError && !topScoreLoading && (
          <ErrorBanner message="Failed to load top anime by score." onRetry={retryTopScore} />
        )}

        {/* Data loaded */}
        {!topScoreLoading && !topScoreError && topScoreData?.data?.length > 0 && (
          <>
            <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {topScoreData.data
                .filter((anime, index, self) => self.findIndex((a) => a.mal_id === anime.mal_id) === index)
                .map((item) => (
                  <AnimeCard key={item.mal_id} alt={item.title} data={item} />
                ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={topScoreData.pagination?.current_page}
                totalPages={topScoreData.pagination?.last_visible_page}
                onChange={(newPage) => {
                  setTopScorePage(newPage);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              />
            </div>
          </>
        )}

        {/* No results */}
        {!topScoreLoading && !topScoreError && (!topScoreData?.data || topScoreData.data.length === 0) && (
          <div className="text-center py-12 text-white/30 text-sm">No anime found.</div>
        )}
      </section>

      <Footer />

      <style>{`
        /* ── Marquee ── */
        @keyframes scrollLeft {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        @keyframes scrollRight {
          from { transform: translateX(-50%); }
          to   { transform: translateX(0); }
        }
        .animate-scrollLeft  {
          animation: scrollLeft  35s linear infinite;
          will-change: transform;
        }
        .animate-scrollRight {
          animation: scrollRight 35s linear infinite;
          will-change: transform;
        }
        .animate-scrollLeft:hover,
        .animate-scrollRight:hover { animation-play-state: paused; }

        /* ── Scrollbar hide ── */
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }

        /* ── xs breakpoint (360px) for arrow buttons ── */
        @media (min-width: 360px) { .xs\\:flex { display: flex; } }

        /* ── Prevent layout shift on spotlight image ── */
        img { max-width: 100%; }

        /* ══ REDUCED MOTION — old / low-power devices ══
           Triggered automatically when OS/browser has
           "Reduce Motion" enabled (Android, iOS, Windows). */
        @media (prefers-reduced-motion: reduce) {
          /* Kill all animations & transitions globally */
          *, *::before, *::after {
            animation-duration:       0.01ms !important;
            animation-iteration-count: 1     !important;
            transition-duration:      0.01ms !important;
            scroll-behavior:          auto   !important;
          }

          /* Free the compositor layers we no longer need */
          .animate-scrollLeft,
          .animate-scrollRight {
            animation: none !important;
            will-change: auto;
          }

          /* Stop the Tailwind pulse on skeletons */
          .animate-pulse {
            animation: none !important;
            opacity: 0.5;
          }

          /* Remove scale transforms on hover */
          .hover\\:scale-\\[1\\.02\\]:hover,
          .group:hover .group-hover\\:scale-105 {
            transform: none !important;
          }

          /* Disable heavy backdrop-blur on hover-triggered elements */
          .hover\\:bg-black\\/70 {
            backdrop-filter: none !important;
          }
        }

        /* ══ BACKDROP-BLUR PERFORMANCE
           backdrop-filter is GPU-expensive. Limit its use
           to elements that truly need it, and only on
           devices that can handle it smoothly. ══ */
        @media (max-width: 640px) {
          /* On small/older screens, strip backdrop-blur from
             decorative elements; keep only the spotlight badge. */
          .backdrop-blur-sm:not(.spotlight-badge) {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
