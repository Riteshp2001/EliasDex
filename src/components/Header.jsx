// Header.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { FaBars, FaSearch, FaBell, FaFire, FaStar, FaCalendarAlt } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { MdNewReleases } from "react-icons/md";
import { useRouter } from "next/navigation";
import Logo from "./Logo";
import useSidebarStore from "../store/sidebarStore";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

/* ─── Constants ─── */
const NAV_LINKS = [
  { label: "Most Popular", href: "/search?order_by=popularity&sfw=false", icon: <FaFire size={13} /> },
  { label: "Top Favorites", href: "/search?order_by=favorites&sfw=false", icon: <FaStar size={13} /> },
  {
    label: "New Releases",
    href: "/search?status=airing&order_by=start_date&sfw=false",
    icon: <MdNewReleases size={14} />,
  },
  {
    label: "Upcoming",
    href: "/search?status=upcoming&order_by=start_date&sfw=false",
    icon: <FaCalendarAlt size={13} />,
  },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "New episode of Attack on Titan is out!", time: "2m ago", unread: true },
  { id: 2, text: "Demon Slayer Season 4 announced", time: "1h ago", unread: true },
  { id: 3, text: "Your watchlist has been updated", time: "3h ago", unread: false },
];

/* ─── Donor Tier Styles (Enhanced) ─── */
const TIER_STYLES = {
  celestial: {
    label: "Celestial",
    icon: "🌌",
    bg: "linear-gradient(135deg,#2D1060,#A855F7)",
    color: "#E0B0FF",
    border: "rgba(224,176,255,0.7)",
    glow: "0 0 14px rgba(224,176,255,0.55)",
    avatarRing: "#A855F7",
    nameGrad: "linear-gradient(135deg, #E0B0FF, #A855F7, #C084FC)",
    animation: true,
  },
  legendary: {
    label: "Legendary",
    icon: "🏆",
    bg: "linear-gradient(135deg,#4A2E00,#FFD966)",
    color: "#FFD966",
    border: "rgba(255,217,102,0.7)",
    glow: "0 0 12px rgba(255,217,102,0.5)",
    avatarRing: "#FFD966",
    nameGrad: "linear-gradient(135deg, #FFD966, #FFB347)",
    animation: true,
  },
  mythic: {
    label: "Mythic",
    icon: "⚡",
    bg: "linear-gradient(135deg,#1E102E,#C77DFF)",
    color: "#C77DFF",
    border: "rgba(199,125,255,0.7)",
    glow: "0 0 12px rgba(199,125,255,0.5)",
    avatarRing: "#C77DFF",
    nameGrad: "linear-gradient(135deg, #C77DFF, #9B5DE5)",
    animation: true,
  },
  immortal: {
    label: "Immortal",
    icon: "♾️",
    bg: "linear-gradient(135deg,#0A2A2A,#64FFDA)",
    color: "#64FFDA",
    border: "rgba(100,255,218,0.6)",
    glow: "0 0 10px rgba(100,255,218,0.4)",
    avatarRing: "#64FFDA",
    nameGrad: "linear-gradient(135deg, #64FFDA, #00B4D8)",
    animation: true,
  },
  titanium: {
    label: "Titanium",
    icon: "⚙️",
    bg: "linear-gradient(135deg,#1C252B,#B0BEC5)",
    color: "#B0BEC5",
    border: "rgba(176,190,197,0.6)",
    glow: "none",
    avatarRing: "#B0BEC5",
    nameGrad: "linear-gradient(135deg, #B0BEC5, #90A4AE)",
    animation: false,
  },
  diamond: {
    label: "Diamond",
    icon: "💎",
    bg: "linear-gradient(135deg,#0A2E38,#7DF9FF)",
    color: "#7DF9FF",
    border: "rgba(125,249,255,0.6)",
    glow: "0 0 10px rgba(125,249,255,0.4)",
    avatarRing: "#7DF9FF",
    nameGrad: "linear-gradient(135deg, #7DF9FF, #00E5FF)",
    animation: true,
  },
  platinum: {
    label: "Platinum",
    icon: "✦",
    bg: "linear-gradient(135deg,#0D0820,#A78BFA)",
    color: "#A78BFA",
    border: "rgba(167,139,250,0.6)",
    glow: "0 0 8px rgba(167,139,250,0.4)",
    avatarRing: "#A78BFA",
    nameGrad: "linear-gradient(135deg, #A78BFA, #60A5FA)",
    animation: true,
  },
  "gold-plus": {
    label: "Gold+",
    icon: "⭐",
    bg: "linear-gradient(135deg,#1C1600,#F7D44A)",
    color: "#F7D44A",
    border: "rgba(247,212,74,0.6)",
    glow: "0 0 8px rgba(247,212,74,0.4)",
    avatarRing: "#F7D44A",
    nameGrad: "linear-gradient(135deg, #F7D44A, #FFE484)",
    animation: true,
  },
  gold: {
    label: "Gold",
    icon: "★",
    bg: "linear-gradient(135deg,#1C1200,#F7CC45)",
    color: "#F7CC45",
    border: "rgba(247,204,69,0.5)",
    glow: "0 0 6px rgba(247,204,69,0.4)",
    avatarRing: "#F7CC45",
    nameGrad: "linear-gradient(135deg, #F7CC45, #FFF0A0)",
    animation: true,
  },
  "silver-plus": {
    label: "Silver+",
    icon: "✨",
    bg: "linear-gradient(135deg,#0F1A24,#D0E0F0)",
    color: "#D0E0F0",
    border: "rgba(208,224,240,0.5)",
    glow: "none",
    avatarRing: "#D0E0F0",
    nameGrad: "linear-gradient(135deg, #D0E0F0, #FFFFFF)",
    animation: false,
  },
  silver: {
    label: "Silver",
    icon: "◆",
    bg: "linear-gradient(135deg,#0F1C28,#C4D0DC)",
    color: "#C4D0DC",
    border: "rgba(196,208,220,0.4)",
    glow: "none",
    avatarRing: "#C4D0DC",
    nameGrad: "linear-gradient(135deg, #C4D0DC, #E8F0F8)",
    animation: false,
  },
  "bronze-plus": {
    label: "Bronze+",
    icon: "🔸",
    bg: "linear-gradient(135deg,#2A1808,#E0A060)",
    color: "#E0A060",
    border: "rgba(224,160,96,0.5)",
    glow: "none",
    avatarRing: "#E0A060",
    nameGrad: "linear-gradient(135deg, #E0A060, #F0C080)",
    animation: false,
  },
  bronze: {
    label: "Bronze",
    icon: "◈",
    bg: "linear-gradient(135deg,#1F1206,#CD7F32)",
    color: "#CD7F32",
    border: "rgba(205,127,50,0.4)",
    glow: "none",
    avatarRing: "#CD7F32",
    nameGrad: "linear-gradient(135deg, #CD7F32, #E89F60)",
    animation: false,
  },
  iron: {
    label: "Iron",
    icon: "⚙️",
    bg: "linear-gradient(135deg,#181E24,#A8B0B8)",
    color: "#A8B0B8",
    border: "rgba(168,176,184,0.4)",
    glow: "none",
    avatarRing: "#A8B0B8",
    nameGrad: "linear-gradient(135deg, #A8B0B8, #C0C8D0)",
    animation: false,
  },
  copper: {
    label: "Copper",
    icon: "🔶",
    bg: "linear-gradient(135deg,#2A1610,#D98A6C)",
    color: "#D98A6C",
    border: "rgba(217,138,108,0.4)",
    glow: "none",
    avatarRing: "#D98A6C",
    nameGrad: "linear-gradient(135deg, #D98A6C, #E8A888)",
    animation: false,
  },
  tin: {
    label: "Tin",
    icon: "🔘",
    bg: "linear-gradient(135deg,#181E24,#9EA4AC)",
    color: "#9EA4AC",
    border: "rgba(158,164,172,0.4)",
    glow: "none",
    avatarRing: "#9EA4AC",
    nameGrad: "linear-gradient(135deg, #9EA4AC, #B8C0C8)",
    animation: false,
  },
  supporter: {
    label: "Supporter",
    icon: "❤️",
    bg: "linear-gradient(135deg,#1a1a2e,#e85d5d)",
    color: "#e85d5d",
    border: "rgba(232,93,93,0.4)",
    glow: "none",
    avatarRing: "#e85d5d",
    nameGrad: "linear-gradient(135deg, #e85d5d, #ff8a8a)",
    animation: true,
  },
};

