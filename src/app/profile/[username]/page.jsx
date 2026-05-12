"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Image from "next/image";

/* ─── Tier Config Lengkap dengan efek ─── */
const TIER_CONFIG = {
  celestial: {
    label: "Celestial",
    icon: "🌌",
    color: "#E0B0FF",
    bg: "linear-gradient(135deg,#2D1060,#A855F7)",
    glow: "rgba(224,176,255,0.35)",
    nameGrad: "linear-gradient(135deg, #E0B0FF, #A855F7, #C084FC, #E0B0FF)",
    avatarBorder: "linear-gradient(135deg, #E0B0FF, #A855F7, #C084FC)",
    levelColor: "#E0B0FF",
    animation: true,
  },
  legendary: {
    label: "Legendary",
    icon: "🏆",
    color: "#FFD966",
    bg: "linear-gradient(135deg,#4A2E00,#FFD966)",
    glow: "rgba(255,217,102,0.3)",
    nameGrad: "linear-gradient(135deg, #FFD966, #FFB347, #FFD966)",
    avatarBorder: "linear-gradient(135deg, #FFD966, #FFB347)",
    levelColor: "#FFD966",
    animation: true,
  },
  mythic: {
    label: "Mythic",
    icon: "⚡",
    color: "#C77DFF",
    bg: "linear-gradient(135deg,#1E102E,#C77DFF)",
    glow: "rgba(199,125,255,0.3)",
    nameGrad: "linear-gradient(135deg, #C77DFF, #9B5DE5, #C77DFF)",
    avatarBorder: "linear-gradient(135deg, #C77DFF, #9B5DE5)",
    levelColor: "#C77DFF",
    animation: true,
  },
  immortal: {
    label: "Immortal",
    icon: "♾️",
    color: "#64FFDA",
    bg: "linear-gradient(135deg,#0A2A2A,#64FFDA)",
    glow: "rgba(100,255,218,0.25)",
    nameGrad: "linear-gradient(135deg, #64FFDA, #00B4D8, #64FFDA)",
    avatarBorder: "linear-gradient(135deg, #64FFDA, #00B4D8)",
    levelColor: "#64FFDA",
    animation: true,
  },
  titanium: {
    label: "Titanium",
    icon: "⚙️",
    color: "#B0BEC5",
    bg: "linear-gradient(135deg,#1C252B,#B0BEC5)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #B0BEC5, #90A4AE, #B0BEC5)",
    avatarBorder: "linear-gradient(135deg, #B0BEC5, #90A4AE)",
    levelColor: "#B0BEC5",
    animation: false,
  },
  diamond: {
    label: "Diamond",
    icon: "💎",
    color: "#7DF9FF",
    bg: "linear-gradient(135deg,#0A2E38,#7DF9FF)",
    glow: "rgba(125,249,255,0.25)",
    nameGrad: "linear-gradient(135deg, #7DF9FF, #00E5FF, #7DF9FF)",
    avatarBorder: "linear-gradient(135deg, #7DF9FF, #00E5FF)",
    levelColor: "#7DF9FF",
    animation: true,
  },
  platinum: {
    label: "Platinum",
    icon: "✦",
    color: "#A78BFA",
    bg: "linear-gradient(135deg,#0D0820,#A78BFA)",
    glow: "rgba(167,139,250,0.25)",
    nameGrad: "linear-gradient(135deg, #A78BFA, #60A5FA, #C084FC)",
    avatarBorder: "linear-gradient(135deg, #A78BFA, #60A5FA)",
    levelColor: "#A78BFA",
    animation: true,
  },
  "gold-plus": {
    label: "Gold+",
    icon: "⭐",
    color: "#F7D44A",
    bg: "linear-gradient(135deg,#1C1600,#F7D44A)",
    glow: "rgba(247,212,74,0.2)",
    nameGrad: "linear-gradient(135deg, #F7D44A, #FFE484, #F7D44A)",
    avatarBorder: "linear-gradient(135deg, #F7D44A, #FFE484)",
    levelColor: "#F7D44A",
    animation: true,
  },
  gold: {
    label: "Gold",
    icon: "★",
    color: "#F7CC45",
    bg: "linear-gradient(135deg,#1C1200,#F7CC45)",
    glow: "rgba(247,204,69,0.2)",
    nameGrad: "linear-gradient(135deg, #F7CC45, #FFF0A0, #F7CC45)",
    avatarBorder: "linear-gradient(135deg, #F7CC45, #FFF0A0)",
    levelColor: "#F7CC45",
    animation: true,
  },
  "silver-plus": {
    label: "Silver+",
    icon: "✨",
    color: "#D0E0F0",
    bg: "linear-gradient(135deg,#0F1A24,#D0E0F0)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #D0E0F0, #FFFFFF, #D0E0F0)",
    avatarBorder: "linear-gradient(135deg, #D0E0F0, #FFFFFF)",
    levelColor: "#D0E0F0",
    animation: false,
  },
  silver: {
    label: "Silver",
    icon: "◆",
    color: "#C4D0DC",
    bg: "linear-gradient(135deg,#0F1C28,#C4D0DC)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #C4D0DC, #E8F0F8, #C4D0DC)",
    avatarBorder: "linear-gradient(135deg, #C4D0DC, #E8F0F8)",
    levelColor: "#C4D0DC",
    animation: false,
  },
  "bronze-plus": {
    label: "Bronze+",
    icon: "🔸",
    color: "#E0A060",
    bg: "linear-gradient(135deg,#2A1808,#E0A060)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #E0A060, #F0C080, #E0A060)",
    avatarBorder: "linear-gradient(135deg, #E0A060, #F0C080)",
    levelColor: "#E0A060",
    animation: false,
  },
  bronze: {
    label: "Bronze",
    icon: "◈",
    color: "#CD7F32",
    bg: "linear-gradient(135deg,#1F1206,#CD7F32)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #CD7F32, #E89F60, #CD7F32)",
    avatarBorder: "linear-gradient(135deg, #CD7F32, #E89F60)",
    levelColor: "#CD7F32",
    animation: false,
  },
  iron: {
    label: "Iron",
    icon: "⚙️",
    color: "#A8B0B8",
    bg: "linear-gradient(135deg,#181E24,#A8B0B8)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #A8B0B8, #C0C8D0, #A8B0B8)",
    avatarBorder: "linear-gradient(135deg, #A8B0B8, #C0C8D0)",
    levelColor: "#A8B0B8",
    animation: false,
  },
  copper: {
    label: "Copper",
    icon: "🔶",
    color: "#D98A6C",
    bg: "linear-gradient(135deg,#2A1610,#D98A6C)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #D98A6C, #E8A888, #D98A6C)",
    avatarBorder: "linear-gradient(135deg, #D98A6C, #E8A888)",
    levelColor: "#D98A6C",
    animation: false,
  },
  tin: {
    label: "Tin",
    icon: "🔘",
    color: "#9EA4AC",
    bg: "linear-gradient(135deg,#181E24,#9EA4AC)",
    glow: null,
    nameGrad: "linear-gradient(135deg, #9EA4AC, #B8C0C8, #9EA4AC)",
    avatarBorder: "linear-gradient(135deg, #9EA4AC, #B8C0C8)",
    levelColor: "#9EA4AC",
    animation: false,
  },
  supporter: {
    label: "Supporter",
    icon: "❤️",
    color: "#e85d5d",
    bg: "linear-gradient(135deg,#1a1a2e,#e85d5d)",
    glow: "rgba(232,93,93,0.2)",
    nameGrad: "linear-gradient(135deg, #e85d5d, #ff8a8a, #e85d5d)",
    avatarBorder: "linear-gradient(135deg, #e85d5d, #ff8a8a)",
    levelColor: "#e85d5d",
    animation: true,
  },
};

