import { v4 as uuidv4 } from 'uuid';
import { Timeline, Track, Clip, TimelineSettings } from '@/types/timeline';

export class TimelineEditor {
  private static readonly DEFAULT_SETTINGS: TimelineSettings = {
    resolution: {
      width: 1920,
      height: 1080,
      fps: 30
    },
    backgroundColor: '#000000',
    duration: 0,
    preview: {
      quality: 'medium',
      enabled: true
    }
  };

  // 새 타임라인 생성
  static createTimeline(name: string = '새 프로젝트'): Timeline {
    return {
      id: uuidv4(),
      name,
      duration: 0,
      tracks: [],
      settings: { ...this.DEFAULT_SETTINGS },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  // 트랙 추가
  static addTrack(timeline: Timeline, type: Track['type'], name?: string): Timeline {
    const track: Track = {
      id: uuidv4(),
      type,
      name: name || this.getDefaultTrackName(type),
      clips: [],
      locked: false,
      volume: 1,
      muted: false,
      solo: false,
      color: this.getDefaultTrackColor(type),
      height: this.getDefaultTrackHeight(type),
      visible: true
    };

    return {
      ...timeline,
      tracks: [...timeline.tracks, track],
      updatedAt: new Date()
    };
  }

  // 클립 추가
  static addClip(timeline: Timeline, trackId: string, clip: Omit<Clip, 'id' | 'trackId'>): Timeline {
    const newClip: Clip = {
      ...clip,
      id: uuidv4(),
      trackId,
      startTime: clip.startTime || 0,
      endTime: clip.endTime || clip.startTime + (clip.duration || 5),
      volume: clip.volume ?? 1,
      muted: clip.muted ?? false,
      position: clip.position ?? { x: 0, y: 0, width: 200, height: 150 },
      opacity: clip.opacity ?? 1,
      speed: clip.speed ?? 1
    };

    // 트랙에 클립 추가
    const track = timeline.tracks.find(t => t.id === trackId);
    if (track) {
      track.clips.push(newClip);
    }

    // 타임라인 전체 길이 업데이트
    const newDuration = Math.max(timeline.duration, newClip.endTime);

    return {
      ...timeline,
      duration: newDuration,
      updatedAt: new Date()
    };
  }

  // 클립 삭제
  static removeClip(timeline: Timeline, clipId: string): Timeline {
    const updatedTracks = timeline.tracks.map(track => ({
      ...track,
      clips: track.clips.filter(clip => clip.id !== clipId)
    }));

    // 타임라인 전체 길이 재계산
    const newDuration = this.calculateTimelineDuration(updatedTracks);

    return {
      ...timeline,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    };
  }

  // 클립 업데이트
  static updateClip(timeline: Timeline, clipId: string, updates: Partial<Clip>): Timeline {
    const updatedTracks = timeline.tracks.map(track => ({
      ...track,
      clips: track.clips.map(clip =>
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    }));

    // 시간 변경된 경우 타임라인 길이 재계산
    const updatedClip = updatedTracks
      .flatMap(track => track.clips)
      .find(clip => clip.id === clipId);

    let newDuration = timeline.duration;
    if (updatedClip) {
      newDuration = Math.max(
        newDuration,
        updatedTracks.flatMap(track => track.clips).reduce(
          (max, clip) => Math.max(max, clip.endTime),
          0
        )
      );
    }

    return {
      ...timeline,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    };
  }

  // 클립 이동
  static moveClip(timeline: Timeline, clipId: string, newStartTime: number): Timeline {
    const clip = timeline.tracks
      .flatMap(track => track.clips)
      .find(clip => clip.id === clipId);

    if (!clip) return timeline;

    const duration = clip.endTime - clip.startTime;
    const newEndTime = newStartTime + duration;

    return this.updateClip(timeline, clipId, {
      startTime: newStartTime,
      endTime: newEndTime
    });
  }

  // 클립 정렬 (시간순)
  static sortClips(timeline: Timeline): Timeline {
    const updatedTracks = timeline.tracks.map(track => ({
      ...track,
      clips: track.clips.sort((a, b) => a.startTime - b.startTime)
    }));

    return {
      ...timeline,
      tracks: updatedTracks,
      updatedAt: new Date()
    };
  }

  // 중첩 클립 분리
  static splitOverlappingClips(timeline: Timeline): Timeline {
    const updatedTracks = timeline.tracks.map(track => {
      const sortedClips = [...track.clips].sort((a, b) => a.startTime - b.startTime);
      const nonOverlappingClips: Clip[] = [];

      for (const clip of sortedClips) {
        const lastClip = nonOverlappingClips[nonOverlappingClips.length - 1];

        if (!lastClip || lastClip.endTime <= clip.startTime) {
          nonOverlappingClips.push(clip);
        } else {
          // 겹치는 부분 분리
          const overlapStart = clip.startTime;
          const overlapEnd = lastClip.endTime;

          if (overlapEnd < clip.endTime) {
            // 첫 번째 클립: 겹치 시작까지
            nonOverlappingClips.push({
              ...clip,
              endTime: overlapStart,
              duration: overlapStart - clip.startTime
            });

            // 두 번째 클립: 겹치 끝 이후
            nonOverlappingClips.push({
              ...clip,
              id: uuidv4(),
              startTime: overlapEnd,
              duration: clip.endTime - overlapEnd
            });
          }
        }
      }

      return {
        ...track,
        clips: nonOverlappingClips
      };
    });

    // 새로운 길이 계산
    const newDuration = this.calculateTimelineDuration(updatedTracks);

    return {
      ...timeline,
      tracks: updatedTracks,
      duration: newDuration,
      updatedAt: new Date()
    };
  }

  // 타임라인 전체 길이 계산
  private static calculateTimelineDuration(tracks: Track[]): number {
    let maxEndTime = 0;

    for (const track of tracks) {
      for (const clip of track.clips) {
        maxEndTime = Math.max(maxEndTime, clip.endTime);
      }
    }

    return maxEndTime;
  }

  // 기본 트랙 이름
  private static getDefaultTrackName(type: Track['type']): string {
    const names = {
      video: '비디오',
      audio: '오디오',
      text: '텍스트',
      image: '이미지'
    };
    return names[type] || '트랙';
  }

  // 기본 트랙 색상
  private static getDefaultTrackColor(type: Track['type']): string {
    const colors = {
      video: '#3b82f6',
      audio: '#10b981',
      text: '#f59e0b',
      image: '#8b5cf6'
    };
    return colors[type] || '#64748b';
  }

  // 기본 트랙 높이
  private static getDefaultTrackHeight(type: Track['type']): number {
    const heights = {
      video: 80,
      audio: 60,
      text: 50,
      image: 70
    };
    return heights[type] || 60;
  }

  // 클립 유효성 검사
  static validateClip(clip: Partial<Clip>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!clip.startTime || clip.startTime < 0) {
      errors.push('시작 시간은 0 이상이어야 합니다.');
    }

    if (!clip.endTime || clip.endTime <= 0) {
      errors.push('종료 시간은 0보다 커야 합니다.');
    }

    if (clip.startTime >= clip.endTime) {
      errors.push('종료 시간은 시작 시간보다 커야 합니다.');
    }

    if (clip.duration && clip.duration <= 0) {
      errors.push('지속 시간은 0보다 커야 합니다.');
    }

    if (clip.volume !== undefined && (clip.volume < 0 || clip.volume > 2)) {
      errors.push('볼륨은 0에서 2 사이여야 합니다.');
    }

    if (clip.opacity !== undefined && (clip.opacity < 0 || clip.opacity > 1)) {
      errors.push('투명도는 0에서 1 사이여야 합니다.');
    }

    if (clip.speed !== undefined && (clip.speed <= 0 || clip.speed > 4)) {
      errors.push('재생 속도는 0보다 커야 합니다.');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 트랙 유효성 검사
  static validateTrack(track: Partial<Track>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!track.name || track.name.trim() === '') {
      errors.push('트랙 이름이 필요합니다.');
    }

    if (track.clips) {
      for (const clip of track.clips) {
        const validation = this.validateClip(clip);
        if (!validation.valid) {
          errors.push(...validation.errors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 타임라인 유효성 검사
  static validateTimeline(timeline: Partial<Timeline>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!timeline.name || timeline.name.trim() === '') {
      errors.push('타임라인 이름이 필요합니다.');
    }

    if (timeline.tracks) {
      for (const track of timeline.tracks) {
        const validation = this.validateTrack(track);
        if (!validation.valid) {
          errors.push(...validation.errors);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // 타임라인 JSON 직렬화
  static toJSON(timeline: Timeline): string {
    return JSON.stringify(timeline, null, 2);
  }

  // JSON에서 타임라인 복원
  static fromJSON(jsonString: string): Timeline {
    try {
      const data = JSON.parse(jsonString);
      return data as Timeline;
    } catch (error) {
      throw new Error('유효하지 않은 타임라인 데이터입니다.');
    }
  }

  // 클립 복제
  static cloneClip(clip: Clip, offsetTime: number = 0): Clip {
    return {
      ...clip,
      id: uuidv4(),
      startTime: clip.startTime + offsetTime,
      endTime: clip.endTime + offsetTime,
      transform: clip.transform ? { ...clip.transform } : undefined
    };
  }

  // 트랙 복제
  static cloneTrack(track: Track): Track {
    return {
      ...track,
      id: uuidv4(),
      clips: track.clips.map(clip => this.cloneClip(clip))
    };
  }

  // 시간 축소/확장
  static stretchClip(timeline: Timeline, clipId: string, scaleFactor: number): Timeline {
    const clip = timeline.tracks
      .flatMap(track => track.clips)
      .find(clip => clip.id === clipId);

    if (!clip || scaleFactor <= 0) return timeline;

    const centerTime = (clip.startTime + clip.endTime) / 2;
    const newStartTime = centerTime + (clip.startTime - centerTime) * scaleFactor;
    const newEndTime = centerTime + (clip.endTime - centerTime) * scaleFactor;
    const duration = newEndTime - newStartTime;

    return this.updateClip(timeline, clipId, {
      startTime: newStartTime,
      endTime: newEndTime,
      duration
    });
  }
}