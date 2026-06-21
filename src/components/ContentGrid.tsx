"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tv, Film, TvMinimal, Loader2, AlertCircle } from "lucide-react";

export interface ContentItem {
  id: string | number;
  name: string;
  logo?: string;
  poster?: string;
  cover?: string;
  group?: string;
  url?: string;
}

interface ContentGridProps {
  items: ContentItem[];
  type: "live" | "movie" | "series";
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  onLoadMore: () => void;
  onSelect: (item: ContentItem) => void;
}

export function ContentGrid({
  items,
  type,
  isLoading,
  error,
  hasMore,
  onLoadMore,
  onSelect,
}: ContentGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string | number>>(new Set());

  const handleImageError = (id: string | number) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const getPlaceholderIcon = () => {
    switch (type) {
      case "live":
        return <TvMinimal className="w-10 h-10 text-muted-foreground/40" />;
      case "movie":
        return <Film className="w-10 h-10 text-muted-foreground/40" />;
      case "series":
        return <Tv className="w-10 h-10 text-muted-foreground/40" />;
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground">Loading content...</p>
      </div>
    );
  }

  if (error && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <p className="text-destructive text-center max-w-md">{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
          {getPlaceholderIcon()}
        </div>
        <p className="text-muted-foreground text-center">
          No {type === "live" ? "channels" : type === "movie" ? "movies" : "series"} found.
          <br />
          Configure your IPTV provider in settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item) => {
          const imageUrl = item.logo || item.poster || item.cover;
          const hasImageError = imageErrors.has(item.id);

          return (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className="group relative flex flex-col items-center text-left p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/30 hover:bg-white/[0.07] transition-all duration-200 active:scale-95 min-h-[140px] touch-manipulation"
            >
              <div className="relative w-full aspect-square max-w-[120px] mb-3 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center">
                {imageUrl && !hasImageError ? (
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={() => handleImageError(item.id)}
                  />
                ) : (
                  <div className="flex items-center justify-center">
                    {getPlaceholderIcon()}
                  </div>
                )}
                {type === "live" && (
                  <div className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                )}
              </div>
              <p className="text-xs font-medium text-center line-clamp-2 leading-snug text-foreground/90 group-hover:text-primary transition-colors">
                {item.name}
              </p>
              {item.group && (
                <p className="text-[10px] text-muted-foreground mt-1 text-center line-clamp-1">
                  {item.group}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {hasMore && (
        <div className="flex justify-center py-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="h-12 px-8 border-white/10 hover:bg-white/5 text-base"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}