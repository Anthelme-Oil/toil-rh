export function getVideoEmbedUrl(url: string = ''): { isEmbed: boolean; src: string } {
  if (!url) return { isEmbed: false, src: '' };

  // YouTube
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (ytMatch) {
    return { isEmbed: true, src: `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1` };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch) {
    return { isEmbed: true, src: `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1` };
  }

  // Fichier vidéo direct (MP4, WebM...)
  return { isEmbed: false, src: url };
}