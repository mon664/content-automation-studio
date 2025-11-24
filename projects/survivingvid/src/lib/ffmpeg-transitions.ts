// FFmpeg 전환 효과 - AutoVid 55개 효과 완전 복사

import { FFmpegTransition } from '@/types/autovid';

export const FFMPEG_TRANSITIONS_DATA: {
  [key in FFmpegTransition]: {
    name: string;
    description: string;
    duration?: number;
    category: 'basic' | 'slide' | 'wipe' | 'fade' | 'shape' | 'advanced';
  };
} = {
  // 기본 효과 (12개)
  fade: {
    name: 'Fade',
    description: '기본 페이드 인/아웃 효과',
    category: 'fade'
  },
  fadeblack: {
    name: 'Fade to Black',
    description: '검은색으로 페이드되는 효과',
    category: 'fade'
  },
  fadewhite: {
    name: 'Fade to White',
    description: '흰색으로 페이드되는 효과',
    category: 'fade'
  },
  distance: {
    name: 'Distance',
    description: '거리 기반 전환 효과',
    category: 'advanced'
  },
  wipeleft: {
    name: 'Wipe Left',
    description: '왼쪽으로 와이프하는 효과',
    category: 'wipe'
  },
  wiperight: {
    name: 'Wipe Right',
    description: '오른쪽으로 와이프하는 효과',
    category: 'wipe'
  },
  wipeup: {
    name: 'Wipe Up',
    description: '위로 와이프하는 효과',
    category: 'wipe'
  },
  wipedown: {
    name: 'Wipe Down',
    description: '아래로 와이프하는 효과',
    category: 'wipe'
  },
  slideleft: {
    name: 'Slide Left',
    description: '왼쪽으로 슬라이드하는 효과',
    category: 'slide'
  },
  slideright: {
    name: 'Slide Right',
    description: '오른쪽으로 슬라이드하는 효과',
    category: 'slide'
  },
  slideup: {
    name: 'Slide Up',
    description: '위로 슬라이드하는 효과',
    category: 'slide'
  },
  slidedown: {
    name: 'Slide Down',
    description: '아래로 슬라이드하는 효과',
    category: 'slide'
  },

  // 회전 효과 (8개)
  smoothleft: {
    name: 'Smooth Left',
    description: '부드러운 왼쪽 전환 효과',
    category: 'slide'
  },
  smoothright: {
    name: 'Smooth Right',
    description: '부드러운 오른쪽 전환 효과',
    category: 'slide'
  },
  smoothup: {
    name: 'Smooth Up',
    description: '부드러운 위쪽 전환 효과',
    category: 'slide'
  },
  smoothdown: {
    name: 'Smooth Down',
    description: '부드러운 아래쪽 전환 효과',
    category: 'slide'
  },
  circlecrop: {
    name: 'Circle Crop',
    description: '원형으로 자르며 전환되는 효과',
    category: 'shape'
  },
  rectcrop: {
    name: 'Rectangle Crop',
    description: '사각형으로 자르며 전환되는 효과',
    category: 'shape'
  },
  circleclose: {
    name: 'Circle Close',
    description: '원형이 닫히며 전환되는 효과',
    category: 'shape'
  },
  circleopen: {
    name: 'Circle Open',
    description: '원형이 열리며 전환되는 효과',
    category: 'shape'
  },

  // 변형 효과 (12개)
  vertopen: {
    name: 'Vertical Open',
    description: '수직으로 열리는 효과',
    category: 'wipe'
  },
  vertclose: {
    name: 'Vertical Close',
    description: '수직으로 닫히는 효과',
    category: 'wipe'
  },
  horzopen: {
    name: 'Horizontal Open',
    description: '수평으로 열리는 효과',
    category: 'wipe'
  },
  horzclose: {
    name: 'Horizontal Close',
    description: '수평으로 닫히는 효과',
    category: 'wipe'
  },
  dissolve: {
    name: 'Dissolve',
    description: '디졸브 전환 효과',
    category: 'fade'
  },
  pixelize: {
    name: 'Pixelize',
    description: '픽셀화되며 전환되는 효과',
    category: 'advanced'
  },
  diagtl: {
    name: 'Diagonal Top-Left',
    description: '좌상단 대각선 전환 효과',
    category: 'wipe'
  },
  diagtr: {
    name: 'Diagonal Top-Right',
    description: '우상단 대각선 전환 효과',
    category: 'wipe'
  },
  diagbl: {
    name: 'Diagonal Bottom-Left',
    description: '좌하단 대각선 전환 효과',
    category: 'wipe'
  },
  diagbr: {
    name: 'Diagonal Bottom-Right',
    description: '우하단 대각선 전환 효과',
    category: 'wipe'
  },
  hlslice: {
    name: 'Horizontal Slice',
    description: '수평 슬라이스 전환 효과',
    category: 'advanced'
  },
  hrslice: {
    name: 'Horizontal Reverse Slice',
    description: '수평 역슬라이스 전환 효과',
    category: 'advanced'
  },

  // 고급 효과 (12개)
  vuslice: {
    name: 'Vertical Up Slice',
    description: '수직 상향 슬라이스 효과',
    category: 'advanced'
  },
  vdslice: {
    name: 'Vertical Down Slice',
    description: '수직 하향 슬라이스 효과',
    category: 'advanced'
  },
  hblur: {
    name: 'Horizontal Blur',
    description: '수평 블러 전환 효과',
    category: 'advanced'
  },
  fadegrays: {
    name: 'Fade to Grayscale',
    description: '흑백으로 페이드되는 효과',
    category: 'fade'
  },
  squeezeh: {
    name: 'Squeeze Horizontal',
    description: '수평으로 압축되는 효과',
    category: 'advanced'
  },
  squeezev: {
    name: 'Squeeze Vertical',
    description: '수직으로 압축되는 효과',
    category: 'advanced'
  },
  zoomin: {
    name: 'Zoom In',
    description: '확대되며 전환되는 효과',
    category: 'advanced'
  },
  fadefast: {
    name: 'Fast Fade',
    description: '빠른 페이드 효과',
    category: 'fade',
    duration: 0.5
  },
  fadeslow: {
    name: 'Slow Fade',
    description: '느린 페이드 효과',
    category: 'fade',
    duration: 2.0
  },
  hlwind: {
    name: 'Horizontal Wind',
    description: '수평 바람 효과',
    category: 'advanced'
  },
  hrwind: {
    name: 'Horizontal Reverse Wind',
    description: '수평 역바람 효과',
    category: 'advanced'
  },
  vuwind: {
    name: 'Vertical Up Wind',
    description: '수직 상향 바람 효과',
    category: 'advanced'
  },

  // 3D 효과 (12개)
  vdwind: {
    name: 'Vertical Down Wind',
    description: '수직 하향 바람 효과',
    category: 'advanced'
  },
  coverleft: {
    name: 'Cover Left',
    description: '왼쪽에서 덮는 효과',
    category: 'slide'
  },
  coverright: {
    name: 'Cover Right',
    description: '오른쪽에서 덮는 효과',
    category: 'slide'
  },
  coverup: {
    name: 'Cover Up',
    description: '위에서 덮는 효과',
    category: 'slide'
  },
  coverdown: {
    name: 'Cover Down',
    description: '아래에서 덮는 효과',
    category: 'slide'
  },
  revealleft: {
    name: 'Reveal Left',
    description: '왼쪽으로 드러나는 효과',
    category: 'slide'
  },
  revealright: {
    name: 'Reveal Right',
    description: '오른쪽으로 드러나는 효과',
    category: 'slide'
  },
  revealup: {
    name: 'Reveal Up',
    description: '위로 드러나는 효과',
    category: 'slide'
  },
  revealdown: {
    name: 'Reveal Down',
    description: '아래로 드러나는 효과',
    category: 'slide'
  },
  wipetl: {
    name: 'Wipe Top-Left',
    description: '좌상단 와이프 효과',
    category: 'wipe'
  },
  wipetr: {
    name: 'Wipe Top-Right',
    description: '우상단 와이프 효과',
    category: 'wipe'
  },
  wipebl: {
    name: 'Wipe Bottom-Left',
    description: '좌하단 와이프 효과',
    category: 'wipe'
  },

  // 특수 효과 (5개)
  wipebr: {
    name: 'Wipe Bottom-Right',
    description: '우하단 와이프 효과',
    category: 'wipe'
  },
  radial: {
    name: 'Radial',
    description: '방사형 전환 효과',
    category: 'shape'
  }
};

