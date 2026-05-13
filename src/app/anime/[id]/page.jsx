// app/anime/[id]/page.jsx
"use client";

import { useEffect, useMemo, useRef, useState, useCallback, memo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Head from "next/head";
import Image from "next/image";
import {
  FaPlay,
  FaStar,
  FaHeart,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaTh,
  FaExternalLinkAlt,
  FaMusic,
  FaGlobe,
  FaBroadcastTower,
  FaBuilding,
  FaInfoCircle,
  FaBookOpen,
  FaUsers,
  FaArrowRight,
} from "react-icons/fa";
import { MdGridView, MdViewList } from "react-icons/md";

import { useApi } from "@/services/useApi";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";

const COLORS = {
  bg: "#0B0E14",
  surface: "#151921",
  surface2: "#1A2030",
  border: "#1E2A3A",
  accent: "#F59E0B",
  accentDim: "rgba(245,158,11,0.12)",
  accentBorder: "rgba(245,158,11,0.25)",
  text: "#E2E8F0",
  muted: "#8892A4",
  mutedDim: "#4B5563",
};

const fmt = (n) => n?.toLocaleString?.() ?? "—";
const fmtScore = (s) => (s ? s.toFixed(2) : "N/A");
const scoreColor = (s) => {
  if (!s) return COLORS.muted;
  if (s >= 8) return "#22D3A5";
  if (s >= 7) return "#F59E0B";
  if (s >= 6) return "#F97316";
  return "#EF4444";
};
const fmtMembers = (n) => {
  if (!n) return "?";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return String(n);
};
const EP_COLORS = {
  Bad: "rgb(231, 76, 60)",
  Mid: "rgb(243, 156, 18)",
  Good: "rgb(244, 208, 63)",
  Awesome: "rgb(40, 180, 99)",
  AbsoluteCinema: "rgb(29, 161, 242)",
  Filler: "#7C5C99",
};

const epColor = (ep) => {
  if (ep?.filler) return EP_COLORS.Filler;
  const score = ep?.score ?? 0;
  if (score <= 1.5) return EP_COLORS.Bad;
  if (score <= 3.5) return EP_COLORS.Mid;
  if (score < 4) return EP_COLORS.Good;
  if (score < 4.5) return EP_COLORS.Awesome;
  return EP_COLORS.AbsoluteCinema;
};

// ─── Helper Components (sudah di-memo, tidak diubah banyak) ────────────────
const DetailRow = memo(({ label, value }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-3 py-2 border-b border-[#1A2030] last:border-0">
      <span className="text-xs text-[#8892A4] shrink-0">{label}</span>
      <span className="text-xs text-[#E2E8F0] text-right break-words">{value}</span>
    </div>
  );
});
DetailRow.displayName = "DetailRow";

const Card = memo(({ children, className = "" }) => (
  <div className={`bg-[#151921] rounded-xl border border-[#1E2A3A] overflow-hidden ${className}`}>{children}</div>
));
Card.displayName = "Card";

const CardHead = memo(({ children }) => (
  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1A2030] text-sm font-semibold text-[#E2E8F0]">
    {children}
  </div>
));
CardHead.displayName = "CardHead";

const Tag = memo(({ children, amber = false }) => (
  <span
    className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium"
    style={{
      background: amber ? "rgba(245,158,11,0.12)" : "#1A2030",
      color: amber ? "#F59E0B" : COLORS.muted,
    }}
  >
    {children}
  </span>
));
Tag.displayName = "Tag";

const Player = memo(
  ({ animeId, currentEp, category, onCategoryChange, hasPrev, hasNext, onPrev, onNext }) => {
    const embedUrl = `https://megaplay.buzz/stream/mal/${animeId}/${currentEp?.mal_id ? currentEp.mal_id : 1}/${category}`;

    return (
      <div className="flex flex-col gap-3">
        <div
          className="relative w-full overflow-hidden rounded-xl border border-[#1E2A3A]"
          style={{ background: "#000", aspectRatio: "16/9" }}
        >
          <iframe
            key={`${animeId}-${currentEp?.mal_id}-${category}`}
            src={embedUrl}
            title={`Episode ${currentEp?.mal_id ? currentEp.mal_id : "1"}`}
            className="absolute inset-0 w-full h-full border-none"
            allowFullScreen
            allow="autoplay; encrypted-media"
            loading="lazy"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-1.5">
            {["sub", "dub"].map((type) => (
              <button
                key={type}
                onClick={() => onCategoryChange(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  category === type ? "bg-amber-500 text-black" : "bg-[#1A2030] text-[#8892A4]"
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: "#1A2030", color: hasPrev ? "#E2E8F0" : "#4B5563" }}
            >
              <FaChevronLeft size={10} /> Prev
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ background: "#1A2030", color: hasNext ? "#E2E8F0" : "#4B5563" }}
            >
              Next <FaChevronRight size={10} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-xs text-[#8892A4]">Now Playing</p>
            <p className="text-sm font-semibold text-[#E2E8F0] truncate max-w-[200px] md:max-w-xs">
              Ep {currentEp?.mal_id ?? "—"}
              {currentEp?.title ? ` — ${currentEp.title}` : ""}
            </p>
          </div>
        </div>
      </div>
    );
  },
  (prev, next) =>
    prev.currentEp?.mal_id === next.currentEp?.mal_id &&
    prev.category === next.category &&
    prev.animeId === next.animeId &&
    prev.hasPrev === next.hasPrev &&
    prev.hasNext === next.hasNext,
);
Player.displayName = "Player";

const EpisodeCard = memo(({ ep, isActive, layout, onClick, progress }) => {
  const color = epColor(ep);
  const percent = progress?.percent ?? 0;
  const isWatched = progress?.eventType === "complete" || percent >= 95;
  const statusLabel = isWatched ? "Watched" : percent ? `Resume ${percent}%` : null;

  if (layout === "grid") {
    return (
      <button
        onClick={onClick}
        title={ep.title ?? `Episode ${ep.mal_id}`}
        className="relative overflow-hidden rounded-lg text-xs font-semibold transition-all"
        style={{
          padding: "6px 4px",
          background: isActive ? color : isWatched ? "rgba(34, 197, 94, 0.1)" : COLORS.surface,
          border: `1px solid ${isActive ? color : isWatched ? "rgba(34, 197, 94, 0.35)" : COLORS.border}`,
          color: isActive ? "#fff" : COLORS.muted,
          cursor: "pointer",
        }}
      >
        {!isActive && (
          <span className="absolute top-0 left-0 bottom-0 w-[3px]" style={{ background: color, opacity: 0.7 }} />
        )}
        <span className="relative z-10">{ep.mal_id}</span>
        {statusLabel && (
          <span className="absolute left-0 right-0 bottom-0 px-2 py-1 text-[10px] font-semibold text-[#E2E8F0] bg-black/65">
            {statusLabel}
          </span>
        )}
        {percent > 0 && (
          <div className="absolute left-0 right-0 bottom-0 h-1" style={{ background: "rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-r-full"
              style={{ width: `${Math.min(percent, 100)}%`, background: isWatched ? COLORS.accent : COLORS.accent }}
            />
          </div>
        )}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-left transition-all"
      style={{
        background: isActive ? COLORS.surface2 : isWatched ? "rgba(34, 197, 94, 0.08)" : "transparent",
        border: `1px solid ${isActive ? "rgba(245,158,11,0.3)" : isWatched ? "rgba(34,197,94,0.2)" : COLORS.border}`,
        cursor: "pointer",
      }}
    >
      <span className="w-1 self-stretch rounded-full shrink-0" style={{ background: color }} />
      <span className="text-xs font-bold shrink-0 w-6" style={{ color: isActive ? COLORS.accent : COLORS.muted }}>
        {ep.mal_id}
      </span>
      <span className="flex-1 overflow-hidden">
        <span className="block text-xs font-medium text-[#E2E8F0] truncate">{ep.title ?? `Episode ${ep.mal_id}`}</span>
        {ep.aired && (
          <span className="block text-[10px] text-[#8892A4] mt-0.5">
            {new Date(ep.aired).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
          </span>
        )}
        {statusLabel && (
          <div className="mt-2">
            <div className="h-1 rounded-full bg-[#111827] overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${Math.min(percent, 100)}%`, background: isWatched ? COLORS.accent : COLORS.accent }}
              />
            </div>
            <span className="text-[10px] text-[#8892A4] mt-1 block">{statusLabel}</span>
          </div>
        )}
      </span>
      {ep.score && (
        <span className="text-[11px] font-semibold shrink-0" style={{ color: color }}>
          ★ {ep.score.toFixed(1)}
        </span>
      )}
      {ep.filler && (
        <span
          className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full font-medium"
          style={{ background: "rgba(124,92,153,0.2)", color: "#B89BD0" }}
        >
          FILLER
        </span>
      )}
    </button>
  );
});
EpisodeCard.displayName = "EpisodeCard";

const Pagination = memo(({ page, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="flex gap-1.5 items-center flex-wrap">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page <= 1}
        className="px-2.5 py-1 rounded-lg text-xs"
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          color: page <= 1 ? COLORS.mutedDim : COLORS.text,
          cursor: page <= 1 ? "not-allowed" : "pointer",
        }}
      >
        ‹
      </button>
      {Array.from({ length: total }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{
            background: p === page ? COLORS.accent : COLORS.surface,
            border: `1px solid ${p === page ? COLORS.accent : COLORS.border}`,
            color: p === page ? "#0B0E14" : COLORS.muted,
            cursor: "pointer",
            minWidth: 30,
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(total, page + 1))}
        disabled={page >= total}
        className="px-2.5 py-1 rounded-lg text-xs"
        style={{
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          color: page >= total ? COLORS.mutedDim : COLORS.text,
          cursor: page >= total ? "not-allowed" : "pointer",
        }}
      >
        ›
      </button>
    </div>
  );
});
Pagination.displayName = "Pagination";

const CharCard = memo(({ char }) => {
  const cName = char.character?.name ?? "Unknown";
  const cImg = char.character?.images?.jpg?.image_url;
  const role = char.role;
  const va = char.voice_actors?.find((v) => v.language === "Japanese");
  return (
    <div
      className="flex items-stretch rounded-xl overflow-hidden text-xs"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
    >
      <div className="flex items-center gap-2 px-2.5 py-2 flex-1">
        {cImg && (
          <div className="relative w-10 h-12 shrink-0">
            <Image
              src={cImg}
              alt={cName}
              className="object-cover rounded-md"
              fill
              sizes="40px"
            />
          </div>
        )}
        <div>
          <p className="font-semibold text-[#E2E8F0]">{cName}</p>
          <p
            className="text-[10px] mt-0.5 font-medium"
            style={{ color: role === "Main" ? COLORS.accent : COLORS.muted }}
          >
            {role}
          </p>
        </div>
      </div>
      {va && (
        <div className="flex items-center gap-2 px-2.5 py-2" style={{ borderLeft: `1px solid ${COLORS.border}` }}>
          <div className="text-right">
            <p className="font-semibold text-[#E2E8F0]">{va.person?.name}</p>
            <p className="text-[10px] text-[#8892A4] mt-0.5">Japanese</p>
          </div>
          {va.person?.images?.jpg?.image_url && (
            <div className="relative w-10 h-12 shrink-0">
              <Image
                src={va.person.images.jpg.image_url}
                alt={va.person.name}
                className="object-cover rounded-md"
                fill
                sizes="40px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
});
CharCard.displayName = "CharCard";

const AnimeCard = memo(({ entry }) => {
  const title = entry?.title ?? "?";
  const img = entry?.images?.jpg?.image_url;
  const score = entry?.score;
  const id = entry?.mal_id;
  return (
    <Link
      href={`/anime/${id}`}
      className="flex flex-col rounded-xl overflow-hidden transition-transform hover:-translate-y-1"
      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}`, textDecoration: "none" }}
    >
      <div className="relative aspect-[2/3]">
        {img ? (
          <Image src={img} alt={title} fill className="object-cover" sizes="(max-width: 640px) 120px, 160px" />
        ) : (
          <div className="absolute inset-0 bg-[#1A2030]" />
        )}
        {score && (
          <span
            className="absolute top-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ background: "rgba(11,14,20,0.85)", color: scoreColor(score) }}
          >
            ★ {score.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-[11px] text-[#E2E8F0] font-medium p-2 line-clamp-2">{title}</p>
    </Link>
  );
});
AnimeCard.displayName = "AnimeCard";

// ─── Constants for progress ────────────────────────────────────────────────
const PLAYER_PROGRESS_API_URL = process.env.NEXT_PUBLIC_PLAYER_PROGRESS_URL;
const PLAYER_EMBED_ORIGIN = "https://megaplay.buzz";
const progressCacheKey = (animeId, episodeId) => `watch-progress:${animeId}:${episodeId}`;

// ─── Main Component ────────────────────────────────────────────────────────
export default function AnimePage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const epFromUrl = Number(searchParams.get("ep")) || null;
  const [epPage, setEpPage] = useState(1);
  const [layout, setLayout] = useState("grid");
  const [tab, setTab] = useState("episodes");
  const [showFullSyn, setShowFullSyn] = useState(false);
  const [playerCategory, setPlayerCategory] = useState("sub");
  const [autoNextEnabled, setAutoNextEnabled] = useState(true);
  
  // ✅ Optimasi: lazy initialization watchProgressMap
  const [watchProgressMap, setWatchProgressMap] = useState(() => {
    if (typeof window === "undefined") return {};
    const map = {};
    const prefix = `watch-progress:${id}:`;
    try {
      Object.keys(window.localStorage).forEach((key) => {
        if (!key.startsWith(prefix)) return;
        const value = window.localStorage.getItem(key);
        if (!value) return;
        const payload = JSON.parse(value);
        const episodeId = key.slice(prefix.length);
        map[episodeId] = payload;
      });
    } catch (e) {
      // ignore
    }
    return map;
  });
  
  const { user, isAuthenticated, updateWatchProgress } = useAuth();

  const { data: animeData, isLoading: animeLoading, isError: animeError } = useApi(`/anime/${id}/full`);
  const { data: epData, isLoading: epLoading } = useApi(`/anime/${id}/episodes?page=${epPage}`);
  const { data: charData, isLoading: charLoading } = useApi(tab === "characters" ? `/anime/${id}/characters` : null);
  const { data: recData, isLoading: recLoading } = useApi(tab === "recommended" ? `/anime/${id}/recommendations` : null);

  const anime = animeData?.data;
  const episodes = useMemo(() => {
    const list = epData?.data ?? [];
    if (list.length > 0) return list;
    const episodeCount = typeof anime?.episodes === "number" ? anime.episodes : null;
    if (episodeCount && episodeCount > 0) {
      return Array.from({ length: episodeCount }, (_, index) => ({
        mal_id: index + 1,
        title: `Episode ${index + 1}`,
      }));
    }
    return [{ mal_id: 1, title: "Episode 1" }];
  }, [epData, anime]);
  
  const pagination = epData?.pagination;
  const characters = charData?.data ?? [];
  const recommendations = recData?.data ?? [];

  // Active episode derived from URL
  const activeEp = useMemo(() => {
    if (episodes.length === 0) return null;
    if (epFromUrl && episodes.some((e) => e.mal_id === epFromUrl)) return epFromUrl;
    return episodes[0]?.mal_id ?? null;
  }, [epFromUrl, episodes]);

  const currentEp = useMemo(() => episodes.find((e) => e.mal_id === activeEp) ?? episodes[0], [episodes, activeEp]);
  const currentIdx = episodes.findIndex((e) => e.mal_id === activeEp);
  const hasPrev = currentIdx > 0;
  const hasNext = currentIdx < episodes.length - 1;

  // Navigasi episode (hanya ubah URL, tidak re-mount)
  const navigateToEp = useCallback(
    (epId) => {
      router.replace(`/anime/${id}?ep=${epId}`, { scroll: false });
    },
    [id, router],
  );

  const handlePrev = useCallback(() => {
    if (!hasPrev) return;
    navigateToEp(episodes[currentIdx - 1].mal_id);
  }, [hasPrev, currentIdx, episodes, navigateToEp]);

  const handleNext = useCallback(() => {
    if (!hasNext) return;
    navigateToEp(episodes[currentIdx + 1].mal_id);
  }, [hasNext, currentIdx, episodes, navigateToEp]);

  const handleSelectEp = useCallback(
    (epId) => {
      navigateToEp(epId);
    },
    [navigateToEp],
  );

  // Ref untuk throttling progress
  const lastSentProgressRef = useRef({ episodeId: null, percent: 0, sentAt: 0 });
  const latestProgressRef = useRef(null);

  // ✅ FIX: Define shouldSendProgress BEFORE it is used
  const shouldSendProgress = useCallback((lastSent, next) => {
    if (!lastSent || lastSent.episodeId !== next.episodeId) return true;
    if (next.eventType === "complete") return true;
    if (next.percent >= lastSent.percent + 5) return true;
    return Date.now() - (lastSent.sentAt || 0) >= 20000;
  }, []);

  const persistWatchProgress = useCallback(
    async ({ animeId, episodeId, currentTime, duration, percent, eventType }) => {
      const normalized = {
        animeId,
        episodeId,
        currentTime,
        duration,
        percent,
        eventType,
        updatedAt: new Date().toISOString(),
      };
      latestProgressRef.current = normalized;
      // Cache local
      const cacheKey = progressCacheKey(animeId, episodeId);
      try {
        localStorage.setItem(cacheKey, JSON.stringify(normalized));
      } catch {}
      setWatchProgressMap((prev) => ({ ...prev, [episodeId]: normalized }));

      if (isAuthenticated && anime) {
        if (!shouldSendProgress(lastSentProgressRef.current, normalized)) return;
        try {
          await updateWatchProgress(
            animeId,
            episodeId,
            episodes.length,
            anime.title,
            anime.images?.jpg?.image_url || "",
          );
          lastSentProgressRef.current = {
            episodeId,
            percent,
            sentAt: Date.now(),
          };
        } catch (error) {
          console.warn("Failed to save watch progress", error);
        }
      }
    },
    [isAuthenticated, anime, episodes.length, updateWatchProgress, shouldSendProgress],
  );

  // Listener progress dari iframe
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== PLAYER_EMBED_ORIGIN && !event.origin?.includes("megaplay.buzz")) return;
      let data = event.data;
      if (typeof data === "string") {
        try { data = JSON.parse(data); } catch { return; }
      }
      if (data.channel !== "megacloud") return;
      const isWatchLog = data.type === "watching-log";
      const isTimeEvent = data.event === "time";
      const isPauseEvent = data.event === "pause";
      const isCompleteEvent = data.event === "complete";
      if (!isWatchLog && !isTimeEvent && !isPauseEvent && !isCompleteEvent) return;

      const currentTime = typeof data.currentTime === "number" ? data.currentTime : typeof data.time === "number" ? data.time : 0;
      const duration = typeof data.duration === "number" ? data.duration : 0;
      const percent = typeof data.percent === "number"
        ? Math.round(data.percent)
        : duration ? Math.round((currentTime / duration) * 100) : 0;
      const eventType = isWatchLog ? "watching-log" : data.event;

      if (!currentEp?.mal_id) return;
      persistWatchProgress({
        animeId: id,
        episodeId: currentEp.mal_id,
        currentTime,
        duration,
        percent,
        eventType,
      });

      if (isCompleteEvent && autoNextEnabled && hasNext) {
        setTimeout(() => handleNext(), 250);
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [currentEp?.mal_id, id, persistWatchProgress, autoNextEnabled, hasNext, handleNext]);

  // Send progress on unload (beacon)
  useEffect(() => {
    const sendUnloadProgress = () => {
      const progress = latestProgressRef.current;
      if (!progress || !PLAYER_PROGRESS_API_URL) return;
      const payload = { ...progress, eventType: "unload", updatedAt: new Date().toISOString() };
      const body = JSON.stringify(payload);
      if (navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(PLAYER_PROGRESS_API_URL, blob);
      } else {
        fetch(PLAYER_PROGRESS_API_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body, keepalive: true }).catch(() => {});
      }
    };
    window.addEventListener("beforeunload", sendUnloadProgress);
    return () => window.removeEventListener("beforeunload", sendUnloadProgress);
  }, []);

  // Track when episode changes (untuk update server) – dipertahankan fungsinya
  useEffect(() => {
    if (isAuthenticated && currentEp && anime && id) {
      const episodeNumber = currentEp.mal_id;
      const totalEpisodes = episodes.length;
      updateWatchProgress(
        id,
        episodeNumber,
        totalEpisodes,
        anime.title,
        anime.images?.jpg?.image_url || "",
      ).catch((error) => console.warn("Failed to update watch progress:", error));
    }
  }, [currentEp, isAuthenticated, id, anime, episodes.length, updateWatchProgress]);

  const handlePageChange = useCallback((p) => setEpPage(p), []);

  const legend = [
    { label: "Absolute Cinema", color: "rgb(29,161,242)" },
    { label: "Awesome", color: "rgb(40,180,99)" },
    { label: "Good", color: "rgb(244,208,63)" },
    { label: "Mid", color: "rgb(243,156,18)" },
    { label: "Bad", color: "rgb(231,76,60)" },
    { label: "Filler", color: "#7C5C99" },
  ];

  if (animeError) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: COLORS.bg }}>
        <div className="text-center p-8">
          <p className="text-2xl font-bold text-[#E2E8F0] mb-2">Anime not found</p>
          <Link href="/" className="text-sm underline" style={{ color: COLORS.accent }}>
            ← Go Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen" style={{ background: COLORS.bg, color: COLORS.text }}>
      {anime && (
        <Head>
          <title>{anime.title} — Watch Online</title>
          <meta name="description" content={anime.synopsis?.slice(0, 160)} />
        </Head>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 md:py-6">
        {/* Responsive: stack vertikal di mobile, horizontal di xl */}
        <div className="flex flex-col xl:flex-row gap-6 items-start">
          {/* LEFT: Player + Tabs */}
          <div className="flex-1 min-w-0 w-full">
            {animeLoading ? (
              <div
                className="aspect-video rounded-xl flex items-center justify-center"
                style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
              >
                <Loader />
              </div>
            ) : (
              <Player
                animeId={id}
                currentEp={currentEp}
                category={playerCategory}
                onCategoryChange={setPlayerCategory}
                hasPrev={hasPrev}
                hasNext={hasNext}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            )}

            {/* TABS */}
            <div className="mt-5">
              <div className="flex gap-0 border-b overflow-x-auto scrollbar-hide" style={{ borderColor: COLORS.border }}>
                {[
                  { key: "episodes", label: "Episodes" },
                  { key: "detail", label: "Detail & Info" },
                  { key: "characters", label: "Characters" },
                  { key: "recommended", label: "Recommended" },
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className="px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap bg-transparent outline-none"
                    style={{
                      color: tab === key ? COLORS.accent : COLORS.muted,
                      borderBottomWidth: "2px",
                      borderBottomStyle: "solid",
                      borderBottomColor: tab === key ? COLORS.accent : "transparent",
                      marginBottom: -1,
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="pt-4">
                {tab === "episodes" && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Pagination page={epPage} total={pagination?.last_visible_page ?? 1} onChange={handlePageChange} />
                      <div
                        className="flex rounded-lg overflow-hidden shrink-0"
                        style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                      >
                        <button
                          onClick={() => setLayout("list")}
                          className="p-2 transition-colors"
                          style={{
                            background: layout === "list" ? COLORS.accent : "transparent",
                            color: layout === "list" ? "#0B0E14" : COLORS.muted,
                          }}
                        >
                          <MdViewList size={18} />
                        </button>
                        <button
                          onClick={() => setLayout("grid")}
                          className="p-2 transition-colors"
                          style={{
                            background: layout === "grid" ? COLORS.accent : "transparent",
                            color: layout === "grid" ? "#0B0E14" : COLORS.muted,
                          }}
                        >
                          <MdGridView size={18} />
                        </button>
                      </div>
                      <button
                        onClick={() => setAutoNextEnabled((prev) => !prev)}
                        className="rounded-lg px-3 py-2 text-xs font-semibold transition-all shrink-0"
                        style={{
                          background: autoNextEnabled ? COLORS.accent : COLORS.surface,
                          color: autoNextEnabled ? "#0B0E14" : COLORS.text,
                          border: `1px solid ${autoNextEnabled ? COLORS.accent : COLORS.border}`,
                        }}
                      >
                        Auto next: {autoNextEnabled ? "On" : "Off"}
                      </button>
                    </div>
                    <div
                      className="flex flex-wrap gap-2 rounded-xl p-3"
                      style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
                    >
                      {legend.map((l) => (
                        <div key={l.label} className="flex items-center gap-1.5 text-[11px]" style={{ color: COLORS.text }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                          {l.label}
                        </div>
                      ))}
                    </div>
                    {epLoading ? (
                      <Loader />
                    ) : (
                      <div
                        className={layout === "grid" ? "grid gap-2" : "flex flex-col gap-1.5"}
                        style={
                          layout === "grid"
                            ? {
                                gridTemplateColumns: "repeat(auto-fill, minmax(55px, 1fr))",
                              }
                            : {}
                        }
                      >
                        {episodes.map((ep) => (
                          <EpisodeCard
                            key={ep.mal_id}
                            ep={ep}
                            isActive={ep.mal_id === activeEp}
                            layout={layout}
                            onClick={() => handleSelectEp(ep.mal_id)}
                            progress={watchProgressMap[ep.mal_id]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {tab === "detail" && (animeLoading ? <Loader /> : anime && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <Card>
                        <CardHead><FaInfoCircle className="text-amber-400" size={14} /> Synopsis</CardHead>
                        <div className="px-4 py-3">
                          <p className="text-sm leading-relaxed" style={{ color: "#C4CBDA" }}>
                            {showFullSyn ? anime.synopsis : (anime.synopsis?.slice(0, 400) ?? "") + (anime.synopsis?.length > 400 ? "…" : "")}
                          </p>
                          {anime.synopsis?.length > 400 && (
                            <button
                              onClick={() => setShowFullSyn(!showFullSyn)}
                              className="text-xs mt-2 font-medium"
                              style={{ color: COLORS.accent, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                            >
                              {showFullSyn ? "Show less" : "Read more"}
                            </button>
                          )}
                        </div>
                      </Card>
                    </div>
                    <Card>
                      <CardHead><FaInfoCircle className="text-amber-400" size={14} /> Information</CardHead>
                      <div className="px-4 py-2">
                        <DetailRow label="Type" value={anime.type} />
                        <DetailRow label="Episodes" value={anime.episodes ?? "Ongoing"} />
                        <DetailRow label="Status" value={anime.status} />
                        <DetailRow label="Aired" value={anime.aired?.string} />
                        <DetailRow label="Duration" value={anime.duration} />
                        <DetailRow label="Rating" value={anime.rating} />
                        <DetailRow label="Source" value={anime.source} />
                        <DetailRow label="Season" value={anime.season ? `${anime.season} ${anime.year}` : null} />
                      </div>
                    </Card>
                    <Card>
                      <CardHead><FaBuilding className="text-amber-400" size={12} /> Production</CardHead>
                      <div className="px-4 py-2">
                        <DetailRow label="Studios" value={anime.studios?.map((s) => s.name).join(", ")} />
                        <DetailRow label="Producers" value={anime.producers?.map((p) => p.name).join(", ")} />
                        <DetailRow label="Licensors" value={anime.licensors?.map((l) => l.name).join(", ")} />
                        {anime.broadcast?.string && <DetailRow label="Broadcast" value={anime.broadcast.string} />}
                        <div className="flex justify-between py-2 items-center">
                          <span className="text-xs" style={{ color: COLORS.muted }}>Favorites</span>
                          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#F97096" }}>
                            <FaHeart size={10} /> {fmt(anime.favorites)}
                          </span>
                        </div>
                      </div>
                    </Card>
                    {(anime.theme?.openings?.length > 0 || anime.theme?.endings?.length > 0) && (
                      <Card>
                        <CardHead><FaMusic className="text-amber-400" size={12} /> Theme Songs</CardHead>
                        <div className="px-4 py-3 space-y-3">
                          {anime.theme.openings?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.accent }}>Openings</p>
                              {anime.theme.openings.map((op, i) => (
                                <p key={i} className="text-xs py-1.5 border-b last:border-0" style={{ color: "#C4CBDA", borderColor: COLORS.border }}>{op}</p>
                              ))}
                            </div>
                          )}
                          {anime.theme.endings?.length > 0 && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: COLORS.muted }}>Endings</p>
                              {anime.theme.endings.map((ed, i) => (
                                <p key={i} className="text-xs py-1.5 border-b last:border-0" style={{ color: "#C4CBDA", borderColor: COLORS.border }}>{ed}</p>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                    <Card>
                      <CardHead><FaGlobe className="text-amber-400" size={12} /> Links</CardHead>
                      <div className="px-4 py-3 space-y-3">
                        {anime.streaming?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {anime.streaming.map((s, i) => (
                              <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg" style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.text, textDecoration: "none" }}>
                                {s.name} <FaExternalLinkAlt size={9} />
                              </a>
                            ))}
                          </div>
                        )}
                        {anime.external?.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {anime.external.map((l, i) => (
                              <a key={i} href={l.url} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2.5 py-1 rounded-full transition-colors" style={{ background: COLORS.surface2, border: `1px solid ${COLORS.border}`, color: COLORS.muted, textDecoration: "none" }}>
                                {l.name}
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}

                {tab === "characters" && (charLoading ? <Loader /> : (
                  <>
                    <p className="text-xs mb-3" style={{ color: COLORS.muted }}>{characters.length} characters</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {characters.slice(0, 30).map((c) => <CharCard key={c.character?.mal_id} char={c} />)}
                    </div>
                  </>
                ))}

                {tab === "recommended" && (recLoading ? <Loader /> : (
                  <>
                    <p className="text-xs mb-3" style={{ color: COLORS.muted }}>{recommendations.length} recommendations</p>
                    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                      {recommendations.slice(0, 20).map((r) => <AnimeCard key={r.entry?.mal_id} entry={r.entry} />)}
                    </div>
                  </>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR - pindah ke bawah di mobile, sticky di xl */}
          <div className="w-full xl:w-80 xl:sticky xl:top-4 flex flex-col gap-4">
            {animeLoading ? <Loader /> : anime && (
              <>
                <Card>
                  <div className="relative aspect-[2/3] max-h-[300px]">
                    <Image
                      src={anime.images?.webp?.large_image_url}
                      alt={anime.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 320px"
                    />
                    <div
                      className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(to top, #151921 0%, transparent 55%)" }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-sm font-bold text-[#E2E8F0] leading-tight">{anime.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: COLORS.accent }}>{anime.title_japanese}</p>
                    </div>
                  </div>
                  <div className="p-3 flex flex-wrap gap-1.5">
                    {anime.genres?.slice(0, 6).map((g) => <Tag key={g.mal_id} amber>{g.name}</Tag>)}
                    <Tag>{anime.type}</Tag>
                  </div>
                </Card>
                <Card>
                  <CardHead><FaStar className="text-amber-400" size={12} /> Score & Stats</CardHead>
                  <div className="grid grid-cols-2 gap-px p-3" style={{ background: COLORS.border }}>
                    {[
                      { label: "Score", val: fmtScore(anime.score), color: scoreColor(anime.score), sub: `${fmt(anime.scored_by)} voters` },
                      { label: "Rank", val: `#${anime.rank ?? "?"}`, color: COLORS.accent },
                      { label: "Popularity", val: `#${anime.popularity ?? "?"}`, color: COLORS.accent },
                      { label: "Members", val: fmtMembers(anime.members), color: COLORS.accent },
                    ].map(({ label, val, color, sub }) => (
                      <div key={label} className="flex flex-col items-center justify-center py-3" style={{ background: COLORS.surface }}>
                        <span className="text-xl font-bold" style={{ color }}>{val}</span>
                        <span className="text-[10px] mt-0.5" style={{ color: COLORS.muted }}>{label}</span>
                        {sub && <span className="text-[9px]" style={{ color: COLORS.mutedDim }}>{sub}</span>}
                      </div>
                    ))}
                  </div>
                </Card>
                <Card>
                  <CardHead><FaInfoCircle className="text-amber-400" size={12} /> Quick Info</CardHead>
                  <div className="px-3 py-1">
                    <DetailRow label="Episodes" value={anime.episodes ?? "Ongoing"} />
                    <DetailRow label="Status" value={anime.status} />
                    <DetailRow label="Aired" value={anime.aired?.string} />
                    <DetailRow label="Duration" value={anime.duration} />
                    <DetailRow label="Season" value={anime.season ? `${anime.season} ${anime.year}` : null} />
                    <DetailRow label="Studios" value={anime.studios?.map((s) => s.name).join(", ")} />
                    <div className="flex justify-between py-2 items-center">
                      <span className="text-xs" style={{ color: COLORS.muted }}>Favorites</span>
                      <span className="text-xs font-semibold flex items-center gap-1" style={{ color: "#F97096" }}><FaHeart size={9} /> {fmt(anime.favorites)}</span>
                    </div>
                  </div>
                </Card>
                {currentEp && (
                  <Card>
                    <CardHead>Now Watching</CardHead>
                    <div className="px-3 py-2.5">
                      <p className="text-xs font-bold" style={{ color: COLORS.accent }}>Episode {currentEp.mal_id}</p>
                      {currentEp.title && <p className="text-sm font-semibold mt-0.5" style={{ color: COLORS.text }}>{currentEp.title}</p>}
                      {currentEp.aired && (
                        <p className="text-[11px] mt-1" style={{ color: COLORS.muted }}>
                          Aired: {new Date(currentEp.aired).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                        </p>
                      )}
                      {currentEp.score && <p className="text-[11px] mt-0.5" style={{ color: scoreColor(currentEp.score) }}>★ {currentEp.score.toFixed(1)} community score</p>}
                      {currentEp.filler && (
                        <span className="inline-block mt-1.5 text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(124,92,153,0.2)", color: "#B89BD0" }}>FILLER EPISODE</span>
                      )}
                    </div>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      <style jsx global>{`
        * { box-sizing: border-box; }
        body { background: #0b0e14; }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}