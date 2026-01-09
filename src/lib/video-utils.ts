// Verifica se é uma URL externa (YouTube, Vimeo, etc)
export function isExternalVideoUrl(url: string): boolean {
  if (!url) return false;

  const externalPatterns = [
    /youtube\.com/i,
    /youtu\.be/i,
    /vimeo\.com/i,
    /dailymotion\.com/i,
    /wistia\.com/i,
    /loom\.com/i,
  ];

  return externalPatterns.some(pattern => pattern.test(url));
}

// Converte URL de vídeo para formato embed
export function getEmbedUrl(url: string): string {
  // YouTube - vários formatos
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const youtubeMatch = url.match(youtubeRegex);

  if (youtubeMatch) {
    const videoId = youtubeMatch[1];
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
  }

  // Vimeo - vários formatos
  const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
  const vimeoMatch = url.match(vimeoRegex);

  if (vimeoMatch) {
    const videoId = vimeoMatch[1];
    return `https://player.vimeo.com/video/${videoId}`;
  }

  // Outros - retorna a URL original
  return url;
}