// 카테고리별 그룹화
export const TRANSITIONS_BY_CATEGORY = {
  basic: ['fade', 'fadeblack', 'fadewhite'],
  slide: ['slideleft', 'slideright', 'slideup', 'slidedown', 'smoothleft', 'smoothright', 'smoothup', 'smoothdown'],
  wipe: ['wipeleft', 'wiperight', 'wipeup', 'wipedown', 'vertopen', 'vertclose', 'horzopen', 'horzclose', 'diagtl', 'diagtr', 'diagbl', 'diagbr'],
  fade: ['fade', 'fadeblack', 'fadewhite', 'dissolve', 'fadegrays', 'fadefast', 'fadeslow'],
  shape: ['circlecrop', 'rectcrop', 'circleclose', 'circleopen', 'radial'],
  advanced: ['distance', 'pixelize', 'hlslice', 'hrslice', 'vuslice', 'vdslice', 'hblur', 'squeezeh', 'squeezev', 'zoomin', 'hlwind', 'hrwind', 'vuwind', 'vdwind']
};

// 기본 추천 전환 효과
export const RECOMMENDED_TRANSITIONS = [
  'fade',
  'dissolve',
  'slideleft',
  'slideright',
  'fadeblack',
  'fadewhite',
  'smoothleft',
  'smoothright'
] as const;

// FFmpeg 명령어 생성 함수
export const createFFmpegTransitionCommand = (
  input1: string,
  input2: string,
  output: string,
  transition: FFmpegTransition,
  duration: number = 1,
  offset?: number
): string => {
  const transitionData = FFMPEG_TRANSITIONS_DATA[transition];
  const actualDuration = transitionData.duration || duration;

  if (offset === undefined) {
    // 첫 번째 비디오 길이를 계산해야 함 (실제로는 ffprobe 사용)
    offset = 5; // 임시값
  }

  return `-i "${input1}" -i "${input2}" -filter_complex "[0:v][1:v]xfade=transition=${transition}:duration=${actualDuration}:offset=${offset}[v]" -map "[v]" "${output}"`;
};

// 전환 효과 미리보기 생성 함수
export const generateTransitionPreview = (
  transition: FFmpegTransition,
  backgroundColor: string = '#000000'
): string => {
  const transitionData = FFMPEG_TRANSITIONS_DATA[transition];

  return `data:image/svg+xml;base64,${btoa(`
    <svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="180" fill="${backgroundColor}"/>
      <text x="160" y="90" text-anchor="middle" fill="white" font-family="Arial" font-size="14">
        ${transitionData.name}
      </text>
      <text x="160" y="110" text-anchor="middle" fill="white" font-family="Arial" font-size="10">
        ${transitionData.description}
      </text>
    </svg>
  `)}`;
};