/* ─── Subcomponents ─── */
const TierBadge = ({ tier, style }) => (
  <div
    className="hdr-tier-badge"
    style={{
      "--t-bg": style.bg,
      "--t-border": style.border,
      "--t-color": style.color,
      "--t-glow": style.glow !== "none" ? style.glow : "none",
    }}
  >
    <span className="hdr-tier-icon">{style.icon}</span>
    <span className="hdr-tier-label">{style.label}</span>
  </div>
);

const AvatarCircle = ({ user, tierStyle }) => (
  <div
    className={`hdr-avatar-ring ${tierStyle?.animation ? "animate" : ""}`}
    style={tierStyle ? { "--ring-color": tierStyle.avatarRing, "--ring-glow": tierStyle.glow } : {}}
  >
    <div className="hdr-avatar-circle">
  {typeof user?.profileImage === "string" &&
  user.profileImage.trim() !== "" ? (
    <Image
      src={user.profileImage}
      alt={user?.name || "User"}
      className="hdr-avatar-img"
      width={40}
      height={40}
      unoptimized
    />
  ) : (
    <span>
      {(user?.name?.charAt(0) || "G").toUpperCase()}
    </span>
  )}
</div>
  </div>
);

/* ─── Main Component ─── */
const Header = () => {
  const { toggleSidebar, isOpen: isSidebarOpen } = useSidebarStore();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const { user, isAuthenticated, logout } = useAuth();

  /* ─── Donor tier resolution ─── */
  const donorTier = user?.isDonator ? user.donorTier || "supporter" : null;
  const tierStyle = donorTier ? (TIER_STYLES[donorTier] ?? TIER_STYLES.supporter) : null;
  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  /* ─── Effects ─── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileSearch) mobileSearchRef.current?.focus();
  }, [showMobileSearch]);

  /* ─── Handlers ─── */
  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(searchValue.trim())}`);
    setShowMobileSearch(false);
    setSearchValue("");
  };

  const closePanels = () => {
    setShowNotif(false);
    setShowUserMenu(false);
    setShowMobileSearch(false);
  };

  /* ─── Render ─── */
  return (
    <>
      <style>{`
        /* ── Base ── */
        .hdr-root { position: relative; z-index: 100; }

        .hdr-bar {
          position: fixed; top: 0; left: 0; right: 0;
          background: rgba(10, 10, 16, 0.0);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          transition: background 0.35s ease, filter 0.3s ease, opacity 0.3s ease;
          z-index: 100;
        }
        .hdr-bar.scrolled { background: rgba(10, 10, 16, 0.75); }

        /* Blur effect when sidebar is open */
        .hdr-bar.sidebar-open {
          filter: blur(3px) brightness(0.6);
          opacity: 0.7;
          pointer-events: none;
        }

        /* ── Inner layout ── */
        .hdr-inner {
          display: flex; align-items: center;
          padding: 0 20px; height: 60px;
          max-width: 100%; box-sizing: border-box;
        }
        .hdr-left  { display: flex; align-items: center; gap: 10px; flex: 1 1 0; min-width: 0; overflow: hidden; }
        .hdr-right { display: flex; align-items: center; gap: 6px; flex-shrink: 0; margin-left: 12px; }

        /* ── Menu toggle ── */
        .hdr-menu-btn {
          width: 36px; height: 36px; border-radius: 9px;
          background: transparent; color: #888; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          border: none; flex-shrink: 0; transition: color 0.2s, background 0.2s;
        }
        .hdr-menu-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

        /* ── Nav links ── */
        .hdr-nav { display: flex; align-items: center; gap: 2px; overflow: hidden; }
        .hdr-nav-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 6px 11px; border-radius: 8px; font-size: 13px;
          font-weight: 500; color: #888; background: transparent;
          cursor: pointer; white-space: nowrap; border: none;
          transition: color 0.2s, background 0.2s; flex-shrink: 0;
        }
        .hdr-nav-btn:hover { color: #fff; background: rgba(255,255,255,0.07); }

        /* ── Search ── */
        .hdr-search-wrap { width: 240px; flex-shrink: 0; }
        .hdr-search-form { display: flex; align-items: center; gap: 6px; }
        .hdr-search-field { position: relative; flex: 1; }
        .hdr-search-icon {
          position: absolute; left: 11px; top: 50%; transform: translateY(-50%);
          color: #555; pointer-events: none;
        }
        .hdr-search-input {
          width: 100%; box-sizing: border-box;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
          padding: 7px 30px 7px 32px; font-size: 13px; color: #fff;
          outline: none; transition: border-color 0.2s, background 0.2s;
        }
        .hdr-search-input::placeholder { color: #555; }
        .hdr-search-input:focus { border-color: rgba(232,93,93,0.5); background: rgba(255,255,255,0.08); }
        .hdr-search-clear {
          position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
          color: #666; cursor: pointer; background: none; border: none;
          display: flex; align-items: center; padding: 2px;
          transition: color 0.2s;
        }
        .hdr-search-clear:hover { color: #ccc; }
        .hdr-search-submit {
          padding: 7px 14px; border-radius: 9px; background: #e85d5d;
          color: #fff; border: none; font-size: 12px; font-weight: 700;
          cursor: pointer; white-space: nowrap; transition: background 0.2s, opacity 0.2s;
          letter-spacing: 0.02em;
        }
        .hdr-search-submit:hover { background: #d44f4f; }

        /* ── Icon buttons ── */
        .hdr-icon-btn {
          position: relative; width: 38px; height: 38px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 10px; background: transparent; color: #888;
          cursor: pointer; border: none; flex-shrink: 0;
          transition: color 0.2s, background 0.2s;
        }
        .hdr-icon-btn:hover        { color: #fff; background: rgba(255,255,255,0.08); }
        .hdr-icon-btn.active       { color: #e85d5d; background: rgba(232,93,93,0.1); }
        .hdr-icon-btn-mobile       { display: none; }

        /* ── Badge (notification count) ── */
        .hdr-badge {
          position: absolute; top: 5px; right: 5px;
          width: 16px; height: 16px; border-radius: 50%;
          background: #e85d5d; color: #fff;
          font-size: 9px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          border: 2px solid #0a0a10;
        }

        /* ── Tier Badge ── */
        .hdr-tier-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 11px 4px 8px; border-radius: 40px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.03em;
          white-space: nowrap; cursor: default; user-select: none;
          background: var(--t-bg);
          border: 1px solid var(--t-border);
          color: var(--t-color);
          box-shadow: var(--t-glow, none);
          animation: tierPulse 2.5s ease-in-out infinite alternate;
          transition: box-shadow 0.3s;
          will-change: box-shadow;
        }
        .hdr-tier-icon  { font-size: 13px; line-height: 1; }
        .hdr-tier-label { font-size: 11px; }
        @keyframes tierPulse {
          from { box-shadow: var(--t-glow, none); }
          to   { box-shadow: var(--t-glow, none), 0 0 18px var(--t-color, transparent); }
        }

        /* ── Avatar Ring ── */
        .hdr-avatar-ring {
          width: 32px; height: 32px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          background: var(--ring-color, transparent);
          padding: 2px; box-sizing: border-box;
          flex-shrink: 0;
          transition: box-shadow 0.3s, transform 0.2s;
        }
        .hdr-avatar-ring.animate {
          animation: ringPulse 2s ease-in-out infinite alternate;
          will-change: transform, box-shadow;
        }
        @keyframes ringPulse {
          0% { box-shadow: 0 0 0 0 var(--ring-glow, transparent); transform: scale(1); }
          100% { box-shadow: 0 0 12px 2px var(--ring-glow, transparent); transform: scale(1.02); }
        }
        .hdr-avatar-circle {
          width: 100%; height: 100%; border-radius: 50%;
          background: linear-gradient(135deg, #e85d5d, #c0392b);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700; color: #fff; overflow: hidden;
        }
        .hdr-avatar-img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; }

        /* ── Avatar Name ── */
        .hdr-avatar-name {
          font-size: 13px; font-weight: 500; white-space: nowrap;
          max-width: 100px; overflow: hidden; text-overflow: ellipsis;
          transition: all 0.2s;
        }
        .hdr-avatar-name.donor {
          background: var(--name-grad);
          background-size: 150% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          font-weight: 600;
          animation: nameShine 3s linear infinite;
          will-change: background-position;
        }
        @keyframes nameShine {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* ── Avatar Button ── */
        .hdr-avatar-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 10px 4px 4px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #aaa; cursor: pointer; flex-shrink: 0;
          transition: background 0.2s, border-color 0.2s, transform 0.15s;
        }
        .hdr-avatar-btn:hover {
          background: rgba(255,255,255,0.09);
          border-color: var(--ring-color, rgba(255,255,255,0.2));
          transform: translateY(-1px);
        }

        /* ── Dropdowns ── */
        .hdr-dropdown-wrap { position: relative; }
        .hdr-dropdown {
          position: absolute; top: calc(100% + 10px); right: 0;
          background: #16161f; border: 1px solid rgba(255,255,255,0.09);
          border-radius: 14px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          min-width: 260px; z-index: 300; overflow: hidden;
          animation: dropIn 0.18s ease forwards;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-dropdown-header {
          padding: 13px 16px 9px; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.09em; color: #444;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        /* Notif items */
        .hdr-notif-item {
          display: flex; flex-direction: column; gap: 4px;
          padding: 11px 16px; border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer; transition: background 0.15s;
        }
        .hdr-notif-item:hover        { background: rgba(255,255,255,0.04); }
        .hdr-notif-item.unread       { background: rgba(232,93,93,0.04); }
        .hdr-notif-row               { display: flex; align-items: flex-start; gap: 8px; }
        .hdr-notif-dot               { width: 7px; height: 7px; border-radius: 50%; background: #e85d5d; flex-shrink: 0; margin-top: 4px; }
        .hdr-notif-text              { font-size: 13px; color: #ddd; line-height: 1.4; }
        .hdr-notif-time              { font-size: 11px; color: #444; padding-left: 15px; }

        /* User menu items */
        .hdr-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px; font-size: 13px; color: #aaa;
          cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s, color 0.15s;
        }
        .hdr-menu-item:last-child { border-bottom: none; }
        .hdr-menu-item:hover             { background: rgba(255,255,255,0.05); color: #fff; }
        .hdr-menu-item.danger:hover      { background: rgba(232,93,93,0.08); color: #e85d5d; }

        /* Donor info strip inside dropdown */
        .hdr-donor-strip {
          display: flex; align-items: center; gap: 8px;
          padding: 10px 16px; font-size: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .hdr-donor-strip-badge { font-size: 15px; }
        .hdr-donor-strip-info  { display: flex; flex-direction: column; gap: 1px; }
        .hdr-donor-strip-label { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 0.07em; }
        .hdr-donor-strip-tier  { font-size: 12px; font-weight: 700; }

        /* ── Mobile search ── */
        .hdr-mobile-search {
          overflow: hidden; max-height: 0; opacity: 0;
          border-top: 1px solid transparent;
          transition: max-height 0.28s ease, opacity 0.22s ease;
        }
        .hdr-mobile-search.open {
          max-height: 72px; opacity: 1;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .hdr-mobile-search-inner { padding: 10px 14px; }

        /* ── Spacer ── */
        .hdr-spacer { height: 60px; }

        /* ── Responsive ── */
        @media (max-width: 1100px) {
          /* Compact nav labels on mid-range screens */
          .hdr-nav-btn { padding: 6px 8px; font-size: 12px; }
        }
        @media (max-width: 900px) {
          .hdr-nav { display: none; }
        }
        @media (max-width: 768px) {
          .hdr-search-wrap, .hdr-avatar-name { display: none; }
          /* Touch targets: minimum 44×44px tap area for accessibility */
          .hdr-menu-btn { width: 44px; height: 44px; border-radius: 10px; }
          .hdr-icon-btn  { width: 44px; height: 44px; }
          .hdr-avatar-btn { min-height: 44px; }
        }
        @media (max-width: 640px) {
          .hdr-icon-btn-mobile { display: flex; }
          .hdr-inner { padding: 0 10px; }
          .hdr-right { gap: 2px; }
          .hdr-tier-badge { display: none; }
          /* Remove GPU-hungry backdrop-filter on low-end mobile */
          .hdr-bar {
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            background: rgba(10, 10, 16, 0.93) !important;
          }
          .hdr-bar.scrolled {
            background: rgba(10, 10, 16, 0.97) !important;
          }
          /* Skip filter:blur() on sidebar-open — triggers GPU compositing */
          .hdr-bar.sidebar-open {
            filter: none !important;
            opacity: 0.5;
          }
        }
        @media (max-width: 480px) {
          .hdr-avatar-btn { padding: 4px; border-radius: 50%; border: none; background: transparent; }
        }

        /* ── Reduce Motion — disables all animations for old/accessibility devices ── */
        @media (prefers-reduced-motion: reduce) {
          .hdr-tier-badge,
          .hdr-avatar-ring.animate,
          .hdr-avatar-name.donor {
            animation: none !important;
            will-change: auto !important;
          }
          .hdr-bar {
            transition: background 0.01ms, opacity 0.01ms !important;
          }
          /* Sidebar overlay without blur */
          .hdr-bar.sidebar-open {
            filter: brightness(0.5) !important;
          }
          .hdr-mobile-search {
            transition: none !important;
          }
          .hdr-menu-btn, .hdr-nav-btn, .hdr-icon-btn,
          .hdr-search-input, .hdr-search-submit, .hdr-avatar-btn,
          .hdr-menu-item, .hdr-notif-item {
            transition: none !important;
          }
        }
      `}</style>

      <div className="relative z-[100]">
        <div
          className={["hdr-bar", scrolled ? "scrolled" : "", isSidebarOpen ? "sidebar-open" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          {/* ── Main bar ── */}
          <div className="hdr-inner">
            {/* Left */}
            <div className="hdr-left">
              <button className="hdr-menu-btn" onClick={toggleSidebar} aria-label="Toggle sidebar">
                <FaBars size={18} />
              </button>

              <div className="hdr-logo-wrap">
                <Logo />
              </div>

              <nav className="hdr-nav" aria-label="Browse">
                {NAV_LINKS.map((link) => (
                  <button key={link.href} className="hdr-nav-btn" onClick={() => router.push(link.href)}>
                    {link.icon} {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Right */}
            <div className="hdr-right">
              {/* Desktop search */}
              <div className="hdr-search-wrap">
                <form className="hdr-search-form" onSubmit={handleSearch}>
                  <div className="hdr-search-field">
                    <FaSearch size={12} className="hdr-search-icon" />
                    <input
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Search anime…"
                      type="search"
                      className="hdr-search-input"
                      aria-label="Search"
                    />
                    {searchValue && (
                      <button
                        type="button"
                        className="hdr-search-clear"
                        onClick={() => setSearchValue("")}
                        aria-label="Clear"
                      >
                        <FaXmark size={12} />
                      </button>
                    )}
                  </div>
                  <button type="submit" className="hdr-search-submit">
                    Search
                  </button>
                </form>
              </div>

              {/* Mobile search toggle */}
              <button
                className={`hdr-icon-btn hdr-icon-btn-mobile${showMobileSearch ? " active" : ""}`}
                onClick={() => {
                  setShowMobileSearch((v) => !v);
                  setShowNotif(false);
                  setShowUserMenu(false);
                }}
                aria-label={showMobileSearch ? "Close search" : "Open search"}
              >
                {showMobileSearch ? <FaXmark size={17} /> : <FaSearch size={15} />}
              </button>

              {/* Tier badge (desktop) */}
              {isAuthenticated && tierStyle && <TierBadge tier={donorTier} style={tierStyle} />}

              {/* Notifications (disabled) */}
              {/* <div className="hdr-dropdown-wrap" ref={notifRef}> ... </div> */}

              {/* User menu */}
              <div className="hdr-dropdown-wrap" ref={userRef}>
                <button
                  className="hdr-avatar-btn"
                  onClick={() => {
                    setShowUserMenu((v) => !v);
                    setShowNotif(false);
                    setShowMobileSearch(false);
                  }}
                  aria-label="User menu"
                >
                  <AvatarCircle user={user} tierStyle={tierStyle} />
                  <span
                    className={`hdr-avatar-name${user?.isDonator ? " donor" : ""}`}
                    style={tierStyle ? { "--name-grad": tierStyle.nameGrad } : {}}
                  >
                    {user ? user.name : "Guest"}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="hdr-dropdown" role="menu">
                    <div className="hdr-dropdown-header">My Account</div>

                    {/* Donor strip inside dropdown */}
                    {isAuthenticated && user?.isDonator && tierStyle && (
                      <div className="hdr-donor-strip">
                        <span className="hdr-donor-strip-badge">{tierStyle.icon}</span>
                        <div className="hdr-donor-strip-info">
                          <span className="hdr-donor-strip-label">Donor Rank</span>
                          <span className="hdr-donor-strip-tier" style={{ color: tierStyle.color }}>
                            {tierStyle.label}
                          </span>
                        </div>
                      </div>
                    )}

                    {user ? (
                      <>
                        <div
                          className="hdr-menu-item"
                          role="menuitem"
                          onClick={() => {
                            router.push("/user");
                            closePanels();
                          }}
                        >
                          My Profile
                        </div>
                        <div
                          className="hdr-menu-item"
                          role="menuitem"
                          onClick={() => {
                            router.push("/user/setting");
                            closePanels();
                          }}
                        >
                          Settings
                        </div>
                        <div
                          className="hdr-menu-item danger"
                          role="menuitem"
                          onClick={() => {
                            logout();
                            closePanels();
                          }}
                        >
                          Sign Out
                        </div>
                      </>
                    ) : (
                      <>
                        <div
                          className="hdr-menu-item"
                          role="menuitem"
                          onClick={() => {
                            router.push("/login");
                            closePanels();
                          }}
                        >
                          Login
                        </div>
                        <div
                          className="hdr-menu-item"
                          role="menuitem"
                          onClick={() => {
                            router.push("/register");
                            closePanels();
                          }}
                        >
                          Register
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Mobile search bar ── */}
          <div className={`hdr-mobile-search${showMobileSearch ? " open" : ""}`} aria-hidden={!showMobileSearch}>
            <div className="hdr-mobile-search-inner">
              <form className="hdr-search-form" onSubmit={handleSearch}>
                <div className="hdr-search-field">
                  <FaSearch size={12} className="hdr-search-icon" />
                  <input
                    ref={mobileSearchRef}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    placeholder="Search anime…"
                    type="search"
                    className="hdr-search-input"
                    aria-label="Search"
                  />
                  {searchValue && (
                    <button
                      type="button"
                      className="hdr-search-clear"
                      onClick={() => {
                        setSearchValue("");
                        mobileSearchRef.current?.focus();
                      }}
                      aria-label="Clear"
                    >
                      <FaXmark size={12} />
                    </button>
                  )}
                </div>
                <button type="submit" className="hdr-search-submit">
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="hdr-spacer" />
      </div>
    </>
  );
};

export default Header;