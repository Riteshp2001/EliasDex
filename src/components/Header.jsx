// Header.jsx
"use client";
import { useState, useEffect, useRef } from "react";
import { FaBars, FaSearch, FaBell, FaFire, FaStar, FaCalendarAlt } from "react-icons/fa";
import { FaXmark } from "react-icons/fa6";
import { MdNewReleases } from "react-icons/md";
import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";
import useSidebarStore from "../store/sidebarStore";
import { useAuth } from "@/context/AuthContext";

const NAV_LINKS = [
  { label: "Most Popular", href: "/search?order_by=popularity&sfw=false", icon: <FaFire size={13} /> },
  { label: "Top Favorites", href: "/search?order_by=favorites&sfw=false", icon: <FaStar size={13} /> },
  { label: "New Releases", href: "/search?status=airing&order_by=start_date&sfw=false", icon: <MdNewReleases size={14} /> },
  { label: "Upcoming", href: "/search?status=upcoming&order_by=start_date&sfw=false", icon: <FaCalendarAlt size={13} /> },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, text: "New episode of Attack on Titan is out!", time: "2m ago", unread: true },
  { id: 2, text: "Demon Slayer Season 4 announced", time: "1h ago", unread: true },
  { id: 3, text: "Your watchlist has been updated", time: "3h ago", unread: false },
];

