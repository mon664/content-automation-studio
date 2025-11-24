// AutoVid 타입 정의 - 원본과 100% 호환

export interface ScriptRequest {
  subject: string;
  requestNumber: number;
  requestLanguage: string;
  includeOpeningSegment: boolean;
  includeClosingSegment: boolean;
  includeImageGenPrompt: boolean;
}

export interface ScriptResponse {
  title: string;
  openingSegment: {
    videoSearchKeyword: string[];
    script: string[];
    imageGenPrompt: string;
  };
  snippets: Snippet[];
}

export interface Snippet {
  videoSearchKeyword: string[];
  segmentTitle: string;
  rank: number;
  script: string[];
  imageGenPrompt: string;
}

export interface Template {
  Id: string;
  IsDefault: boolean;
  TemplateName: string;
  BackgroundColor: string;
  TopHeightPercent: number;
  BottomHeightPercent: number;
  FixedTexts: FixedText[];
  Stickers: Sticker[];
}

export interface FixedText {
  FontColorAsColor: {
    A: number;
    R: number;
    G: number;
    B: number;
  };
  X: number;
  Y: number;
  Content: string;
  FontSize: number;
  FontColor: string;
  FontFamilyName: string;
  IsBold: boolean;
}

export interface Sticker {
  // 스티커 관련 속성
  [key: string]: any;
}

export interface VideoProject {
  id: string;
  name: string;
  template: string;
  script: ScriptResponse;
  images: string[];
  transitions: string[];
  audioPath?: string;
  subtitlePath?: string;
  outputPath?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCredit {
  SCrd: number; // 구독 무료 크레딧
  ECrd: number; // 유료 크레딧
}

export interface UserProfile {
  email: string;
  name: string;
  avatar?: string;
  credits: UserCredit;
  subscription?: 'free' | 'pro' | 'premium';
  settings: UserSettings;
}

export interface UserSettings {
  scriptLanguage: string;
  promptName: string;
  subtitleStyle: string;
  channelIntro?: string;
  channelOutro?: string;
  youtubeApiKey?: string;
  channelId?: string;
  channelName?: string;
  defaultVoice: string;
  defaultTemplate: string;
  defaultTransition: string;
}

// FFmpeg 전환 효과 타입
export const FFMPEG_TRANSITIONS = [
  'fade', 'fadeblack', 'fadewhite', 'distance',
  'wipeleft', 'wiperight', 'wipeup', 'wipedown',
  'slideleft', 'slideright', 'slideup', 'slidedown',
  'smoothleft', 'smoothright', 'smoothup', 'smoothdown',
  'circlecrop', 'rectcrop', 'circleclose', 'circleopen',
  'vertopen', 'vertclose', 'horzopen', 'horzclose',
  'dissolve', 'pixelize', 'diagtl', 'diagtr',
  'diagbl', 'diagbr', 'hlslice', 'hrslice',
  'vuslice', 'vdslice', 'hblur', 'fadegrays',
  'squeezeh', 'squeezev', 'zoomin', 'fadefast',
  'fadeslow', 'hlwind', 'hrwind', 'vuwind',
  'vdwind', 'coverleft', 'coverright', 'coverup',
  'coverdown', 'revealleft', 'revealright', 'revealup',
  'revealdown', 'wipetl', 'wipetr', 'wipebl',
  'wipebr', 'radial'
] as const;

export type FFmpegTransition = typeof FFMPEG_TRANSITIONS[number];

// AI 이미지 모델 타입
export const AI_IMAGE_MODELS = {
  'animagine31': 'animagine-xl-3.1',
  'chibitoon': 'chibi-style',
  'enna-sketch': 'sketch-style',
  'flux-dark': 'flux-schnell-dark',
  'flux-realistic': 'flux-schnell-realistic',
  'flux-webtoon': 'flux-schnell-webtoon'
} as const;

export type AIImageModel = keyof typeof AI_IMAGE_MODELS;