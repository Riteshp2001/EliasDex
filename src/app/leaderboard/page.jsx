"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";
import Image from "next/image";

const MEDAL_COLORS = {
  1: { bg: "from-yellow-500 to-yellow-600", border: "border-yellow-400", medal: "🥇" },
  2: { bg: "from-gray-400 to-gray-500", border: "border-gray-300", medal: "🥈" },
  3: { bg: "from-orange-400 to-orange-500", border: "border-orange-300", medal: "🥉" },
};

const DONOR_TIERS = {
  bronze: { color: "from-orange-500 to-orange-600", badge: "Bronze Donor" },
  silver: { color: "from-gray-400 to-gray-500", badge: "Silver Donor" },
  gold: { color: "from-yellow-400 to-yellow-500", badge: "Gold Donor" },
  platinum: { color: "from-blue-300 to-purple-400", badge: "Platinum Donor" },
};

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("levels");
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchLeaderboard = async () => {
      // loading tidak diubah di sini karena efek sudah dimulai dengan loading=true
      try {
        const endpoint = activeTab === "levels" ? "/api/leaderboard/levels" : "/api/leaderboard/donations";
        const response = await fetch(endpoint);
        const data = await response.json();
        if (!cancelled) {
          setLeaderboard(data.leaderboard || []);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch leaderboard:", error);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchLeaderboard();

    return () => {
      cancelled = true;
    };
  }, [activeTab]);

  const getRankStyle = (rank) => {
    if (rank <= 3) return MEDAL_COLORS[rank];
    return { bg: "", border: "", medal: "" };
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] text-white">
      <style>{`
        @keyframes donorBadgeGlow {
          0% { box-shadow: 0 0 5px rgba(245, 158, 11, 0.3); }
          100% { box-shadow: 0 0 15px rgba(245, 158, 11, 0.8); }
        }

        .donator-card {
          position: relative;
          overflow: hidden;
        }

        .donator-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(245, 158, 11, 0.1), transparent);
          animation: shine 3s infinite;
        }

        @keyframes shine {
          0% { left: -100%; }
          100% { left: 100%; }
        }

        .donator-highlight {
          animation: highlightPulse 2s ease-in-out infinite;
        }

        @keyframes highlightPulse {
          0%, 100% { background-color: rgba(245, 158, 11, 0.05); }
          50% { background-color: rgba(245, 158, 11, 0.1); }
        }
      `}</style>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-3">🏆 Leaderboard</h1>
          <p className="text-[#94a3b8]">Climb the ranks and become a legend</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8 border-b border-[#1f2937]">
          <button
            onClick={() => {
              setActiveTab("levels");
              setLoading(true); // langsung tunjukkan loading saat ganti tab
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "levels" ? "text-[#f59e0b] border-b-2 border-[#f59e0b]" : "text-[#94a3b8] hover:text-white"
            }`}
          >
            ⭐ Top Levels
          </button>
          <button
            onClick={() => {
              setActiveTab("donations");
              setLoading(true);
            }}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "donations"
                ? "text-[#f59e0b] border-b-2 border-[#f59e0b]"
                : "text-[#94a3b8] hover:text-white"
            }`}
          >
            💝 Top Donators
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[#94a3b8]">No data available yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Top 3 - Special Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              {leaderboard.slice(0, 3).map((user, idx) => {
                const rankStyle = getRankStyle(user.rank);
                return (
                  <div
                    key={user.username}
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className={`relative cursor-pointer group overflow-hidden rounded-2xl bg-gradient-to-b ${rankStyle.bg} p-0.5 hover:scale-105 transition-transform ${user.isDonator ? "donator-card" : ""}`}
                  >
                    <div
                      className={`bg-[#111827] rounded-2xl p-6 relative z-10 ${user.isDonator ? "donator-highlight" : ""}`}
                    >
                      <div className="text-center mb-4">
                        <div className="text-5xl mb-2">{rankStyle.medal}</div>
                        <h3 className="text-2xl font-bold">{user.name}</h3>
                        <p className="text-sm text-[#94a3b8]">@{user.username}</p>
                      </div>

                      <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#f59e0b] bg-[#1f2937]">
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              alt={user.name}
                              className="w-full h-full object-cover"
                              width={80}
                              height={80}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[#f59e0b]">
                              {user.name?.charAt(0)?.toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-center space-y-2">
                        {activeTab === "levels" ? (
                          <>
                            <div className="text-4xl font-bold text-[#f59e0b]">Level {user.level}</div>
                            <div className="text-sm text-[#94a3b8]">{user.totalXp?.toLocaleString()} XP</div>
                          </>
                        ) : (
                          <>
                            <div className="text-4xl font-bold text-[#f59e0b]">
                              Rp{(user.totalDonations || 0).toLocaleString()}
                            </div>
                            <div
                              className={`inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${DONOR_TIERS[user.donorTier]?.color} animate-pulse shadow-lg`}
                              style={{
                                animation: `donorBadgeGlow 2s ease-in-out infinite alternate`,
                                boxShadow: `0 0 10px ${
                                  user.donorTier === "gold"
                                    ? "rgba(245, 158, 11, 0.5)"
                                    : user.donorTier === "platinum"
                                      ? "rgba(129, 140, 248, 0.5)"
                                      : user.donorTier === "silver"
                                        ? "rgba(161, 161, 161, 0.5)"
                                        : "rgba(217, 119, 6, 0.5)"
                                }`,
                              }}
                            >
                              {DONOR_TIERS[user.donorTier]?.badge || "Donator"}
                            </div>
                          </>
                        )}
                      </div>

                      {user.isDonator && (
                        <div className="mt-4 pt-4 border-t border-[#1f2937]">
                          <p className="text-center text-xs text-[#f59e0b] font-semibold">✨ Supporting Creator</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rank 4-10 - Standard List */}
            {leaderboard.length > 3 && (
              <div className="space-y-3">
                {leaderboard.slice(3).map((user) => (
                  <div
                    key={user.username}
                    onClick={() => router.push(`/profile/${user.username}`)}
                    className="cursor-pointer group flex items-center gap-4 p-4 rounded-lg bg-[#111827] border border-[#1f2937] hover:border-[#f59e0b] hover:bg-[#1a2138] transition-all"
                  >
                    {/* Rank Badge */}
                    <div className="w-12 h-12 rounded-full bg-[#1f2937] flex items-center justify-center font-bold text-[#f59e0b] text-lg flex-shrink-0">
                      #{user.rank}
                    </div>

                    {/* Profile Image */}
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-[#1f2937] border-2 border-[#2d3748] flex-shrink-0">
                      {user.profileImage ? (
                        <Image
                          src={user.profileImage}
                          alt={user.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[#f59e0b]">
                          {user.name?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3
                          className={`font-bold text-lg ${
                            user.isDonator
                              ? "text-transparent bg-clip-text bg-gradient-to-r " + DONOR_TIERS[user.donorTier]?.color
                              : "text-white"
                          }`}
                        >
                          {user.name}
                        </h3>
                        {user.isDonator && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r text-white"
                            style={{
                              backgroundImage: `linear-gradient(to right, ${
                                DONOR_TIERS[user.donorTier]?.color.split(" ")[1]
                              } 0%, ${DONOR_TIERS[user.donorTier]?.color.split(" ")[2]} 100%)`,
                            }}
                          >
                            ✨ {DONOR_TIERS[user.donorTier]?.badge.split(" ")[0]}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#94a3b8]">@{user.username}</p>
                    </div>

                    {/* Stats */}
                    <div className="text-right flex-shrink-0">
                      {activeTab === "levels" ? (
                        <>
                          <div className="text-2xl font-bold text-[#f59e0b]">Lv{user.level}</div>
                          <div className="text-xs text-[#94a3b8]">{(user.totalXp || 0).toLocaleString()} XP</div>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl font-bold text-[#f59e0b]">
                            Rp{(user.totalDonations || 0).toLocaleString()}
                          </div>
                          <div className="text-xs text-[#94a3b8]">Total Donated</div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        {activeTab === "donations" && (
          <div className="mt-12 text-center p-8 rounded-2xl bg-gradient-to-r from-[#f59e0b] to-[#d97706] bg-opacity-10 border border-[#f59e0b]">
            <h3 className="text-2xl font-bold mb-2">Want to Support Us?</h3>
            <p className="text-[#94a3b8] mb-4">Become a donor and unlock special perks!</p>
            <Link
              href="/donate"
              className="inline-block px-8 py-3 bg-gradient-to-r from-[#f59e0b] to-[#d97706] text-black font-bold rounded-lg hover:from-[#d97706] hover:to-[#b85f00] transition-all"
            >
              💝 Donate Now
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
