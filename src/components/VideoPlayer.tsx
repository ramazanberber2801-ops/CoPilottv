"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Play,
  Pause,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  X,
  SkipBack,
  SkipForward,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
}

const PROXY_SERVICES = [
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

async function proxyFetch(url: string, attempt = 0): Promise<Response> {
  const proxyFn = PROXY_SERVICES[attempt % PROXY_SERVICES.length];
  const proxyUrl = proxyFn(url);
  console.log(`[CoPilot TV] Proxy fetch attempt ${attempt + 1}:`, proxyUrl.slice(0, 120) + "...");
  const res = await fetch(proxyUrl, { method: "GET" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function fetchAndRewriteManifest(manifestUrl: string, attempt = 0): Promise<string> {
  const res = await proxyFetch(manifestUrl, attempt);
  const text = await res.text();

  // Validate we actually got an M3U8, not an HTML error page
  const trimmed = text.trim();
  if (!trimmed.startsWith("#EXTM3U") && !trimmed.startsWith("#EXTINF")) {
    throw new Error(`Proxy returned non-M3U8 content (starts with: ${trimmed.slice(0, 60)})`);
  }

  const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf("/") + 1);
  const proxyFn = PROXY_SERVICES[attempt % PROXY_SERVICES.length];

  const lines = text.split("\n").map((line) => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith("#")) return line;

    let absoluteUrl = trimmedLine;
    if (!trimmedLine.startsWith("http://") && !trimmedLine.startsWith("https://")) {
      absoluteUrl = baseUrl + trimmedLine;
    }

    return proxyFn(absoluteUrl);
  });

  const blob = new Blob([lines.join("\n")], { type: "application/vnd.apple.mpegurl" });
  return URL.createObjectURL(blob);
}

export function VideoPlayer({ src, title, onClose }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<InstanceType<typeof import("hls.js").default> | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [useDirect, setUseDirect] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  const setupHls = useCallback(
    async (videoSrc: string, directFallback = false) => {
      console.log("[CoPilot TV] Loading stream:", videoSrc, "| directFallback:", directFallback, "| retry:", retryCount);

      const video = videoRef.current;
      if (!video) return;

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      setHasError(false);
      setErrorMsg(null);
      clearErrorTimer();

      errorTimerRef.current = setTimeout(() => {
        const vid = videoRef.current;
        if (vid && (vid.paused || vid.readyState < 2)) {
          console.warn("[CoPilot TV] Stream failed to start after timeout");
          setHasError(true);
          setErrorMsg("Stream failed to load. The server may be unavailable or blocked.");
        }
      }, 8000);

      const isHls = videoSrc.toLowerCase().includes(".m3u8");

      if (isHls) {
        try {
          const Hls = (await import("hls.js")).default;
          if (Hls.isSupported()) {
            const hls = new Hls({
              maxBufferLength: 30,
              maxMaxBufferLength: 600,
              liveSyncDurationCount: 3,
              fragLoadingTimeOut: 30000,
              manifestLoadingTimeOut: 30000,
              levelLoadingTimeOut: 30000,
            });
            hlsRef.current = hls;

            hls.on(Hls.Events.MEDIA_ATTACHED, () => {
              console.log("[CoPilot TV] HLS media attached");
            });

            hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
              console.log("[CoPilot TV] HLS manifest parsed, levels:", data.levels?.length || 0);
              setHasError(false);
              setErrorMsg(null);
              clearErrorTimer();
              video.play().catch((err: Error) => {
                console.warn("[CoPilot TV] Autoplay blocked:", err.message);
              });
            });

            hls.on(Hls.Events.ERROR, (_event: any, data: any) => {
              console.error("[CoPilot TV] HLS error:", data.type, data.details, "fatal:", data.fatal);
              if (data.fatal) {
                clearErrorTimer();
                if (!directFallback) {
                  console.log("[CoPilot TV] HLS fatal error, switching to direct fallback...");
                  setUseDirect(true);
                } else {
                  setHasError(true);
                  setErrorMsg(`HLS Error: ${data.type} — ${data.details}`);
                }
              }
            });

            if (!directFallback) {
              try {
                const blobUrl = await fetchAndRewriteManifest(videoSrc, retryCount);
                blobUrlRef.current = blobUrl;
                console.log("[CoPilot TV] Using blob manifest:", blobUrl.slice(0, 60) + "...");
                hls.loadSource(blobUrl);
              } catch (err) {
                console.warn("[CoPilot TV] Proxy manifest fetch failed:", err);
                setUseDirect(true);
                clearErrorTimer();
                return;
              }
            } else {
              console.log("[CoPilot TV] Direct fallback, loading proxied URL");
              const proxyFn = PROXY_SERVICES[retryCount % PROXY_SERVICES.length];
              video.src = proxyFn(videoSrc);
              video.addEventListener("loadedmetadata", () => {
                clearErrorTimer();
                video.play().catch((err: Error) => {
                  console.warn("[CoPilot TV] Direct autoplay blocked:", err.message);
                });
              });
              return;
            }

            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = videoSrc;
            video.addEventListener("loadedmetadata", () => {
              clearErrorTimer();
              video.play().catch((err: Error) => {
                console.warn("[CoPilot TV] Native autoplay blocked:", err.message);
              });
            });
          } else {
            setHasError(true);
            setErrorMsg("HLS is not supported in this browser.");
            clearErrorTimer();
          }
        } catch (err) {
          console.error("[CoPilot TV] Failed to load hls.js:", err);
          setHasError(true);
          setErrorMsg("Failed to initialize HLS player.");
          clearErrorTimer();
        }
      } else {
        video.src = videoSrc;
        video.addEventListener("loadedmetadata", () => {
          clearErrorTimer();
          video.play().catch((err: Error) => {
            console.warn("[CoPilot TV] Standard autoplay blocked:", err.message);
          });
        });
      }
    },
    [clearErrorTimer, retryCount]
  );

  useEffect(() => {
    setUseDirect(false);
    setRetryCount(0);
    setHasError(false);
    setErrorMsg(null);
  }, [src]);

  useEffect(() => {
    setupHls(src, useDirect);

    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      clearErrorTimer();
    };
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      console.error("[CoPilot TV] Video element error:", video.error?.code, video.error?.message);
      setHasError(true);
      setErrorMsg("The stream could not be played.");
      clearErrorTimer();
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("error", handleError);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("error", handleError);
      clearErrorTimer();
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, [src, useDirect, retryCount, setupHls, clearErrorTimer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    console.log("[CoPilot TV] Toggle play — current state:", video.paused ? "paused" : "playing");

    if (video.paused) {
      video.play().catch((err) => {
        console.error("[CoPilot TV] Play() failed:", err);
        setHasError(true);
        setErrorMsg("Playback failed. Tap Retry to try again.");
      });
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, video.currentTime + seconds);
  };

  const handleRetry = () => {
    setRetryCount((c) => c + 1);
    setUseDirect(false);
    setHasError(false);
    setErrorMsg(null);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted={false}
          onDoubleClick={toggleFullscreen}
        />

        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10 gap-4">
            <div className="w-16 h-16 rounded-2xl bg-destructive/20 flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-white font-semibold text-lg">Stream Unavailable</p>
            {errorMsg && <p className="text-white/60 text-sm max-w-md text-center px-4">{errorMsg}</p>}
            <Button
              onClick={handleRetry}
              className="h-12 px-6 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan mt-2"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry Stream
            </Button>
            <p className="text-white/30 text-xs mt-2">Attempt {retryCount + 1}</p>
            {useDirect && (
              <p className="text-white/20 text-xs">Direct mode active</p>
            )}
          </div>
        )}
      </div>

      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 ${
          showControls && !hasError ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pb-8 pt-2 px-2">
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-11 w-11 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <h2 className="text-white font-semibold text-base truncate">{title}</h2>
          </div>
        </div>

        {!isPlaying && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              variant="ghost"
              onClick={togglePlay}
              className="h-24 w-24 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm active:scale-95 transition-transform"
            >
              <Play className="w-12 h-12 text-white fill-white" />
            </Button>
          </div>
        )}

        <div className="bg-gradient-to-t from-black/80 to-transparent pt-12 pb-4 px-2">
          <div className="flex items-center justify-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => seek(-10)}
              className="h-14 w-14 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-transform"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              onClick={togglePlay}
              className="h-20 w-20 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan active:scale-95 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-10 h-10" />
              ) : (
                <Play className="w-10 h-10 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => seek(10)}
              className="h-14 w-14 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-transform"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-11 w-11 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-transform"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-11 w-11 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-transform"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
