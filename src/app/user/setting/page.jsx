"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";

export default function UserSettingsPage() {
  const router = useRouter();
  const { user, loading, setUser, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    Promise.resolve().then(() => {
      setName(user.name || "");
      setUsername(user.username || "");
      setProfileImage(user.profileImage || "");
    });
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("profileImage", file);

      const response = await fetch("/api/user/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to upload image");
      }

      setProfileImage(data.imageUrl);
      setSuccess("Profile image uploaded successfully!");
      await refreshUser();
    } catch (err) {
      setError(err.message || "Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, profileImage }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to update settings");
      setUser(data.user);
      setSuccess("Profile updated successfully.");
      await refreshUser();
    } catch (err) {
      setError(err.message || "Unable to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0e14]">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0e14] px-4 py-8 text-white">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#1f2937] bg-[#111827]/95 p-6 shadow-xl">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.2em] text-[#94a3b8]">Account settings</p>
          <h1 className="mt-2 text-3xl font-bold">Edit your profile</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-[#cbd5e1]">Full name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#cbd5e1]">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-3 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </div>
          <div>
            <label className="block text-sm text-[#cbd5e1]">Profile picture</label>
            <div className="mt-3 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#0f172a] overflow-hidden">
                {profileImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-[#f59e0b]">{name?.charAt(0)?.toUpperCase() ?? "U"}</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-2 text-sm text-[#cbd5e1] hover:border-[#f59e0b] transition disabled:opacity-60"
                >
                  {isUploadingImage ? "Uploading..." : "Upload new image"}
                </button>
                <p className="text-xs text-[#94a3b8] mt-1">Max 5MB. Supported: JPEG, PNG, GIF, WebP</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#cbd5e1]">Or enter image URL</label>
            <input
              value={profileImage}
              onChange={(e) => setProfileImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="mt-3 w-full rounded-2xl border border-[#334155] bg-[#0f172a] px-4 py-3 text-white outline-none focus:border-[#f59e0b]"
            />
          </div>
          {error && <p className="text-sm text-[#f87171]">{error}</p>}
          {success && <p className="text-sm text-[#4ade80]">{success}</p>}
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-2xl bg-[#f59e0b] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#d97706] disabled:opacity-60"
          >
            {isSaving ? <Loader className="mx-auto h-5 w-5" /> : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