/* ─── Helpers ─── */
const fmt = (n) => (n ?? 0).toLocaleString();
const fmtDate = (d) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

/* ─── Sub-components ─── */
function StatCard({ value, label, accent }) {
  return (
    <div className="pf-stat">
      <span className="pf-stat-val" style={{ color: accent ?? "#e85d5d" }}>
        {value}
      </span>
      <span className="pf-stat-lbl">{label}</span>
    </div>
  );
}

function ActivityRow({ image, title, sub, date, href }) {
  return (
    <Link href={href ?? "#"} className="pf-activity-row">
      <div className="pf-activity-thumb">
        {image ? (
          <Image src={image} alt={title} width={52} height={68} className="pf-activity-img" />
        ) : (
          <span className="pf-activity-placeholder">—</span>
        )}
      </div>
      <div className="pf-activity-info">
        <span className="pf-activity-title">{title}</span>
        <span className="pf-activity-sub">{sub}</span>
      </div>
      <span className="pf-activity-date">{date}</span>
    </Link>
  );
}

/* ─── Page ─── */
export default function ProfilePage() {
  const router = useRouter();
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/user/profile/${username}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "User not found");
        setProfileUser(data.user);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="pf-center-screen">
        <Loader />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="pf-center-screen pf-error-screen">
        <p className="pf-error-code">404</p>
        <h1 className="pf-error-title">User Not Found</h1>
        <p className="pf-error-msg">{error || "The user you're looking for doesn't exist."}</p>
        <Link href="/" className="pf-btn-primary">
          Go Home
        </Link>
      </div>
    );
  }

  const isOwn = currentUser?.username === profileUser.username;
  const donorTier = profileUser.donorTier || (profileUser.isDonator ? "supporter" : null);
  const tier = donorTier ? (TIER_CONFIG[donorTier] ?? TIER_CONFIG.supporter) : null;

  const accentColor = tier?.color ?? "#e85d5d";
  const hasGlow = tier?.glow;
  const hasAnimation = tier?.animation ?? false;

  const allActivity = [
    ...(profileUser.watchHistory?.slice(0, 5).map((i) => ({
      key: `a-${i.animeId}`,
      image: i.image,
      title: i.title,
      sub: `Ep ${i.currentEp} · Anime`,
      date: fmtDate(i.updatedAt),
      href: `/anime/${i.animeId}`,
    })) ?? []),
    ...(profileUser.comicHistory?.slice(0, 5).map((i) => ({
      key: `c-${i.comicId || i.title}`,
      image: i.image,
      title: i.title,
      sub: `Ch ${i.currentChapter} · Comic`,
      date: fmtDate(i.updatedAt),
      href: `/comic/${i.comicId}`,
    })) ?? []),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8);

  return (
    <>
      <style>{`
        /* ── Reset & Base ── */
        .pf-page { min-height: 100vh; background: #080a0f; color: #e2e8f0; font-family: 'DM Sans', system-ui, sans-serif; }
        .pf-wrap  { max-width: 860px; margin: 0 auto; padding: 48px 20px 80px; display: flex; flex-direction: column; gap: 20px; }

        /* Loader / Error */
        .pf-center-screen { min-height: 100vh; background: #080a0f; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px; text-align: center; padding: 24px; }
        .pf-error-code    { font-size: 88px; font-weight: 800; color: #1a1f2e; line-height: 1; letter-spacing: -4px; }
        .pf-error-title   { font-size: 24px; font-weight: 700; color: #e2e8f0; margin: 0; }
        .pf-error-msg     { font-size: 14px; color: #4a5568; max-width: 320px; }

        /* ── Cards ── */
        .pf-card {
          background: #0d1117;
          border: 1px solid #1a2030;
          border-radius: 20px;
          padding: 32px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s;
        }
        .pf-card-sm { padding: 24px 28px; }

        /* Tier glow border effect */
        .pf-card.tier-glow::before {
          content: '';
          position: absolute; inset: 0;
          border-radius: 20px;
          padding: 1px;
          background: var(--tier-bg);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          pointer-events: none;
          opacity: 0.7;
        }

        /* ── Profile Hero ── */
        .pf-hero { display: flex; align-items: flex-start; gap: 28px; }

        /* Avatar */
        .pf-avatar-wrap { position: relative; flex-shrink: 0; }
        .pf-avatar-ring {
          width: 104px; height: 104px; border-radius: 50%;
          padding: 2.5px; background: var(--tier-bg, #1a2030);
          display: flex; align-items: center; justify-content: center;
          box-shadow: var(--tier-shadow, none);
          transition: all 0.3s;
        }
        .pf-avatar-ring.animate {
          animation: avatarGlow 2s ease-in-out infinite alternate;
        }
        @keyframes avatarGlow {
          0% { box-shadow: 0 0 0 0 var(--tier-color); }
          100% { box-shadow: 0 0 20px 5px var(--tier-color); }
        }
        .pf-avatar-inner {
          width: 100%; height: 100%; border-radius: 50%;
          background: #111827; overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          font-size: 36px; font-weight: 800; color: #e85d5d;
        }
        .pf-avatar-inner img { width: 100%; height: 100%; object-fit: cover; }
        .pf-tier-pip {
          position: absolute; bottom: 2px; right: 2px;
          width: 28px; height: 28px; border-radius: 50%;
          background: var(--tier-bg); border: 2px solid #080a0f;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          transition: transform 0.2s;
        }
        .pf-tier-pip:hover { transform: scale(1.1); }

        /* User info */
        .pf-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 12px; }
        .pf-name-row { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
        .pf-name {
          font-size: 26px; font-weight: 800; letter-spacing: -0.5px; line-height: 1.1;
        }
        .pf-name.donator {
          background: var(--name-grad);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: nameShine 3s linear infinite;
        }
        @keyframes nameShine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        .pf-level-badge {
          display: inline-flex; align-items: center;
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(4px);
          padding: 4px 12px;
          border-radius: 40px;
          font-size: 0.85rem;
          font-weight: 700;
          border: 1px solid rgba(255,255,255,0.1);
          color: #c8d2e4;
        }
        .pf-level-badge.donator {
          background: rgba(0,0,0,0.3);
          border-color: var(--tier-color);
          color: var(--tier-color);
          box-shadow: 0 0 8px var(--tier-color);
          animation: levelPulse 1.5s ease-in-out infinite alternate;
        }
        @keyframes levelPulse {
          0% { box-shadow: 0 0 2px var(--tier-color); }
          100% { box-shadow: 0 0 12px var(--tier-color); }
        }
        .pf-username { font-size: 13px; color: #3a4a60; font-weight: 500; margin-top: 2px; }

        /* Tier badge */
        .pf-tier-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px 3px 7px; border-radius: 40px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
          background: var(--tier-bg); color: var(--tier-color);
          box-shadow: var(--tier-shadow, none);
          white-space: nowrap;
          transition: all 0.2s;
        }
        .pf-tier-badge.animate {
          animation: badgePulse 2s ease-in-out infinite alternate;
        }
        @keyframes badgePulse {
          0% { transform: scale(1); box-shadow: 0 0 2px var(--tier-color); }
          100% { transform: scale(1.02); box-shadow: 0 0 10px var(--tier-color); }
        }
        .pf-tier-badge-icon { font-size: 12px; }

        /* Stats */
        .pf-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
        .pf-stat {
          background: #080c14; border: 1px solid #141c28;
          border-radius: 14px; padding: 12px 10px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
          transition: border-color 0.2s;
        }
        .pf-stat:hover { border-color: #1e2840; }
        .pf-stat-val { font-size: 20px; font-weight: 800; letter-spacing: -0.5px; line-height: 1; }
        .pf-stat-lbl { font-size: 10px; color: #3a4a60; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; text-align: center; }

        /* Actions */
        .pf-actions { display: flex; flex-wrap: wrap; gap: 8px; }

        .pf-btn-primary {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 10px;
          background: #e85d5d; color: #fff;
          font-size: 13px; font-weight: 700;
          border: none; cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .pf-btn-primary:hover { background: #d44f4f; transform: translateY(-1px); }

        .pf-btn-outline {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 10px;
          background: transparent; color: #6b7a94;
          font-size: 13px; font-weight: 600;
          border: 1px solid #1a2030; cursor: pointer; text-decoration: none;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .pf-btn-outline:hover { border-color: #2a3450; color: #c8d2e4; transform: translateY(-1px); }

        .pf-btn-donate {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 20px; border-radius: 10px;
          background: transparent;
          font-size: 13px; font-weight: 700;
          border: 1px solid rgba(248,200,80,0.25); color: #f8c850;
          cursor: pointer; text-decoration: none;
          transition: background 0.2s, transform 0.15s;
        }
        .pf-btn-donate:hover { background: rgba(248,200,80,0.08); transform: translateY(-1px); }

        /* ── Section headings ── */
        .pf-section-head {
          font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: #2a3450;
          margin-bottom: 16px; display: flex; align-items: center; gap: 10px;
        }
        .pf-section-head::after { content: ''; flex: 1; height: 1px; background: #111827; }

        /* ── Bio ── */
        .pf-bio { font-size: 14px; color: #7a8fa8; line-height: 1.7; }

        /* ── Activity ── */
        .pf-activity-list { display: flex; flex-direction: column; gap: 2px; }
        .pf-activity-row {
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px; border-radius: 12px;
          text-decoration: none; color: inherit;
          transition: background 0.15s;
        }
        .pf-activity-row:hover { background: #0d1320; }
        .pf-activity-thumb {
          width: 44px; height: 58px; border-radius: 8px;
          overflow: hidden; background: #111827; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .pf-activity-img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .pf-activity-placeholder { font-size: 18px; color: #2a3450; }
        .pf-activity-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .pf-activity-title { font-size: 13px; font-weight: 600; color: #c8d2e4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .pf-activity-sub   { font-size: 11px; color: #3a4a60; }
        .pf-activity-date  { font-size: 11px; color: #2a3450; white-space: nowrap; flex-shrink: 0; }
        .pf-activity-empty { text-align: center; padding: 40px 0; font-size: 13px; color: #2a3450; }
      `}</style>

      <div className="pf-page">
        <div className="pf-wrap">
          {/* ── Hero Card ── */}
          <div
            className={`pf-card${tier ? " tier-glow" : ""}`}
            style={{
              "--tier-bg": tier?.bg ?? "#1a2030",
              "--tier-color": tier?.color ?? "#e2e8f0",
              "--tier-shadow": hasGlow ? `0 0 28px ${tier.glow}` : "none",
              "--name-grad": tier?.nameGrad ?? "none",
            }}
          >
            <div className="pf-hero">
              {/* Avatar */}
              <div className="pf-avatar-wrap">
                <div
                  className={`pf-avatar-ring ${hasAnimation ? "animate" : ""}`}
                  style={{
                    background: tier?.bg ?? "#1a2030",
                    boxShadow: hasGlow ? `0 0 20px ${tier.glow}` : "none",
                  }}
                >
                  <div className="pf-avatar-inner">
                    {typeof profileUser.profileImage === "string" && profileUser.profileImage.trim() !== "" ? (
                      <Image src={profileUser.profileImage} alt={profileUser.name} width={40} height={40} unoptimized />
                    ) : (
                      (profileUser.name?.charAt(0)?.toUpperCase() ?? "U")
                    )}
                  </div>
                </div>
                {tier && (
                  <div className="pf-tier-pip" style={{ "--tier-bg": tier.bg }}>
                    {tier.icon}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="pf-info">
                <div>
                  <div className="pf-name-row">
                    <h1 className={`pf-name ${tier ? "donator" : ""}`} style={tier ? { "--name-grad": tier.nameGrad } : {}}>
                      {profileUser.name}
                    </h1>
                    <div className={`pf-level-badge ${tier ? "donator" : ""}`} style={tier ? { "--tier-color": tier.levelColor } : {}}>
                      Lvl.{profileUser.level ?? 1}
                    </div>
                    {tier && (
                      <span
                        className={`pf-tier-badge ${hasAnimation ? "animate" : ""}`}
                        style={{
                          "--tier-bg": tier.bg,
                          "--tier-color": tier.color,
                          "--tier-shadow": hasGlow ? `0 0 10px ${tier.glow}` : "none",
                        }}
                      >
                        <span className="pf-tier-badge-icon">{tier.icon}</span>
                        {tier.label}
                      </span>
                    )}
                  </div>
                  <p className="pf-username">@{profileUser.username}</p>
                </div>

                {/* Stats */}
                <div className="pf-stats">
                  <StatCard value={profileUser.level ?? 1} label="Level" accent={accentColor} />
                  <StatCard value={fmt(profileUser.totalXp)} label="Total XP" accent={accentColor} />
                  <StatCard value={profileUser.watchHistory?.length ?? 0} label="Anime" accent={accentColor} />
                  <StatCard value={profileUser.comicHistory?.length ?? 0} label="Comics" accent={accentColor} />
                </div>

                {/* Actions */}
                <div className="pf-actions">
                  {isOwn ? (
                    <>
                      <button onClick={() => router.back()} className="pf-btn-outline">
                        ← Back
                      </button>
                      <Link href="/user/setting" className="pf-btn-primary">
                        Edit Profile
                      </Link>
                      <Link href="/user" className="pf-btn-outline">
                        Dashboard
                      </Link>
                      {!profileUser.isDonator && (
                        <Link href="/donate" className="pf-btn-donate">
                          💝 Become a Donor
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      {/* <Link href={`/message/${profileUser.username}`} className="pf-btn-primary">
                        💬 Message
                      </Link> */}
                      <button onClick={() => router.back()} className="pf-btn-outline">
                        ← Back
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ── Bio ── */}
          {profileUser.bio && (
            <div className="pf-card pf-card-sm">
              <p className="pf-section-head">About</p>
              <p className="pf-bio">{profileUser.bio}</p>
            </div>
          )}

          {/* ── Recent Activity ── */}
          <div className="pf-card pf-card-sm">
            <p className="pf-section-head">Recent Activity</p>
            {allActivity.length > 0 ? (
              <div className="pf-activity-list">
                {allActivity.map(({ key, ...restOfItem }) => (
                  <ActivityRow key={key} {...restOfItem} />
                ))}
              </div>
            ) : (
              <p className="pf-activity-empty">
                {isOwn ? "Nothing here yet — start watching!" : `${profileUser.name} hasn't been active yet.`}
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}