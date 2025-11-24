'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Play,
  Wand2,
  Settings,
  Sparkles,
  Clock,
  CreditCard,
  Film,
  Image,
  Music,
  Type,
  Download,
  Save,
  Loader2
} from 'lucide-react';

interface VideoGenerationRequest {
  subject: string;
  style: 'professional' | 'casual' | 'dramatic' | 'educational';
  duration: number;
  includeSubtitles: boolean;
  includeBackgroundMusic: boolean;
  voiceType: 'male' | 'female' | 'neutral';
  aspectRatio: '16:9' | '9:16' | '1:1';
  quality: 'standard' | 'high' | 'premium';
}

interface GenerationStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress: number;
  details?: string;
}

const AutoVideoGeneration: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [request, setRequest] = useState<VideoGenerationRequest>({
    subject: '',
    style: 'professional',
    duration: 60,
    includeSubtitles: true,
    includeBackgroundMusic: true,
    voiceType: 'neutral',
    aspectRatio: '16:9',
    quality: 'high'
  });
  const [generationSteps, setGenerationSteps] = useState<GenerationStep[]>([
    { id: '1', name: '스크립트 생성', status: 'pending', progress: 0 },
    { id: '2', name: '이미지 생성', status: 'pending', progress: 0 },
    { id: '3', name: '음성 합성', status: 'pending', progress: 0 },
    { id: '4', name: '배경 음악', status: 'pending', progress: 0 },
    { id: '5', name: '영상 렌더링', status: 'pending', progress: 0 }
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateCredits = (request: VideoGenerationRequest): number => {
    let credits = 5; // 기본 크레딧

    // 스타일별 추가 크레딧
    if (request.style === 'professional') credits += 2;
    if (request.style === 'dramatic') credits += 1;

    // 길이별 추가 크레딧
    if (request.duration > 60) credits += 2;
    if (request.duration > 120) credits += 3;

    // 품질별 추가 크레딧
    if (request.quality === 'premium') credits += 3;
    if (request.quality === 'high') credits += 1;

    // 자막 추가
    if (request.includeSubtitles) credits += 1;

    // 배경음악 추가
    if (request.includeBackgroundMusic) credits += 1;

    return credits;
  };

  const updateStepProgress = (stepId: string, progress: number, status: GenerationStep['status'], details?: string) => {
    setGenerationSteps(prev => prev.map(step =>
      step.id === stepId
        ? { ...step, progress, status, details }
        : step
    ));
  };

  const handleGenerate = async () => {
    if (!subject.trim()) {
      setError('주제를 입력해주세요.');
      return;
    }

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const requiredCredits = calculateCredits({ ...request, subject });
    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);

    if (availableCredits < requiredCredits) {
      setError(`크레딧이 부족합니다. 필요한 크레딧: ${requiredCredits}, 보유 크레딧: ${availableCredits}`);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);

    // 초기화
    setGenerationSteps(prev => prev.map(step => ({
      ...step,
      status: 'pending',
      progress: 0,
      details: undefined
    })));

    try {
      // Step 1: 스크립트 생성
      setCurrentStep(0);
      updateStepProgress('1', 0, 'processing', 'AI가 스크립트를 생성 중입니다...');

      const scriptResponse = await fetch('/api/ai/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          description,
          style: request.style,
          duration: request.duration,
          language: 'ko-KR'
        })
      });

      if (!scriptResponse.ok) throw new Error('스크�립트 생성 실패');

      updateStepProgress('1', 100, 'completed', '스크립트 생성 완료');

      // Step 2: 이미지 생성
      setCurrentStep(1);
      updateStepProgress('2', 0, 'processing', 'AI 이미지를 생성 중입니다...');

      const imageResponse = await fetch('/api/ai/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          style: request.style,
          count: Math.ceil(request.duration / 10), // 10초당 1개 이미지
          quality: request.quality
        })
      });

      if (!imageResponse.ok) throw new Error('이미지 생성 실패');

      updateStepProgress('2', 100, 'completed', '이미지 생성 완료');

      // Step 3: 음성 합성
      setCurrentStep(2);
      updateStepProgress('3', 0, 'processing', '음성을 합성 중입니다...');

      const voiceResponse = await fetch('/api/ai/generate-voice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: 'generated_script_here', // 실제로는 Step 1에서 받은 스크립트
          voiceType: request.voiceType,
          language: 'ko-KR'
        })
      });

      if (!voiceResponse.ok) throw new Error('음성 합성 실패');

      updateStepProgress('3', 100, 'completed', '음성 합성 완료');

      // Step 4: 배경 음악 (선택사항)
      if (request.includeBackgroundMusic) {
        setCurrentStep(3);
        updateStepProgress('4', 0, 'processing', '배경 음악을 선택 중입니다...');

        // 실제로는 음악 라이브러리에서 적절한 음악 선택 또는 생성
        await new Promise(resolve => setTimeout(resolve, 2000)); // 시뮬레이션

        updateStepProgress('4', 100, 'completed', '배경 음악 선택 완료');
      } else {
        updateStepProgress('4', 100, 'completed', '배경 음악 없음');
      }

      // Step 5: 영상 렌더링
      setCurrentStep(4);
      updateStepProgress('5', 0, 'processing', '영상을 렌더링 중입니다...');

      const renderResponse = await fetch('/api/ai/render-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          style: request.style,
          duration: request.duration,
          aspectRatio: request.aspectRatio,
          quality: request.quality,
          includeSubtitles: request.includeSubtitles,
          includeBackgroundMusic: request.includeBackgroundMusic,
          userId: user.uid
        })
      });

      if (!renderResponse.ok) throw new Error('영상 렌더링 실패');

      const renderData = await renderResponse.json();

      updateStepProgress('5', 100, 'completed', '영상 렌더링 완료');

      // 크레딧 차감
      // await CreditService.spendCredits(user.uid, 'auto_video_generation', requiredCredits);

      setGeneratedVideo(renderData.videoUrl);

    } catch (error) {
      console.error('영상 생성 오류:', error);
      setError(error instanceof Error ? error.message : '영상 생성에 실패했습니다.');

      // 현재 단계 실패 표시
      if (currentStep < generationSteps.length) {
        updateStepProgress(
          generationSteps[currentStep].id,
          0,
          'error',
          error instanceof Error ? error.message : '알 수 없는 오류'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">AI 자동 영상 생성</h1>
          <p className="text-gray-600 mt-2">인공지능이 영상 주제를 분석하여 자동으로 고품질 영상을 생성합니다</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Wand2 className="w-3 h-3" />
              AI 스크립트 생성
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Image className="w-3 h-3" />
              AI 이미지 생성
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              자동 음성 합성
            </Badge>
          </div>
        </div>

        {/* 영상 생성 요청 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              영상 정보 입력
            </CardTitle>
            <CardDescription>
              생성할 영상의 주제와 상세 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 기본 정보 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="subject">영상 주제 *</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="예: 스마트폰 추천, 요리 레시피, 여행 정보"
                  disabled={isGenerating}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">영상 길이</Label>
                <Select
                  value={request.duration.toString()}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, duration: parseInt(value) }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30초</SelectItem>
                    <SelectItem value="60">1분</SelectItem>
                    <SelectItem value="120">2분</SelectItem>
                    <SelectItem value="180">3분</SelectItem>
                    <SelectItem value="300">5분</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">상세 설명 (선택사항)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="영상에 포함하고 싶은 특정 내용이나 스타일을 자유롭게 설명해주세요"
                rows={3}
                disabled={isGenerating}
              />
            </div>

            <Separator />

            {/* 영상 스타일 설정 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>영상 스타일</Label>
                <Select
                  value={request.style}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, style: value as any }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">전문적/뉴스 스타일</SelectItem>
                    <SelectItem value="casual">캐주얼/유튜브 스타일</SelectItem>
                    <SelectItem value="dramatic">드라마틱/감동적</SelectItem>
                    <SelectItem value="educational">교육적/정보성</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>음성 타입</Label>
                <Select
                  value={request.voiceType}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, voiceType: value as any }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">남성 목소리</SelectItem>
                    <SelectItem value="female">여성 목소리</SelectItem>
                    <SelectItem value="neutral">중립적 목소리</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>화면 비율</Label>
                <Select
                  value={request.aspectRatio}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, aspectRatio: value as any }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">가로 (16:9) - 유튜브</SelectItem>
                    <SelectItem value="9:16">세로 (9:16) - 쇼츠/릴스</SelectItem>
                    <SelectItem value="1:1">정사각형 (1:1) - 인스타그램</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>영상 품질</Label>
                <Select
                  value={request.quality}
                  onValueChange={(value) => setRequest(prev => ({ ...prev, quality: value as any }))}
                  disabled={isGenerating}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">표준 (720p)</SelectItem>
                    <SelectItem value="high">고품질 (1080p)</SelectItem>
                    <SelectItem value="premium">프리미엄 (4K)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 추가 옵션 */}
            <div className="space-y-4">
              <Label>추가 옵션</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={request.includeSubtitles}
                    onChange={(e) => setRequest(prev => ({ ...prev, includeSubtitles: e.target.checked }))}
                    disabled={isGenerating}
                    className="rounded"
                  />
                  <span className="text-sm">자막 포함 (+1 크레딧)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={request.includeBackgroundMusic}
                    onChange={(e) => setRequest(prev => ({ ...prev, includeBackgroundMusic: e.target.checked }))}
                    disabled={isGenerating}
                    className="rounded"
                  />
                  <span className="text-sm">배경 음악 포함 (+1 크레딧)</span>
                </label>
              </div>
            </div>

            {/* 크레딧 정보 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">필요 크레딧</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {calculateCredits({ ...request, subject })} 크레딧
                </Badge>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-blue-700">보유 크레딧</span>
                <Badge variant="outline" className="border-blue-300 text-blue-700">
                  {(userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0)} 크레딧
                </Badge>
              </div>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* 생성 버튼 */}
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !subject.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  영상 생성 중...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI 영상 생성하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 생성 진행 상태 */}
        {isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 animate-spin" />
                생성 진행 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {generationSteps.map((step, index) => (
                  <div key={step.id} className="flex items-center space-x-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step.status === 'completed' ? 'bg-green-100 text-green-800' :
                      step.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      step.status === 'error' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {step.status === 'completed' ? '✓' :
                       step.status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                       step.status === 'error' ? '✕' :
                       index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-medium ${
                          step.status === 'error' ? 'text-red-800' :
                          step.status === 'completed' ? 'text-green-800' :
                          step.status === 'processing' ? 'text-blue-800' :
                          'text-gray-700'
                        }`}>
                          {step.name}
                        </span>
                        {step.status === 'processing' && (
                          <span className="text-sm text-blue-600">{step.progress}%</span>
                        )}
                      </div>
                      {step.details && (
                        <p className={`text-xs ${
                          step.status === 'error' ? 'text-red-600' :
                          step.status === 'completed' ? 'text-green-600' :
                          step.status === 'processing' ? 'text-blue-600' :
                          'text-gray-500'
                        }`}>
                          {step.details}
                        </p>
                      )}
                      {step.status === 'processing' && (
                        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 생성 완료 */}
        {generatedVideo && !isGenerating && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Film className="w-5 h-5" />
                영상 생성 완료
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video
                    controls
                    className="w-full h-full"
                    src={generatedVideo}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    다운로드
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Save className="w-4 h-4 mr-2" />
                    프로젝트 저장
                  </Button>
                  <Button className="flex-1">
                    <Play className="w-4 h-4 mr-2" />
                    수동 편집
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AutoVideoGeneration;
