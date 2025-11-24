export interface YouTubeVideoInfo {
  id: string;
  title: string;
  description: string;
  duration: number;
  durationFormatted: string;
  uploader: string;
  uploaderId: string;
  uploadDate: string;
  viewCount: number;
  likeCount: number;
  thumbnail: string;
  thumbnails: YouTubeThumbnail[];
  formats: YouTubeFormat[];
  audioFormats: YouTubeFormat[];
  videoFormats: YouTubeFormat[];
  fileSize: number;
  fileSizeHuman: string;
  tags: string[];
  category: string;
  language: string;
}

export interface YouTubeThumbnail {
  quality: string;
  url: string;
  width: number;
  height: number;
}

export interface YouTubeFormat {
  formatId: string;
  ext: string;
  resolution: string;
  fps: number;
  filesize: number;
  filesizeHuman: string;
  tbr: number;
  vcodec: string;
  acodec: string;
  container: string;
  quality: string;
}

export interface DownloadOptions {
  formatId: string;
  quality: 'highest' | 'medium' | 'lowest';
  type: 'video' | 'audio' | 'both';
  container: 'mp4' | 'webm' | 'mp3' | 'wav';
}

export interface DownloadProgress {
  id: string;
  url: string;
  status: 'pending' | 'downloading' | 'processing' | 'completed' | 'error' | 'cancelled';
  progress: number;
  speed: number;
  eta: number;
  downloadedBytes: number;
  totalBytes: number;
  filename: string;
  error?: string;
  createdAt: any;
  completedAt?: any;
}