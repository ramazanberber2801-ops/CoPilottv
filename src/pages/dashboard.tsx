"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tv,
  LogOut,
  Crown,
  User,
  Shield,
  Play,
  Settings,
  CreditCard,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAdmin, isPremium, isLoading } = useAuth();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 animate-pulse-slow" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-white/5">
        <div className="container-tesla flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center glow-cyan">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">CoPilot</span> TV
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                <Shield className="w-3 h-3" />
                Admin
              </div>
            )}
            {isPremium && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold">
                <Crown className="w-3 h-3" />
                Premium
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container-tesla py-8">
        {/* Welcome */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name}</h1>
          <p className="text-muted-foreground">
            Manage your subscription and IPTV configuration
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <Card className="glass border-white/10 animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="w-4 h-4 text-primary" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Role</p>
                <div className="flex items-center gap-2">
                  <span className="capitalize font-medium">{user.role}</span>
                  {isAdmin && <Shield className="w-3 h-3 text-primary" />}
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member Since</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="glass border-white/10 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <CreditCard className="w-4 h-4 text-primary" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Current Plan</p>
                  <p className={`text-lg font-bold capitalize ${isPremium ? "text-primary" : "text-muted-foreground"}`}>
                    {user.subscription}
                  </p>
                </div>
                {isPremium ? (
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Crown className="w-6 h-6 text-primary" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-muted/10 flex items-center justify-center">
                    <User className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>

              {isPremium ? (
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-primary font-medium">
                    ✓ All features unlocked
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isAdmin
                      ? "Permanent admin access"
                      : "Premium subscription active"}
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-muted/5 border border-white/10">
                  <p className="text-sm text-muted-foreground">
                    Free tier — limited channels
                  </p>
                </div>
              )}

              {!isPremium && (
                <Button className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                  Upgrade to Premium
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="glass border-white/10 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Play className="w-4 h-4 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/app">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 border-white/10 hover:bg-white/5 text-base">
                  <Play className="w-5 h-5 text-primary" />
                  Open Player
                </Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline" className="w-full h-12 justify-start gap-3 border-white/10 hover:bg-white/5 text-base">
                  <Settings className="w-5 h-5 text-primary" />
                  IPTV Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}