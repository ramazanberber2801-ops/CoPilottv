"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentGrid, type ContentItem } from "@/components/ContentGrid";
import { VideoPlayer } from "@/components/VideoPlayer";
import {
  Tv,
  LogOut,
  Settings,
  Radio,
  Film,
  TvMinimal,
  Loader2,
} from "lucide-react";
import {
  fetchM3U,
  fetchXtreamLive,
  fetchXtreamVod,
  fetchXtreamSeries,
  getXtreamStreamUrl,
} from "@/lib/iptv";

type SectionType = "live" | "movies" | "series";

interface SectionState {
  items: ContentItem[];
  isLoading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

const PAGE_SIZE = 100;

export default function AppPage() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SectionType>("live");
  const [player, setPlayer] = useState<{ src: string; title: string } | null>(null);

  const [sections, setSections] = useState<Record<SectionType, SectionState>>({
    live: { items: [], isLoading: false, error: null, page: 0, hasMore: true },
    movies: { items: [], isLoading: false, error: null, page: 0, hasMore: true },
    series: { items: [], isLoading: false, error: null, page: 0, hasMore: true },
  });

  const iptvConfig = user?.iptvConfig;

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const loadContent = useCallback(
    async (type: SectionType, pageNum: number) => {
      if (!iptvConfig) return;

      setSections((prev) => ({
        ...prev,
        [type]: { ...prev[type], isLoading: true, error: null },
      }));

      try {
        let newItems: ContentItem[] = [];

        if (iptvConfig.type === "m3u" && iptvConfig.m3uUrl) {
          if (type === "live") {
            const channels = await fetchM3U(iptvConfig.m3uUrl);
            newItems = channels.map((ch) => ({
              id: ch.id,
              name: ch.name,
              logo: ch.logo,
              group: ch.group,
              url: ch.url,
            }));
          }
          // M3U doesn't have movies/series in standard format
        } else if (iptvConfig.type === "xtream") {
          const creds = {
            serverUrl: iptvConfig.serverUrl || "",
            username: iptvConfig.username || "",
            password: iptvConfig.password || "",
          };

          if (type === "live") {
            const channels = await fetchXtreamLive(creds);
            newItems = channels.map((ch) => ({
              id: ch.id,
              name: ch.name,
              logo: ch.logo,
              group: ch.group,
              url: ch.url,
            }));
          } else if (type === "movies") {
            const movies = await fetchXtreamVod(creds);
            newItems = movies.map((m) => ({
              id: m.stream_id,
              name: m.name,
              poster: m.stream_icon,
            }));
          } else if (type === "series") {
            const series = await fetchXtreamSeries(creds);
            newItems = series.map((s) => ({
              id: s.series_id,
              name: s.name,
              cover: s.cover,
            }));
          }
        }

        const start = pageNum * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const paginated = newItems.slice(start, end);

        setSections((prev) => ({
          ...prev,
          [type]: {
            items: pageNum === 0 ? paginated : [...prev[type].items, ...paginated],
            isLoading: false,
            error: null,
            page: pageNum,
            hasMore: end < newItems.length,
          },
        }));
      } catch (err) {
        setSections((prev) => ({
          ...prev,
          [type]: {
            ...prev[type],
            isLoading: false,
            error: err instanceof Error ? err.message : "Failed to load content",
            hasMore: false,
          },
        }));
      }
    },
    [iptvConfig]
  );

  // Auto-load when tab changes or config available
  React.useEffect(() => {
    if (iptvConfig && sections[activeTab].items.length === 0 && !sections[activeTab].isLoading) {
      loadContent(activeTab, 0);
    }
  }, [activeTab, iptvConfig, loadContent]);

  const handleLoadMore = (type: SectionType) => {
    loadContent(type, sections[type].page + 1);
  };

  const handleSelectItem = (item: ContentItem) => {
    if (!item.url && !iptvConfig) return;

    let src = item.url || "";
    if (iptvConfig?.type === "xtream" && !item.url) {
      const creds = {
        serverUrl: iptvConfig.serverUrl || "",
        username: iptvConfig.username || "",
        password: iptvConfig.password || "",
      };
      src = getXtreamStreamUrl(creds, Number(item.id), activeTab === "live" ? "live" : "vod");
    }

    if (src) {
      setPlayer({ src, title: item.name });
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
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
      {/* Header */}
      <header className="border-b border-white/5 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="container-tesla flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl glass flex items-center justify-center glow-cyan">
              <Tv className="w-5 h-5 text-primary" />
            </div>
            <span className="text-lg font-bold">
              <span className="gradient-text">CoPilot</span> TV
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/settings">
              <Button
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 rounded-xl text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-10 gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="container-tesla py-6">
        {!iptvConfig && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Settings className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold">No IPTV Provider Configured</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Add your M3U playlist or Xtream Codes API credentials to start streaming.
            </p>
            <Link href="/settings">
              <Button className="h-12 px-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan">
                Configure IPTV
              </Button>
            </Link>
          </div>
        )}

        {iptvConfig && (
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as SectionType)}
            className="w-full animate-fade-in"
          >
            <TabsList className="grid w-full grid-cols-3 h-14 bg-white/5 border border-white/10 rounded-xl p-1 mb-6">
              <TabsTrigger
                value="live"
                className="h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30 text-base font-medium transition-all gap-2"
              >
                <Radio className="w-4 h-4" />
                Live TV
              </TabsTrigger>
              <TabsTrigger
                value="movies"
                className="h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30 text-base font-medium transition-all gap-2"
              >
                <Film className="w-4 h-4" />
                Movies
              </TabsTrigger>
              <TabsTrigger
                value="series"
                className="h-full rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border data-[state=active]:border-primary/30 text-base font-medium transition-all gap-2"
              >
                <TvMinimal className="w-4 h-4" />
                Series
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="mt-0">
              <ContentGrid
                items={sections.live.items}
                type="live"
                isLoading={sections.live.isLoading}
                error={sections.live.error}
                hasMore={sections.live.hasMore}
                onLoadMore={() => handleLoadMore("live")}
                onSelect={handleSelectItem}
              />
            </TabsContent>

            <TabsContent value="movies" className="mt-0">
              <ContentGrid
                items={sections.movies.items}
                type="movie"
                isLoading={sections.movies.isLoading}
                error={sections.movies.error}
                hasMore={sections.movies.hasMore}
                onLoadMore={() => handleLoadMore("movies")}
                onSelect={handleSelectItem}
              />
            </TabsContent>

            <TabsContent value="series" className="mt-0">
              <ContentGrid
                items={sections.series.items}
                type="series"
                isLoading={sections.series.isLoading}
                error={sections.series.error}
                hasMore={sections.series.hasMore}
                onLoadMore={() => handleLoadMore("series")}
                onSelect={handleSelectItem}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {player && (
        <VideoPlayer
          src={player.src}
          title={player.title}
          onClose={() => setPlayer(null)}
        />
      )}
    </div>
  );
}