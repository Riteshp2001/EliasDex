"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Image from "next/image";
import Footer from "@/components/Footer";

// ======================== TIER STYLES LENGKAP (18 TIER) ========================
const TIER_STYLES = {
  celestial: {
    label: "Celestial",
    icon: "🌌",
    accent: "#E0B0FF",
    accentGlow: "rgba(224,176,255,0.7)",
    nameGrad: "linear-gradient(135deg, #E0B0FF, #A855F7, #C084FC, #E0B0FF)",
    badgeBg: "linear-gradient(135deg, #1A0B2E, #2D1B4E)",
    badgeBorder: "#E0B0FF",
    avatarBorder: "linear-gradient(135deg, #E0B0FF, #A855F7, #C084FC)",
    glowEffect: "0 0 20px rgba(224,176,255,0.6)",
    css: "celestial",
    levelColor: "#E0B0FF",
  },
  legendary: {
    label: "Legendary",
    icon: "🏆",
    accent: "#FFD966",
    accentGlow: "rgba(255,217,102,0.6)",
    nameGrad: "linear-gradient(135deg, #FFD966, #FFB347, #FFD966)",
    badgeBg: "linear-gradient(135deg, #2E1A00, #4A2E00)",
    badgeBorder: "#FFD966",
    avatarBorder: "linear-gradient(135deg, #FFD966, #FFB347)",
    glowEffect: "0 0 18px rgba(255,217,102,0.5)",
    css: "legendary",
    levelColor: "#FFD966",
  },
  mythic: {
    label: "Mythic",
    icon: "⚡",
    accent: "#C77DFF",
    accentGlow: "rgba(199,125,255,0.55)",
    nameGrad: "linear-gradient(135deg, #C77DFF, #9B5DE5, #C77DFF)",
    badgeBg: "linear-gradient(135deg, #1E102E, #321B4E)",
    badgeBorder: "#C77DFF",
    avatarBorder: "linear-gradient(135deg, #C77DFF, #9B5DE5)",
    glowEffect: "0 0 18px rgba(199,125,255,0.5)",
    css: "mythic",
    levelColor: "#C77DFF",
  },
  immortal: {
    label: "Immortal",
    icon: "♾️",
    accent: "#64FFDA",
    accentGlow: "rgba(100,255,218,0.5)",
    nameGrad: "linear-gradient(135deg, #64FFDA, #00B4D8, #64FFDA)",
    badgeBg: "linear-gradient(135deg, #0A2A2A, #104F4F)",
    badgeBorder: "#64FFDA",
    avatarBorder: "linear-gradient(135deg, #64FFDA, #00B4D8)",
    glowEffect: "0 0 15px rgba(100,255,218,0.4)",
    css: "immortal",
    levelColor: "#64FFDA",
  },
  titanium: {
    label: "Titanium",
    icon: "⚙️",
    accent: "#B0BEC5",
    accentGlow: "rgba(176,190,197,0.45)",
    nameGrad: "linear-gradient(135deg, #B0BEC5, #90A4AE, #B0BEC5)",
    badgeBg: "linear-gradient(135deg, #1C252B, #2C3A42)",
    badgeBorder: "#B0BEC5",
    avatarBorder: "linear-gradient(135deg, #B0BEC5, #90A4AE)",
    glowEffect: "0 0 12px rgba(176,190,197,0.3)",
    css: "titanium",
    levelColor: "#B0BEC5",
  },
  diamond: {
    label: "Diamond",
    icon: "💎",
    accent: "#7DF9FF",
    accentGlow: "rgba(125,249,255,0.5)",
    nameGrad: "linear-gradient(135deg, #7DF9FF, #00E5FF, #7DF9FF)",
    badgeBg: "linear-gradient(135deg, #0A2E38, #104A58)",
    badgeBorder: "#7DF9FF",
    avatarBorder: "linear-gradient(135deg, #7DF9FF, #00E5FF)",
    glowEffect: "0 0 15px rgba(125,249,255,0.4)",
    css: "diamond",
    levelColor: "#7DF9FF",
  },
  platinum: {
    label: "Platinum",
    icon: "✦",
    accent: "#A78BFA",
    accentGlow: "rgba(167,139,250,0.38)",
    nameGrad: "linear-gradient(135deg, #A78BFA, #60A5FA, #C084FC)",
    badgeBg: "linear-gradient(135deg, #0D0820, #160D30)",
    badgeBorder: "#A78BFA",
    avatarBorder: "linear-gradient(135deg, #A78BFA, #60A5FA)",
    glowEffect: "0 0 12px rgba(167,139,250,0.4)",
    css: "platinum",
    levelColor: "#A78BFA",
  },
  "gold-plus": {
    label: "Gold+",
    icon: "⭐",
    accent: "#F7D44A",
    accentGlow: "rgba(247,212,74,0.35)",
    nameGrad: "linear-gradient(135deg, #F7D44A, #FFE484, #F7D44A)",
    badgeBg: "linear-gradient(135deg, #1C1600, #2E2600)",
    badgeBorder: "#F7D44A",
    avatarBorder: "linear-gradient(135deg, #F7D44A, #FFE484)",
    glowEffect: "0 0 10px rgba(247,212,74,0.4)",
    css: "gold-plus",
    levelColor: "#F7D44A",
  },
  gold: {
    label: "Gold",
    icon: "★",
    accent: "#F7CC45",
    accentGlow: "rgba(247,204,69,0.3)",
    nameGrad: "linear-gradient(135deg, #F7CC45, #FFF0A0, #F7CC45)",
    badgeBg: "linear-gradient(135deg, #1C1200, #2E1F00)",
    badgeBorder: "#F7CC45",
    avatarBorder: "linear-gradient(135deg, #F7CC45, #FFF0A0)",
    glowEffect: "0 0 8px rgba(247,204,69,0.4)",
    css: "gold",
    levelColor: "#F7CC45",
  },
  "silver-plus": {
    label: "Silver+",
    icon: "✨",
    accent: "#D0E0F0",
    accentGlow: "rgba(208,224,240,0.3)",
    nameGrad: "linear-gradient(135deg, #D0E0F0, #FFFFFF, #D0E0F0)",
    badgeBg: "linear-gradient(135deg, #0F1A24, #1F2E3C)",
    badgeBorder: "#D0E0F0",
    avatarBorder: "linear-gradient(135deg, #D0E0F0, #FFFFFF)",
    glowEffect: "0 0 8px rgba(208,224,240,0.3)",
    css: "silver-plus",
    levelColor: "#D0E0F0",
  },
  silver: {
    label: "Silver",
    icon: "◆",
    accent: "#C4D0DC",
    accentGlow: "rgba(196,208,220,0.25)",
    nameGrad: "linear-gradient(135deg, #C4D0DC, #E8F0F8, #C4D0DC)",
    badgeBg: "linear-gradient(135deg, #0F1C28, #1A2C3A)",
    badgeBorder: "#C4D0DC",
    avatarBorder: "linear-gradient(135deg, #C4D0DC, #E8F0F8)",
    glowEffect: "0 0 6px rgba(196,208,220,0.3)",
    css: "silver",
    levelColor: "#C4D0DC",
  },
  "bronze-plus": {
    label: "Bronze+",
    icon: "🔸",
    accent: "#E0A060",
    accentGlow: "rgba(224,160,96,0.28)",
    nameGrad: "linear-gradient(135deg, #E0A060, #F0C080, #E0A060)",
    badgeBg: "linear-gradient(135deg, #2A1808, #402810)",
    badgeBorder: "#E0A060",
    avatarBorder: "linear-gradient(135deg, #E0A060, #F0C080)",
    glowEffect: "0 0 6px rgba(224,160,96,0.3)",
    css: "bronze-plus",
    levelColor: "#E0A060",
  },
  bronze: {
    label: "Bronze",
    icon: "◈",
    accent: "#CD7F32",
    accentGlow: "rgba(205,127,50,0.25)",
    nameGrad: "linear-gradient(135deg, #CD7F32, #E89F60, #CD7F32)",
    badgeBg: "linear-gradient(135deg, #1F1206, #301E0E)",
    badgeBorder: "#CD7F32",
    avatarBorder: "linear-gradient(135deg, #CD7F32, #E89F60)",
    glowEffect: "0 0 5px rgba(205,127,50,0.3)",
    css: "bronze",
    levelColor: "#CD7F32",
  },
  iron: {
    label: "Iron",
    icon: "⚙️",
    accent: "#A8B0B8",
    accentGlow: "rgba(168,176,184,0.2)",
    nameGrad: "linear-gradient(135deg, #A8B0B8, #C0C8D0, #A8B0B8)",
    badgeBg: "linear-gradient(135deg, #181E24, #2A3038)",
    badgeBorder: "#A8B0B8",
    avatarBorder: "linear-gradient(135deg, #A8B0B8, #C0C8D0)",
    glowEffect: "0 0 4px rgba(168,176,184,0.2)",
    css: "iron",
    levelColor: "#A8B0B8",
  },
  copper: {
    label: "Copper",
    icon: "🔶",
    accent: "#D98A6C",
    accentGlow: "rgba(217,138,108,0.2)",
    nameGrad: "linear-gradient(135deg, #D98A6C, #E8A888, #D98A6C)",
    badgeBg: "linear-gradient(135deg, #2A1610, #402218)",
    badgeBorder: "#D98A6C",
    avatarBorder: "linear-gradient(135deg, #D98A6C, #E8A888)",
    glowEffect: "0 0 4px rgba(217,138,108,0.2)",
    css: "copper",
    levelColor: "#D98A6C",
  },
  tin: {
    label: "Tin",
    icon: "🔘",
    accent: "#9EA4AC",
    accentGlow: "rgba(158,164,172,0.18)",
    nameGrad: "linear-gradient(135deg, #9EA4AC, #B8C0C8, #9EA4AC)",
    badgeBg: "linear-gradient(135deg, #181E24, #262E36)",
    badgeBorder: "#9EA4AC",
    avatarBorder: "linear-gradient(135deg, #9EA4AC, #B8C0C8)",
    glowEffect: "0 0 3px rgba(158,164,172,0.2)",
    css: "tin",
    levelColor: "#9EA4AC",
  },
  supporter: {
    label: "Supporter",
    icon: "❤️",
    accent: "#5C6C7C",
    accentGlow: "rgba(92,108,124,0.15)",
    nameGrad: "linear-gradient(135deg, #5C6C7C, #8A9AAC, #5C6C7C)",
    badgeBg: "linear-gradient(135deg, #101418, #1C242C)",
    badgeBorder: "#5C6C7C",
    avatarBorder: "linear-gradient(135deg, #5C6C7C, #8A9AAC)",
    glowEffect: "0 0 3px rgba(92,108,124,0.15)",
    css: "supporter",
    levelColor: "#5C6C7C",
  },
};

