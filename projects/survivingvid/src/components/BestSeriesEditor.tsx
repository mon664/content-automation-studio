'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Play, Pause, Save, Plus, Trash2, Copy,
  Star, Zap, Layers, Clock, Film,
  FileText, Settings, ChevronRight,
  ChevronDown, Eye, Edit, Check
} from 'lucide-react';

interface SeriesEpisode {
  id: string;
  title: string;
  description: string;
  duration: number;
  status: 'draft' | 'processing' | 'completed' | 'error';
  script?: any;
  images?: string[];
  videoUrl?: string;
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Series {
  id: string;
  name: string;
  description: string;
  totalEpisodes: number;
  episodes: SeriesEpisode[];
  template: string;
  transition: string;
  style: string;
  status: 'draft' | 'processing' | 'completed' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const BestSeriesEditor: React.FC = () => {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  // 폼 상태
  const [formData, setFormData] = useState({
    seriesName: '',
    seriesDescription: '',
    totalEpisodes: 5,
    mainTopic: '',
    episodePattern: 'sequential', // sequential, random, themed
    template: 'BLACK',
    transition: 'fade',
    style: 'professional',
    autoGenerate: true,
    usePreview: true,
    batchMode: true
  });

  // 시리즈 생성
  const handleCreateSeries = () => {
    if (!formData.seriesName.trim() || !formData.mainTopic.trim()) {
      alert('시리즈명과 메인 주제를 입력해주세요.');
      return;
    }

    const newSeries: Series = {
      id: 'series-' + Date.now(),
      name: formData.seriesName,
      description: formData.seriesDescription,
      totalEpisodes: formData.totalEpisodes,
      episodes: [],
      template: formData.template,
      transition: formData.transition,
      style: formData.style,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 에피소드 자동 생성
    for (let i = 1; i <= formData.totalEpisodes; i++) {
      const episode: SeriesEpisode = {
        id: `episode-${newSeries.id}-${i}`,
        title: `${formData.mainTopic} - ${i}부`,
        description: generateEpisodeDescription(formData.mainTopic, i, formData.totalEpisodes),
        duration: 60,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      newSeries.episodes.push(episode);
    }

    setSeries(prev => [...prev, newSeries]);
    setSelectedSeries(newSeries);

    // 자동 생성 옵션이면 바로 생성 시작
    if (formData.autoGenerate) {
      handleGenerateAllEpisodes(newSeries);
    }
  };

  // 에피소드 설명 생성
  const generateEpisodeDescription = (topic: string, episodeNumber: number, totalEpisodes: number): string => {
    const patterns = {
      sequential: [
        `${topic} - ${episodeNumber}/${totalEpisodes}부: 기본 내용`,
        `${topic}의 ${episodeNumber}번째 이야기: 핵심 개념과 응용`,
        `${topic} 완벽 가이드 - ${episodeNumber}부: 심화 과정`
      ],
      random: [
        `${topic} - ${episodeNumber}부: 독특한 관점과 분석`,
        `${topic} - ${episodeNumber}부: 예상치 못한 정보 공개`,
        `${topic} - ${episodeNumber}부: 전문가의 인사이트`
      ],
      themed: [
        `${topic} - ${episodeNumber}부: 역사적 배경과 기원`,
        `${topic} - ${episodeNumber}부: 현재 동향과 미래 예측`,
        `${topic} - ${episodeNumber}부: 실용 팁과 꿀팁`
      ]
    };

    const stylePatterns = patterns[formData.episodePattern as keyof typeof patterns] || patterns.sequential;
    return stylePatterns[(episodeNumber - 1) % stylePatterns.length];
  };

  // 전체 에피소드 생성
  const handleGenerateAllEpisodes = async (targetSeries: Series = selectedSeries) => {
    if (!targetSeries) return;

    setIsGenerating(true);
    setGenerationProgress(0);

    const episodesToGenerate = targetSeries.episodes.filter(ep => ep.status === 'draft');
    const totalEpisodes = episodesToGenerate.length;

    try {
      for (let i = 0; i < totalEpisodes; i++) {
        const episode = episodesToGenerate[i];

        setCurrentStep(`에피소드 ${episode.title} 생성 중... (${i + 1}/${totalEpisodes})`);
        setGenerationProgress((i / totalEpisodes) * 100);

        // 스크립트 생성 시뮬레이션
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 에피소드 상태 업데이트
        setSeries(prev => ({
          ...prev,
          episodes: prev.episodes.map(ep =>
            ep.id === episode.id
              ? { ...ep, status: 'completed' }
              : ep
          )
        }));
      }

      setCurrentStep('모든 에피소드 생성 완료');
      setGenerationProgress(100);

      // 시리즈 상태 업데이트
      setSeries(prev => ({
        ...prev,
        map: prev.map(s =>
          s.id === targetSeries.id
            ? { ...s, status: 'completed', updatedAt: new Date() }
            : s
        )
      }));

    } catch (error) {
      console.error('시리즈 생성 오류:', error);
      setCurrentStep('생성 중 오류 발생');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  // 단일 에피소드 생성
  const handleGenerateEpisode = async (episode: SeriesEpisode) => {
    if (!selectedSeries) return;

    setSeries(prev => ({
      ...prev,
      episodes: prev.episodes.map(ep =>
        ep.id === episode.id
          ? { ...ep, status: 'processing' }
          : ep
      )
    }));

    try {
      // 실제 AI 생성 로직 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000));

      setSeries(prev => ({
        ...prev,
        episodes: prev.episodes.map(ep =>
          ep.id === episode.id
            ? { ...ep, status: 'completed' }
            : ep
        )
      }));

    } catch (error) {
      console.error('에피소드 생성 오류:', error);

      setSeries(prev => ({
        ...prev,
        episodes: prev.episodes.map(ep =>
          ep.id === episode.id
            ? { ...ep, status: 'error' }
            : ep
        )
      }));
    }
  };

  // 시리즈 삭제
  const deleteSeries = (seriesId: string) => {
    setSeries(prev => prev.filter(s => s.id !== seriesId));
    if (selectedSeries?.id === seriesId) {
      setSelectedSeries(null);
    }
  };

  // 에피소드 삭제
  const deleteEpisode = (episodeId: string) => {
    if (!selectedSeries) return;

    const updatedEpisodes = selectedSeries.episodes.filter(ep => ep.id !== episodeId);
    const updatedSeries = {
      ...selectedSeries,
      episodes: updatedEpisodes,
      totalEpisodes: updatedEpisodes.length,
      updatedAt: new Date()
    };

    setSeries(prev => prev.map(s => s.id === updatedSeries.id ? updatedSeries : s));
    setSelectedSeries(updatedSeries);
  };

  // 시리즈 복제
  const duplicateSeries = (seriesToDuplicate: Series) => {
    const duplicatedSeries: Series = {
      ...seriesToDuplicate,
      id: 'series-' + Date.now(),
      name: seriesToDuplicate.name + ' (복사)',
      episodes: seriesToDuplicate.episodes.map(ep => ({
        ...ep,
        id: 'episode-' + Date.now() + '-' + Math.random(),
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      })),
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSeries(prev => [...prev, duplicatedSeries]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            베스트 시리즈
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="create">시리즈 생성</TabsTrigger>
              <TabsTrigger value="manage">시리즈 관리</TabsTrigger>
              <TabsTrigger value="batch">일괄 생성</TabsTrigger>
              <TabsTrigger value="export">내보내기</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 기본 정보 */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="series-name">시리즈명</Label>
                    <Input
                      id="series-name"
                      placeholder="예: AI 기술 혁명의 모든 것"
                      value={formData.seriesName}
                      onChange={(e) => setFormData({ ...formData, seriesName: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="series-description">시리즈 설명</Label>
                    <Textarea
                      id="series-description"
                      placeholder="시리즈에 대한 간단한 설명을 입력하세요."
                      value={formData.seriesDescription}
                      onChange={(e) => setFormData({ ...formData, seriesDescription: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="main-topic">메인 주제</Label>
                    <Input
                      id="main-topic"
                      placeholder="예: 인공지능, 블록체인, 웹 개발"
                      value={formData.mainTopic}
                      onChange={(e) => setFormData({ ...formData, mainTopic: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="total-episodes">총 에피소드 수</Label>
                      <Slider
                        id="total-episodes"
                        value={[formData.totalEpisodes]}
                        onValueChange={([value]) => setFormData({ ...formData, totalEpisodes: value })}
                        max={50}
                        min={3}
                        step={1}
                      />
                      <div className="text-sm text-muted-foreground mt-1">
                        {formData.totalEpisodes}개 에피소드
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="episode-pattern">에피소드 패턴</Label>
                      <Select value={formData.episodePattern} onValueChange={(value: any) => setFormData({ ...formData, episodePattern: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sequential">순차적 (1, 2, 3...)</SelectItem>
                          <SelectItem value="random">랜덤</SelectItem>
                          <SelectItem value="themed">주제별</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* 스타일 설정 */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="template">템플릿</Label>
                      <Select value={formData.template} onValueChange={(value: any) => setFormData({ ...formData, template: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="BLACK">BLACK</SelectItem>
                          <SelectItem value="WHITE">WHITE</SelectItem>
                          <SelectItem value="StoryCard-BeigeBrown">Beige Brown</SelectItem>
                          <SelectItem value="StoryCard-BeigeRed">Beige Red</SelectItem>
                          <SelectItem value="StoryCard-BlackPink">Black Pink</SelectItem>
                          <SelectItem value="StoryCard-WhiteBlue">White Blue</SelectItem>
                          <SelectItem value="StoryCard-WhiteGreen">White Green</SelectItem>
                          <SelectItem value="StoryCard-WhiteRed">White Red</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="transition">전환 효과</Label>
                      <Select value={formData.transition} onValueChange={(value: any) => setFormData({ ...formData, transition: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fade">Fade</SelectItem>
                          <SelectItem value="dissolve">Dissolve</SelectItem>
                          <SelectItem value="slide">Slide</SelectItem>
                          <SelectItem value="zoom">Zoom</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="style">스타일</Label>
                      <Select value={formData.style} onValueChange={(value: any) => setFormData({ ...formData, style: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">전문가</SelectItem>
                          <SelectItem value="casual">캐주얼</SelectItem>
                          <SelectItem value="educational">교육용</SelectItem>
                          <SelectItem value="entertainment">엔터테인먼트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 옵션 */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="auto-generate"
                        checked={formData.autoGenerate}
                        onCheckedChange={(checked) => setFormData({ ...formData, autoGenerate: checked })}
                      />
                      <Label htmlFor="auto-generate">생성 후 자동으로 내용 생성</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="use-preview"
                        checked={formData.usePreview}
                        onCheckedChange={(checked) => setFormData({ ...formData, usePreview: checked })}
                      />
                      <Label htmlFor="use-preview">미리보기 사용</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="batch-mode"
                        checked={formData.batchMode}
                        onCheckedChange={(checked) => setFormData({ ...formData, batchMode: checked })}
                      />
                      <Label htmlFor="batch-mode">일괄 처리 모드</Label>
                    </div>
                  </div>

                  <Button onClick={handleCreateSeries} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    시리즈 생성
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manage" className="space-y-4">
              {/* 시리즈 목록 */}
              <div className="space-y-4">
                {series.length === 0 ? (
                  <Alert>
                    <FileText className="h-4 w-4" />
                    <AlertDescription>
                      생성된 시리즈가 없습니다. 먼저 시리즈를 생성해주세요.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-2">
                    {series.map((s) => (
                      <div
                        key={s.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedSeries?.id === s.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedSeries(s)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{s.name}</h3>
                              <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>
                                {s.status === 'completed' && <Check className="h-3 w-3" />}
                                {s.status === 'draft' && <Clock className="h-3 w-3" />}
                                {s.status === 'processing' && <Zap className="h-3 w-3" />}
                                {s.status === 'error' && <AlertDescription className="h-3 w-3" />}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {s.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                              <span>에피소드: {s.episodes.length}/{s.totalEpisodes}</span>
                              <span>생성일: {s.createdAt.toLocaleDateString()}</span>
                              <span>수정일: {s.updatedAt.toLocaleDateString()}</span>
                            </div>
                          </div>

                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                duplicateSeries(s);
                              }}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteSeries(s.id);
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* 에피소드 목록 */}
                        {selectedSeries?.id === s.id && (
                          <div className="mt-4 pl-4 border-t pt-4">
                            <h4 className="font-medium mb-3">에피소드 목록</h4>
                            <div className="space-y-2">
                              {s.episodes.map((episode) => (
                                <div
                                  key={episode.id}
                                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">{episode.title}</div>
                                    <div className="text-xs text-muted-foreground">
                                      길이: {episode.duration}초 | 생성일: {episode.createdAt.toLocaleDateString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant={
                                        episode.status === 'completed' ? 'default' :
                                        episode.status === 'processing' ? 'destructive' :
                                        episode.status === 'error' ? 'destructive' :
                                        'secondary'
                                      }
                                    >
                                      {episode.status === 'completed' && <Check className="h-3 w-3" />}
                                      {episode.status === 'processing' && <Zap className="h-3 w-3" />}
                                      {episode.status === 'error' && <AlertDescription className="h-3 w-3" />}
                                      {episode.status === 'draft' && <Clock className="h-3 w-3" />}
                                    </Badge>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleGenerateEpisode(episode)}
                                      disabled={episode.status !== 'draft'}
                                    >
                                      <Play className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => deleteEpisode(episode.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="batch" className="space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  일괄 생성 기능은 개발 중입니다. 여러 시리즈를 동시에 생성할 수 있습니다.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="export" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                내보내기 기능은 개발 중입니다. 완성되면 플레이리스트, 자막 파일 등을 생성할 수 있습니다.
              </div>
            </TabsContent>
          </Tabs>

          {/* 생성 진행률 표시 */}
          {isGenerating && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 animate-pulse" />
                <span>{currentStep}</span>
              </div>
              <Progress value={generationProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BestSeriesEditor;