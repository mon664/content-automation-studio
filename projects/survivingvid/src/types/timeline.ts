export interface Timeline {
  id: string;
  name: string;
  duration: number;
  tracks: Track[];
  settings: TimelineSettings;
  createdAt: any;
  updatedAt: any;
}

export interface Track {
  id: string;
  type: 'video' | 'audio' | 'text' | 'image';
  name: string;
  clips: Clip[];
  locked: boolean;
  volume: number;
  muted: boolean;
  solo: boolean;
  color: string;
  height: number;
  visible: boolean;
}

export interface Clip {
  id: string;
  trackId: string;
  type: 'video' | 'audio' | 'text' | 'image';
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  trimStart?: number;
  trimEnd?: number;
  volume: number;
  muted: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  transform?: {
    rotation: number;
    scaleX: number;
    scaleY: number;
    anchorX: number;
    anchorY: number;
  };
  opacity: number;
  speed: number;
  filter?: {
    brightness: number;
    contrast: number;
    saturation: number;
    blur: number;
  };
  source: {
    type: 'file' | 'url' | 'text';
    src?: string;
    content?: string;
    style?: TextClipStyle;
  };
  effects?: ClipEffect[];
}

export interface TextClipStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold' | 'light';
  color: string;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
  textAlign: 'left' | 'center' | 'right';
  lineHeight?: number;
  letterSpacing?: number;
}

export interface ClipEffect {
  type: 'fadeIn' | 'fadeOut' 'slideIn' | 'slideOut' | 'zoomIn' | 'zoomOut';
  startTime: number;
  endTime: number;
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  parameters?: Record<string, any>;
}

export interface TimelineSettings {
  resolution: {
    width: number;
    height: number;
    fps: number;
  };
  backgroundColor: string;
  duration: number;
  preview: {
    quality: 'low' | 'medium' | 'high';
    enabled: boolean;
  };
}

export interface TimelineState {
  timeline: Timeline | null;
  currentTime: number;
  isPlaying: boolean;
  selectedClipId: string | null;
  selectedTrackId: string | null;
  zoom: number;
  scrollOffset: number;
  showWaveforms: boolean;
  showThumbnails: boolean;
}