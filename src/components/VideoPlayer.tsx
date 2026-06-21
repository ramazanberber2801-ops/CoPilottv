"use client";

import React, { useRef, useEffect, useState } from "react";
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
} from "lucide-react";

interface VideoPlayerProps {
  src: string;
  title: string;
  onClose: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, title, onClose, autoPlay = true }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (autoPlay) {
      video.play().catch(() => {
        // Autoplay blocked, user must interact
      });
    }

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [src, autoPlay]);

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
    if (video.paused) {
      video.play();
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

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex flex-col"
      onMouseMove={handleMouseMove}
      onClick={handleMouseMove}
    >
      {/* Video */}
      <div className="flex-1 relative flex items-center justify-center bg-black">
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          playsInline
          onDoubleClick={toggleFullscreen}
        />
      </div>

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-between p-4 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Top Bar */}
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

        {/* Center Play Button (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
            <Button
              variant="ghost"
              onClick={togglePlay}
              className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm"
            >
              <Play className="w-10 h-10 text-white fill-white" />
            </Button>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="bg-gradient-to-t from-black/80 to-transparent pt-12 pb-4 px-2">
          <div className="flex items-center justify-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => seek(-10)}
              className="h-14 w-14 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <SkipBack className="w-6 h-6" />
            </Button>

            <Button
              variant="ghost"
              onClick={togglePlay}
              className="h-16 w-16 p-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan"
            >
              {isPlaying ? (
                <Pause className="w-8 h-8" />
              ) : (
                <Play className="w-8 h-8 fill-current" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => seek(10)}
              className="h-14 w-14 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <SkipForward className="w-6 h-6" />
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4 px-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMute}
              className="h-11 w-11 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="h-11 w-11 p-0 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}