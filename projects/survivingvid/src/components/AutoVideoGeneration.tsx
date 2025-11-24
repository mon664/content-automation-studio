'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, Settings, Image, Type, Music, Video, Download } from 'lucide-react';
import ToastEditor from './ToastEditor';
import { useToastEditor } from './ToastEditor';
import { ScriptRequest, ScriptResponse, FFmpegTransition, AIImageModel } from '@/types/autovid';
import { generateVideoScript } from '@/lib/gemini';
import { getVertexAIInstance } from '@/lib/vertex-ai';
import { TemplateManager } from '@/lib/templates';
import { FFMPEG_TRANSITIONS_DATA } from '@/lib/ffmpeg-transitions';

const AutoVideoGeneration: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [script, setScript] = useState<ScriptResponse | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('BLACK');
  const [selectedTransition, setSelectedTransition] = useState<FFmpegTransition>('fade');
  const [selectedModel, setSelectedModel] = useState<AIImageModel>('flux-realistic');

  // 폼 상태
  const [formData, setFormData] = useState({
    subject: '',
    requestNumber: 5,
    requestLanguage: 'ko-KR',
    includeOpeningSegment: true,
    includeClosingSegment: false,
    includeImageGenPrompt: true,
    outputFormat: 'mp4',
    aspectRatio: '9:16',
    videoLength: 60,
    backgroundMusic: false,
    autoSubtitles: true
  });

  const editorRef = useToastEditor();

  // 템플릿 목록
  const templates = TemplateManager.getAllTemplates();
  const transitions = Object.entries(FFMPEG_TRANSITIONS_DATA);

  // 스크립트 생성
  const handleGenerateScript = async () => {
    if (!formData.subject.trim()) {
      alert('주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCurrentStep('스크립트 생성 중...');

    try {
      const request: ScriptRequest = {
        subject: formData.subject,
        requestNumber: formData.requestNumber,
        requestLanguage: formData.requestLanguage,
        includeOpeningSegment: formData.includeOpeningSegment,
        includeClosingSegment: formData.includeClosingSegment,
        includeImageGenPrompt: formData.includeImageGenPrompt
      };

      const generatedScript = await generateVideoScript(request);
      setScript(generatedScript);

      // 에디터에 스크립트 내용 표시
      if (editorRef.setContent) {
        const scriptContent = formatScriptForEditor(generatedScript);
        editorRef.setContent(scriptContent);
      }

      setProgress(25);
      setCurrentStep('스크립트 생성 완료');
    } catch (error) {
      console.error('스크립트 생성 오류:', error);
      alert('스크립트 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 이미지 생성
  const handleGenerateImages = async () => {
    if (!script) {
      alert('먼저 스크립트를 생성해주세요.');
      return;
    }

    setIsGenerating(true);
    setCurrentStep('이미지 생성 중...');

    try {
      const vertexAI = getVertexAIInstance();
      const results = await vertexAI.generateImagesForScript(script, selectedModel);

      const allImages = [results.opening, ...results.snippets].filter(Boolean);
      setImages(allImages);

      setProgress(50);
      setCurrentStep('이미지 생성 완료');
    } catch (error) {
      console.error('이미지 생성 오류:', error);
      alert('이미지 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 비디오 생성
  const handleGenerateVideo = async () => {
    if (!script || images.length === 0) {
      alert('스크립트와 이미지 생성을 먼저 완료해주세요.');
      return;
    }

    setIsGenerating(true);
    setProgress(50);
    setCurrentStep('비디오 조립 중...');

    try {
      // 여기서 실제 FFmpeg 처리를 구현
      // 지금은 시뮬레이션
      for (let i = 50; i <= 100; i += 10) {
        setProgress(i);
        setCurrentStep(`비디오 처리 중... ${i}%`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setCurrentStep('비디오 생성 완료!');
      alert('비디오 생성이 완료되었습니다.');
    } catch (error) {
      console.error('비디오 생성 오류:', error);
      alert('비디오 생성에 실패했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 전체 프로세스 실행
  const handleGenerateFullVideo = async () => {
    if (!formData.subject.trim()) {
      alert('주제를 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // 1. 스크립트 생성
      setCurrentStep('스크립트 생성 중...');
      await handleGenerateScript();

      // 2. 이미지 생성
      setCurrentStep('이미지 생성 중...');
      await handleGenerateImages();

      // 3. 비디오 생성
      setCurrentStep('비디오 조립 중...');
      await handleGenerateVideo();

      setCurrentStep('모든 작업 완료!');
    } catch (error) {
      console.error('전체 프로세스 오류:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // 스크립트 포맷팅
  const formatScriptForEditor = (scriptData: ScriptResponse): string => {
    let content = `<h1>${scriptData.title}</h1>\n\n`;

    if (scriptData.openingSegment) {
      content += `<h2>오프닝</h2>\n`;
      content += `<p><strong>검색 키워드:</strong> ${scriptData.openingSegment.videoSearchKeyword.join(', ')}</p>\n`;
      content += `<p><strong>이미지 프롬프트:</strong> ${scriptData.openingSegment.imageGenPrompt}</p>\n`;
      content += `<div>\n`;
      scriptData.openingSegment.script.forEach((line, index) => {
        content += `<p>${line}</p>\n`;
      });
      content += `</div>\n\n`;
    }

    content += `<h2>본문</h2>\n`;

    scriptData.snippets.forEach((snippet) => {
      content += `<h3>${snippet.rank}. ${snippet.segmentTitle}</h3>\n`;
      content += `<p><strong>검색 키워드:</strong> ${snippet.videoSearchKeyword.join(', ')}</p>\n`;
      content += `<p><strong>이미지 프롬프트:</strong> ${snippet.imageGenPrompt}</p>\n`;
      content += `<div>\n`;
      snippet.script.forEach((line) => {
        content += `<p>${line}</p>\n`;
      });
      content += `</div>\n\n`;
    });

    return content;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            AI 자동 영상 생성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">기본 설정</TabsTrigger>
              <TabsTrigger value="style">스타일 설정</TabsTrigger>
              <TabsTrigger value="advanced">고급 옵션</TabsTrigger>
              <TabsTrigger value="preview">미리보기</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">영상 주제</Label>
                <Input
                  id="subject"
                  placeholder="예: 세상에서 가장 위험한 관광지"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  disabled={isGenerating}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="requestNumber">생성할 파트 수</Label>
                  <Select
                    value={formData.requestNumber.toString()}
                    onValueChange={(value) => setFormData({ ...formData, requestNumber: parseInt(value) })}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 5, 7, 10].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num}개</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">언어</Label>
                  <Select
                    value={formData.requestLanguage}
                    onValueChange={(value) => setFormData({ ...formData, requestLanguage: value })}
                    disabled={isGenerating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ko-KR">한국어</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                      <SelectItem value="ja-JP">日本語</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="opening"
                  checked={formData.includeOpeningSegment}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeOpeningSegment: checked })}
                  disabled={isGenerating}
                />
                <Label htmlFor="opening">오프닝 포함</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="image-prompts"
                  checked={formData.includeImageGenPrompt}
                  onCheckedChange={(checked) => setFormData({ ...formData, includeImageGenPrompt: checked })}
                  disabled={isGenerating}
                />
                <Label htmlFor="image-prompts">이미지 생성 프롬프트 포함</Label>
              </div>
            </TabsContent>

            <TabsContent value="style" className="space-y-4">
              <div className="space-y-2">
                <Label>템플릿 선택</Label>
                <div className="grid grid-cols-4 gap-2">
                  {templates.map((template) => (
                    <Button
                      key={template.Id}
                      variant={selectedTemplate === template.TemplateName ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTemplate(template.TemplateName)}
                      disabled={isGenerating}
                    >
                      {template.TemplateName}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>전환 효과</Label>
                <Select value={selectedTransition} onValueChange={(value: FFmpegTransition) => setSelectedTransition(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {transitions.map(([key, transition]) => (
                      <SelectItem key={key} value={key as FFmpegTransition}>
                        {transition.name} - {transition.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>이미지 모델</Label>
                <Select value={selectedModel} onValueChange={(value: AIImageModel) => setSelectedModel(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="animagine31">애니메이션 스타일</SelectItem>
                    <SelectItem value="chibitoon">치비 만화 스타일</SelectItem>
                    <SelectItem value="enna-sketch">스케치 스타일</SelectItem>
                    <SelectItem value="flux-dark">다크톤</SelectItem>
                    <SelectItem value="flux-realistic">사실적</SelectItem>
                    <SelectItem value="flux-webtoon">웹툰 스타일</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aspectRatio">화면 비율</Label>
                  <Select value={formData.aspectRatio} onValueChange={(value) => setFormData({ ...formData, aspectRatio: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:16">세로 (9:16)</SelectItem>
                      <SelectItem value="16:9">가로 (16:9)</SelectItem>
                      <SelectItem value="1:1">정사각형 (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoLength">영상 길이 (초)</Label>
                  <div className="px-3">
                    <Slider
                      value={[formData.videoLength]}
                      onValueChange={(value) => setFormData({ ...formData, videoLength: value[0] })}
                      max={300}
                      min={30}
                      step={30}
                      disabled={isGenerating}
                    />
                    <div className="text-sm text-muted-foreground mt-1">{formData.videoLength}초</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="background-music"
                  checked={formData.backgroundMusic}
                  onCheckedChange={(checked) => setFormData({ ...formData, backgroundMusic: checked })}
                  disabled={isGenerating}
                />
                <Label htmlFor="background-music">배경 음악 추가</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-subtitles"
                  checked={formData.autoSubtitles}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoSubtitles: checked })}
                  disabled={isGenerating}
                />
                <Label htmlFor="auto-subtitles">자동 자막 생성</Label>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <div className="space-y-2">
                <Label>스크립트 미리보기</Label>
                <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                  {script ? (
                    <div dangerouslySetInnerHTML={{ __html: formatScriptForEditor(script) }} />
                  ) : (
                    <p className="text-muted-foreground">스크립트가 생성되지 않았습니다.</p>
                  )}
                </div>
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <Label>생성된 이미지 ({images.length}개)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <img src={image} alt={`Generated image ${index + 1}`} className="w-full h-24 object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator />

          <div className="flex gap-2">
            <Button onClick={handleGenerateScript} disabled={isGenerating}>
              <Type className="h-4 w-4 mr-2" />
              스크립트 생성
            </Button>
            <Button onClick={handleGenerateImages} disabled={isGenerating || !script}>
              <Image className="h-4 w-4 mr-2" />
              이미지 생성
            </Button>
            <Button onClick={handleGenerateFullVideo} disabled={isGenerating} className="bg-green-600 hover:bg-green-700">
              <Play className="h-4 w-4 mr-2" />
              전체 자동 생성
            </Button>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{currentStep}</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AutoVideoGeneration;