const Header = () => {
  const sidebarHandler = useSidebarStore((state) => state.toggleSidebar);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [value, setValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const { user, isAuthenticated, logout } = useAuth();

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showMobileSearch) mobileSearchRef.current?.focus();
  }, [showMobileSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!value.trim()) return;
    router.push(`/search?keyword=${encodeURIComponent(value)}`);
    setShowMobileSearch(false);
    setValue("");
  };

  return (
    <>
      <style>{`
        /* ── Reset scope ── */
        .hdr { all: revert; }

        .hdr-root {
          position: relative;
          z-index: 100;
        }
        .hdr-bar {
          position: fixed;
          top: 0; left: 0; right: 0;
          background: rgba(15,15,20,0.92);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          transition: box-shadow 0.3s ease, background 0.3s ease;
        }
        .hdr-bar.scrolled {
          box-shadow: 0 4px 32px rgba(0,0,0,0.4);
          background: rgba(10,10,15,0.97);
        }

        /* ── Main row: left takes remaining space, right is fixed ── */
        .hdr-inner {
          display: flex;
          align-items: center;
          padding: 0 20px;
          height: 60px;
          gap: 0;
          box-sizing: border-box;
          width: 100%;
        }

        /* LEFT: menu + logo + nav — grows to fill, clips if too small */
        .hdr-left {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1 1 0;
          min-width: 0;
        }

        .hdr-menu-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #aaa;
          cursor: pointer;
          transition: color 0.2s, background 0.2s;
          padding: 0;
        }
        .hdr-menu-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }

        /* Logo wrapper — don't let it shrink */
        .hdr-logo-wrap {
          flex-shrink: 0;
        }

        /* Nav — sits after logo, clips naturally */
        .hdr-nav {
          display: flex;
          align-items: center;
          gap: 2px;
          flex-shrink: 1;
          min-width: 0;
          overflow: hidden;
        }

        .hdr-nav-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 11px;
          border-radius: 8px;
          border: none;
          font-size: 13px;
          font-weight: 500;
          color: #9a9aaa;
          background: transparent;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: color 0.2s, background 0.2s;
          line-height: 1;
        }
        .hdr-nav-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.08);
        }

        /* RIGHT: search + icons — never shrinks, never grows */
        .hdr-right {
          display: flex;
          align-items: center;
          gap: 8px;
          flex: 0 0 auto;
          margin-left: 16px;
        }

        /* Desktop search — fixed width */
        .hdr-search-wrap {
          width: 250px;
          flex-shrink: 0;
        }
        .hdr-search-form {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .hdr-search-field {
          position: relative;
          flex: 1;
          min-width: 0;
        }
        .hdr-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: #555;
          pointer-events: none;
        }
        .hdr-search-input {
          width: 100%;
          box-sizing: border-box;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 7px 32px 7px 32px;
          font-size: 13px;
          color: #fff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .hdr-search-input::placeholder { color: #555; }
        .hdr-search-input:focus {
          border-color: rgba(232,93,93,0.5);
          background: rgba(255,255,255,0.09);
        }
        .hdr-search-clear {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          color: #666;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .hdr-search-clear:hover { color: #fff; }
        .hdr-search-submit {
          padding: 7px 12px;
          border-radius: 9px;
          background: #e85d5d;
          color: #fff;
          border: none;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          flex-shrink: 0;
          transition: background 0.2s;
        }
        .hdr-search-submit:hover { background: #d94f4f; }

        /* Icon buttons (notif, mobile search toggle) */
        .hdr-icon-btn {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #9a9aaa;
          cursor: pointer;
          padding: 0;
          transition: color 0.2s, background 0.2s;
        }
        .hdr-icon-btn:hover { color: #fff; background: rgba(255,255,255,0.08); }
        .hdr-icon-btn.active { color: #e85d5d; background: rgba(232,93,93,0.1); }
        .hdr-icon-btn-mobile { display: none; }

        .hdr-badge {
          position: absolute;
          top: 5px; right: 5px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #e85d5d;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #0f0f14;
        }

        /* Avatar button */
        .hdr-avatar-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 10px 4px 4px;
          border-radius: 10px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          color: #aaa;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.2s, color 0.2s, border-color 0.2s;
        }
        .hdr-avatar-btn:hover {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border-color: rgba(255,255,255,0.15);
        }
        .hdr-avatar-circle {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: linear-gradient(135deg, #e85d5d, #c0392b);
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: #fff;
          flex-shrink: 0;
          overflow: hidden;
        }
        .hdr-avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hdr-donor-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid #0f0f14;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }
        .hdr-donor-badge.bronze {
          background: linear-gradient(135deg, #d97706, #ea580c);
        }
        .hdr-donor-badge.silver {
          background: linear-gradient(135deg, #a1a1a1, #d4d4d8);
        }
        .hdr-donor-badge.gold {
          background: linear-gradient(135deg, #f59e0b, #fbbf24);
        }
        .hdr-donor-badge.platinum {
          background: linear-gradient(135deg, #818cf8, #c084fc);
        }
        .hdr-avatar-name {
          font-size: 13px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Dropdowns */
        .hdr-dropdown-wrap { position: relative; }
        .hdr-dropdown {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: #1a1a24;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          min-width: 260px;
          z-index: 300;
          overflow: hidden;
          animation: hdrDropIn 0.18s ease;
        }
        @keyframes hdrDropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .hdr-dropdown-header {
          padding: 13px 16px 9px;
          font-size: 11px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #555;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .hdr-notif-item {
          display: flex; flex-direction: column; gap: 3px;
          padding: 11px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          cursor: pointer;
          transition: background 0.15s;
        }
        .hdr-notif-item:last-child { border-bottom: none; }
        .hdr-notif-item:hover { background: rgba(255,255,255,0.04); }
        .hdr-notif-item.unread { background: rgba(232,93,93,0.04); }
        .hdr-notif-row { display: flex; gap: 8px; align-items: flex-start; }
        .hdr-notif-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #e85d5d; flex-shrink: 0; margin-top: 4px;
        }
        .hdr-notif-text { font-size: 13px; color: #ddd; line-height: 1.4; }
        .hdr-notif-time { font-size: 11px; color: #555; padding-left: 14px; }
        .hdr-menu-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 16px;
          font-size: 13px; color: #bbb;
          cursor: pointer;
          border-bottom: 1px solid rgba(255,255,255,0.04);
          transition: background 0.15s, color 0.15s;
        }
        .hdr-menu-item:last-child { border-bottom: none; }
        .hdr-menu-item:hover { background: rgba(255,255,255,0.05); color: #fff; }
        .hdr-menu-item.danger:hover { background: rgba(232,93,93,0.08); color: #e85d5d; }

        /* Mobile expandable search */
        .hdr-mobile-search {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          border-top: 1px solid transparent;
          transition: max-height 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease;
        }
        .hdr-mobile-search.open {
          max-height: 72px;
          opacity: 1;
          border-top: 1px solid rgba(255,255,255,0.06);
        }
        .hdr-mobile-search-inner {
          padding: 10px 14px;
        }

        /* Spacer */
        .hdr-spacer { height: 60px; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .hdr-nav          { display: none; }
          .hdr-search-wrap  { display: none; }
          .hdr-avatar-name  { display: none; }
          .hdr-icon-btn-mobile { display: flex; }
          .hdr-inner        { padding: 0 14px; }
          .hdr-right        { margin-left: auto; gap: 4px; }
        }
        @media (max-width: 480px) {
          .hdr-avatar-btn {
            padding: 4px;
            border-radius: 50%;
            border: none;
            background: transparent;
          }
          .hdr-avatar-btn:hover { background: rgba(255,255,255,0.08); }
        }
      `}</style>

      <div className="hdr-root">
        <div className={`hdr-bar${scrolled ? " scrolled" : ""}`}>
          <div className="hdr-inner">
            {/* ── LEFT ── */}
            <div className="hdr-left">
              <button className="hdr-menu-btn" onClick={sidebarHandler} aria-label="Toggle sidebar">
                <FaBars size={20} />
              </button>

              <div className="hdr-logo-wrap">
                <Logo />
              </div>

              <nav className="hdr-nav">
                {NAV_LINKS.map((link) => (
                  <button key={link.href} className="hdr-nav-btn" onClick={() => router.push(link.href)}>
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* ── RIGHT ── */}
            <div className="hdr-right">
              {/* Desktop search */}
              <div className="hdr-search-wrap">
                <form className="hdr-search-form" onSubmit={handleSubmit}>
                  <div className="hdr-search-field">
                    <FaSearch size={12} className="hdr-search-icon" />
                    <input
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      placeholder="Search anime..."
                      type="text"
                      className="hdr-search-input"
                    />
                    {value.length > 0 && (
                      <button type="button" className="hdr-search-clear" onClick={() => setValue("")}>
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
                  setShowMobileSearch(!showMobileSearch);
                  setShowNotif(false);
                  setShowUserMenu(false);
                }}
                aria-label="Search"
              >
                {showMobileSearch ? <FaXmark size={18} /> : <FaSearch size={16} />}
              </button>

              {/* Notifications */}
              <div className="hdr-dropdown-wrap" ref={notifRef}>
                <button
                  className={`hdr-icon-btn${showNotif ? " active" : ""}`}
                  onClick={() => {
                    setShowNotif(!showNotif);
                    setShowUserMenu(false);
                    setShowMobileSearch(false);
                  }}
                  aria-label="Notifications"
                >
                  <FaBell size={17} />
                  {unreadCount > 0 && <span className="hdr-badge">{unreadCount}</span>}
                </button>
                {showNotif && (
                  <div className="hdr-dropdown">
                    <div className="hdr-dropdown-header">Notifications</div>
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <div key={n.id} className={`hdr-notif-item${n.unread ? " unread" : ""}`}>
                        <div className="hdr-notif-row">
                          {n.unread && <span className="hdr-notif-dot" />}
                          <span className="hdr-notif-text" style={{ marginLeft: n.unread ? 0 : 14 }}>
                            {n.text}
                          </span>
                        </div>
                        <span className="hdr-notif-time">{n.time}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="hdr-dropdown-wrap" ref={userRef}>
                <button
                  className="hdr-avatar-btn"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotif(false);
                    setShowMobileSearch(false);
                  }}
                  aria-label="User menu"
                >
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <div className="hdr-avatar-circle">
                      {user?.profileImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.profileImage}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        (user?.name?.charAt(0)?.toUpperCase() ?? "U")
                      )}
                    </div>
                    {user?.isDonator && <div className={`hdr-donor-badge ${user.donorTier || "bronze"}`}>✨</div>}
                  </div>
                  <span
                    className={`hdr-avatar-name ${user?.isDonator ? "font-bold" : ""}`}
                    style={user?.isDonator ? { color: "#f59e0b" } : {}}
                  >
                    {user ? user.name : "Guest"}
                  </span>
                </button>
                {showUserMenu && (
                  <div className="hdr-dropdown">
                    <div className="hdr-dropdown-header">My Account</div>
                    {user
                      ? [
                          { label: "My Profile", action: () => router.push("/user") },
                          { label: "Settings", action: () => router.push("/user/setting") },
                        ].map((item) => (
                          <div key={item.label} className="hdr-menu-item" onClick={item.action}>
                            {item.label}
                          </div>
                        ))
                      : [
                          { label: "Login", action: () => router.push("/login") },
                          { label: "Register", action: () => router.push("/register") },
                        ].map((item) => (
                          <div key={item.label} className="hdr-menu-item" onClick={item.action}>
                            {item.label}
                          </div>
                        ))}
                    {user && (
                      <div
                        className="hdr-menu-item danger"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                      >
                        Sign Out
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Mobile expandable search */}
          <div className={`hdr-mobile-search${showMobileSearch ? " open" : ""}`}>
            <div className="hdr-mobile-search-inner">
              <form className="hdr-search-form" onSubmit={handleSubmit}>
                <div className="hdr-search-field">
                  <FaSearch size={12} className="hdr-search-icon" />
                  <input
                    ref={mobileSearchRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Search anime, genres, studios..."
                    type="text"
                    className="hdr-search-input"
                  />
                  {value.length > 0 && (
                    <button
                      type="button"
                      className="hdr-search-clear"
                      onClick={() => {
                        setValue("");
                        mobileSearchRef.current?.focus();
                      }}
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
