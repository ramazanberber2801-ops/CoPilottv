"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tv,
  LogOut,
  Link as LinkIcon,
  Server,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { fetchM3U, fetchXtreamLive } from "@/lib/iptv";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout, updateIptvConfig, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<"m3u" | "xtream">(
    user?.iptvConfig?.type || "m3u"
  );

  const [m3uUrl, setM3uUrl] = useState(user?.iptvConfig?.m3uUrl || "");

  const [serverUrl, setServerUrl] = useState(
    user?.iptvConfig?.serverUrl || ""
  );
  const [username, setUsername] = useState(
    user?.iptvConfig?.username || ""
  );
  const [password, setPassword] = useState(
    user?.iptvConfig?.password || ""
  );

  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [testMessage, setTestMessage] = useState("");

  React.useEffect(() => {
    if (user?.iptvConfig) {
      setActiveTab(user.iptvConfig.type);
      setM3uUrl(user.iptvConfig.m3uUrl || "");
      setServerUrl(user.iptvConfig.serverUrl || "");
      setUsername(user.iptvConfig.username || "");
      setPassword(user.iptvConfig.password || "");
    }
  }, [user?.iptvConfig]);

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleSaveM3U = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrl.trim()) return;

    setTestStatus("testing");
    setTestMessage("Saving...");

    try {
      await updateIptvConfig({
        type: "m3u",
        m3uUrl: m3uUrl.trim(),
      });
      setTestStatus("success");
      setTestMessage("M3U configuration saved");
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  const handleSaveXtream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl.trim() || !username.trim() || !password.trim()) return;

    setTestStatus("testing");
    setTestMessage("Saving...");

    try {
      await updateIptvConfig({
        type: "xtream",
        serverUrl: serverUrl.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      setTestStatus("success");
      setTestMessage("Xtream Codes configuration saved");
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  const handleTestM3U = async () => {
    if (!m3uUrl.trim()) return;
    setTestStatus("testing");
    setTestMessage("");

    try {
      const channels = await fetchM3U(m3uUrl.trim());
      setTestStatus("success");
      setTestMessage(`Connected! Found ${channels.length} channels.`);
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Connection failed");
    }
  };

  const handleTestXtream = async () => {
    if (!serverUrl.trim() || !username.trim() || !password.trim()) return;
    setTestStatus("testing");
    setTestMessage("");

    try {
      const channels = await fetchXtreamLive({
        serverUrl: serverUrl.trim(),
        username: username.trim(),
        password: password.trim(),
      });
      setTestStatus("success");
      setTestMessage(`Connected! Found ${channels.length} live channels.`);
    } catch (err) {
      setTestStatus("error");
      setTestMessage(err instanceof Error ? err.message : "Connection failed");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 animate-pulse-slow" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-white/5">
        <div className="container-tesla flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl glass flex items-center justify-center glow-cyan">
                <Tv className="w-5 h-5 text-primary" />
              </div>
              <span className="text-lg font-bold hidden sm:inline">
                <span className="gradient-text">CoPilot</span> TV
              </span>
            </Link>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </header>

      <main className="container-tesla py-8">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">IPTV Configuration</h1>
            <p className="text-muted-foreground">
              Connect your IPTV provider to start streaming
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "m3u" | "xtream")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-14 bg-white/5 border border-white/10 rounded-xl p-1">
              <TabsTrigger
                value="m3u"
                className="h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30 text-base font-medium transition-all"
              >
                <LinkIcon className="w-4 h-4 mr-2" />
                M3U Playlist
              </TabsTrigger>
              <TabsTrigger
                value="xtream"
                className="h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30 text-base font-medium transition-all"
              >
                <Server className="w-4 h-4 mr-2" />
                Xtream Codes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="m3u" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    M3U Playlist URL
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveM3U} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="m3uUrl" className="text-sm font-medium text-muted-foreground">
                        Playlist URL
                      </Label>
                      <Input
                        id="m3uUrl"
                        type="url"
                        value={m3uUrl}
                        onChange={(e) => setM3uUrl(e.target.value)}
                        placeholder="https://example.com/playlist.m3u"
                        required
                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-base"
                      />
                      <p className="text-xs text-muted-foreground">
                        Paste the direct link to your M3U playlist file
                      </p>
                    </div>

                    {testStatus !== "idle" && (
                      <div
                        className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${
                          testStatus === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : testStatus === "error"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {testStatus === "testing" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : testStatus === "success" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {testStatus === "testing" ? "Testing connection..." : testMessage}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestM3U}
                        disabled={testStatus === "testing" || !m3uUrl.trim()}
                        className="h-12 px-6 border-white/10 hover:bg-white/5 text-base"
                      >
                        {testStatus === "testing" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <LinkIcon className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="xtream" className="mt-6">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Server className="w-4 h-4 text-primary" />
                    Xtream Codes API
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveXtream} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="serverUrl" className="text-sm font-medium text-muted-foreground">
                        Server URL
                      </Label>
                      <Input
                        id="serverUrl"
                        type="url"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        placeholder="http://your-server.com:8080"
                        required
                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="xtUsername" className="text-sm font-medium text-muted-foreground">
                        Username
                      </Label>
                      <Input
                        id="xtUsername"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Your username"
                        required
                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-base"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="xtPassword" className="text-sm font-medium text-muted-foreground">
                        Password
                      </Label>
                      <Input
                        id="xtPassword"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Your password"
                        required
                        className="h-12 bg-white/5 border-white/10 focus:border-primary/50 focus:ring-primary/20 text-base"
                      />
                    </div>

                    {testStatus !== "idle" && (
                      <div
                        className={`flex items-center gap-2 text-sm rounded-lg px-4 py-3 ${
                          testStatus === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : testStatus === "error"
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : "bg-primary/10 text-primary border border-primary/20"
                        }`}
                      >
                        {testStatus === "testing" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : testStatus === "success" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                        {testStatus === "testing" ? "Testing connection..." : testMessage}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleTestXtream}
                        disabled={testStatus === "testing" || !serverUrl.trim() || !username.trim() || !password.trim()}
                        className="h-12 px-6 border-white/10 hover:bg-white/5 text-base"
                      >
                        {testStatus === "testing" ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Server className="w-4 h-4 mr-2" />
                        )}
                        Test Connection
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-12 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                      >
                        Save Configuration
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 flex justify-center">
            <Link href="/app">
              <Button
                size="lg"
                className="h-14 px-8 text-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
              >
                <Tv className="w-5 h-5 mr-2" />
                Open Player
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}