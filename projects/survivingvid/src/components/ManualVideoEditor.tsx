'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { TimelineEditor } from '@/lib/timeline';
import { Timeline, Track, Clip, TimelineState } from '@/types/timeline';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play, Pause, SkipBack, SkipForward,
  Plus, Trash2, Download, Upload, Save,
  Film, Image, Music, Type, Settings,
  Scissors, Copy, Layers, Clock, Volume2, VolumeX,
  ZoomIn, ZoomOut, Eye, EyeOff, Lock, Unlock
} from 'lucide-react';


const ManualVideoEditor: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [timelineState, setTimelineState] = useState<TimelineState>({
    timeline: null,
    currentTime: 0,
    isPlaying: false,
    selectedClipId: null,
    selectedTrackId: null,
    zoom: 1,
    scrollOffset: 0,
    showWaveforms: true,
    showThumbnails: true
  });

  const [projectName, setProjectName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedClip, setDraggedClip] = useState<Clip | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const timelineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const playbackRef = useRef<NodeJS.Timeout | null>(null);

  // 타임라인 초기화
  useEffect(() => {
    const newTimeline = TimelineEditor.createTimeline('새 프로젝트');
    setTimeline(newTimeline);
    setTimelineState(prev => ({ ...prev, timeline: newTimeline }));
    setProjectName('새 프로젝트');
    setDuration(newTimeline.duration);
  }, []);

  // 재생 시간 업데이트
  useEffect(() => {
    if (timelineState.isPlaying) {
      playbackRef.current = setInterval(() => {
        setTimelineState(prev => {
          const newTime = Math.min(prev.currentTime + 0.1, duration);
          if (newTime >= duration) {
            return { ...prev, currentTime: 0, isPlaying: false };
          }
          return { ...prev, currentTime: newTime };
        });
      }, 100);
    } else {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current);
      }
    };
  }, [timelineState.isPlaying, duration]);

  // 시간 포맷팅
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);

    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms
      .toString()
      .padStart(2, '0')}`;
  };

  // 타임라인에서 시간을 픽셀로 변환
  const timeToPixels = (time: number): number => {
    return time * timelineState.zoom * 50; // 50px per second at 100% zoom
  };

  // 픽셀을 시간으로 변환
  const pixelsToTime = (pixels: number): number => {
    return pixels / (timelineState.zoom * 50);
  };

  // 트랙 추가
  const addTrack = (type: Track['type']) => {
    if (!timeline) return;

    const updatedTimeline = TimelineEditor.addTrack(timeline, type);
    setTimeline(updatedTimeline);
    setTimelineState(prev => ({ ...prev, timeline: updatedTimeline }));
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !timeline) return;

    let updatedTimeline = timeline;

    for (const file of files) {
      const fileType = file.type.startsWith('video/') ? 'video' :
                      file.type.startsWith('audio/') ? 'audio' :
                      file.type.startsWith('image/') ? 'image' : 'video';

      // 트랙이 없으면 생성
      if (!updatedTimeline.tracks.find(t => t.type === fileType)) {
        updatedTimeline = TimelineEditor.addTrack(updatedTimeline, fileType);
      }

      const track = updatedTimeline.tracks.find(t => t.type === fileType)!;

      let duration = 5; // 기본값
      // 비디오 파일이면 실제 길이 가져오기
      if (file.type.startsWith('video/')) {
        try {
          const video = document.createElement('video');
          video.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
          });
          duration = Math.min(video.duration, 60); // 최대 60초
          URL.revokeObjectURL(video.src);
        } catch (error) {
          console.error('비디오 길이 가져오기 실패:', error);
        }
      }

      const clip: Omit<Clip, 'id' | 'trackId'> = {
        type: fileType,
        name: file.name,
        startTime: 0,
        endTime: duration,
        duration: duration,
        source: {
          type: 'file',
          src: URL.createObjectURL(file)
        },
        volume: 1,
        muted: false,
        position: { x: 0, y: 0, width: 200, height: 150 },
        opacity: 1,
        speed: 1
      };

      updatedTimeline = TimelineEditor.addClip(updatedTimeline, track.id, clip);
    }

    setTimeline(updatedTimeline);
    setTimelineState(prev => ({ ...prev, timeline: updatedTimeline }));
    setDuration(updatedTimeline.duration);
  };

  // 클립 선택
  const selectClip = (clipId: string) => {
    setTimelineState(prev => ({
      ...prev,
      selectedClipId: clipId,
      selectedTrackId: prev.timeline?.tracks.find(t =>
        t.clips.some(c => c.id === clipId)
      )?.id || null
    }));
  };

  // 텍스트 클립 추가
  const addTextClip = () => {
    if (!timeline) return;

    let updatedTimeline = timeline;
    if (!updatedTimeline.tracks.find(t => t.type === 'text')) {
      updatedTimeline = TimelineEditor.addTrack(updatedTimeline, 'text');
    }

    const track = updatedTimeline.tracks.find(t => t.type === 'text')!;

    const clip: Omit<Clip, 'id' | 'trackId'> = {
      type: 'text',
      name: '텍스트 클립',
      startTime: 0,
      endTime: 5,
      duration: 5,
      source: {
        type: 'text',
        content: '새 텍스트',
        style: {
          fontFamily: 'Arial',
          fontSize: 24,
          fontWeight: 'normal',
          color: '#ffffff',
          textAlign: 'center'
        }
      },
      volume: 1,
      muted: false,
      position: { x: 0, y: 0, width: 200, height: 50 },
      opacity: 1,
      speed: 1
    };

    updatedTimeline = TimelineEditor.addClip(updatedTimeline, track.id, clip);
    setTimeline(updatedTimeline);
    setTimelineState(prev => ({ ...prev, timeline: updatedTimeline }));
    setDuration(updatedTimeline.duration);
  };

  // 클립 삭제
  const deleteSelectedClip = () => {
    if (!timeline || !timelineState.selectedClipId) return;

    const updatedTimeline = TimelineEditor.removeClip(timeline, timelineState.selectedClipId);
    setTimeline(updatedTimeline);
    setTimelineState(prev => ({
      ...prev,
      timeline: updatedTimeline,
      selectedClipId: null,
      selectedTrackId: null
    }));
    setDuration(updatedTimeline.duration);
  };

  // 재생/정지 토글
  const togglePlayback = () => {
    setTimelineState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  // 시간으로 이동
  const seekTo = (time: number) => {
    setTimelineState(prev => ({ ...prev, currentTime: Math.max(0, Math.min(time, duration)) }));
  };

  // 확대/축소
  const handleZoom = (direction: 'in' | 'out') => {
    setTimelineState(prev => ({
      ...prev,
      zoom: Math.max(0.1, Math.min(5, direction === 'in' ? prev.zoom * 1.2 : prev.zoom / 1.2))
    }));
  };

  
  return (
    <Layout>
      <div className="h-screen flex flex-col bg-gray-50">
        {/* 헤더 */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-64 text-sm"
                placeholder="프로젝트 이름"
              />
              <Button
                onClick={() => {/* saveProject */}}
                variant="outline"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                저장
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Film className="w-3 h-3" />
                수동영상생성
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(duration)}
              </Badge>
            </div>
          </div>
        </div>

        {/* 미디어 라이브러리 및 툴바 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                파일 추가
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*,audio/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <Separator orientation="vertical" className="h-6" />

              <Button
                onClick={() => addTrack('video')}
                variant="ghost"
                size="sm"
              >
                <Film className="w-4 h-4 mr-1" />
                비디오
              </Button>
              <Button
                onClick={() => addTrack('audio')}
                variant="ghost"
                size="sm"
              >
                <Music className="w-4 h-4 mr-1" />
                오디오
              </Button>
              <Button
                onClick={addTextClip}
                variant="ghost"
                size="sm"
              >
                <Type className="w-4 h-4 mr-1" />
                텍스트
              </Button>
              <Button
                onClick={() => addTrack('image')}
                variant="ghost"
                size="sm"
              >
                <Image className="w-4 h-4 mr-1" />
                이미지
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleZoom('out')}
                variant="ghost"
                size="sm"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm text-gray-600 min-w-[3rem] text-center">
                {Math.round(timelineState.zoom * 100)}%
              </span>
              <Button
                onClick={() => handleZoom('in')}
                variant="ghost"
                size="sm"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => {/* exportVideo */}}
                variant="default"
                size="sm"
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                내보내기 (3 크레딧)
              </Button>
            </div>
          </div>
        </div>

        {/* 재생 컨트롤 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={togglePlayback}
              variant="outline"
              size="sm"
              className="w-10 h-10 rounded-full"
            >
              {timelineState.isPlaying ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </Button>

            <Button
              onClick={() => seekTo(0)}
              variant="ghost"
              size="sm"
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">
                {formatTime(timelineState.currentTime)} / {formatTime(duration)}
              </div>
              <Slider
                value={[timelineState.currentTime]}
                onValueChange={([value]) => seekTo(value)}
                max={duration}
                step={0.1}
                className="flex-1"
              />
            </div>

            <Select value={playbackSpeed.toString()} onValueChange={(value) => setPlaybackSpeed(parseFloat(value))}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1x</SelectItem>
                <SelectItem value="1.5">1.5x</SelectItem>
                <SelectItem value="2">2x</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 타임라인 영역 */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex">
            {/* 트랙 헤더 */}
            <div className="w-48 bg-gray-100 border-r border-gray-300 p-2 overflow-y-auto">
              <div className="space-y-2">
                {timeline?.tracks.map((track, index) => (
                  <div
                    key={track.id}
                    className={`p-2 bg-white rounded border cursor-pointer ${
                      timelineState.selectedTrackId === track.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                    onClick={() => setTimelineState(prev => ({ ...prev, selectedTrackId: track.id }))}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {track.type === 'video' && <Film className="w-4 h-4 text-blue-500" />}
                        {track.type === 'audio' && <Music className="w-4 h-4 text-green-500" />}
                        {track.type === 'text' && <Type className="w-4 h-4 text-orange-500" />}
                        {track.type === 'image' && <Image className="w-4 h-4 text-purple-500" />}
                        <span className="text-sm font-medium">{track.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {track.locked ? (
                          <Lock className="w-3 h-3 text-gray-500" />
                        ) : (
                          <Unlock className="w-3 h-3 text-gray-500" />
                        )}
                        {track.muted && (
                          <VolumeX className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* 빈 트랙 추가 버튼 */}
                <div className="space-y-1">
                  <Button
                    onClick={() => addTrack('video')}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    비디오 트랙
                  </Button>
                  <Button
                    onClick={() => addTrack('audio')}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    오디오 트랙
                  </Button>
                </div>
              </div>
            </div>

            {/* 타임라인 트랙 */}
            <div className="flex-1 bg-gray-900 overflow-auto" ref={timelineRef}>
              <div className="relative" style={{ width: `${Math.max(1000, duration * timelineState.zoom * 50)}px` }}>
                {/* 시간 룰러 */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gray-800 border-b border-gray-700 z-10">
                  <div className="flex">
                    {Array.from({ length: Math.ceil(duration) + 1 }, (_, i) => (
                      <div
                        key={i}
                        className="flex-shrink-0 border-l border-gray-600 text-xs text-gray-400 px-2 py-1"
                        style={{ width: `${timelineState.zoom * 50}px` }}
                      >
                        {formatTime(i)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 트랙 및 클립 */}
                <div className="pt-8">
                  {timeline?.tracks.map((track, trackIndex) => (
                    <div
                      key={track.id}
                      className={`h-16 border-b border-gray-700 relative ${
                        timelineState.selectedTrackId === track.id ? 'bg-gray-800' : ''
                      }`}
                      style={{ height: `${track.height}px` }}
                    >
                      {/* 재생 헤드 */}
                      {timelineState.isPlaying && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                          style={{ left: `${timelineState.currentTime * timelineState.zoom * 50}px` }}
                        />
                      )}

                      {/* 클립 */}
                      {track.clips.map((clip) => (
                        <div
                          key={clip.id}
                          className={`absolute top-1 bottom-1 rounded cursor-move border-2 ${
                            timelineState.selectedClipId === clip.id
                              ? 'border-blue-400 bg-blue-900 bg-opacity-75'
                              : 'border-gray-600 bg-gray-700 bg-opacity-75'
                          } hover:bg-opacity-90`}
                          style={{
                            left: `${clip.startTime * timelineState.zoom * 50}px`,
                            width: `${(clip.endTime - clip.startTime) * timelineState.zoom * 50}px`,
                            backgroundColor: track.color + '99'
                          }}
                          onClick={() => selectClip(clip.id)}
                          draggable
                          onDragStart={(e) => {
                            setDraggedClip(clip);
                            setIsDragging(true);
                          }}
                          onDragEnd={() => {
                            setIsDragging(false);
                            setDraggedClip(null);
                          }}
                        >
                          <div className="p-1 text-xs text-white truncate">
                            {clip.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* 드롭 영역 */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-10 z-30 pointer-events-none" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 클립 속성 패널 */}
        {timelineState.selectedClipId && (
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-900">클립 속성</h3>
              <Button
                onClick={deleteSelectedClip}
                variant="ghost"
                size="sm"
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs text-gray-600">시작 시간</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">종료 시간</Label>
                <Input
                  type="number"
                  step="0.1"
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">볼륨</Label>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  defaultValue={[1]}
                  className="h-8"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-600">재생 속도</Label>
                <Input
                  type="number"
                  step="0.1"
                  defaultValue="1"
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );

export default ManualVideoEditor;