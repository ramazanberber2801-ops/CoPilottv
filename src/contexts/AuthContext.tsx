"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase, getUserPlaylist, upsertPlaylist } from "@/lib/supabase";
import type { PlaylistConfig } from "@/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  subscription: "free" | "premium";
  iptvConfig?: {
    type: "m3u" | "xtream";
    m3uUrl?: string;
    serverUrl?: string;
    username?: string;
    password?: string;
  };
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateIptvConfig: (config: User["iptvConfig"]) => Promise<void>;
  isAdmin: boolean;
  isPremium: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "ramazanberber2801@gmail.com";

function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase();
}

function mapSupabaseUser(sbUser: SupabaseUser, playlist?: PlaylistConfig | null): User {
  const email = sbUser.email || "";
  const metadata = (sbUser.user_metadata as Record<string, unknown>) || {};
  const admin = isAdminEmail(email);

  let iptvConfig: User["iptvConfig"] | undefined;
  if (playlist) {
    if (playlist.config_type === "m3u" && playlist.m3u_url) {
      iptvConfig = { type: "m3u", m3uUrl: playlist.m3u_url };
    } else if (playlist.config_type === "xtream") {
      iptvConfig = {
        type: "xtream",
        serverUrl: playlist.xtream_server_url || undefined,
        username: playlist.xtream_username || undefined,
        password: playlist.xtream_password || undefined,
      };
    }
  }

  return {
    id: sbUser.id,
    email: email.toLowerCase(),
    name: String(metadata.name || metadata.full_name || email.split("@")[0] || "User"),
    role: admin ? "admin" : "user",
    subscription: admin ? "premium" : "free",
    iptvConfig,
    createdAt: sbUser.created_at || new Date().toISOString(),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserWithPlaylist = useCallback(async (sbUser: SupabaseUser) => {
    const playlist = sbUser.id ? await getUserPlaylist(sbUser.id) : null;
    setUser(mapSupabaseUser(sbUser, playlist));
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session?.user) {
        await fetchUserWithPlaylist(session.user);
      }
      setIsLoading(false);
    };

    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        fetchUserWithPlaylist(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [fetchUserWithPlaylist]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (data.user) {
      await fetchUserWithPlaylist(data.user);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) throw new Error(error.message);
    if (!data.session) {
      throw new Error("Please check your email to confirm your account before logging in.");
    }
    if (data.user) {
      await fetchUserWithPlaylist(data.user);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateIptvConfig = async (config: User["iptvConfig"]) => {
    if (!user) return;
    const userId = user.id;

    const playlistData: Omit<PlaylistConfig, "id" | "created_at" | "updated_at"> = {
      user_id: userId,
      config_type: config?.type || "m3u",
      m3u_url: config?.type === "m3u" ? config.m3uUrl || null : null,
      xtream_server_url: config?.type === "xtream" ? config.serverUrl || null : null,
      xtream_username: config?.type === "xtream" ? config.username || null : null,
      xtream_password: config?.type === "xtream" ? config.password || null : null,
    };

    await upsertPlaylist(playlistData);
    setUser((prev) => (prev ? { ...prev, iptvConfig: config } : null));
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateIptvConfig,
    isAdmin: user?.role === "admin",
    isPremium: user?.subscription === "premium" || user?.role === "admin",
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}