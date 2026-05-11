"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import Footer from "@/components/Footer";

const DONOR_TIER_COLORS = {
  bronze: "from-orange-500 to-orange-600 border-orange-400",
  silver: "from-gray-400 to-gray-500 border-gray-300",
  gold: "from-yellow-400 to-yellow-500 border-yellow-300",
  platinum: "from-blue-300 to-purple-400 border-purple-300",
};

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
        const response = await fetch(`/api/user/profile/${username}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "User not found");
        }

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
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <Loader />
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="min-h-screen bg-[#0b0e14] px-4 py-8 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold mb-4">User Not Found</h1>
          <p className="text-gray-400 mb-8">{error || "The user you're looking for doesn't exist."}</p>
          <Link
            href="/"
            className="inline-block bg-[#f59e0b] text-black px-6 py-3 rounded-lg font-semibold hover:bg-[#d97706] transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.username === profileUser.username;

  return (
    <div className="min-h-screen bg-[#0b0e14] px-4 py-8 text-white">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Profile Header */}
        <div className="rounded-3xl border border-[#1f2937] bg-[#111827]/95 p-8 shadow-xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              <div
                className={`w-32 h-32 rounded-full overflow-hidden bg-[#1f2937] relative ${profileUser.isDonator ? `border-4 bg-gradient-to-br ${DONOR_TIER_COLORS[profileUser.donorTier]}` : "border-4 border-[#f59e0b]"}`}
              >
                {profileUser.profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileUser.profileImage} alt={profileUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-[#f59e0b]">
                    {profileUser.name?.charAt(0)?.toUpperCase() ?? "U"}
                  </div>
                )}
                {profileUser.isDonator && (
                  <div className="absolute bottom-0 right-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-[#0b0e14] flex items-center justify-center text-2xl shadow-lg">
                    ✨
                  </div>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">{profileUser.name}</h1>
                {profileUser.isDonator && (
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-bold bg-gradient-to-r ${DONOR_TIER_COLORS[profileUser.donorTier]} text-white shadow-lg`}
                  >
                    ✨ {profileUser.donorTier?.charAt(0).toUpperCase() + profileUser.donorTier?.slice(1)} Donor
                  </span>
                )}
              </div>
              <p className="text-xl text-[#94a3b8] mb-4">@{profileUser.username}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f59e0b]">{profileUser.level || 1}</div>
                  <div className="text-sm text-[#94a3b8]">Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f59e0b]">{profileUser.totalXp || 0}</div>
                  <div className="text-sm text-[#94a3b8]">XP</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f59e0b]">{profileUser.watchHistory?.length || 0}</div>
                  <div className="text-sm text-[#94a3b8]">Anime Watched</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#f59e0b]">{profileUser.comicHistory?.length || 0}</div>
                  <div className="text-sm text-[#94a3b8]">Comics Read</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isOwnProfile && (
                <div className="flex gap-3 justify-center md:justify-start">
                  <Link
                    href="/user/setting"
                    className="bg-[#f59e0b] text-black px-6 py-2 rounded-lg font-semibold hover:bg-[#d97706] transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/user"
                    className="border border-[#f59e0b] text-[#f59e0b] px-6 py-2 rounded-lg font-semibold hover:bg-[#f59e0b] hover:text-black transition-colors"
                  >
                    View Dashboard
                  </Link>
                  {!profileUser.isDonator && (
                    <Link
                      href="/donate"
                      className="border border-yellow-500 text-yellow-500 px-6 py-2 rounded-lg font-semibold hover:bg-yellow-500 hover:text-black transition-colors"
                    >
                      💝 Become a Donor
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="rounded-3xl border border-[#1f2937] bg-[#111827]/95 p-6 shadow-xl">
          <h2 className="text-2xl font-bold mb-6">Recent Activity</h2>

          {profileUser.watchHistory?.length > 0 || profileUser.comicHistory?.length > 0 ? (
            <div className="space-y-4">
              {/* Anime History */}
              {profileUser.watchHistory?.slice(0, 5).map((item) => (
                <div key={`anime-${item.animeId}`} className="flex items-center gap-4 p-4 rounded-lg bg-[#0f172a]">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#1f2937]">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-[#94a3b8]">Episode {item.currentEp} • Anime</p>
                  </div>
                  <div className="text-sm text-[#94a3b8]">{new Date(item.updatedAt).toLocaleDateString()}</div>
                </div>
              ))}

              {/* Comic History */}
              {profileUser.comicHistory?.slice(0, 5).map((item) => (
                <div key={`comic-${item.comicId}`} className="flex items-center gap-4 p-4 rounded-lg bg-[#0f172a]">
                  <div className="w-16 h-20 rounded-lg overflow-hidden bg-[#1f2937]">
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-[#94a3b8]">Chapter {item.currentChapter} • Comic</p>
                  </div>
                  <div className="text-sm text-[#94a3b8]">{new Date(item.updatedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#94a3b8] text-center py-8">
              {isOwnProfile ? "You haven't watched anything yet." : "This user hasn't been active yet."}
            </p>
          )}
        </div>

        {/* Donor Perks Section */}
        {profileUser.isDonator && (
          <div
            className={`rounded-3xl border-2 bg-gradient-to-br ${DONOR_TIER_COLORS[profileUser.donorTier]} bg-opacity-10 p-8 shadow-xl`}
          >
            <div className="flex items-center gap-4 mb-6">
              <span className="text-5xl">✨</span>
              <div>
                <h2 className="text-2xl font-bold">Supporter Perks</h2>
                <p className="text-[#94a3b8]">Exclusive benefits for our generous supporters</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileUser.donorTier === "bronze" && (
                <>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎖️</span>
                    <div>
                      <h4 className="font-bold">Custom Name Badge</h4>
                      <p className="text-sm text-[#94a3b8]">Special color in header</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🏅</span>
                    <div>
                      <h4 className="font-bold">Donor Badge</h4>
                      <p className="text-sm text-[#94a3b8]">Display on your profile</p>
                    </div>
                  </div>
                </>
              )}
              {profileUser.donorTier === "silver" && (
                <>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎖️</span>
                    <div>
                      <h4 className="font-bold">All Bronze Perks</h4>
                      <p className="text-sm text-[#94a3b8]">Everything for Bronze tier</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🚀</span>
                    <div>
                      <h4 className="font-bold">Early Feature Access</h4>
                      <p className="text-sm text-[#94a3b8]">Get new features first</p>
                    </div>
                  </div>
                </>
              )}
              {profileUser.donorTier === "gold" && (
                <>
                  <div className="flex gap-3">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h4 className="font-bold">VIP Status</h4>
                      <p className="text-sm text-[#94a3b8]">Premium recognition</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎯</span>
                    <div>
                      <h4 className="font-bold">Priority Support</h4>
                      <p className="text-sm text-[#94a3b8]">Priority help when needed</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <h4 className="font-bold">Monthly Supporter Badge</h4>
                      <p className="text-sm text-[#94a3b8]">Unique monthly recognition</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">💫</span>
                    <div>
                      <h4 className="font-bold">Custom Color Name</h4>
                      <p className="text-sm text-[#94a3b8]">Personalized color scheme</p>
                    </div>
                  </div>
                </>
              )}
              {profileUser.donorTier === "platinum" && (
                <>
                  <div className="flex gap-3">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h4 className="font-bold">Lifetime VIP Status</h4>
                      <p className="text-sm text-[#94a3b8]">Forever premium recognition</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🌟</span>
                    <div>
                      <h4 className="font-bold">Lifetime Supporter Badge</h4>
                      <p className="text-sm text-[#94a3b8]">Permanent special badge</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">📵</span>
                    <div>
                      <h4 className="font-bold">Ad-Free Experience</h4>
                      <p className="text-sm text-[#94a3b8]">Complete ad-free browsing</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <h4 className="font-bold">Exclusive Perks</h4>
                      <p className="text-sm text-[#94a3b8]">Special exclusive benefits</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
