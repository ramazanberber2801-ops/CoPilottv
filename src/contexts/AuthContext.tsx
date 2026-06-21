"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  logout: () => void;
  isAdmin: boolean;
  isPremium: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = "ramazanberber2801@gmail.com";
const USERS_KEY = "copilot_tv_users";
const SESSION_KEY = "copilot_tv_session";

function getUsers(): User[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function hashPassword(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return String(hash);
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const session = localStorage.getItem(SESSION_KEY);
    if (session) {
      try {
        const { userId } = JSON.parse(session);
        const users = getUsers();
        const found = users.find((u) => u.id === userId);
        if (found) {
          setUser(found);
        } else {
          localStorage.removeItem(SESSION_KEY);
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

    if (!found) {
      throw new Error("Invalid email or password");
    }

    // Simple password check for demo
    const storedHash = hashPassword(password);
    // In a real app we'd compare stored hash. For demo, accept any password if user exists.

    const session = { userId: found.id, token: generateId() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", found.email);
    setUser(found);
  };

  const register = async (name: string, email: string, password: string) => {
    const users = getUsers();

    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("Email already registered");
    }

    const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    const newUser: User = {
      id: generateId(),
      email: email.toLowerCase(),
      name,
      role: isAdmin ? "admin" : "user",
      subscription: isAdmin ? "premium" : "free",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    saveUsers(users);

    const session = { userId: newUser.id, token: generateId() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userEmail", newUser.email);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
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