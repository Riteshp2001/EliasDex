"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Image from "next/image";

/* ─── Rank Config ─────────────────────────────────────────────── */
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

/* ─── Donor Tier Config ───────────────────────────────────────── */
const TIERS = {
  bronze: {
    label:      "Bronze",
    accent:     "#CD7F32",
    accentSoft: "rgba(205,127,50,0.12)",
    accentGlow: "rgba(205,127,50,0.3)",
    nameGrad:   "linear-gradient(90deg,#CD7F32,#E89F60,#CD7F32)",
    badgeBg:    "linear-gradient(135deg,#3D1F00,#5E3010)",
    badgeBorder:"rgba(205,127,50,0.5)",
    rowBg:      "linear-gradient(90deg,rgba(205,127,50,0.07) 0%,#0E1118 60%)",
    rowBorder:  "rgba(205,127,50,0.28)",
    stripGrad:  "linear-gradient(to bottom,#A0510A,#E8A060,#A0510A)",
    icon:       "◈",
    css:        "bronze",
  },
  silver: {
    label:      "Silver",
    accent:     "#C4D0DC",
    accentSoft: "rgba(196,208,220,0.1)",
    accentGlow: "rgba(196,208,220,0.28)",
    nameGrad:   "linear-gradient(90deg,#A8B8C8,#E0EAF2,#A8B8C8)",
    badgeBg:    "linear-gradient(135deg,#0F1C28,#1A2C3A)",
    badgeBorder:"rgba(196,208,220,0.4)",
    rowBg:      "linear-gradient(90deg,rgba(196,208,220,0.06) 0%,#0E1118 60%)",
    rowBorder:  "rgba(196,208,220,0.22)",
    stripGrad:  "linear-gradient(to bottom,#7A9AB0,#E0EAF2,#7A9AB0)",
    icon:       "◆",
    css:        "silver",
  },
  gold: {
    label:      "Gold",
    accent:     "#F7CC45",
    accentSoft: "rgba(247,204,69,0.1)",
    accentGlow: "rgba(247,204,69,0.45)",
    nameGrad:   "linear-gradient(90deg,#F7CC45,#FFF0A0,#F7CC45)",
    badgeBg:    "linear-gradient(135deg,#1C1200,#2E1F00)",
    badgeBorder:"rgba(247,204,69,0.6)",
    rowBg:      "linear-gradient(90deg,rgba(247,204,69,0.08) 0%,#0E1118 60%)",
    rowBorder:  "rgba(247,204,69,0.28)",
    stripGrad:  "linear-gradient(to bottom,#AA8800,#F7CC45,#AA8800)",
    icon:       "★",
    css:        "gold",
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
};

/* ─── Component ───────────────────────────────────────────────── */
export default function LeaderboardPage() {
  const router  = useRouter();
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

  const switchTab = (t) => {
    if (t !== activeTab) { setActiveTab(t); setLoading(true); }
  };

  /* Podium display order: 2nd | 1st | 3rd */
  const top3   = leaderboard.slice(0, 3);
  const podium = top3.length === 3
    ? [top3[1], top3[0], top3[2]]
    : top3;
  const rest   = leaderboard.slice(3);

  /* Star positions for rank 1 */
  const STARS = [
    {x:"12%",y:"15%",d:"1.3s",del:"0s"},   {x:"82%",y:"10%",d:"1.8s",del:".5s"},
    {x:"7%",y:"68%",d:"2.2s",del:".9s"},   {x:"90%",y:"62%",d:"1.6s",del:".2s"},
    {x:"48%",y:"6%",d:"2s",del:".6s"},     {x:"60%",y:"88%",d:"1.7s",del:"1.1s"},
    {x:"75%",y:"75%",d:"2.4s",del:".4s"},
  ];

  return (
    <div className="min-h-screen bg-[#080A0F] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .lb-root, .lb-root * { font-family: 'DM Sans', sans-serif; }
        .sy { font-family: 'Syne', sans-serif !important; }

        /* Noise */
        .lb-noise::after {
          content:''; position:fixed; inset:0; pointer-events:none; z-index:0; opacity:.5;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 300 300' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }

        /* Tabs */
        .lb-tab {
          position:relative; padding:10px 22px;
          font-family:'Syne',sans-serif; font-size:11px; font-weight:700;
          letter-spacing:.14em; text-transform:uppercase; color:#3D4A5C;
          background:none; border:none; cursor:pointer; transition:color .2s;
        }
        .lb-tab:hover { color:#6B7A8D; }
        .lb-tab.on    { color:#F7CC45; }
        .lb-tab.on::after {
          content:''; position:absolute; bottom:0; left:22px; right:22px;
          height:1.5px; background:#F7CC45;
          box-shadow: 0 0 8px rgba(247,204,69,.55);
        }

        /* Podium layout */
        .podium-row {
          display:flex; align-items:flex-end; gap:10px;
        }
        .podium-col        { flex:1; }
        .podium-col-center { flex:1.08; }

        /* mobile: stack 1-2-3 */
        @media (max-width:639px) {
          .podium-row { flex-direction:column; align-items:stretch; }
          .podium-col, .podium-col-center { flex:none; }
          .pr1 { order:1; } .pr2 { order:2; } .pr3 { order:3; }
        }

        /* Podium card */
        .p-card {
          position:relative; border-radius:18px; overflow:hidden;
          border:1px solid; cursor:pointer;
          transition:transform .25s, box-shadow .3s;
        }
        .p-card:hover { transform:translateY(-6px); }

        /* Rank 1: pulsing glow */
        @keyframes r1Pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(247,204,69,0),0 4px 30px rgba(247,204,69,.12); }
          50%      { box-shadow:0 0 0 7px rgba(247,204,69,.07),0 4px 50px rgba(247,204,69,.28); }
        }
        .pr1 .p-card { animation: r1Pulse 3s ease-in-out infinite; }

        /* Rank 2: holographic sweep */
        .pr2 .p-card::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(110deg,transparent 20%,rgba(200,216,232,.06) 50%,transparent 80%);
          background-size:200% 100%;
          animation:r2Sheen 4s ease infinite;
        }
        @keyframes r2Sheen {
          0%   { background-position:200% 0; }
          100% { background-position:-200% 0; }
        }

        /* Rank 3: ember pulse */
        @keyframes r3Ember {
          0%,100% { box-shadow:0 4px 14px rgba(212,136,92,.08); }
          50%      { box-shadow:0 4px 30px rgba(212,136,92,.22); }
        }
        .pr3 .p-card { animation: r3Ember 4s ease-in-out infinite; }

        /* Crown */
        .crown-host {
          position:absolute; top:-22px; left:50%; transform:translateX(-50%);
          z-index:20; pointer-events:none;
        }
        .crown-sym {
          display:block; font-size:28px; line-height:1;
          filter:drop-shadow(0 0 10px rgba(247,204,69,.9)) drop-shadow(0 0 22px rgba(247,204,69,.5));
          animation:crownFloat 3.2s ease-in-out infinite;
        }
        @keyframes crownFloat {
          0%,100% { transform:translateY(0); }
          50%      { transform:translateY(-5px); }
        }

        /* Stars (rank 1) */
        .stars-layer { position:absolute; inset:0; pointer-events:none; overflow:hidden; }
        .star-dot {
          position:absolute; width:2px; height:2px; border-radius:50%;
          background:#F7CC45; opacity:0;
          animation:twinkle var(--dur) ease-in-out var(--del) infinite;
        }
        @keyframes twinkle {
          0%,100% { opacity:0; transform:scale(1); }
          50%      { opacity:.75; transform:scale(1.6); }
        }

        /* Avatar ring */
        .av-ring { border-radius:50%; padding:2.5px; }
        .av-img  { border-radius:50%; overflow:hidden; background:#1C2130;
                   display:flex; align-items:center; justify-content:center;
                   font-family:'Syne',sans-serif; font-weight:800; }

        /* Rank label pill */
        .rlabel {
          font-family:'Syne',sans-serif; font-weight:800;
          font-size:10px; letter-spacing:.14em; text-transform:uppercase;
          padding:3px 10px; border-radius:99px; border:1px solid;
        }

        /* Tier badge (podium) */
        .t-badge {
          display:inline-flex; align-items:center; gap:4px;
          padding:4px 10px; border-radius:8px;
          font-size:10px; font-weight:700; letter-spacing:.1em;
          text-transform:uppercase; border:1px solid;
        }

        /* Platinum badge animated bg */
        @keyframes platBg {
          0%   { background-position:0% 50%; }
          100% { background-position:200% 50%; }
        }
        .t-badge-plat {
          background:linear-gradient(90deg,#2D1060,#0D2060,#601070,#0D2060,#2D1060) !important;
          background-size:300% 100% !important;
          animation:platBg 4s linear infinite;
          border-color:rgba(167,139,250,.55) !important;
          color:#D4B8FF !important;
        }

        /* Gold badge glow */
        @keyframes goldBadge {
          0%,100% { box-shadow:0 0 4px rgba(247,204,69,.2); }
          50%      { box-shadow:0 0 14px rgba(247,204,69,.65); }
        }
        .t-badge-gold { animation:goldBadge 2s ease-in-out infinite; }

        /* Row cards */
        .row-card {
          position:relative; overflow:hidden;
          display:flex; align-items:center; gap:14px;
          padding:13px 16px; border-radius:12px;
          background:#0E1118; border:1px solid #1C2130;
          cursor:pointer; transition:transform .2s, border-color .2s, box-shadow .2s;
        }
        .row-card:hover { transform:translateX(4px); }
        .row-card-plain:hover { border-color:rgba(247,204,69,.2); }

        /* Left strip via pseudo */
        .row-card .strip {
          position:absolute; left:0; top:0; bottom:0; width:3px;
          border-radius:12px 0 0 12px;
        }

        /* Bronze row */
        .row-bronze { background:linear-gradient(90deg,rgba(205,127,50,.07) 0%,#0E1118 60%) !important; border-color:rgba(205,127,50,.28) !important; }
        .row-bronze:hover { box-shadow:0 0 18px rgba(205,127,50,.14); border-color:rgba(205,127,50,.5) !important; }
        .strip-bronze { background:linear-gradient(to bottom,#A0510A,#E8A060,#A0510A); }

        /* Silver row + sheen */
        .row-silver { background:linear-gradient(90deg,rgba(196,208,220,.06) 0%,#0E1118 60%) !important; border-color:rgba(196,208,220,.22) !important; }
        .row-silver:hover { box-shadow:0 0 18px rgba(196,208,220,.1); border-color:rgba(196,208,220,.4) !important; }
        .strip-silver { background:linear-gradient(to bottom,#7A9AB0,#E0EAF2,#7A9AB0); }
        .row-silver .sheen {
          position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(110deg,transparent 30%,rgba(200,216,232,.05) 50%,transparent 70%);
          background-size:200% 100%;
          animation:silvRowSheen 5s ease infinite;
        }
        @keyframes silvRowSheen { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Gold row */
        .row-gold { background:linear-gradient(90deg,rgba(247,204,69,.08) 0%,#0E1118 60%) !important; border-color:rgba(247,204,69,.25) !important; }
        .row-gold:hover { box-shadow:0 0 20px rgba(247,204,69,.18); border-color:rgba(247,204,69,.5) !important; }
        .strip-gold { background:linear-gradient(to bottom,#AA8800,#F7CC45,#AA8800); animation:goldStrip 2s ease-in-out infinite; }
        @keyframes goldStrip { 0%,100%{opacity:.6} 50%{opacity:1} }

        /* Platinum row + flowing strip + shimmer */
        .row-platinum { background:linear-gradient(90deg,rgba(167,139,250,.08) 0%,#0E1118 60%) !important; border-color:rgba(167,139,250,.25) !important; }
        .row-platinum:hover { box-shadow:0 0 22px rgba(167,139,250,.18); border-color:rgba(167,139,250,.5) !important; }
        .strip-platinum {
          background:linear-gradient(to bottom,#A78BFA,#60A5FA,#C084FC,#A78BFA);
          background-size:100% 300%;
          animation:platStrip 3s linear infinite;
        }
        @keyframes platStrip { 0%{background-position:0 0%} 100%{background-position:0 100%} }
        .row-platinum .sheen {
          position:absolute; inset:0; pointer-events:none;
          background:linear-gradient(110deg,transparent 20%,rgba(167,139,250,.04) 50%,transparent 80%);
          background-size:200% 100%;
          animation:platRowSheen 3s ease infinite;
        }
        @keyframes platRowSheen { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

        /* Row tier pill */
        .rt-pill {
          display:inline-flex; align-items:center; gap:3px;
          padding:2px 7px; border-radius:99px; border:1px solid;
          font-size:9px; font-weight:700; letter-spacing:.1em; text-transform:uppercase;
          flex-shrink:0;
        }
        .rt-pill-plat {
          background:linear-gradient(90deg,rgba(167,139,250,.15),rgba(96,165,250,.12));
          border-color:rgba(167,139,250,.4) !important; color:#C4A8FF !important;
          animation:platPillGlow 3s ease-in-out infinite;
        }
        @keyframes platPillGlow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 8px rgba(167,139,250,.4)} }
        .rt-pill-gold { animation:goldPillGlow 2s ease-in-out infinite; }
        @keyframes goldPillGlow { 0%,100%{box-shadow:none} 50%{box-shadow:0 0 8px rgba(247,204,69,.4)} }

        /* Gradient animated text */
        .gt { background-clip:text; -webkit-background-clip:text; -webkit-text-fill-color:transparent;
              background-size:200% auto; animation:gtAnim 4s linear infinite; }
        @keyframes gtAnim { 0%{background-position:0% center} 100%{background-position:200% center} }

        /* CTA */
        .cta-card {
          border-radius:18px; border:1px solid #1C2130; background:#0E1118;
          padding:44px 32px; text-align:center; position:relative; overflow:hidden;
        }
        .cta-card::before {
          content:''; position:absolute; top:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(247,204,69,.45),transparent);
        }
        .cta-btn {
          display:inline-block; padding:13px 36px;
          background:#F7CC45; color:#080A0F;
          font-family:'Syne',sans-serif; font-weight:700; font-size:12px;
          letter-spacing:.1em; text-transform:uppercase; border-radius:9px;
          transition:background .2s, transform .2s; text-decoration:none;
        }
        .cta-btn:hover { background:#E8B830; transform:translateY(-2px); }

        /* Entrance */
        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fu  { animation:fadeUp .45s ease both; }
        .d1  { animation-delay:.05s; } .d2 { animation-delay:.1s; }
        .d3  { animation-delay:.15s; } .d4 { animation-delay:.2s; }

        /* Scrollbar */
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#1C2130; border-radius:4px; }
      `}</style>

      <div className="lb-noise" />

      <div className="lb-root relative z-10 max-w-3xl mx-auto px-4 sm:px-6 py-12 pb-24">

        {/* ── Header ── */}
        <div className="mb-10 fu">
          <p className="sy text-[10px] uppercase tracking-[.22em] text-[#2E3A4A] mb-3">Hall of Fame</p>
          <h1 className="sy text-4xl sm:text-5xl font-extrabold tracking-tight leading-none">Leaderboard</h1>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-10 border-b border-[#1C2130] fu d1">
          {[["levels","Top Levels"],["donations","Top Donators"]].map(([k,v]) => (
            <button key={k} className={`lb-tab${activeTab===k?" on":""}`} onClick={()=>switchTab(k)}>{v}</button>
          ))}
        </div>

        {/* ── Loading / empty ── */}
        {loading ? (
          <div className="flex justify-center py-24"><Loader /></div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#2E3A4A] text-sm">No data available yet.</p>
          </div>
        ) : (
          <>
            {/* ══════════════════════════════════════════
                PODIUM  (2nd | 1st | 3rd)
            ══════════════════════════════════════════ */}
            <div className="podium-row mb-12 fu d2" style={{paddingTop:"30px"}}>
              {podium.map((user) => {
                const rc      = RANK_CFG[user.rank];
                const tier    = TIERS[user.donorTier];
                const is1     = user.rank === 1;
                const avSize  = is1 ? 82 : user.rank === 2 ? 70 : 60;
                const ptClass = `pr${user.rank}`;
                const colCls  = is1 ? "podium-col-center" : "podium-col";
                const ptOffset = is1 ? "0px" : user.rank === 2 ? "38px" : "56px";

                return (
                  <div key={user.username} className={`${colCls} ${ptClass}`} style={{paddingTop:ptOffset}}>
                    {/* Floating crown for rank 1 */}
                    {is1 && (
                      <div className="crown-host" style={{zIndex:20}}>
                        <span className="crown-sym">♛</span>
                      </div>
                    )}

                    <div
                      className="p-card"
                      style={{
                        background: tier
                          ? `${rc.cardBg}`
                          : rc.cardBg,
                        borderColor: tier
                          ? `color-mix(in srgb,${rc.border},${tier.accentGlow} 35%)`
                          : rc.border,
                        minHeight: rc.minH,
                        paddingTop:  is1 ? "32px" : "24px",
                        paddingBottom: "24px",
                        paddingLeft: "16px",
                        paddingRight: "16px",
                        boxShadow: tier ? `inset 0 0 40px ${tier.accentSoft}` : undefined,
                      }}
                      onClick={() => router.push(`/profile/${user.username}`)}
                    >
                      {/* Twinkling stars — rank 1 only */}
                      {is1 && (
                        <div className="stars-layer" aria-hidden="true">
                          {STARS.map((s,i) => (
                            <span key={i} className="star-dot" style={{
                              left:s.x, top:s.y,
                              "--dur":s.d, "--del":s.del,
                              boxShadow:`0 0 4px ${rc.accent}`,
                            }} />
                          ))}
                        </div>
                      )}

                      {/* Content */}
                      <div className="relative z-10 flex flex-col items-center gap-3 text-center">

                        {/* Rank pill */}
                        <span className="rlabel" style={{
                          color: rc.accent,
                          borderColor: `${rc.accent}45`,
                          background: rc.softGlow,
                        }}>
                          {rc.label}
                        </span>

                        {/* Avatar */}
                        <div
                          className="av-ring"
                          style={{
                            background: `conic-gradient(${rc.accent} 0%,${rc.softGlow} 45%,${rc.accent} 100%)`,
                          }}
                        >
                          <div className="av-img" style={{
                            width:avSize, height:avSize,
                            fontSize: avSize * 0.38,
                            color: tier ? tier.accent : rc.accent,
                          }}>
                            {user.profileImage
                              ? <Image src={user.profileImage} alt={user.name} width={avSize} height={avSize}
                                  style={{width:"100%",height:"100%",objectFit:"cover"}} />
                              : user.name?.charAt(0)?.toUpperCase()}
                          </div>
                        </div>

                        {/* Name */}
                        <div>
                          {tier ? (
                            <div className={`sy font-bold ${is1?"text-lg":"text-base"} gt`}
                              style={{backgroundImage:tier.nameGrad}}>
                              {user.name}
                            </div>
                          ) : (
                            <div className={`sy font-bold ${is1?"text-lg":"text-base"} text-white`}>
                              {user.name}
                            </div>
                          )}
                          <p className="text-[10px] text-[#374151] mt-0.5">@{user.username}</p>
                        </div>

                        {/* Tier badge */}
                        {tier && (
                          <span
                            className={`t-badge ${user.donorTier==="platinum"?"t-badge-plat":""} ${user.donorTier==="gold"?"t-badge-gold":""}`}
                            style={user.donorTier!=="platinum" ? {
                              background: tier.badgeBg,
                              borderColor: tier.badgeBorder,
                              color: tier.accent,
                            } : {}}
                          >
                            <span>{tier.icon}</span>
                            <span>{tier.label}</span>
                          </span>
                        )}

                        {/* Stat */}
                        <div className="mt-1">
                          {activeTab === "levels" ? (
                            <>
                              <div className="sy font-extrabold" style={{
                                fontSize: is1?"28px":"22px",
                                color: tier ? tier.accent : rc.accent,
                              }}>
                                Lv {user.level}
                              </div>
                              <div className="text-[11px] text-[#374151] mt-1">
                                {(user.totalXp||0).toLocaleString()} XP
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="sy font-extrabold" style={{
                                fontSize: is1?"22px":"17px",
                                color: tier ? tier.accent : rc.accent,
                              }}>
                                Rp{(user.totalDonations||0).toLocaleString()}
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

            {/* ══════════════════════════════════════════
                RANK 4+
            ══════════════════════════════════════════ */}
            {rest.length > 0 && (
              <div className="space-y-2 fu d3">
                {/* Divider */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-[#1C2130]" />
                  <span className="sy text-[9px] uppercase tracking-[.22em] text-[#2E3A4A]">Rankings</span>
                  <div className="flex-1 h-px bg-[#1C2130]" />
                </div>

                {rest.map((user, idx) => {
                  const tier     = TIERS[user.donorTier];
                  const hasDonor = user.isDonator && !!tier;
                  const rowCls   = hasDonor
                    ? `row-card row-${user.donorTier}`
                    : "row-card row-card-plain";

                  return (
                    <div
                      key={user.username}
                      className={rowCls}
                      style={{animationDelay:`${idx*0.04}s`}}
                      onClick={() => router.push(`/profile/${user.username}`)}
                    >
                      {/* Left accent strip */}
                      {hasDonor && (
                        <span className={`strip strip-${user.donorTier}`} aria-hidden />
                      )}

                      {/* Shimmer overlay (silver + platinum) */}
                      {hasDonor && (user.donorTier==="silver"||user.donorTier==="platinum") && (
                        <span className="sheen" aria-hidden />
                      )}

                      {/* Rank */}
                      <div className="sy font-extrabold text-[11px] text-[#2E3A4A] w-8 text-center flex-shrink-0">
                        {user.rank}
                      </div>

                      {/* Avatar */}
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center sy font-bold text-sm"
                        style={{
                          background: hasDonor
                            ? `radial-gradient(circle,${tier.accentSoft},#1C2130)`
                            : "#1C2130",
                          border: `1px solid ${hasDonor ? tier.accent+"40" : "#1C2130"}`,
                          color: hasDonor ? tier.accent : "#F7CC45",
                        }}
                      >
                        {user.profileImage
                          ? <Image src={user.profileImage} alt={user.name} width={40} height={40}
                              style={{width:"100%",height:"100%",objectFit:"cover"}} />
                          : user.name?.charAt(0)?.toUpperCase()}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {hasDonor ? (
                            <span className="sy font-bold text-sm gt truncate"
                              style={{backgroundImage:tier.nameGrad}}>
                              {user.name}
                            </span>
                          ) : (
                            <span className="sy font-bold text-sm text-white truncate">
                              {user.name}
                            </span>
                          )}
                          {hasDonor && (
                            <span
                              className={`rt-pill ${user.donorTier==="platinum"?"rt-pill-plat":""} ${user.donorTier==="gold"?"rt-pill-gold":""}`}
                              style={user.donorTier!=="platinum" ? {
                                color: tier.accent,
                                borderColor: `${tier.accent}45`,
                                background: tier.accentSoft,
                              } : {}}
                            >
                              {tier.icon} {tier.label}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#2E3A4A]">@{user.username}</p>
                      </div>

                      {/* Stat */}
                      <div className="text-right flex-shrink-0">
                        {activeTab === "levels" ? (
                          <>
                            <div className="sy font-bold text-base"
                              style={{color: hasDonor ? tier.accent : "#F7CC45"}}>
                              Lv{user.level}
                            </div>
                            <div className="text-[10px] text-[#374151]">
                              {(user.totalXp||0).toLocaleString()} xp
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="sy font-bold text-sm"
                              style={{color: hasDonor ? tier.accent : "#F7CC45"}}>
                              Rp{(user.totalDonations||0).toLocaleString()}
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

        {/* ── Donation CTA ── */}
        {activeTab === "donations" && !loading && (
          <div className="mt-14 cta-card fu d4">
            <p className="sy text-[9px] uppercase tracking-[.22em] text-[#2E3A4A] mb-2">Support Us</p>
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