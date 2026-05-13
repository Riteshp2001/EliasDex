"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Image from "next/image";

/* ─── Rank Config (podium) ────────────────────────────────────────────────── */
const RANK_CFG = {
  1: {
    accent:       "#F7CC45",
    glow:         "rgba(247,204,69,0.5)",
    softGlow:     "rgba(247,204,69,0.1)",
    border:       "rgba(247,204,69,0.45)",
    cardBg:       "linear-gradient(160deg,#1C1600 0%,#0E1118 55%)",
    label:        "1st",
    minH:         "360px",
    shimmerColor: "rgba(247,204,69,0.08)",
  },
  2: {
    accent:       "#C8D8E8",
    glow:         "rgba(200,216,232,0.35)",
    softGlow:     "rgba(200,216,232,0.06)",
    border:       "rgba(200,216,232,0.28)",
    cardBg:       "linear-gradient(160deg,#0A1220 0%,#0E1118 55%)",
    label:        "2nd",
    minH:         "290px",
    shimmerColor: "rgba(200,216,232,0.07)",
  },
  3: {
    accent:       "#D4885C",
    glow:         "rgba(212,136,92,0.35)",
    softGlow:     "rgba(212,136,92,0.06)",
    border:       "rgba(212,136,92,0.28)",
    cardBg:       "linear-gradient(160deg,#1A0C06 0%,#0E1118 55%)",
    label:        "3rd",
    minH:         "260px",
    shimmerColor: "rgba(212,136,92,0.07)",
  },
};

/* ─── Donor Tier Config ──────────────────────────────────────────────────── */
const TIERS = {
  celestial: {
    label:      "Celestial",
    accent:     "#E0B0FF",
    accentSoft: "rgba(224,176,255,0.15)",
    accentGlow: "rgba(224,176,255,0.7)",
    nameGrad:   "linear-gradient(90deg,#E0B0FF,#A855F7,#C084FC,#E0B0FF)",
    badgeBg:    "linear-gradient(135deg,#1A0B2E,#2D1B4E)",
    badgeBorder:"rgba(224,176,255,0.8)",
    rowBg:      "linear-gradient(90deg,rgba(224,176,255,0.12) 0%,#0E1118 60%)",
    rowBorder:  "rgba(224,176,255,0.35)",
    stripGrad:  "linear-gradient(to bottom,#A855F7,#E0B0FF,#C084FC,#A855F7)",
    icon:       "🌌",
    css:        "celestial",
    isUltra:    true,
  },
  legendary: {
    label:      "Legendary",
    accent:     "#FFD966",
    accentSoft: "rgba(255,217,102,0.14)",
    accentGlow: "rgba(255,217,102,0.6)",
    nameGrad:   "linear-gradient(90deg,#FFD966,#FFB347,#FFD966)",
    badgeBg:    "linear-gradient(135deg,#2E1A00,#4A2E00)",
    badgeBorder:"rgba(255,217,102,0.7)",
    rowBg:      "linear-gradient(90deg,rgba(255,217,102,0.11) 0%,#0E1118 60%)",
    rowBorder:  "rgba(255,217,102,0.3)",
    stripGrad:  "linear-gradient(to bottom,#FFB347,#FFD966,#FFB347)",
    icon:       "🏆",
    css:        "legendary",
    isUltra:    true,
  },
  mythic: {
    label:      "Mythic",
    accent:     "#C77DFF",
    accentSoft: "rgba(199,125,255,0.13)",
    accentGlow: "rgba(199,125,255,0.55)",
    nameGrad:   "linear-gradient(90deg,#C77DFF,#9B5DE5,#C77DFF)",
    badgeBg:    "linear-gradient(135deg,#1E102E,#321B4E)",
    badgeBorder:"rgba(199,125,255,0.65)",
    rowBg:      "linear-gradient(90deg,rgba(199,125,255,0.1) 0%,#0E1118 60%)",
    rowBorder:  "rgba(199,125,255,0.28)",
    stripGrad:  "linear-gradient(to bottom,#9B5DE5,#C77DFF,#9B5DE5)",
    icon:       "⚡",
    css:        "mythic",
    isUltra:    true,
  },
  immortal: {
    label:      "Immortal",
    accent:     "#64FFDA",
    accentSoft: "rgba(100,255,218,0.12)",
    accentGlow: "rgba(100,255,218,0.5)",
    nameGrad:   "linear-gradient(90deg,#64FFDA,#00B4D8,#64FFDA)",
    badgeBg:    "linear-gradient(135deg,#0A2A2A,#104F4F)",
    badgeBorder:"rgba(100,255,218,0.6)",
    rowBg:      "linear-gradient(90deg,rgba(100,255,218,0.09) 0%,#0E1118 60%)",
    rowBorder:  "rgba(100,255,218,0.26)",
    stripGrad:  "linear-gradient(to bottom,#00B4D8,#64FFDA,#00B4D8)",
    icon:       "♾️",
    css:        "immortal",
  },
  titanium: {
    label:      "Titanium",
    accent:     "#B0BEC5",
    accentSoft: "rgba(176,190,197,0.12)",
    accentGlow: "rgba(176,190,197,0.45)",
    nameGrad:   "linear-gradient(90deg,#B0BEC5,#90A4AE,#B0BEC5)",
    badgeBg:    "linear-gradient(135deg,#1C252B,#2C3A42)",
    badgeBorder:"rgba(176,190,197,0.55)",
    rowBg:      "linear-gradient(90deg,rgba(176,190,197,0.08) 0%,#0E1118 60%)",
    rowBorder:  "rgba(176,190,197,0.24)",
    stripGrad:  "linear-gradient(to bottom,#90A4AE,#B0BEC5,#90A4AE)",
    icon:       "⚙️",
    css:        "titanium",
  },
  diamond: {
    label:      "Diamond",
    accent:     "#7DF9FF",
    accentSoft: "rgba(125,249,255,0.12)",
    accentGlow: "rgba(125,249,255,0.5)",
    nameGrad:   "linear-gradient(90deg,#7DF9FF,#00E5FF,#7DF9FF)",
    badgeBg:    "linear-gradient(135deg,#0A2E38,#104A58)",
    badgeBorder:"rgba(125,249,255,0.6)",
    rowBg:      "linear-gradient(90deg,rgba(125,249,255,0.09) 0%,#0E1118 60%)",
    rowBorder:  "rgba(125,249,255,0.26)",
    stripGrad:  "linear-gradient(to bottom,#00E5FF,#7DF9FF,#00E5FF)",
    icon:       "💎",
    css:        "diamond",
  },
  platinum: {
    label:      "Platinum",
    accent:     "#A78BFA",
    accentSoft: "rgba(167,139,250,0.1)",
    accentGlow: "rgba(167,139,250,0.38)",
    nameGrad:   "linear-gradient(90deg,#A78BFA,#60A5FA,#C084FC,#A78BFA)",
    badgeBg:    "linear-gradient(135deg,#0D0820,#160D30)",
    badgeBorder:"rgba(167,139,250,0.5)",
    rowBg:      "linear-gradient(90deg,rgba(167,139,250,0.08) 0%,#0E1118 60%)",
    rowBorder:  "rgba(167,139,250,0.28)",
    stripGrad:  "linear-gradient(to bottom,#A78BFA,#60A5FA,#C084FC,#A78BFA)",
    icon:       "✦",
    css:        "platinum",
  },
  "gold-plus": {
    label:      "Gold+",
    accent:     "#F7D44A",
    accentSoft: "rgba(247,212,74,0.1)",
    accentGlow: "rgba(247,212,74,0.35)",
    nameGrad:   "linear-gradient(90deg,#F7D44A,#FFE484,#F7D44A)",
    badgeBg:    "linear-gradient(135deg,#1C1600,#2E2600)",
    badgeBorder:"rgba(247,212,74,0.55)",
    rowBg:      "linear-gradient(90deg,rgba(247,212,74,0.08) 0%,#0E1118 60%)",
    rowBorder:  "rgba(247,212,74,0.25)",
    stripGrad:  "linear-gradient(to bottom,#D4A000,#F7D44A,#D4A000)",
    icon:       "⭐",
    css:        "gold-plus",
  },
  gold: {
    label:      "Gold",
    accent:     "#F7CC45",
    accentSoft: "rgba(247,204,69,0.1)",
    accentGlow: "rgba(247,204,69,0.3)",
    nameGrad:   "linear-gradient(90deg,#F7CC45,#FFF0A0,#F7CC45)",
    badgeBg:    "linear-gradient(135deg,#1C1200,#2E1F00)",
    badgeBorder:"rgba(247,204,69,0.5)",
    rowBg:      "linear-gradient(90deg,rgba(247,204,69,0.07) 0%,#0E1118 60%)",
    rowBorder:  "rgba(247,204,69,0.22)",
    stripGrad:  "linear-gradient(to bottom,#AA8800,#F7CC45,#AA8800)",
    icon:       "★",
    css:        "gold",
  },
  "silver-plus": {
    label:      "Silver+",
    accent:     "#D0E0F0",
    accentSoft: "rgba(208,224,240,0.09)",
    accentGlow: "rgba(208,224,240,0.3)",
    nameGrad:   "linear-gradient(90deg,#D0E0F0,#FFFFFF,#D0E0F0)",
    badgeBg:    "linear-gradient(135deg,#0F1A24,#1F2E3C)",
    badgeBorder:"rgba(208,224,240,0.45)",
    rowBg:      "linear-gradient(90deg,rgba(208,224,240,0.07) 0%,#0E1118 60%)",
    rowBorder:  "rgba(208,224,240,0.2)",
    stripGrad:  "linear-gradient(to bottom,#8A9AAA,#D0E0F0,#8A9AAA)",
    icon:       "✨",
    css:        "silver-plus",
  },
  silver: {
    label:      "Silver",
    accent:     "#C4D0DC",
    accentSoft: "rgba(196,208,220,0.08)",
    accentGlow: "rgba(196,208,220,0.25)",
    nameGrad:   "linear-gradient(90deg,#C4D0DC,#E8F0F8,#C4D0DC)",
    badgeBg:    "linear-gradient(135deg,#0F1C28,#1A2C3A)",
    badgeBorder:"rgba(196,208,220,0.4)",
    rowBg:      "linear-gradient(90deg,rgba(196,208,220,0.06) 0%,#0E1118 60%)",
    rowBorder:  "rgba(196,208,220,0.18)",
    stripGrad:  "linear-gradient(to bottom,#7A9AB0,#C4D0DC,#7A9AB0)",
    icon:       "◆",
    css:        "silver",
  },
  "bronze-plus": {
    label:      "Bronze+",
    accent:     "#E0A060",
    accentSoft: "rgba(224,160,96,0.09)",
    accentGlow: "rgba(224,160,96,0.28)",
    nameGrad:   "linear-gradient(90deg,#E0A060,#F0C080,#E0A060)",
    badgeBg:    "linear-gradient(135deg,#2A1808,#402810)",
    badgeBorder:"rgba(224,160,96,0.45)",
    rowBg:      "linear-gradient(90deg,rgba(224,160,96,0.07) 0%,#0E1118 60%)",
    rowBorder:  "rgba(224,160,96,0.22)",
    stripGrad:  "linear-gradient(to bottom,#A06030,#E0A060,#A06030)",
    icon:       "🔸",
    css:        "bronze-plus",
  },
  bronze: {
    label:      "Bronze",
    accent:     "#CD7F32",
    accentSoft: "rgba(205,127,50,0.08)",
    accentGlow: "rgba(205,127,50,0.25)",
    nameGrad:   "linear-gradient(90deg,#CD7F32,#E89F60,#CD7F32)",
    badgeBg:    "linear-gradient(135deg,#1F1206,#301E0E)",
    badgeBorder:"rgba(205,127,50,0.4)",
    rowBg:      "linear-gradient(90deg,rgba(205,127,50,0.06) 0%,#0E1118 60%)",
    rowBorder:  "rgba(205,127,50,0.2)",
    stripGrad:  "linear-gradient(to bottom,#8B4513,#CD7F32,#8B4513)",
    icon:       "◈",
    css:        "bronze",
  },
  iron: {
    label:      "Iron",
    accent:     "#A8B0B8",
    accentSoft: "rgba(168,176,184,0.07)",
    accentGlow: "rgba(168,176,184,0.2)",
    nameGrad:   "linear-gradient(90deg,#A8B0B8,#C0C8D0,#A8B0B8)",
    badgeBg:    "linear-gradient(135deg,#181E24,#2A3038)",
    badgeBorder:"rgba(168,176,184,0.35)",
    rowBg:      "linear-gradient(90deg,rgba(168,176,184,0.05) 0%,#0E1118 60%)",
    rowBorder:  "rgba(168,176,184,0.16)",
    stripGrad:  "linear-gradient(to bottom,#607080,#A8B0B8,#607080)",
    icon:       "⚙️",
    css:        "iron",
  },
  copper: {
    label:      "Copper",
    accent:     "#D98A6C",
    accentSoft: "rgba(217,138,108,0.07)",
    accentGlow: "rgba(217,138,108,0.2)",
    nameGrad:   "linear-gradient(90deg,#D98A6C,#E8A888,#D98A6C)",
    badgeBg:    "linear-gradient(135deg,#2A1610,#402218)",
    badgeBorder:"rgba(217,138,108,0.35)",
    rowBg:      "linear-gradient(90deg,rgba(217,138,108,0.05) 0%,#0E1118 60%)",
    rowBorder:  "rgba(217,138,108,0.16)",
    stripGrad:  "linear-gradient(to bottom,#A05030,#D98A6C,#A05030)",
    icon:       "🔶",
    css:        "copper",
  },
  tin: {
    label:      "Tin",
    accent:     "#9EA4AC",
    accentSoft: "rgba(158,164,172,0.06)",
    accentGlow: "rgba(158,164,172,0.18)",
    nameGrad:   "linear-gradient(90deg,#9EA4AC,#B8C0C8,#9EA4AC)",
    badgeBg:    "linear-gradient(135deg,#181E24,#262E36)",
    badgeBorder:"rgba(158,164,172,0.3)",
    rowBg:      "linear-gradient(90deg,rgba(158,164,172,0.04) 0%,#0E1118 60%)",
    rowBorder:  "rgba(158,164,172,0.14)",
    stripGrad:  "linear-gradient(to bottom,#5A6870,#9EA4AC,#5A6870)",
    icon:       "🔘",
    css:        "tin",
  },
  supporter: {
    label:      "Supporter",
    accent:     "#5C6C7C",
    accentSoft: "rgba(92,108,124,0.06)",
    accentGlow: "rgba(92,108,124,0.15)",
    nameGrad:   "linear-gradient(90deg,#5C6C7C,#8A9AAC,#5C6C7C)",
    badgeBg:    "linear-gradient(135deg,#101418,#1C242C)",
    badgeBorder:"rgba(92,108,124,0.28)",
    rowBg:      "linear-gradient(90deg,rgba(92,108,124,0.03) 0%,#0E1118 60%)",
    rowBorder:  "rgba(92,108,124,0.1)",
    stripGrad:  "linear-gradient(to bottom,#3A4A58,#5C6C7C,#3A4A58)",
    icon:       "❤️",
    css:        "supporter",
  },
};

