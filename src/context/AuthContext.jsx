"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useCallback } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    totalXp: 0,
    level: 1,
    levelProgress: 0,
  });

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, statsRes] = await Promise.all([
        fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch("/api/user/watch-progress", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }).catch(() => null),
      ]);

      const userData = await userRes.json();
      setUser(userData?.user ?? null);

      if (statsRes) {
        const statsData = await statsRes.json();
        setUserStats({
          totalXp: statsData.totalXp || 0,
          level: statsData.level || 1,
          levelProgress: statsData.levelProgress || 0,
        });
      }
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []); // Array kosong karena setter state (setLoading, dll) stabil secara default

  useEffect(() => {
    Promise.resolve().then(refreshUser);
  }, [refreshUser]);

  // Contoh untuk fungsi login
  const login = useCallback(
    async ({ email, password }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "login failed");
      }

      setUser(data.user);
      await refreshUser();
      return data.user;
    },
    [refreshUser],
  ); // refreshUser jadi dependensi di sini

  const register = useCallback(
    async ({ email, username, name, password }) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, name, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Registration failed");
      }
      setUser(data.user);
      await refreshUser();
      return data.user;
    },
    [refreshUser],
  );

  const logout = async () => {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    setUser(null);
    setUserStats({ totalXp: 0, level: 1, levelProgress: 0 });
  };

  const updateWatchProgress = async (animeId, currentEp, totalEp, title, image) => {
    try {
      const response = await fetch("/api/user/watch-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ animeId, currentEp, totalEp, title, image }),
      });
      const data = await response.json();
      if (response.ok) {
        setUserStats({
          totalXp: data.totalXp,
          level: data.level,
          levelProgress: data.levelProgress,
        });
        return data;
      }
    } catch (error) {
      console.error("Failed to update watch progress:", error);
    }
    return null;
  };

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading,
      isAuthenticated: !!user,
      refreshUser,
      login,
      register,
      logout,
      updateWatchProgress,
      userStats,
    }),
    [user, loading, userStats, login, register, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
