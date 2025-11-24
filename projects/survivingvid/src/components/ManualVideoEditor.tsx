'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play, Pause, SkipBack, SkipForward,
  Plus, Trash2, Download, Upload, Save,
  Film, Image, Music, Type, Settings,
  Scissors, Copy, Layers, Clock
} from 'lucide-react';

interface TimelineClip {
  id: string;
  type: 'video' | 'image' | 'text' | 'audio';
  name: string;
  duration: number; // 초
  startTime: number; // 타임라인 시작 위치 (초)
  thumbnail?: string;
  content?: string; // 텍스트 내용
  volume?: number; // 오디오 볼륨 (0-1)
  transition?: {
    type: string;
    duration: number;
  };
}

interface ManualVideoProject {
  id: string;
  name: string;
  duration: number;
  clips: TimelineClip[];
  aspectRatio: '9:16' | '16:9' | '1:1';
  resolution: {
    width: number;
    height: number;
  };
  audioTrack?: {
    id: string;
    name: string;
    volume: number;
    muted: boolean;
  };
}

const ManualVideoEditor: React.FC = () => {
  const [project, setProject] = useState<ManualVideoProject>({
    id: 'project-' + Date.now(),
    name: '새 프로젝트',
    duration: 60,
    clips: [],
    aspectRatio: '9:16',
    resolution: { width: 1080, height: 1920 }
  });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [selectedClipId, setSelectedClipId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedClipId, setDraggedClipId] = useState<string | null>(null);

  const timelineRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 타임라인에서 시간을 픽셀로 변환
  const timeToPixels = (time: number): number => {
    if (!timelineRef.current) return 0;
    const timelineWidth = timelineRef.current.offsetWidth;
    return (time / project.duration) * timelineWidth;
  };

  // 픽셀을 시간으로 변환
  const pixelsToTime = (pixels: number): number => {
    if (!timelineRef.current) return 0;
    const timelineWidth = timelineRef.current.offsetWidth;
    return (pixels / timelineWidth) * project.duration;
  };

  // 파일 업로드 처리
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    for (const file of files) {
      const clip: TimelineClip = {
        id: 'clip-' + Date.now() + '-' + Math.random(),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        name: file.name,
        duration: file.type.startsWith('video/') ? 30 : 5, // 기본값
        startTime: project.clips.length > 0 ?
          Math.max(...project.clips.map(c => c.startTime + c.duration)) : 0,
        thumbnail: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
      };

      // 비디오 파일이면 실제 길이 가져오기
      if (file.type.startsWith('video/')) {
        try {
          const video = document.createElement('video');
          video.src = URL.createObjectURL(file);
          await new Promise((resolve) => {
            video.onloadedmetadata = resolve;
          });
          clip.duration = Math.min(video.duration, 60); // 최대 60초
          URL.revokeObjectURL(video.src);
        } catch (error) {
          console.error('비디오 길이 가져오기 실패:', error);
        }
      }

      setProject(prev => ({
        ...prev,
        clips: [...prev.clips, clip]
      }));
    }
  };

  // 클립 추가
  const addTextClip = () => {
    const clip: TimelineClip = {
      id: 'text-' + Date.now(),
      type: 'text',
      name: '텍스트 클립',
      duration: 5,
      startTime: project.clips.length > 0 ?
        Math.max(...project.clips.map(c => c.startTime + c.duration)) : 0,
      content: '새 텍스트',
      volume: 1
    };

    setProject(prev => ({
      ...prev,
      clips: [...prev.clips, clip]
    }));
  };

  // 클립 삭제
  const deleteClip = (clipId: string) => {
    setProject(prev => ({
      ...prev,
      clips: prev.clips.filter(clip => clip.id !== clipId)
    }));
    if (selectedClipId === clipId) {
      setSelectedClipId(null);
    }
  };

  // 클립 복제
  const duplicateClip = (clip: TimelineClip) => {
    const newClip: TimelineClip = {
      ...clip,
      id: 'clip-' + Date.now() + '-' + Math.random(),
      startTime: clip.startTime + clip.duration,
      name: clip.name + ' (복사)'
    };

    setProject(prev => ({
      ...prev,
      clips: [...prev.clips, newClip]
    }));
  };

  // 타임라인 클릭 처리
  const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const time = pixelsToTime(x);
    setCurrentTime(Math.max(0, Math.min(time, project.duration)));
  };

  // 클립 드래그 핸들링
  const handleClipMouseDown = (clipId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setDraggedClipId(clipId);
    setIsDragging(true);
    setSelectedClipId(clipId);
  };

  // 마우스 이동 핸들링
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isDragging || !draggedClipId || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const newStartTime = pixelsToTime(x);

      setProject(prev => ({
        ...prev,
        clips: prev.clips.map(clip =>
          clip.id === draggedClipId
            ? { ...clip, startTime: Math.max(0, Math.min(newStartTime, project.duration - clip.duration)) }
            : clip
        )
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setDraggedClipId(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, draggedClipId, project.duration]);

  // 재생 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          return next >= project.duration ? 0 : next;
        });
      }, 100);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, project.duration]);

  // 선택된 클립
  const selectedClip = project.clips.find(clip => clip.id === selectedClipId);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Film className="h-5 w-5" />
            수동 영상 생성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">타임라인</TabsTrigger>
              <TabsTrigger value="clips">클립 관리</TabsTrigger>
              <TabsTrigger value="transitions">전환 효과</TabsTrigger>
              <TabsTrigger value="export">내보내기</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              {/* 프로젝트 정보 */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="project-name">프로젝트명</Label>
                  <Input
                    id="project-name"
                    value={project.name}
                    onChange={(e) => setProject(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="aspect-ratio">화면 비율</Label>
                  <select
                    id="aspect-ratio"
                    value={project.aspectRatio}
                    onChange={(e) => {
                      const [width, height] = e.target.value.split(':').map(Number);
                      setProject(prev => ({
                        ...prev,
                        aspectRatio: e.target.value as any,
                        resolution: { width, height }
                      }));
                    }}
                    className="form-control"
                  >
                    <option value="9:16">세로 (9:16)</option>
                    <option value="16:9">가로 (16:9)</option>
                    <option value="1:1">정사각형 (1:1)</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="duration">영상 길이 (초)</Label>
                  <Slider
                    id="duration"
                    value={[project.duration]}
                    onValueChange={([value]) => setProject(prev => ({ ...prev, duration: value }))}
                    max={300}
                    min={30}
                    step={30}
                  />
                  <div className="text-sm text-muted-foreground mt-1">{project.duration}초</div>
                </div>
              </div>

              {/* 미디어 추가 버튼 */}
              <div className="flex gap-2">
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  이미지/비디오 추가
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button onClick={addTextClip} variant="outline">
                  <Type className="h-4 w-4 mr-2" />
                  텍스트 추가
                </Button>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  <Music className="h-4 w-4 mr-2" />
                  오디오 추가
                </Button>
              </div>

              {/* 타임라인 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>타임라인</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {currentTime.toFixed(1)}s / {project.duration}s
                  </div>
                </div>

                {/* 컨트롤러 */}
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentTime(0)}
                  >
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentTime(project.duration)}
                  >
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <Slider
                    value={[currentTime]}
                    onValueChange={([value]) => setCurrentTime(value)}
                    max={project.duration}
                    step={0.1}
                    className="flex-1"
                  />
                </div>

                {/* 타임라인 시각화 */}
                <div
                  ref={timelineRef}
                  className="relative h-24 bg-gray-100 border rounded-lg cursor-pointer overflow-hidden"
                  onClick={handleTimelineClick}
                >
                  {/* 시간 눈금 */}
                  {[...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-0 bottom-0 w-px bg-gray-300"
                      style={{ left: `${(i / 10) * 100}%` }}
                    />
                  ))}

                  {/* 클립들 */}
                  {project.clips.map((clip) => {
                    const left = timeToPixels(clip.startTime);
                    const width = timeToPixels(clip.duration);
                    const isSelected = selectedClipId === clip.id;

                    return (
                      <div
                        key={clip.id}
                        className={`absolute top-2 bottom-2 rounded cursor-move transition-colors ${
                          isSelected
                            ? 'bg-blue-500 text-white shadow-lg z-10'
                            : clip.type === 'video'
                              ? 'bg-red-400 text-white'
                              : clip.type === 'image'
                                ? 'bg-green-400 text-white'
                                : clip.type === 'text'
                                  ? 'bg-purple-400 text-white'
                                  : 'bg-yellow-400 text-white'
                        }`}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          minWidth: '20px'
                        }}
                        onMouseDown={(e) => handleClipMouseDown(clip.id, e)}
                      >
                        <div className="flex items-center justify-between h-full px-2 text-xs truncate">
                          <span>{clip.name}</span>
                          <span>{clip.duration.toFixed(1)}s</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* 현재 시간 표시 */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-blue-600 pointer-events-none z-20"
                    style={{ left: `${timeToPixels(currentTime)}px` }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clips" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 클립 목록 */}
                <div className="space-y-2">
                  <Label>클립 목록</Label>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {project.clips.length === 0 ? (
                      <p className="text-muted-foreground text-center py-8">
                        클립이 없습니다. 미디어를 추가해주세요.
                      </p>
                    ) : (
                      project.clips.map((clip) => (
                        <div
                          key={clip.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedClipId === clip.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedClipId(clip.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant={
                                    clip.type === 'video' ? 'destructive' :
                                    clip.type === 'image' ? 'default' :
                                    clip.type === 'text' ? 'secondary' :
                                    'outline'
                                  }
                                >
                                  {clip.type === 'video' && <Film className="h-3 w-3" />}
                                  {clip.type === 'image' && <Image className="h-3 w-3" />}
                                  {clip.type === 'text' && <Type className="h-3 w-3" />}
                                  {clip.type === 'audio' && <Music className="h-3 w-3" />}
                                </Badge>
                                <span className="font-medium">{clip.name}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                시작: {clip.startTime.toFixed(1)}s, 길이: {clip.duration.toFixed(1)}s
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  duplicateClip(clip);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteClip(clip.id);
                                }}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 클립 속성 */}
                {selectedClip && (
                  <div className="space-y-4">
                    <Label>클립 속성</Label>

                    {selectedClip.type === 'text' && (
                      <div>
                        <Label htmlFor="clip-content">텍스트 내용</Label>
                        <Input
                          id="clip-content"
                          value={selectedClip.content || ''}
                          onChange={(e) => {
                            setProject(prev => ({
                              ...prev,
                              clips: prev.clips.map(clip =>
                                clip.id === selectedClipId
                                  ? { ...clip, content: e.target.value }
                                  : clip
                              )
                            }));
                          }}
                        />
                      </div>
                    )}

                    {(selectedClip.type === 'video' || selectedClip.type === 'audio') && (
                      <div>
                        <Label htmlFor="clip-volume">볼륨</Label>
                        <Slider
                          id="clip-volume"
                          value={[selectedClip.volume || 1]}
                          onValueChange={([value]) => {
                            setProject(prev => ({
                              ...prev,
                              clips: prev.clips.map(clip =>
                                clip.id === selectedClipId
                                  ? { ...clip, volume: value }
                                  : clip
                              )
                            }));
                          }}
                          max={1}
                          min={0}
                          step={0.1}
                        />
                        <div className="text-sm text-muted-foreground mt-1">
                          {Math.round((selectedClip.volume || 1) * 100)}%
                        </div>
                      </div>
                    )}

                    <div>
                      <Label htmlFor="clip-duration">지속 시간 (초)</Label>
                      <Slider
                        id="clip-duration"
                        value={[selectedClip.duration]}
                        onValueChange={([value]) => {
                          setProject(prev => ({
                            ...prev,
                            clips: prev.clips.map(clip =>
                              clip.id === selectedClipId
                                ? { ...clip, duration: value }
                                : clip
                            )
                          }));
                        }}
                        max={60}
                        min={1}
                        step={1}
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {selectedClip.duration}초
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="transitions" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                전환 효과 기능은 개발 중입니다.
              </div>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="flex gap-2">
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  비디오 내보내기
                </Button>
                <Button variant="outline">
                  <Save className="h-4 w-4 mr-2" />
                  프로젝트 저장
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                내보내기 기능은 개발 중입니다. 완성되면 MP4 형식으로 비디오를 생성할 수 있습니다.
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManualVideoEditor;