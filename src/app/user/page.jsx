"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Image from "next/image";

export default function UserPage() {
  const router = useRouter();
  const { user, loading, isAuthenticated, userStats } = useAuth();
  const [history, setHistory] = useState([]);
  const [comicHistory, setComicHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true); // mulai dengan true

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    // loadingHistory sudah true, langsung fetch
    fetch("/api/user/history")
      .then((res) => res.json())
      .then((data) => setHistory(data.history ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoadingHistory(false));
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch("/api/user/comic-progress")
      .then((res) => res.json())
      .then((data) => setComicHistory(data.history ?? []))
      .catch(() => setComicHistory([]));
  }, [isAuthenticated]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <Loader />
      </div>
    );
  }

  const displayUser = {
    ...user,
    level: userStats.level || 1,
    totalXp: userStats.totalXp || 0,
    levelProgress: userStats.levelProgress || 0,
  };

  const stats = {
    totalJudul: history.length,
    totalEpisode: history.reduce((sum, item) => sum + (item.currentEp || 0), 0),
    selesai: history.filter((item) => (item.percent ?? 0) >= 100).length,
    sedangDitonton: history.filter((item) => (item.percent ?? 0) > 0 && (item.percent ?? 0) < 100).length,
    totalComics: comicHistory.length,
    totalChapters: comicHistory.reduce((sum, item) => sum + (item.currentChapter || 0), 0),
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', system-ui, sans-serif;
          background: #0a0a0a;
          color: #a1a1aa;
        }

        .page-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        /* ── HEADER ── */
        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .avatar {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 600;
          color: #e4e4e7;
          overflow: hidden;
          border: 2px solid #27272a;
          position: relative;
        }

        .avatar.donator {
          border: 3px solid transparent;
          background: linear-gradient(#1a1a1a, #1a1a1a) padding-box,
                      linear-gradient(135deg, #f59e0b, #fbbf24) border-box;
          animation: donorPulse 2s ease-in-out infinite;
        }

        .avatar.donator.bronze {
          background: linear-gradient(#1a1a1a, #1a1a1a) padding-box,
                      linear-gradient(135deg, #d97706, #ea580c) border-box;
        }

        .avatar.donator.silver {
          background: linear-gradient(#1a1a1a, #1a1a1a) padding-box,
                      linear-gradient(135deg, #a1a1a1, #d4d4d8) border-box;
        }

        .avatar.donator.gold {
          background: linear-gradient(#1a1a1a, #1a1a1a) padding-box,
                      linear-gradient(135deg, #f59e0b, #fbbf24) border-box;
        }

        .avatar.donator.platinum {
          background: linear-gradient(#1a1a1a, #1a1a1a) padding-box,
                      linear-gradient(135deg, #818cf8, #c084fc) border-box;
        }

        @keyframes donorPulse {
          0% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4); }
          70% { box-shadow: 0 0 0 10px rgba(245, 158, 11, 0); }
          100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0); }
        }

        .donor-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid #0a0a0a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
          z-index: 10;
          animation: badgeFloat 3s ease-in-out infinite;
        }

        .donor-badge.bronze {
          background: linear-gradient(135deg, #d97706, #ea580c);
          color: white;
        }

        .donor-badge.silver {
          background: linear-gradient(135deg, #a1a1a1, #d4d4d8);
          color: #1a1a1a;
        }

        .donor-badge.gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #1a1a1a;
        }

        .donor-badge.platinum {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          color: white;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .user-details {
          flex: 1;
        }

        .display-name {
          font-size: 1.75rem;
          font-weight: 600;
          color: #fafafa;
          letter-spacing: -0.02em;
          margin-bottom: 0.25rem;
        }

        .display-name.donator {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 700;
          animation: nameGlow 2s ease-in-out infinite alternate;
        }

        .display-name.donator.bronze {
          background: linear-gradient(135deg, #d97706, #ea580c);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .display-name.donator.silver {
          background: linear-gradient(135deg, #a1a1a1, #d4d4d8);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .display-name.donator.gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .display-name.donator.platinum {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes nameGlow {
          0% { filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.3)); }
          100% { filter: drop-shadow(0 0 10px rgba(245, 158, 11, 0.6)); }
        }

        .username {
          font-size: 0.875rem;
          color: #71717a;
          letter-spacing: 0.025em;
        }

        .donor-status {
          margin-top: 0.5rem;
        }

        .donor-tier-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 1rem;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          animation: badgeShine 3s ease-in-out infinite;
        }

        .donor-tier-badge.bronze {
          background: linear-gradient(135deg, #d97706, #ea580c);
          color: white;
        }

        .donor-tier-badge.silver {
          background: linear-gradient(135deg, #a1a1a1, #d4d4d8);
          color: #1a1a1a;
        }

        .donor-tier-badge.gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
          color: #1a1a1a;
        }

        .donor-tier-badge.platinum {
          background: linear-gradient(135deg, #818cf8, #c084fc);
          color: white;
        }

        @keyframes badgeShine {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .edit-profile-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.625rem 1.5rem;
          border: 1px solid #3f3f46;
          border-radius: 0.5rem;
          color: #d4d4d8;
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.2s;
          background: transparent;
        }

        .edit-profile-btn:hover {
          border-color: #a1a1aa;
          color: white;
          background: rgba(255,255,255,0.05);
        }

        /* ── STATS CARD ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 1px;
          background: #27272a;
          border-radius: 0.75rem;
          overflow: hidden;
          margin-bottom: 2.5rem;
        }

        .stat-item {
          background: #18181b;
          padding: 1.25rem 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f4f4f5;
          margin-bottom: 0.25rem;
        }

        .stat-number.accent {
          color: #a78bfa; /* subtle accent instead of amber */
        }

        .stat-label {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #71717a;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* ── MAIN GRID LAYOUT ── */
        .main-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: 2.5rem;
          align-items: start;
        }

        @media (max-width: 900px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
        }

        /* ── HISTORY PANEL COMMON ── */
        .history-panel {
          margin-bottom: 2.5rem;
        }

        .panel-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 1.25rem;
        }

        .panel-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: #e4e4e7;
        }

        .panel-link {
          font-size: 0.8rem;
          color: #a78bfa;
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .panel-link:hover {
          opacity: 0.8;
        }

        .history-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .history-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0.5rem;
          border-radius: 0.5rem;
          text-decoration: none;
          color: inherit;
          transition: background 0.15s;
        }

        .history-row:hover {
          background: #18181b;
        }

        .thumb {
          width: 44px;
          height: 60px;
          border-radius: 0.375rem;
          overflow: hidden;
          background: #27272a;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #52525b;
          font-size: 0.65rem;
          text-transform: uppercase;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .info {
          flex: 1;
          min-width: 0;
        }

        .title {
          font-size: 0.9rem;
          font-weight: 500;
          color: #d4d4d8;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 0.2rem;
        }

        .episode {
          font-size: 0.75rem;
          color: #52525b;
          margin-bottom: 0.3rem;
        }

        .progress-bar {
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
        }

        .percentage {
          font-size: 0.8rem;
          font-weight: 600;
          color: #a78bfa;
          width: 36px;
          text-align: right;
          flex-shrink: 0;
        }

        .empty-state {
          padding: 2rem 0;
          text-align: center;
          color: #3f3f46;
          font-size: 0.9rem;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.75rem;
        }

        .widget {
          background: #18181b;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }

        .widget-label {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #52525b;
          margin-bottom: 1rem;
        }

        .email-display {
          font-size: 0.875rem;
          color: #a1a1aa;
          word-break: break-all;
          margin-top: 0.25rem;
        }

        .level-value {
          font-size: 2.5rem;
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
          height: 4px;
          background: #27272a;
          border-radius: 2px;
          margin: 0.75rem 0 0.5rem;
          overflow: hidden;
        }

        .xp-fill {
          height: 100%;
          background: #a78bfa;
          border-radius: 2px;
        }

        .xp-caption {
          font-size: 0.7rem;
          color: #52525b;
        }

        .xp-caption strong {
          color: #a78bfa;
        }

        .settings-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.75rem 0;
          color: #a1a1aa;
          text-decoration: none;
          font-size: 0.875rem;
          border-bottom: 1px solid #27272a;
          transition: color 0.2s;
        }

        .settings-link:last-child {
          border-bottom: none;
        }

        .settings-link:hover {
          color: #f4f4f5;
        }

        .arrow {
          font-size: 1rem;
          color: #52525b;
        }

        /* ── RESPONSIVE ADJUSTMENTS ── */
        @media (max-width: 640px) {
          .page-container {
            padding: 2rem 1rem;
          }
          .profile-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .edit-profile-btn {
            width: 100%;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>

      <div className="page-container">
        {/* Header */}
        <header className="profile-header">
          <div className={`avatar ${displayUser.isDonator ? `donator ${displayUser.donorTier || "bronze"}` : ""}`}>
            {displayUser.profileImage ? (
              <Image src={displayUser.profileImage} alt="Profile" width={100} height={100} />
            ) : (
              (displayUser.name?.charAt(0)?.toUpperCase() ?? "U")
            )}
            {displayUser.isDonator && <div className={`donor-badge ${displayUser.donorTier || "bronze"}`}>✨</div>}
          </div>
          <div className="user-details">
            <h1
              className={`display-name ${displayUser.isDonator ? `donator ${displayUser.donorTier || "bronze"}` : ""}`}
            >
              {displayUser.name}
            </h1>
            <p className="username">@{displayUser.username}</p>
            {displayUser.isDonator && (
              <div className="donor-status">
                <span className={`donor-tier-badge ${displayUser.donorTier || "bronze"}`}>
                  {displayUser.donorTier?.charAt(0).toUpperCase() + displayUser.donorTier?.slice(1)} Donor
                </span>
              </div>
            )}
          </div>
          <Link href="/user/setting" className="edit-profile-btn">
            Edit Profile
          </Link>
        </header>

        {/* Stats */}
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

        {/* Main content area */}
        <div className="main-layout">
          {/* Left column: histories */}
          <div>
            {/* Anime History */}
            <section className="history-panel">
              <div className="panel-header">
                <h2 className="panel-title">Anime History</h2>
                <Link href="/explore/bypopularity" className="panel-link">
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
                <div className="history-list">
                  {history.map((item, idx) => (
                    <Link
                      key={`${item.animeId}-${item.currentEp}`}
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
                      <span className="percentage">{item.percent ?? 0}%</span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Comic History */}
            <section className="history-panel">
              <div className="panel-header">
                <h2 className="panel-title">Comic History</h2>
                <Link href="/explore" className="panel-link">
                  Explore
                </Link>
              </div>
              {comicHistory.length === 0 ? (
                <p className="empty-state">No comics read yet.</p>
              ) : (
                <div className="history-list">
                  {comicHistory.map((item, idx) => (
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

          {/* Right sidebar */}
          <aside className="sidebar">
            <div className="widget">
              <div className="widget-label">Account</div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-sm font-semibold text-neutral-300">
                  {displayUser.name?.charAt(0)?.toUpperCase() ?? "U"}
                </div>
                <div>
                  <div className="text-xs text-neutral-500 uppercase tracking-wider">Email</div>
                  <div className="email-display">{displayUser.email}</div>
                </div>
              </div>
            </div>

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
    </>
  );
}