/* ─── Helper ─────────────────────────────────────────────────────────────── */
function getTierConfig(tierKey) {
  return TIERS[tierKey] || TIERS.supporter;
}

/* ─────────────────────────────────────────────────────────────────────────────
   PERF FIX #1: STARS dipindah ke module-level.
   Sebelumnya ada di dalam component, sehingga array baru dibuat setiap render.
   ──────────────────────────────────────────────────────────────────────────── */
const STARS = [
  { x: "12%", y: "15%", d: "1.3s", del: "0s"   },
  { x: "82%", y: "10%", d: "1.8s", del: ".5s"  },
  { x: "7%",  y: "68%", d: "2.2s", del: ".9s"  },
  { x: "90%", y: "62%", d: "1.6s", del: ".2s"  },
  { x: "48%", y: "6%",  d: "2s",   del: ".6s"  },
  { x: "60%", y: "88%", d: "1.7s", del: "1.1s" },
  { x: "75%", y: "75%", d: "2.4s", del: ".4s"  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   PERF FIX #2: Dynamic tier CSS dihitung SEKALI saat module load.
   Sebelumnya Object.entries(TIERS).map(...) dieksekusi setiap render di dalam
   JSX <style> tag — ini yang menyebabkan lag paling besar.
   ──────────────────────────────────────────────────────────────────────────── */
const TIER_CSS = Object.entries(TIERS).map(([, t]) => `
  .row-${t.css}{background:${t.rowBg}!important;border-color:${t.rowBorder}!important}
  .row-${t.css}:hover{box-shadow:0 0 18px ${t.accentGlow};border-color:${t.accent}80!important}
  .strip-${t.css}{background:${t.stripGrad}}
  ${
    t.css === "platinum" || t.css === "celestial" || t.css === "legendary" || t.css === "mythic"
      ? `.row-${t.css} .sheen{position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(110deg,transparent 20%,${t.accentSoft} 50%,transparent 80%);
          background-size:200% 100%;animation:platRowSheen 3s ease infinite}`
    : t.css === "silver" || t.css === "silver-plus"
      ? `.row-${t.css} .sheen{position:absolute;inset:0;pointer-events:none;
          background:linear-gradient(110deg,transparent 30%,${t.accentSoft} 50%,transparent 70%);
          background-size:200% 100%;animation:silvRowSheen 5s ease infinite}`
    : ""
  }
`).join("");

/* ─────────────────────────────────────────────────────────────────────────────
   PERF FIX #3: Seluruh string CSS dihitung sekali di module-level.
   Sebelumnya seluruh template literal ini ada di dalam JSX component —
   setiap render membuat string ~4KB+ dari awal.
   RESPONSIVE FIX: Semua perubahan layout, clamp(), dan media queries ada di sini.
   ──────────────────────────────────────────────────────────────────────────── */
const PAGE_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *,*::before,*::after{box-sizing:border-box}
  .lb-root,.lb-root *{font-family:'DM Sans',sans-serif}
  .sy{font-family:'Syne',sans-serif!important}

  /* RESPONSIVE FIX: lb-noise dipindah dari ::after ke element langsung.
     ::after dengan position:fixed bisa bikin compositing layer tambahan. */
  .lb-noise{
    position:fixed;inset:0;pointer-events:none;z-index:0;opacity:.5;
    background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
  }

  /* RESPONSIVE FIX: Tabs pakai clamp() — sebelumnya 22px padding bikin overflow di 320px */
  .lb-tab{
    position:relative;
    padding:10px clamp(10px,3.5vw,22px);
    font-family:'Syne',sans-serif;
    font-size:clamp(9px,2.5vw,11px);
    font-weight:700;letter-spacing:.14em;text-transform:uppercase;
    color:#3D4A5C;background:none;border:none;cursor:pointer;transition:color .2s;
    white-space:nowrap;
  }
  .lb-tab:hover{color:#6B7A8D}
  .lb-tab.on{color:#F7CC45}
  .lb-tab.on::after{
    content:'';position:absolute;bottom:0;
    left:clamp(10px,3.5vw,22px);right:clamp(10px,3.5vw,22px);
    height:1.5px;background:#F7CC45;
    box-shadow:0 0 8px rgba(247,204,69,.55);
  }

  /* RESPONSIVE FIX: Podium columns butuh position:relative agar crown-host
     terposisi relatif terhadap column-nya, bukan ancestor yang jauh */
  .podium-row{display:flex;align-items:flex-end;gap:10px}
  .podium-col{flex:1;position:relative}
  .podium-col-center{flex:1.08;position:relative}

  /* RESPONSIVE FIX: Mobile — stack vertikal + reset top-padding rank 2/3
     (ptOffset hanya masuk akal saat side-by-side, bukan saat stacked) */
  @media(max-width:639px){
    .podium-row{flex-direction:column;align-items:stretch;gap:8px}
    .podium-col,.podium-col-center{flex:none}
    .pr1{order:1}.pr2{order:2}.pr3{order:3}
    /* Reset inline padding-top yang tidak relevan saat stacked */
    .pr2,.pr3{padding-top:0!important}
    /* Kurangi minHeight podium card saat stacked (konten lebih ringkas) */
    .pr1 .p-card{min-height:clamp(200px,55vw,260px)!important}
    .pr2 .p-card,.pr3 .p-card{min-height:clamp(160px,42vw,200px)!important}
    /* Crown posisi lebih dekat ke card saat stacked */
    .crown-host{top:-18px}
  }

  .p-card{
    position:relative;border-radius:18px;overflow:hidden;
    border:1px solid;cursor:pointer;
    transition:transform .25s,box-shadow .3s;
  }
  .p-card:hover{transform:translateY(-6px)}

  @keyframes r1Pulse{
    0%,100%{box-shadow:0 0 0 0 rgba(247,204,69,0),0 4px 30px rgba(247,204,69,.12)}
    50%{box-shadow:0 0 0 7px rgba(247,204,69,.07),0 4px 50px rgba(247,204,69,.28)}
  }
  .pr1 .p-card{animation:r1Pulse 3s ease-in-out infinite}

  .pr2 .p-card::before{
    content:'';position:absolute;inset:0;pointer-events:none;
    background:linear-gradient(110deg,transparent 20%,rgba(200,216,232,.06) 50%,transparent 80%);
    background-size:200% 100%;animation:r2Sheen 4s ease infinite;
  }
  @keyframes r2Sheen{0%{background-position:200% 0}100%{background-position:-200% 0}}

  @keyframes r3Ember{
    0%,100%{box-shadow:0 4px 14px rgba(212,136,92,.08)}
    50%{box-shadow:0 4px 30px rgba(212,136,92,.22)}
  }
  .pr3 .p-card{animation:r3Ember 4s ease-in-out infinite}

  .crown-host{
    position:absolute;top:-22px;left:50%;transform:translateX(-50%);
    z-index:20;pointer-events:none;
  }
  .crown-sym{
    display:block;font-size:28px;line-height:1;
    filter:drop-shadow(0 0 10px rgba(247,204,69,.9)) drop-shadow(0 0 22px rgba(247,204,69,.5));
    animation:crownFloat 3.2s ease-in-out infinite;
  }
  @keyframes crownFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}

  .stars-layer{position:absolute;inset:0;pointer-events:none;overflow:hidden}
  .star-dot{
    position:absolute;width:2px;height:2px;border-radius:50%;
    background:#F7CC45;opacity:0;
    animation:twinkle var(--dur) ease-in-out var(--del) infinite;
  }
  @keyframes twinkle{0%,100%{opacity:0;transform:scale(1)}50%{opacity:.75;transform:scale(1.6)}}

  .av-ring{border-radius:50%;padding:2.5px}
  .av-img{
    border-radius:50%;overflow:hidden;background:#1C2130;
    display:flex;align-items:center;justify-content:center;
    font-family:'Syne',sans-serif;font-weight:800;
  }

  .rlabel{
    font-family:'Syne',sans-serif;font-weight:800;
    font-size:10px;letter-spacing:.14em;text-transform:uppercase;
    padding:3px 10px;border-radius:99px;border:1px solid;
  }

  .t-badge{
    display:inline-flex;align-items:center;gap:4px;
    padding:4px 10px;border-radius:8px;
    font-size:10px;font-weight:700;letter-spacing:.1em;
    text-transform:uppercase;border:1px solid;
    /* RESPONSIVE FIX: Cegah badge memotong keluar card kecil */
    max-width:100%;overflow:hidden;
  }

  @keyframes ultraBg{0%{background-position:0% 50%}100%{background-position:200% 50%}}
  .t-badge-ultra{
    background:linear-gradient(90deg,#2D1060,#A855F7,#E0B0FF,#A855F7,#2D1060)!important;
    background-size:300% 100%!important;animation:ultraBg 4s linear infinite;
    border-color:rgba(224,176,255,0.8)!important;color:#F3E8FF!important;
    box-shadow:0 0 12px rgba(224,176,255,0.5);
  }
  .t-badge-legendary{
    background:linear-gradient(90deg,#4A2E00,#FFD966,#FFB347,#FFD966,#4A2E00)!important;
    background-size:300% 100%!important;animation:ultraBg 4s linear infinite;
    border-color:rgba(255,217,102,0.8)!important;color:#FFF0D0!important;
  }
  .t-badge-mythic{
    background:linear-gradient(90deg,#1E102E,#C77DFF,#9B5DE5,#C77DFF,#1E102E)!important;
    background-size:300% 100%!important;animation:ultraBg 4s linear infinite;
    border-color:rgba(199,125,255,0.8)!important;color:#F0E6FF!important;
  }

  @keyframes goldBadge{0%,100%{box-shadow:0 0 4px rgba(247,204,69,.2)}50%{box-shadow:0 0 14px rgba(247,204,69,.65)}}
  .t-badge-gold{animation:goldBadge 2s ease-in-out infinite}

  /* RESPONSIVE FIX: Row card gap dan padding pakai clamp() */
  .row-card{
    position:relative;overflow:hidden;
    display:flex;align-items:center;
    gap:clamp(8px,2.5vw,14px);
    padding:13px clamp(12px,3vw,16px);
    border-radius:12px;
    background:#0E1118;border:1px solid #1C2130;
    cursor:pointer;transition:transform .2s,border-color .2s,box-shadow .2s;
  }
  .row-card:hover{transform:translateX(4px)}
  .row-card-plain:hover{border-color:rgba(247,204,69,.2)}

  .row-card .strip{
    position:absolute;left:0;top:0;bottom:0;width:3px;
    border-radius:12px 0 0 12px;
  }

  ${TIER_CSS}

  @keyframes platRowSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}
  @keyframes silvRowSheen{0%{background-position:200% 0}100%{background-position:-200% 0}}

  .rt-pill{
    display:inline-flex;align-items:center;gap:3px;
    padding:2px 7px;border-radius:99px;border:1px solid;
    font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;
    flex-shrink:0;
  }
  .rt-pill-ultra{
    background:linear-gradient(90deg,rgba(224,176,255,0.2),rgba(168,85,247,0.15));
    border-color:rgba(224,176,255,0.6)!important;color:#E0B0FF!important;
    animation:platPillGlow 2s ease-in-out infinite;
  }
  .rt-pill-legendary{
    background:linear-gradient(90deg,rgba(255,217,102,0.2),rgba(255,179,71,0.15));
    border-color:rgba(255,217,102,0.6)!important;color:#FFD966!important;
    animation:goldPillGlow 2s ease-in-out infinite;
  }
  .rt-pill-mythic{
    background:linear-gradient(90deg,rgba(199,125,255,0.2),rgba(155,93,229,0.15));
    border-color:rgba(199,125,255,0.6)!important;color:#C77DFF!important;
    animation:platPillGlow 2s ease-in-out infinite;
  }
  .rt-pill-gold{
    background:rgba(247,204,69,0.1);
    border-color:rgba(247,204,69,0.4)!important;color:#F7CC45!important;
  }
  .rt-pill-plat{
    border-color:rgba(167,139,250,0.4)!important;color:#A78BFA!important;
  }
  @keyframes platPillGlow{0%,100%{box-shadow:none}50%{box-shadow:0 0 8px rgba(224,176,255,0.5)}}
  @keyframes goldPillGlow{0%,100%{box-shadow:none}50%{box-shadow:0 0 8px rgba(247,204,69,0.5)}}

  .gt{
    background-clip:text;-webkit-background-clip:text;-webkit-text-fill-color:transparent;
    background-size:200% auto;animation:gtAnim 4s linear infinite;
  }
  @keyframes gtAnim{0%{background-position:0% center}100%{background-position:200% center}}

  /* RESPONSIVE FIX: CTA card padding pakai clamp() — sebelumnya 44px 32px bikin sempit di mobile */
  .cta-card{
    border-radius:18px;border:1px solid #1C2130;background:#0E1118;
    padding:clamp(24px,6vw,44px) clamp(16px,5vw,32px);
    text-align:center;position:relative;overflow:hidden;
  }
  .cta-card::before{
    content:'';position:absolute;top:0;left:0;right:0;height:1px;
    background:linear-gradient(90deg,transparent,rgba(247,204,69,.45),transparent);
  }
  /* RESPONSIVE FIX: CTA button padding horizontal pakai clamp() */
  .cta-btn{
    display:inline-block;
    padding:13px clamp(20px,5vw,36px);
    background:#F7CC45;color:#080A0F;
    font-family:'Syne',sans-serif;font-weight:700;
    font-size:clamp(11px,2.5vw,12px);
    letter-spacing:.1em;text-transform:uppercase;border-radius:9px;
    transition:background .2s,transform .2s;text-decoration:none;
  }
  .cta-btn:hover{background:#E8B830;transform:translateY(-2px)}

  @keyframes fadeUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
  .fu{animation:fadeUp .45s ease both}
  .d1{animation-delay:.05s}.d2{animation-delay:.1s}
  .d3{animation-delay:.15s}.d4{animation-delay:.2s}

  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:#1C2130;border-radius:4px}

  /* ─── PERF FIX #4: Disable semua animasi berat untuk device low-end
     dan user yang prefer reduced motion (Android lama, aksesibilitas).
     Ini juga mencegah GPU overload dari banyak animasi simultan. ─────────── */
  @media(prefers-reduced-motion:reduce){
    .fu,.d1,.d2,.d3,.d4{animation:none!important;opacity:1!important;transform:none!important}
    .pr1 .p-card,.pr3 .p-card{animation:none!important}
    .pr2 .p-card::before{animation:none!important}
    .crown-sym,.star-dot{animation:none!important}
    .gt{animation:none!important;-webkit-text-fill-color:inherit;background-clip:initial;-webkit-background-clip:initial}
    .t-badge-ultra,.t-badge-legendary,.t-badge-mythic{animation:none!important}
    .t-badge-gold,.rt-pill-ultra,.rt-pill-legendary,.rt-pill-mythic{animation:none!important;box-shadow:none!important}
    .row-card .sheen{display:none}
    .p-card:hover{transform:none}
    .row-card:hover{transform:none}
    .cta-btn:hover{transform:none}
  }
`;

/* ─── Component ──────────────────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab,   setActiveTab]   = useState("levels");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ep = activeTab === "levels"
          ? "/api/leaderboard/levels"
          : "/api/leaderboard/donations";
        const res  = await fetch(ep);
        const data = await res.json();
        if (!cancelled) setLeaderboard(data.leaderboard || []);
      } catch (e) {
        if (!cancelled) console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeTab]);

  /* PERF FIX #5: useCallback — switchTab tidak perlu dibuat ulang setiap render.
     setActiveTab + setLoading di-batch otomatis oleh React 18. */
  const switchTab = useCallback((t) => {
    if (t !== activeTab) {
      setActiveTab(t);
      setLoading(true);
    }
  }, [activeTab]);

  /* PERF FIX #6: useMemo — podium & rest tidak dihitung ulang kecuali leaderboard berubah.
     Sebelumnya dikalkulasi ulang setiap render meskipun data sama. */
  const { podium, rest } = useMemo(() => {
    const top3 = leaderboard.slice(0, 3);
    return {
      podium: top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3,
      rest:   leaderboard.slice(3),
    };
  }, [leaderboard]);

  return (
    <div className="min-h-screen bg-[#080A0F] text-white">
      {/* PERF FIX: style tag sekarang hanya reference ke string konstant, tidak re-compute */}
      <style>{PAGE_STYLES}</style>

      {/* RESPONSIVE FIX: aria-hidden tambahan, noise langsung di element bukan ::after */}
      <div className="lb-noise" aria-hidden="true" />

      <div className="lb-root relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* Header */}
        <div className="mb-10 fu">
          <p className="sy text-[10px] uppercase tracking-[.22em] text-[#2E3A4A] mb-3">
            Hall of Fame
          </p>
          {/* RESPONSIVE FIX: font-size pakai clamp() — sebelumnya text-4xl/5xl bisa terlalu besar di 320px */}
          <h1
            className="sy font-extrabold tracking-tight leading-none"
            style={{ fontSize: "clamp(1.9rem, 8vw, 3.5rem)" }}
          >
            Leaderboard
          </h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-[#1C2130] fu d1">
          {[["levels","Top Levels"],["donations","Top Donators"]].map(([k,v]) => (
            <button
              key={k}
              className={`lb-tab${activeTab === k ? " on" : ""}`}
              onClick={() => switchTab(k)}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Loading / empty */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader /></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#2E3A4A] text-sm">No data available yet.</p>
          </div>
        ) : (
          <>
            {/* PODIUM (2nd | 1st | 3rd) */}
            <div className="podium-row mb-12 fu d2" style={{ paddingTop: "30px" }}>
              {podium.map((user) => {
                const rc       = RANK_CFG[user.rank];
                const tier     = getTierConfig(user.donorTier);
                const is1      = user.rank === 1;
                const avSize   = is1 ? 82 : user.rank === 2 ? 70 : 60;
                const ptClass  = `pr${user.rank}`;
                const colCls   = is1 ? "podium-col-center" : "podium-col";
                const ptOffset = is1 ? "0px" : user.rank === 2 ? "38px" : "56px";

                let badgeExtraClass = "";
                if      (user.donorTier === "celestial") badgeExtraClass = "t-badge-ultra";
                else if (user.donorTier === "legendary") badgeExtraClass = "t-badge-legendary";
                else if (user.donorTier === "mythic")    badgeExtraClass = "t-badge-mythic";
                else if (user.donorTier === "gold")      badgeExtraClass = "t-badge-gold";

                return (
                  <div
                    key={user.username}
                    className={`${colCls} ${ptClass}`}
                    style={{ paddingTop: ptOffset }}
                  >
                    {/* Crown — sekarang terposisi dengan benar karena parent punya position:relative */}
                    {is1 && (
                      <div className="crown-host">
                        <span className="crown-sym" aria-hidden="true">♛</span>
                      </div>
                    )}

                    <div
                      className="p-card"
                      style={{
                        background:   rc.cardBg,
                        borderColor:  `color-mix(in srgb,${rc.border},${tier.accentGlow} 35%)`,
                        minHeight:    rc.minH,
                        paddingTop:   is1 ? "32px" : "24px",
                        paddingBottom:"24px",
                        paddingLeft:  "16px",
                        paddingRight: "16px",
                        boxShadow:    `inset 0 0 40px ${tier.accentSoft}`,
                      }}
                      onClick={() => router.push(`/profile/${user.username}`)}
                    >
                      {/* Stars hanya untuk rank 1, dan STARS array sudah stabil di module-level */}
                      {is1 && (
                        <div className="stars-layer" aria-hidden="true">
                          {STARS.map((s, i) => (
                            <span
                              key={i}
                              className="star-dot"
                              style={{
                                left: s.x, top: s.y,
                                "--dur": s.d, "--del": s.del,
                                boxShadow: `0 0 4px ${rc.accent}`,
                              }}
                            />
                          ))}
                        </div>
                      )}

                      <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                        <span
                          className="rlabel"
                          style={{
                            color:       rc.accent,
                            borderColor: `${rc.accent}45`,
                            background:  rc.softGlow,
                          }}
                        >
                          {rc.label}
                        </span>

                        <div
                          className="av-ring"
                          style={{
                            background: `conic-gradient(${tier.accent} 0%,${tier.accentSoft} 45%,${tier.accent} 100%)`,
                          }}
                        >
                          <div
                            className="av-img"
                            style={{
                              width:    avSize,
                              height:   avSize,
                              fontSize: avSize * 0.38,
                              color:    tier.accent,
                            }}
                          >
                            {user.profileImage
                              ? <Image
                                  src={user.profileImage}
                                  alt={user.name}
                                  width={avSize}
                                  height={avSize}
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              : user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        </div>

                        <div>
                          <div
                            className={`sy font-bold ${is1 ? "text-lg" : "text-base"} gt`}
                            style={{ backgroundImage: tier.nameGrad }}
                          >
                            {user.name}
                          </div>
                          <p className="text-[10px] text-[#374151] mt-0.5">@{user.username}</p>
                        </div>

                        <span
                          className={`t-badge ${badgeExtraClass}`}
                          style={!badgeExtraClass ? {
                            background:  tier.badgeBg,
                            borderColor: tier.badgeBorder,
                            color:       tier.accent,
                          } : {}}
                        >
                          <span>{tier.icon}</span>
                          <span>{tier.label}</span>
                        </span>

                        <div className="mt-1">
                          {activeTab === "levels" ? (
                            <>
                              {/* RESPONSIVE FIX: font-size pakai clamp() — sebelumnya 28px/22px fixed */}
                              <div
                                className="sy font-extrabold"
                                style={{
                                  fontSize: is1
                                    ? "clamp(18px,5vw,28px)"
                                    : "clamp(14px,4vw,22px)",
                                  color: tier.accent,
                                }}
                              >
                                Lv {user.level}
                              </div>
                              <div className="text-[11px] text-[#374151] mt-1">
                                {(user.totalXp || 0).toLocaleString()} XP
                              </div>
                            </>
                          ) : (
                            <>
                              {/* RESPONSIVE FIX: clamp() untuk donation amount — bisa panjang di Rp */}
                              <div
                                className="sy font-extrabold"
                                style={{
                                  fontSize: is1
                                    ? "clamp(14px,4vw,22px)"
                                    : "clamp(12px,3.5vw,17px)",
                                  color: tier.accent,
                                }}
                              >
                                Rp{(user.totalDonations || 0).toLocaleString()}
                              </div>
                              <div className="text-[11px] text-[#374151] mt-1">Total Donated</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RANK 4+ */}
            {rest.length > 0 && (
              <div className="space-y-2 fu d3">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[#1C2130]" />
                  <span className="sy text-[9px] uppercase tracking-[.22em] text-[#2E3A4A]">
                    Rankings
                  </span>
                  <div className="flex-1 h-px bg-[#1C2130]" />
                </div>

                {rest.map((user, idx) => {
                  const tier     = getTierConfig(user.donorTier);
                  const hasDonor = user.isDonator && !!tier;
                  const rowCls   = hasDonor
                    ? `row-card row-${tier.css}`
                    : "row-card row-card-plain";

                  /* PERF FIX: sederhanakan kondisi pillar pillExtra dengan includes() */
                  let pillExtra = "";
                  if      (user.donorTier === "celestial") pillExtra = "rt-pill-ultra";
                  else if (user.donorTier === "legendary") pillExtra = "rt-pill-legendary";
                  else if (user.donorTier === "mythic")    pillExtra = "rt-pill-mythic";
                  else if (user.donorTier === "gold" || user.donorTier === "gold-plus")
                    pillExtra = "rt-pill-gold";
                  else if (["platinum","immortal","titanium","diamond"].includes(user.donorTier))
                    pillExtra = "rt-pill-plat";

                  return (
                    <div
                      key={user.username}
                      className={rowCls}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                      onClick={() => router.push(`/profile/${user.username}`)}
                    >
                      {hasDonor && (
                        <span className={`strip strip-${tier.css}`} aria-hidden="true" />
                      )}
                      {hasDonor && (
                        tier.css === "silver" || tier.css === "silver-plus" ||
                        tier.css === "platinum" || tier.css === "celestial" ||
                        tier.css === "legendary" || tier.css === "mythic" ||
                        tier.css === "immortal" || tier.css === "titanium" ||
                        tier.css === "diamond"
                      ) && (
                        <span className="sheen" aria-hidden="true" />
                      )}

                      <div className="sy font-extrabold text-[11px] text-[#2E3A4A] w-8 text-center flex-shrink-0">
                        {user.rank}
                      </div>

                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center sy font-bold text-sm"
                        style={{
                          background: hasDonor
                            ? `radial-gradient(circle,${tier.accentSoft},#1C2130)`
                            : "#1C2130",
                          border: `1px solid ${hasDonor ? tier.accent + "40" : "#1C2130"}`,
                          color:  hasDonor ? tier.accent : "#F7CC45",
                        }}
                      >
                        {user.profileImage
                          ? <Image
                              src={user.profileImage}
                              alt={user.name}
                              width={40}
                              height={40}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          : user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className="sy font-bold text-sm gt truncate"
                            style={{ backgroundImage: tier.nameGrad }}
                          >
                            {user.name}
                          </span>
                          {hasDonor && (
                            <span
                              className={`rt-pill ${pillExtra}`}
                              style={!pillExtra ? {
                                color:       tier.accent,
                                borderColor: `${tier.accent}45`,
                                background:  tier.accentSoft,
                              } : {}}
                            >
                              {tier.icon} {tier.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#2E3A4A]">@{user.username}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        {activeTab === "levels" ? (
                          <>
                            <div
                              className="sy font-bold text-base"
                              style={{ color: tier.accent }}
                            >
                              Lv{user.level}
                            </div>
                            <div className="text-[10px] text-[#374151]">
                              {(user.totalXp || 0).toLocaleString()} xp
                            </div>
                          </>
                        ) : (
                          <>
                            <div
                              className="sy font-bold text-sm"
                              style={{ color: tier.accent }}
                            >
                              Rp{(user.totalDonations || 0).toLocaleString()}
                            </div>
                            <div className="text-[10px] text-[#374151]">donated</div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CTA Donasi */}
        {activeTab === "donations" && !loading && (
          <div className="mt-14 cta-card fu d4">
            <p className="sy text-[9px] uppercase tracking-[.22em] text-[#2E3A4A] mb-2">
              Support Us
            </p>
            <h3 className="sy text-2xl font-bold mb-2">Become a Donor</h3>
            <p className="text-sm text-[#3D4A5C] mb-7 max-w-xs mx-auto">
              Unlock exclusive perks, a unique donor badge, and earn your place on this board.
            </p>
            <Link href="/donate" className="cta-btn">Donate Now</Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}