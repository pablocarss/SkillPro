"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingVideoPlayerProps {
  lessonId: string;
  userName: string;
  className?: string;
  onVideoEnded?: () => void | Promise<void>;
}

export function TrainingVideoPlayer({ lessonId, userName, className, onVideoEnded }: TrainingVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"main" | "speed" | "quality">("main");
  const [quality, setQuality] = useState("auto");
  const [buffered, setBuffered] = useState(0);

  // Fetch video URL with authentication - uses training API
  useEffect(() => {
    const fetchVideoUrl = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/video/stream/training/${lessonId}`);
        if (!response.ok) {
          throw new Error("Failed to load video");
        }

        const data = await response.json();
        setVideoUrl(data.videoUrl);
      } catch (err) {
        setError("Erro ao carregar o video. Tente novamente.");
        console.error("Error loading video:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideoUrl();
  }, [lessonId]);

  // Format time as MM:SS
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  // Play/Pause toggle
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Volume toggle
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Progress bar click
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !videoRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * duration;
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Playback rate change
  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
      setPlaybackRate(rate);
      setShowSettings(false);
    }
  };

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };
    const handleWaiting = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = (e: Event) => {
      console.error("Video error:", e);
      setError("Erro ao reproduzir o vídeo");
      setIsLoading(false);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      if (onVideoEnded) {
        // Execute callback in next tick to avoid blocking
        setTimeout(() => {
          try {
            const result = onVideoEnded();
            // Handle if callback returns a promise
            if (result instanceof Promise) {
              result.catch((err) => {
                console.error("Error in async onVideoEnded callback:", err);
              });
            }
          } catch (error) {
            console.error("Error in onVideoEnded callback:", error);
          }
        }, 0);
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ended", handleEnded);
    };
  }, [videoUrl, onVideoEnded]);

  // Fullscreen change handler
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Hide controls after inactivity
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "arrowleft":
          e.preventDefault();
          skip(-10);
          break;
        case "arrowright":
          e.preventDefault();
          skip(10);
          break;
        case "arrowup":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.min(1, volume + 0.1);
            setVolume(videoRef.current.volume);
          }
          break;
        case "arrowdown":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.volume = Math.max(0, volume - 0.1);
            setVolume(videoRef.current.volume);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, volume]);

  // Prevent right-click context menu
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  // Prevent drag
  const handleDragStart = (e: React.DragEvent) => {
    e.preventDefault();
    return false;
  };

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-gray-900 text-white">
        <div className="text-center">
          <p className="text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium hover:bg-primary/90"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-xl bg-black",
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={handleContextMenu}
    >
      {/* Video Element */}
      {videoUrl && (
        <video
          ref={videoRef}
          src={videoUrl}
          className="h-full w-full"
          onClick={togglePlay}
          onDragStart={handleDragStart}
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
        />
      )}

      {/* Watermark - displays user name */}
      <div className="pointer-events-none absolute right-4 top-4 select-none opacity-50">
        <span className="text-sm font-medium text-white/60">{userName}</span>
      </div>

      {/* Moving watermark - makes screen recording traceable */}
      <div
        className="pointer-events-none absolute select-none opacity-20"
        style={{
          top: `${(currentTime * 7) % 60 + 20}%`,
          left: `${(currentTime * 13) % 70 + 10}%`,
        }}
      >
        <span className="text-xs text-white/40">{userName}</span>
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      )}

      {/* Play button overlay when paused */}
      {!isPlaying && !isLoading && videoUrl && (
        <div
          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/30"
          onClick={togglePlay}
        >
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/90 transition-transform hover:scale-110">
            <Play className="h-10 w-10 text-gray-900 ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Controls Overlay */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-4 pt-16 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Progress Bar */}
        <div
          ref={progressRef}
          className="group/progress relative mb-4 h-1 cursor-pointer rounded-full bg-white/30 transition-all hover:h-2"
          onClick={(e) => { e.stopPropagation(); handleProgressClick(e); }}
        >
          {/* Buffered */}
          <div
            className="absolute h-full rounded-full bg-white/40"
            style={{ width: `${(buffered / duration) * 100}%` }}
          />
          {/* Progress */}
          <div
            className="relative h-full rounded-full bg-primary transition-all"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          >
            {/* Progress Handle */}
            <div className="absolute -right-2 top-1/2 h-4 w-4 -translate-y-1/2 scale-0 rounded-full bg-primary shadow-lg transition-transform group-hover/progress:scale-100" />
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePlay(); }}
              className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" fill="currentColor" />
              )}
            </button>

            {/* Skip buttons */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); skip(-10); }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); skip(10); }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              <RotateCw className="h-4 w-4" />
            </button>

            {/* Volume */}
            <div className="group/volume flex items-center gap-2">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <div
                className="relative h-1 w-20 cursor-pointer rounded-full bg-white/30"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  if (videoRef.current) {
                    videoRef.current.volume = pos;
                    setVolume(pos);
                    setIsMuted(pos === 0);
                  }
                }}
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary"
                  style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white shadow-md transition-transform hover:scale-125"
                  style={{ left: `calc(${(isMuted ? 0 : volume) * 100}% - 6px)` }}
                />
              </div>
            </div>

            {/* Time */}
            <span className="text-sm text-white">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Settings Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSettings(!showSettings);
                  setSettingsTab("main");
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </button>
              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 min-w-[180px] rounded-lg bg-gray-900/95 shadow-lg backdrop-blur-sm overflow-hidden">
                  {settingsTab === "main" && (
                    <div className="p-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSettingsTab("quality"); }}
                        className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <span>Qualidade</span>
                        <span className="text-gray-400">{quality === "auto" ? "Auto" : quality}</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSettingsTab("speed"); }}
                        className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-white transition-colors hover:bg-white/10"
                      >
                        <span>Velocidade</span>
                        <span className="text-gray-400">{playbackRate === 1 ? "Normal" : `${playbackRate}x`}</span>
                      </button>
                    </div>
                  )}

                  {settingsTab === "quality" && (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSettingsTab("main"); }}
                        className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <span>←</span>
                        <span>Qualidade</span>
                      </button>
                      <div className="p-1">
                        {["auto", "1080p", "720p", "480p", "360p", "240p"].map((q) => (
                          <button
                            type="button"
                            key={q}
                            onClick={(e) => {
                              e.stopPropagation();
                              setQuality(q);
                              setShowSettings(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10",
                              quality === q && "bg-primary/50"
                            )}
                          >
                            <span>{q === "auto" ? "Auto" : q}</span>
                            {quality === q && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {settingsTab === "speed" && (
                    <div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSettingsTab("main"); }}
                        className="flex w-full items-center gap-2 border-b border-white/10 px-3 py-2 text-sm text-white hover:bg-white/10"
                      >
                        <span>←</span>
                        <span>Velocidade</span>
                      </button>
                      <div className="p-1">
                        {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            type="button"
                            key={rate}
                            onClick={(e) => {
                              e.stopPropagation();
                              changePlaybackRate(rate);
                              setShowSettings(false);
                            }}
                            className={cn(
                              "flex w-full items-center justify-between rounded px-3 py-1.5 text-sm text-white transition-colors hover:bg-white/10",
                              playbackRate === rate && "bg-primary/50"
                            )}
                          >
                            <span>{rate === 1 ? "Normal" : `${rate}x`}</span>
                            {playbackRate === rate && <span>✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20"
            >
              {isFullscreen ? (
                <Minimize className="h-5 w-5" />
              ) : (
                <Maximize className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
