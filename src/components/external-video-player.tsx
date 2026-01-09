"use client";

import { useMemo } from "react";
import { getEmbedUrl } from "@/lib/video-utils";

interface ExternalVideoPlayerProps {
  videoUrl: string;
  title: string;
}

export function ExternalVideoPlayer({ videoUrl, title }: ExternalVideoPlayerProps) {
  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black shadow-lg">
      <iframe
        src={embedUrl}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        title={title}
        frameBorder="0"
      />
    </div>
  );
}