const getTierStyle = (tierKey) => TIER_STYLES[tierKey] || null;

export default function UserPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, userStats } = useAuth();
  const [history, setHistory] = useState([]);
  const [comicHistory, setComicHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const controller = new AbortController();

    const fetchJson = async (url) => {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error("Fetch failed");
      const data = await response.json();
      return Array.isArray(data.history) ? data.history : [];
    };

    (async () => {
      try {
        const [historyData, comicData] = await Promise.all([
          fetchJson("/api/user/history"),
          fetchJson("/api/user/comic-progress"),
        ]);
        setHistory(historyData);
        setComicHistory(comicData);
      } catch (error) {
        if (error.name !== "AbortError") {
          setHistory([]);
          setComicHistory([]);
        }
      } finally {
        setLoadingHistory(false);
      }
    })();

    return () => controller.abort();
  }, [isAuthenticated]);

  // ========== SEMUA useMemo DIPINDAH KE SINI (sebelum early return) ==========
  const displayUser = useMemo(
    () => ({
      ...(user || {}),
      level: userStats?.level || 1,
      totalXp: userStats?.totalXp || 0,
      levelProgress: Math.max(0, Math.min(userStats?.levelProgress ?? 0, 100)),
    }),
    [user, userStats],
  );

  const tierStyle = useMemo(() => getTierStyle(displayUser.donorTier), [displayUser.donorTier]);
  const isDonator = displayUser.isDonator && tierStyle !== null;

  const recentAnimeHistory = useMemo(() => history.slice(0, 5), [history]);
  const recentComicHistory = useMemo(() => comicHistory.slice(0, 5), [comicHistory]);

  const stats = useMemo(
    () => ({
      totalJudul: history.length,
      totalEpisode: history.reduce((sum, item) => sum + (item.currentEp || 0), 0),
      selesai: history.filter((item) => (item.percent ?? 0) >= 100).length,
      sedangDitonton: history.filter((item) => (item.percent ?? 0) > 0 && (item.percent ?? 0) < 100).length,
      totalComics: comicHistory.length,
      totalChapters: comicHistory.reduce((sum, item) => sum + (item.currentChapter || 0), 0),
    }),
    [history, comicHistory],
  );
  // ==========================================================================

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #0a0a0a;
          color: #a1a1aa;
          min-height: 100vh;
          width: 100%;
          overflow-x: hidden;
        }

        .page-container {
          width: min(1200px, 100%);
          margin: 0 auto;
          padding: clamp(1rem, 3vw, 3rem);
        }

        .profile-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: clamp(1rem, 2vw, 2rem);
          margin-bottom: clamp(1.5rem, 3vw, 3rem);
          flex-wrap: wrap;
        }

        .avatar-wrapper {
          position: relative;
          width: clamp(3.25rem, 8vw, 5rem);
          height: clamp(3.25rem, 8vw, 5rem);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .avatar {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(1.2rem, 2vw, 1.8rem);
          font-weight: 600;
          color: #e4e4e7;
          overflow: hidden;
          border: 2px solid #27272a;
          position: relative;
        }

        .avatar.donator {
          border: 3px solid transparent;
          background-clip: padding-box;
          animation: avatarGlow 2s ease-in-out infinite alternate;
        }

        @keyframes avatarGlow {
          0% { filter: drop-shadow(0 0 3px var(--tier-accent)); }
          100% { filter: drop-shadow(0 0 12px var(--tier-accent)); }
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .donor-badge {
          position: absolute;
          bottom: -0.25rem;
          right: -0.25rem;
          width: clamp(1.5rem, 4vw, 2.1rem);
          height: clamp(1.5rem, 4vw, 2.1rem);
          border-radius: 50%;
          border: 2px solid #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: clamp(0.75rem, 1vw, 1rem);
          font-weight: bold;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          transition: transform 0.2s ease;
          will-change: transform;
        }

        .donor-badge:hover {
          transform: scale(1.08);
        }

        .user-details {
          flex: 1;
          min-width: 0;
        }

        .name-row {
          display: flex;
          align-items: flex-end;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .display-name {
          font-size: clamp(1.25rem, 4vw, 2.25rem);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          overflow-wrap: break-word;
          word-wrap: break-word;
          max-width: 100%;
        }

        .display-name.donator {
          background-size: 200% auto;
          animation: nameShine 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes nameShine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        .level-badge {
          display: inline-flex;
          align-items: center;
          background: rgba(255,255,255,0.05);
          padding: 0.4rem 0.85rem;
          border-radius: 999px;
          font-size: clamp(0.75rem, 1vw, 0.95rem);
          font-weight: 700;
          letter-spacing: 0.02em;
          border: 1px solid rgba(255,255,255,0.1);
        }

        .level-badge.donator {
          background: rgba(0,0,0,0.3);
          border-color: var(--tier-accent);
          color: var(--tier-accent);
          box-shadow: 0 0 8px var(--tier-accent);
          animation: levelPulse 1.5s ease-in-out infinite alternate;
        }

        @keyframes levelPulse {
          0% { box-shadow: 0 0 2px var(--tier-accent); }
          100% { box-shadow: 0 0 12px var(--tier-accent); }
        }

        .username {
          font-size: 0.9rem;
          color: #71717a;
          margin-top: 0.35rem;
          overflow-wrap: anywhere;
        }

        .donor-tier-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.6rem;
          padding: 0.35rem 0.85rem;
          border-radius: 2rem;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: 1px solid;
          transition: transform 0.2s ease, filter 0.2s ease;
          white-space: nowrap;
        }

        .donor-tier-badge:hover {
          transform: translateY(-1px);
          filter: brightness(1.05);
        }

        .edit-profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.2rem;
          border: 1px solid #3f3f46;
          border-radius: 0.75rem;
          color: #d4d4d8;
          font-size: clamp(0.75rem, 1vw, 0.95rem);
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s ease;
          background: transparent;
          flex-shrink: 0;
        }

        .edit-profile-btn:hover {
          border-color: #a1a1aa;
          color: white;
          background: rgba(255,255,255,0.05);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
          gap: 0.75rem;
          background: #27272a;
          border-radius: 0.75rem;
          overflow: hidden;
          margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
        }

        .stat-item {
          background: #18181b;
          padding: clamp(0.9rem, 1.5vw, 1.25rem);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          min-width: 0;
        }

        .stat-number {
          font-size: clamp(1.25rem, 2vw, 1.75rem);
          font-weight: 700;
          color: #f4f4f5;
          margin-bottom: 0.35rem;
          word-break: break-word;
        }

        .stat-number.accent {
          color: #a78bfa;
        }

        .stat-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #71717a;
        }

        .main-layout {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(1.5rem, 3vw, 2.5rem);
          align-items: start;
          width: 100%;
          max-width: 100%;
        }

        @media (min-width: 900px) {
          .main-layout {
            grid-template-columns: 1fr 300px;
          }
        }

        .history-panel {
          margin-bottom: clamp(1.5rem, 3vw, 2.5rem);
          overflow-x: hidden;
        }

        .panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1rem;
        }

        .panel-title {
          font-size: clamp(1rem, 1.6vw, 1.2rem);
          font-weight: 600;
          color: #e4e4e7;
          min-width: 0;
          flex: 1 1 auto;
        }

        .panel-link {
          font-size: 0.8rem;
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s ease;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          width: 100%;
          overflow-x: hidden;
        }

        .history-list.scrollable {
          max-height: 420px;
          overflow-y: auto;
          overflow-x: hidden;
          padding-right: 4px;
          width: 100%;
        }

        .history-list.scrollable::-webkit-scrollbar {
          width: 4px;
        }

        .history-list.scrollable::-webkit-scrollbar-track {
          background: #27272a;
          border-radius: 2px;
        }

        .history-list.scrollable::-webkit-scrollbar-thumb {
          background: #52525b;
          border-radius: 2px;
        }

        .history-list.scrollable::-webkit-scrollbar-thumb:hover {
          background: #71717a;
        }

        .history-row {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 0.75rem;
          border-radius: 0.75rem;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s ease;
          width: 100%;
          min-width: 0;
          overflow: hidden;
        }

        @media (max-width: 520px) {
          .history-row {
            grid-template-columns: auto 1fr;
          }

          .percentage {
            justify-self: end;
          }
        }

        .history-row:hover {
          background: #18181b;
        }

        .thumb {
          width: clamp(3rem, 8vw, 3.75rem);
          height: clamp(3.5rem, 9vw, 4.75rem);
          border-radius: 0.5rem;
          overflow: hidden;
          background: #27272a;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #52525b;
          font-size: 0.65rem;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info {
          min-width: 0;
        }

        .title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #d4d4d8;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          text-overflow: ellipsis;
          word-break: break-word;
          line-height: 1.3;
          margin-bottom: 0.2rem;
          max-width: 100%;
        }

        .episode {
          font-size: 0.78rem;
          color: #71717a;
          margin-bottom: 0.35rem;
        }

        .progress-bar {
          width: 100%;
          min-width: 0;
          height: 3px;
          background: #27272a;
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: #a78bfa;
          border-radius: 2px;
          width: 0%;
          transition: width 0.4s ease;
        }

        .percentage {
          font-size: 0.8rem;
          font-weight: 600;
          color: #a78bfa;
          min-width: 3rem;
          text-align: right;
          justify-self: end;
          flex-shrink: 0;
        }

        .empty-state {
          padding: 2rem 0;
          text-align: center;
          color: #3f3f46;
          font-size: 0.95rem;
        }

        .view-more {
          margin-top: 0.75rem;
          text-align: center;
          padding-top: 0.8rem;
          border-top: 1px solid #27272a;
        }

        .view-more-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.7rem 1.25rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: #a78bfa;
          text-decoration: none;
          transition: background 0.2s ease, color 0.2s ease;
          border-radius: 0.75rem;
        }

        .view-more-link:hover {
          background: rgba(167,139,250,0.1);
          color: #c4b5fd;
        }

        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          width: 100%;
          max-width: 100%;
          min-width: 0;
        }

        .widget {
          background: #18181b;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .widget-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #52525b;
          margin-bottom: 1rem;
        }

        .email-display {
          font-size: 0.9rem;
          color: #a1a1aa;
          word-break: break-word;
          margin-top: 0.35rem;
        }

        .level-value {
          font-size: clamp(2rem, 5vw, 3rem);
          font-weight: 700;
          color: #f4f4f5;
          line-height: 1;
          margin-bottom: 0.25rem;
        }

        .xp-value {
          font-size: 1rem;
          font-weight: 600;
          color: #a1a1aa;
        }

        .xp-track {
          width: 100%;
          height: 4px;
          background: #27272a;
          border-radius: 2px;
          margin: 0.85rem 0 0.5rem;
          overflow: hidden;
        }

        .xp-fill {
          height: 100%;
          background: #a78bfa;
          border-radius: 2px;
          width: 0%;
          transition: width 0.5s ease;
        }

        .xp-caption {
          font-size: 0.78rem;
          color: #71717a;
          line-height: 1.4;
        }

        .xp-caption strong {
          color: #a78bfa;
        }
      `}</style>

      <div className="page-container">
        {/* Header Profile */}
        <header className="profile-header">
          <div className="avatar-wrapper">
            <div
              className={`avatar ${isDonator ? "donator" : ""}`}
              style={
                isDonator
                  ? {
                      "--tier-accent": tierStyle.accent,
                      backgroundImage: tierStyle.avatarBorder,
                      backgroundClip: "padding-box",
                    }
                  : {}
              }
            >
              {displayUser.profileImage ? (
                <Image src={displayUser.profileImage} alt="Profile" width={100} height={100} />
              ) : (
                <span>{displayUser.name?.charAt(0)?.toUpperCase() ?? "U"}</span>
              )}
            </div>
            {isDonator && (
              <div
                className="donor-badge"
                style={{
                  background: tierStyle.badgeBg,
                  borderColor: tierStyle.badgeBorder,
                  color: tierStyle.accent,
                  boxShadow: tierStyle.glowEffect,
                }}
              >
                {tierStyle.icon}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="name-row">
              <h1
                className={`display-name ${isDonator ? "donator" : ""}`}
                style={isDonator ? { backgroundImage: tierStyle.nameGrad } : { color: "#fafafa" }}
              >
                {displayUser.name}
              </h1>
              <div
                className={`level-badge ${isDonator ? "donator" : ""}`}
                style={isDonator ? { "--tier-accent": tierStyle.accent, color: tierStyle.accent } : {}}
              >
                Lvl.{displayUser.level}
              </div>
            </div>
            <p className="username">@{displayUser.username}</p>
            {isDonator && (
              <div className="donor-status">
                <div
                  className="donor-tier-badge"
                  style={{
                    background: tierStyle.badgeBg,
                    borderColor: tierStyle.badgeBorder,
                    color: tierStyle.accent,
                    boxShadow: tierStyle.glowEffect,
                  }}
                >
                  <span>{tierStyle.icon}</span>
                  <span>{tierStyle.label}</span>
                </div>
              </div>
            )}
          </div>
          <Link href="/user/setting" className="edit-profile-btn">
            Edit Profile
          </Link>
        </header>

        {/* Stats Grid */}
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-number">{loadingHistory ? "—" : stats.totalJudul}</span>
            <span className="stat-label">Anime</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{loadingHistory ? "—" : stats.totalEpisode}</span>
            <span className="stat-label">Episodes</span>
          </div>
          <div className="stat-item">
            <span className="stat-number accent">{loadingHistory ? "—" : stats.totalComics}</span>
            <span className="stat-label">Comics</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{loadingHistory ? "—" : stats.totalChapters}</span>
            <span className="stat-label">Chapters</span>
          </div>
          <div className="stat-item">
            <span className="stat-number accent">{loadingHistory ? "—" : stats.selesai}</span>
            <span className="stat-label">Done</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{loadingHistory ? "—" : stats.sedangDitonton}</span>
            <span className="stat-label">Watching</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-layout">
          <div>
            {/* Anime History - last 5 with scroll */}
            <section className="history-panel">
              <div className="panel-header">
                <h2 className="panel-title">Anime History</h2>
                <Link href="/search?order_by=popularity" className="panel-link">
                  Explore
                </Link>
              </div>
              {loadingHistory ? (
                <div className="flex justify-center py-12">
                  <Loader />
                </div>
              ) : history.length === 0 ? (
                <p className="empty-state">No anime watched yet.</p>
              ) : (
                <div className="history-list scrollable">
                  {recentAnimeHistory.map((item) => (
                    <Link
                      key={`${item.animeId}-${item.currentEp}-${item.percent ?? 0}`}
                      href={`/anime/${item.animeId}`}
                      className="history-row"
                    >
                      <div className="thumb">
                        {item.image ? <Image src={item.image} alt={item.title} width={100} height={100} /> : "—"}
                      </div>
                      <div className="info">
                        <div className="title">{item.title}</div>
                        <div className="episode">Episode {item.currentEp}</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${item.percent ?? 0}%` }} />
                        </div>
                      </div>
                      <span className="percentage">{Math.max(0, Math.min(item.percent ?? 0, 100))}%</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Comic History - last 5 with scroll */}
            <section className="history-panel">
              <div className="panel-header">
                <h2 className="panel-title">Comic History</h2>
                <Link href="/comic" className="panel-link">
                  Explore
                </Link>
              </div>
              {comicHistory.length === 0 ? (
                <p className="empty-state">No comics read yet.</p>
              ) : (
                <div className="history-list scrollable">
                  {recentComicHistory.map((item) => (
                    <Link
                      key={`${item.comicId}-${item.currentChapter}`}
                      href={`/comic/${item.comicId}`}
                      className="history-row"
                    >
                      <div className="thumb">
                        {item.image ? <Image src={item.image} alt={item.title} width={100} height={100} /> : "—"}
                      </div>
                      <div className="info">
                        <div className="title">{item.title}</div>
                        <div className="episode">Chapter {item.currentChapter}</div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: "100%" }} />
                        </div>
                      </div>
                      <span className="percentage">Read</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Sidebar */}
          <aside className="sidebar">
            <div className="widget">
              <div className="widget-label">Level & XP</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="level-value">{displayUser.level}</div>
                  <div className="text-xs text-neutral-500">Level</div>
                </div>
                <div className="text-right">
                  <div className="xp-value">{displayUser.totalXp.toLocaleString()}</div>
                  <div className="text-xs text-neutral-500">XP</div>
                </div>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${displayUser.levelProgress}%` }} />
              </div>
              <div className="xp-caption">
                <strong>{Math.round(displayUser.levelProgress)}%</strong> to next level
              </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </>
  );
}