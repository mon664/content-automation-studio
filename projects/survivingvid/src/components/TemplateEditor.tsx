'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Play,
  Pause,
  Save,
  Download,
  Upload,
  Copy,
  Trash2,
  Plus,
  Settings,
  Eye,
  RefreshCw,
  Layers,
  Type,
  Music,
  Image,
  Film,
  Palette,
  Clock,
  Zap,
  CreditCard,
  Sparkles,
  Wand2,
  Monitor,
  Grid3X3,
  FileText,
  FolderOpen,
  Star,
  Loader2
} from 'lucide-react';

interface TemplateElement {
  id: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'shape' | 'background';
  name: string;
  properties: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    opacity?: number;
    rotation?: number;
    scale?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    text?: string;
    duration?: number;
    startTime?: number;
    endTime?: number;
    zIndex?: number;
    src?: string;
    borderRadius?: number;
    borderWidth?: number;
    borderColor?: string;
    borderStyle?: string;
  };
  animation?: {
    type: 'fade' | 'slide' | 'zoom' | 'rotate' | 'bounce';
    duration: number;
    delay: number;
    easing: string;
  };
}

interface Template {
  id: string;
  name: string;
  description: string;
  category: 'education' | 'entertainment' | 'news' | 'promotion' | 'custom';
  elements: TemplateElement[];
  settings: {
    width: number;
    height: number;
    duration: number;
    fps: number;
    backgroundColor: string;
    backgroundMusic?: string;
    fontFamily: string;
  };
  createdAt: string;
  updatedAt: string;
}

const TEMPLATE_CATEGORIES = [
  { value: 'education', label: '교육' },
  { value: 'entertainment', label: '엔터테인먼트' },
  { value: 'news', label: '뉴스' },
  { value: 'promotion', label: '홍보' },
  { value: 'custom', label: '사용자 정의' }
];

const ANIMATION_TYPES = [
  { value: 'fade', label: '페이드' },
  { value: 'slide', label: '슬라이드' },
  { value: 'zoom', label: '확대/축소' },
  { value: 'rotate', label: '회전' },
  { value: 'bounce', label: '바운스' }
];

const FONT_FAMILIES = [
  'Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Courier New',
  'Comic Sans MS', 'Impact', 'Trebuchet MS', 'Tahoma', 'Palatino', 'Garamond'
];

export default function TemplateEditor() {
  const { user, userProfile } = useAuth();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Template | null>(null);
  const [selectedElement, setSelectedElement] = useState<TemplateElement | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // 기본 템플릿 생성
  const createNewTemplate = useCallback(() => {
    const newTemplate: Template = {
      id: `template_${Date.now()}`,
      name: '새 템플릿',
      description: '',
      category: 'custom',
      elements: [],
      settings: {
        width: 1920,
        height: 1080,
        duration: 30,
        fps: 30,
        backgroundColor: '#000000',
        fontFamily: 'Arial'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setCurrentTemplate(newTemplate);
  }, []);

  // 요소 추가
  const addElement = useCallback((type: TemplateElement['type']) => {
    if (!currentTemplate) return;

    const newElement: TemplateElement = {
      id: `element_${Date.now()}`,
      type,
      name: `${type}_요소`,
      properties: {
        x: 100,
        y: 100,
        width: type === 'text' ? 300 : 200,
        height: type === 'text' ? 50 : 200,
        opacity: 1,
        rotation: 0,
        scale: 1,
        color: '#ffffff',
        fontSize: 24,
        fontFamily: currentTemplate.settings.fontFamily,
        fontWeight: 'normal',
        text: type === 'text' ? '새 텍스트' : '',
        duration: 5,
        startTime: 0,
        endTime: 5,
        zIndex: 1,
        borderRadius: 0,
        borderWidth: 0,
        borderColor: '#000000',
        borderStyle: 'solid'
      },
      animation: {
        type: 'fade',
        duration: 1,
        delay: 0,
        easing: 'ease-in-out'
      }
    };

    setCurrentTemplate(prev => prev ? {
      ...prev,
      elements: [...prev.elements, newElement],
      updatedAt: new Date().toISOString()
    } : null);
  }, [currentTemplate]);

  // 요소 속성 업데이트
  const updateElement = useCallback((elementId: string, updates: Partial<TemplateElement>) => {
    setCurrentTemplate(prev => prev ? {
      ...prev,
      elements: prev.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      ),
      updatedAt: new Date().toISOString()
    } : null);
  }, []);

  // 요소 삭제
  const deleteElement = useCallback((elementId: string) => {
    setCurrentTemplate(prev => prev ? {
      ...prev,
      elements: prev.elements.filter(el => el.id !== elementId),
      updatedAt: new Date().toISOString()
    } : null);
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // 템플릿 저장
  const saveTemplate = useCallback(async () => {
    if (!currentTemplate) return;
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    // 템플릿 저장 크레딧 계산
    const isPremiumTemplate = currentTemplate.elements.length > 10 ||
                             currentTemplate.category === 'promotion' ||
                             currentTemplate.settings.duration > 60;
    const requiredCredits = isPremiumTemplate ? 3 : 1;

    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);

    if (availableCredits < requiredCredits) {
      setError(`크레딧이 부족합니다. 필요한 크레딧: ${requiredCredits}, 보유 크레딧: ${availableCredits}`);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      // 크레딧 차감
      // await CreditService.spendCredits(user.uid, 'template_save', requiredCredits, {
      //   templateName: currentTemplate.name,
      //   templateCategory: currentTemplate.category,
      //   elementCount: currentTemplate.elements.length
      // });

      const existingIndex = templates.findIndex(t => t.id === currentTemplate.id);
      let updatedTemplates;

      if (existingIndex >= 0) {
        updatedTemplates = [...templates];
        updatedTemplates[existingIndex] = { ...currentTemplate, updatedAt: new Date().toISOString() };
      } else {
        updatedTemplates = [...templates, currentTemplate];
      }

      setTemplates(updatedTemplates);

      // Firebase에 저장 (실제 구현에서는 Firestore 사용)
      // await saveTemplateToFirestore(user.uid, currentTemplate);

      setSuccessMessage(`템플릿이 성공적으로 저장되었습니다! (${requiredCredits} 크레딧 차감)`);

      // 3초 후 성공 메시지 제거
      setTimeout(() => setSuccessMessage(null), 3000);

    } catch (error) {
      console.error('템플릿 저장 오류:', error);
      setError('템플릿 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  }, [currentTemplate, templates, user, userProfile]);

  // 템플릿 내보내기
  const exportTemplate = useCallback(() => {
    if (!currentTemplate) return;

    const dataStr = JSON.stringify(currentTemplate, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    const exportFileDefaultName = `${currentTemplate.name.replace(/[^a-z0-9]/gi, '_')}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [currentTemplate]);

  // 템플릿 가져오기
  const importTemplate = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        template.id = `template_${Date.now()}`;
        template.updatedAt = new Date().toISOString();
        setCurrentTemplate(template);
      } catch (error) {
        console.error('템플릿 가져오기 실패:', error);
      }
    };
    reader.readAsText(file);
  }, []);

  // 미리보기 재생/정지
  const togglePlayback = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  // 미리보기 시간 업데이트
  useEffect(() => {
    if (!isPlaying || !currentTemplate) return;

    const interval = setInterval(() => {
      setPreviewTime(prev => {
        const next = prev + 0.1;
        if (next >= currentTemplate.settings.duration) {
          setIsPlaying(false);
          return 0;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying, currentTemplate]);

  // 초기 데이터 로드
  useEffect(() => {
    const savedTemplates = localStorage.getItem('templates');
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  // 렌더링 함수들
  const renderPreviewArea = () => {
    if (!currentTemplate) return null;

    const { width, height, backgroundColor } = currentTemplate.settings;
    const scale = zoomLevel / 100;

    return (
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-100">
        <div className="relative" style={{ transform: `scale(${scale})` }}>
          <div
            className={`relative bg-white border-2 border-gray-300 shadow-lg ${showGrid ? 'grid-bg' : ''}`}
            style={{
              width: `${width / 10}px`,
              height: `${height / 10}px`,
              backgroundColor
            }}
          >
            {/* 요소 렌더링 */}
            {currentTemplate.elements.map(element => {
              if (previewTime < element.properties.startTime! || previewTime > element.properties.endTime!) {
                return null;
              }

              const baseStyle: React.CSSProperties = {
                position: 'absolute',
                left: `${element.properties.x! / 10}px`,
                top: `${element.properties.y! / 10}px`,
                width: `${element.properties.width! / 10}px`,
                height: `${element.properties.height! / 10}px`,
                opacity: element.properties.opacity,
                transform: `rotate(${element.properties.rotation}deg) scale(${element.properties.scale})`,
                zIndex: element.properties.zIndex,
                border: `${element.properties.borderWidth! / 10}px ${element.properties.borderStyle} ${element.properties.borderColor}`,
                borderRadius: `${element.properties.borderRadius! / 10}px`,
                backgroundColor: element.type === 'shape' ? element.properties.color : 'transparent',
                color: element.properties.color,
                fontSize: `${element.properties.fontSize! / 10}px`,
                fontFamily: element.properties.fontFamily,
                fontWeight: element.properties.fontWeight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: element.type === 'text' ? 'flex-start' : 'center',
                padding: '4px',
                overflow: 'hidden',
                cursor: 'pointer'
              };

              if (element.animation) {
                baseStyle.transition = `all ${element.animation.duration}s ${element.animation.easing}`;
                baseStyle.transitionDelay = `${element.animation.delay}s`;
              }

              return (
                <div
                  key={element.id}
                  style={baseStyle}
                  onClick={() => setSelectedElement(element)}
                  className={`hover:ring-2 hover:ring-blue-400 ${selectedElement?.id === element.id ? 'ring-2 ring-blue-500' : ''}`}
                >
                  {element.type === 'text' && element.properties.text}
                  {element.type === 'image' && (
                    <img
                      src={element.properties.src || '/placeholder.png'}
                      alt={element.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {element.type === 'shape' && (
                    <div className="w-full h-full" style={{ backgroundColor: element.properties.color }} />
                  )}
                  {element.type === 'video' && (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-white">
                      <Film className="w-8 h-8" />
                    </div>
                  )}
                  {element.type === 'audio' && (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <Music className="w-6 h-6 text-blue-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {selectedElement.name} 속성
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4">
              {/* 기본 속성 */}
              <div className="space-y-2">
                <Label htmlFor="element-name">요소 이름</Label>
                <Input
                  id="element-name"
                  value={selectedElement.name}
                  onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
                />
              </div>

              {/* 위치 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>X 위치</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.x}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, x: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Y 위치</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.y}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, y: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              {/* 크기 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>너비</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.width}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, width: parseInt(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>높이</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.height}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, height: parseInt(e.target.value) }
                    })}
                  />
                </div>
              </div>

              {/* 시간 */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label>시작 시간(초)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedElement.properties.startTime}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, startTime: parseFloat(e.target.value) }
                    })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>종료 시간(초)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={selectedElement.properties.endTime}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, endTime: parseFloat(e.target.value) }
                    })}
                  />
                </div>
              </div>

              {/* 텍스트 속성 */}
              {selectedElement.type === 'text' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="element-text">텍스트</Label>
                    <Textarea
                      id="element-text"
                      value={selectedElement.properties.text}
                      onChange={(e) => updateElement(selectedElement.id, {
                        properties: { ...selectedElement.properties, text: e.target.value }
                      })}
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="font-family">폰트</Label>
                    <Select
                      value={selectedElement.properties.fontFamily}
                      onValueChange={(value) => updateElement(selectedElement.id, {
                        properties: { ...selectedElement.properties, fontFamily: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>폰트 크기</Label>
                      <Input
                        type="number"
                        value={selectedElement.properties.fontSize}
                        onChange={(e) => updateElement(selectedElement.id, {
                          properties: { ...selectedElement.properties, fontSize: parseInt(e.target.value) }
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>폰트 두께</Label>
                      <Select
                        value={selectedElement.properties.fontWeight}
                        onValueChange={(value) => updateElement(selectedElement.id, {
                          properties: { ...selectedElement.properties, fontWeight: value }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">보통</SelectItem>
                          <SelectItem value="bold">굵게</SelectItem>
                          <SelectItem value="light">가늘게</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </>
              )}

              {/* 텍스트가 아닌 요소의 소스 */}
              {(selectedElement.type === 'image' || selectedElement.type === 'video') && (
                <div className="space-y-2">
                  <Label htmlFor="element-src">소스 URL</Label>
                  <Input
                    id="element-src"
                    value={selectedElement.properties.src || ''}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, src: e.target.value }
                    })}
                  />
                </div>
              )}

              {/* 모양 속성 */}
              {selectedElement.type === 'shape' && (
                <div className="space-y-2">
                  <Label htmlFor="shape-color">색상</Label>
                  <Input
                    id="shape-color"
                    type="color"
                    value={selectedElement.properties.color}
                    onChange={(e) => updateElement(selectedElement.id, {
                      properties: { ...selectedElement.properties, color: e.target.value }
                    })}
                  />
                </div>
              )}

              {/* 투명도 */}
              <div className="space-y-2">
                <Label>투명도: {Math.round(selectedElement.properties.opacity! * 100)}%</Label>
                <Slider
                  value={[selectedElement.properties.opacity!]}
                  onValueChange={([value]) => updateElement(selectedElement.id, {
                    properties: { ...selectedElement.properties, opacity: value }
                  })}
                  min={0}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* 회전 */}
              <div className="space-y-2">
                <Label>회전: {selectedElement.properties.rotation}°</Label>
                <Slider
                  value={[selectedElement.properties.rotation!]}
                  onValueChange={([value]) => updateElement(selectedElement.id, {
                    properties: { ...selectedElement.properties, rotation: value }
                  })}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>

              {/* 크기 조절 */}
              <div className="space-y-2">
                <Label>크기: {Math.round(selectedElement.properties.scale! * 100)}%</Label>
                <Slider
                  value={[selectedElement.properties.scale!]}
                  onValueChange={([value]) => updateElement(selectedElement.id, {
                    properties: { ...selectedElement.properties, scale: value }
                  })}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Z-Index */}
              <div className="space-y-2">
                <Label>Z-Index (레이어 순서)</Label>
                <Input
                  type="number"
                  value={selectedElement.properties.zIndex}
                  onChange={(e) => updateElement(selectedElement.id, {
                    properties: { ...selectedElement.properties, zIndex: parseInt(e.target.value) }
                  })}
                />
              </div>

              {/* 애니메이션 */}
              {selectedElement.animation && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium">애니메이션</h4>
                  <div className="space-y-2">
                    <Label>애니메이션 타입</Label>
                    <Select
                      value={selectedElement.animation.type}
                      onValueChange={(value: any) => updateElement(selectedElement.id, {
                        animation: { ...selectedElement.animation!, type: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ANIMATION_TYPES.map(anim => (
                          <SelectItem key={anim.value} value={anim.value}>{anim.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>지속 시간: {selectedElement.animation.duration}초</Label>
                    <Slider
                      value={[selectedElement.animation.duration]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        animation: { ...selectedElement.animation!, duration: value }
                      })}
                      min={0.1}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>지연 시간: {selectedElement.animation.delay}초</Label>
                    <Slider
                      value={[selectedElement.animation.delay]}
                      onValueChange={([value]) => updateElement(selectedElement.id, {
                        animation: { ...selectedElement.animation!, delay: value }
                      })}
                      min={0}
                      max={5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}

              {/* 삭제 버튼 */}
              <Button
                variant="destructive"
                onClick={() => deleteElement(selectedElement.id)}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                요소 삭제
              </Button>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 py-6">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">템플릿 편집기</h1>
          <p className="text-gray-600 mt-2">전문적인 템플릿을 제작하고 실시간 미리보기로 확인하세요</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Palette className="w-3 h-3" />
              실시간 편집
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              미리보기
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              요소 관리
            </Badge>
          </div>
        </div>

        {/* 에러/성공 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 왼쪽 패널 */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  템플릿 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentTemplate ? (
                  <>
                    <div>
                      <Label>템플릿명</Label>
                      <Input
                        value={currentTemplate.name}
                        onChange={(e) => setCurrentTemplate({
                          ...currentTemplate,
                          name: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label>설명</Label>
                      <Textarea
                        value={currentTemplate.description || ''}
                        onChange={(e) => setCurrentTemplate({
                          ...currentTemplate,
                          description: e.target.value
                        })}
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label>카테고리</Label>
                      <Select
                        value={currentTemplate.category}
                        onValueChange={(value) => setCurrentTemplate({
                          ...currentTemplate,
                          category: value as any
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATE_CATEGORIES.map(cat => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <Button onClick={createNewTemplate} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    새 템플릿 만들기
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  요소 추가
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button onClick={() => addElement('text')} variant="outline" className="w-full justify-start">
                  <Type className="w-4 h-4 mr-2" />
                  텍스트
                </Button>
                <Button onClick={() => addElement('image')} variant="outline" className="w-full justify-start">
                  <Image className="w-4 h-4 mr-2" />
                  이미지
                </Button>
                <Button onClick={() => addElement('video')} variant="outline" className="w-full justify-start">
                  <Film className="w-4 h-4 mr-2" />
                  비디오
                </Button>
                <Button onClick={() => addElement('audio')} variant="outline" className="w-full justify-start">
                  <Music className="w-4 h-4 mr-2" />
                  오디오
                </Button>
                <Button onClick={() => addElement('shape')} variant="outline" className="w-full justify-start">
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  도형
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5" />
                  템플릿 작업
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentTemplate && (
                  <>
                    <Button onClick={saveTemplate} className="w-full" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          저장 중...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          저장
                        </>
                      )}
                    </Button>
                    <Button onClick={exportTemplate} variant="outline" className="w-full">
                      <Download className="w-4 h-4 mr-2" />
                      내보내기
                    </Button>
                    <Button variant="outline" onClick={() => document.getElementById('import-template')?.click()} className="w-full">
                      <Upload className="w-4 h-4 mr-2" />
                      가져오기
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 메인 편집 영역 */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5" />
                    편집기
                    {currentTemplate && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {currentTemplate.elements.length} 요소
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={isPreview ? "default" : "outline"}
                      onClick={() => setIsPreview(!isPreview)}
                      size="sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {isPreview ? '편집' : '미리보기'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowGrid(!showGrid)}
                      size="sm"
                    >
                      <Grid3X3 className="w-4 h-4" />
                      그리드
                    </Button>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                        size="sm"
                      >
                        -
                      </Button>
                      <span className="text-sm w-12 text-center">{zoomLevel}%</span>
                      <Button
                        variant="outline"
                        onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                        size="sm"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(600px-73px)]">
                {currentTemplate ? (
                  <div className="w-full h-full relative bg-gray-100 overflow-hidden">
                    {/* 캔버스 */}
                    <div
                      className="absolute inset-0 bg-white"
                      style={{
                        width: currentTemplate.settings.width,
                        height: currentTemplate.settings.height,
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'center center',
                        backgroundColor: currentTemplate.settings.backgroundColor
                      }}
                    >
                      {/* 그리드 */}
                      {showGrid && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-full h-full" style={{
                            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 19px, transparent 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 19px, transparent 20px)',
                            backgroundSize: '20px 20px'
                          }} />
                        </div>
                      )}

                      {/* 요소들 */}
                      {currentTemplate.elements.map(element => (
                        <div
                          key={element.id}
                          className={`absolute cursor-move border-2 ${
                            selectedElement?.id === element.id
                              ? 'border-blue-500 border-2'
                              : 'border-transparent hover:border-gray-300'
                          }`}
                          style={{
                            left: element.properties.x,
                            top: element.properties.y,
                            width: element.properties.width,
                            height: element.properties.height,
                            opacity: element.properties.opacity,
                            backgroundColor: element.type === 'shape' ? element.properties.color : 'transparent',
                            borderRadius: element.properties.borderRadius,
                            borderStyle: element.properties.borderStyle,
                            borderWidth: element.properties.borderWidth,
                            borderColor: element.properties.borderColor,
                            fontSize: element.properties.fontSize,
                            fontFamily: element.properties.fontFamily,
                            color: element.properties.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                          }}
                          onClick={() => setSelectedElement(element)}
                        >
                          {element.type === 'text' && (
                            <span className="text-center select-none">
                              {element.properties.text || '텍스트'}
                            </span>
                          )}
                          {element.type === 'image' && element.properties.src && (
                            <img
                              src={element.properties.src}
                              alt={element.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                          {element.type === 'shape' && (
                            <div className="w-full h-full" />
                          )}
                        </div>
                      ))}

                      {/* 미리보기 모든 플레이어 */}
                      {isPreview && (
                        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black bg-opacity-50 rounded px-3 py-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="text-white hover:text-white"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <div className="text-white text-sm">
                            {Math.floor(previewTime)}s / {currentTemplate.settings.duration}s
                          </div>
                          <Slider
                            value={[previewTime]}
                            onValueChange={([value]) => setPreviewTime(value)}
                            max={currentTemplate.settings.duration}
                            step={0.1}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    <div className="text-center">
                      <FolderOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">템플릿을 선택하거나 생성하세요</p>
                      <Button onClick={createNewTemplate} className="mt-4">
                        <Plus className="w-4 h-4 mr-2" />
                        새 템플릿 만들기
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 요소 속성 패널 */}
        {selectedElement && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  요소 속성
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedElement(null)}
                >
                  닫기
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label>이름</Label>
                  <Input
                    value={selectedElement.name}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>X 좌표</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.x}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        x: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>Y 좌표</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.y}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        y: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>너비</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.width}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        width: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>높이</Label>
                  <Input
                    type="number"
                    value={selectedElement.properties.height}
                    onChange={(e) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        height: parseInt(e.target.value)
                      }
                    })}
                  />
                </div>
                <div>
                  <Label>투명도</Label>
                  <Slider
                    value={[selectedElement.properties.opacity || 1]}
                    onValueChange={([value]) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        opacity: value
                      }
                    })}
                    max={1}
                    min={0}
                    step={0.1}
                  />
                </div>
                <div>
                  <Label>회전</Label>
                  <Slider
                    value={[selectedElement.properties.rotation || 0]}
                    onValueChange={([value]) => setSelectedElement({
                      ...selectedElement,
                      properties: {
                        ...selectedElement.properties,
                        rotation: value
                      }
                    })}
                    max={360}
                    min={0}
                    step={15}
                  />
                </div>

                {/* 타입별 속성 */}
                {selectedElement.type === 'text' && (
                  <>
                    <div>
                      <Label>텍스트</Label>
                      <Input
                        value={selectedElement.properties.text || ''}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            text: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>폰트</Label>
                      <Select
                        value={selectedElement.properties.fontFamily || 'Arial'}
                        onValueChange={(value) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            fontFamily: value
                          }
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FONT_FAMILIES.map(font => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>글자 크기</Label>
                      <Input
                        type="number"
                        value={selectedElement.properties.fontSize || 16}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            fontSize: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>색상</Label>
                      <Input
                        type="color"
                        value={selectedElement.properties.color || '#000000'}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            color: e.target.value
                          }
                        })}
                      />
                    </div>
                  </>
                )}

                {selectedElement.type === 'shape' && (
                  <>
                    <div>
                      <Label>색상</Label>
                      <Input
                        type="color"
                        value={selectedElement.properties.color || '#000000'}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            color: e.target.value
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>테두리</Label>
                      <Input
                        type="number"
                        value={selectedElement.properties.borderRadius || 0}
                        onChange={(e) => setSelectedElement({
                          ...selectedElement,
                          properties: {
                            ...selectedElement.properties,
                            borderRadius: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </>
                )}

                <div className="col-span-2">
                  <Button
                    variant="destructive"
                    onClick={() => {
                      if (!currentTemplate) return;
                      const updatedTemplate = {
                        ...currentTemplate,
                        elements: currentTemplate.elements.filter(el => el.id !== selectedElement.id)
                      };
                      setCurrentTemplate(updatedTemplate);
                      setSelectedElement(null);
                    }}
                    >
                    <Trash2 className="w-4 h-4 mr-2" />
                    요소 삭제
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 숨겨진 파일 입력 */}
        <input
          id="import-template"
          type="file"
          accept=".json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;

            try {
              const text = await file.text();
              const importedTemplate = JSON.parse(text);
              setCurrentTemplate(importedTemplate);
              setSuccessMessage('템플릿이 성공적으로 가져와졌습니다!');
              setTimeout(() => setSuccessMessage(null), 3000);
            } catch (error) {
              setError('유효하지 않은 템플릿 파일입니다.');
            }
            e.target.value = '';
          }}
        />
      </div>
    </Layout>
  );
              <input
                id="import-template"
                type="file"
                accept=".json"
                className="hidden"
                onChange={importTemplate}
              />
            </>
          )}
          <Button onClick={createNewTemplate}>
            <Plus className="w-4 h-4 mr-2" />
            새 템플릿
          </Button>
        </div>
      </div>

      {!currentTemplate ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <Layers className="w-16 h-16 mx-auto text-gray-400" />
            <h2 className="text-2xl font-semibold">템플릿 에디터</h2>
            <p className="text-gray-600">새 템플릿을 만들거나 기존 템플릿을 불러오세요</p>
            <Button onClick={createNewTemplate} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              새 템플릿 만들기
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex">
          {/* 왼쪽 패널 - 템플릿 설정 및 요소 목록 */}
          <div className="w-80 border-r bg-white">
            <Tabs defaultValue="settings" className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="settings">설정</TabsTrigger>
                <TabsTrigger value="elements">요소</TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="flex-1 overflow-auto p-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template-name">템플릿 이름</Label>
                  <Input
                    id="template-name"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate(prev => prev ? {
                      ...prev,
                      name: e.target.value,
                      updatedAt: new Date().toISOString()
                    } : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="template-description">설명</Label>
                  <Textarea
                    id="template-description"
                    value={currentTemplate.description}
                    onChange={(e) => setCurrentTemplate(prev => prev ? {
                      ...prev,
                      description: e.target.value,
                      updatedAt: new Date().toISOString()
                    } : null)}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>카테고리</Label>
                  <Select
                    value={currentTemplate.category}
                    onValueChange={(value: any) => setCurrentTemplate(prev => prev ? {
                      ...prev,
                      category: value,
                      updatedAt: new Date().toISOString()
                    } : null)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TEMPLATE_CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">기본 설정</h4>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>너비</Label>
                      <Input
                        type="number"
                        value={currentTemplate.settings.width}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, width: parseInt(e.target.value) },
                          updatedAt: new Date().toISOString()
                        } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>높이</Label>
                      <Input
                        type="number"
                        value={currentTemplate.settings.height}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, height: parseInt(e.target.value) },
                          updatedAt: new Date().toISOString()
                        } : null)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>지속 시간(초)</Label>
                      <Input
                        type="number"
                        value={currentTemplate.settings.duration}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, duration: parseInt(e.target.value) },
                          updatedAt: new Date().toISOString()
                        } : null)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>FPS</Label>
                      <Input
                        type="number"
                        value={currentTemplate.settings.fps}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, fps: parseInt(e.target.value) },
                          updatedAt: new Date().toISOString()
                        } : null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bg-color">배경색</Label>
                    <div className="flex gap-2">
                      <Input
                        id="bg-color"
                        type="color"
                        value={currentTemplate.settings.backgroundColor}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, backgroundColor: e.target.value },
                          updatedAt: new Date().toISOString()
                        } : null)}
                        className="w-20"
                      />
                      <Input
                        value={currentTemplate.settings.backgroundColor}
                        onChange={(e) => setCurrentTemplate(prev => prev ? {
                          ...prev,
                          settings: { ...prev.settings, backgroundColor: e.target.value },
                          updatedAt: new Date().toISOString()
                        } : null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>기본 폰트</Label>
                    <Select
                      value={currentTemplate.settings.fontFamily}
                      onValueChange={(value) => setCurrentTemplate(prev => prev ? {
                        ...prev,
                        settings: { ...prev.settings, fontFamily: value },
                        updatedAt: new Date().toISOString()
                      } : null)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="elements" className="flex-1 flex flex-col">
                <div className="p-4 space-y-2">
                  <Label>요소 추가</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('text')}
                      className="justify-start"
                    >
                      <Type className="w-4 h-4 mr-2" />
                      텍스트
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('image')}
                      className="justify-start"
                    >
                      <Image className="w-4 h-4 mr-2" />
                      이미지
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('video')}
                      className="justify-start"
                    >
                      <Film className="w-4 h-4 mr-2" />
                      비디오
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('audio')}
                      className="justify-start"
                    >
                      <Music className="w-4 h-4 mr-2" />
                      오디오
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('shape')}
                      className="justify-start"
                    >
                      <div className="w-4 h-4 mr-2 border border-current" />
                      모양
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addElement('background')}
                      className="justify-start"
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      배경
                    </Button>
                  </div>
                </div>

                <ScrollArea className="flex-1 px-4 pb-4">
                  <div className="space-y-2">
                    {currentTemplate.elements.map(element => (
                      <div
                        key={element.id}
                        className={`p-2 border rounded cursor-pointer hover:bg-gray-50 ${
                          selectedElement?.id === element.id ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => setSelectedElement(element)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {element.type === 'text' && <Type className="w-4 h-4" />}
                            {element.type === 'image' && <Image className="w-4 h-4" />}
                            {element.type === 'video' && <Film className="w-4 h-4" />}
                            {element.type === 'audio' && <Music className="w-4 h-4" />}
                            {element.type === 'shape' && <div className="w-4 h-4 border border-current" />}
                            {element.type === 'background' && <Palette className="w-4 h-4" />}
                            <span className="text-sm font-medium">{element.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(element.properties.startTime!)}s - {Math.round(element.properties.endTime!)}s
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* 중앙 - 미리보기 영역 */}
          <div className="flex-1 flex flex-col">
            {/* 미리보기 컨트롤 */}
            <div className="border-b bg-white p-2 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
                <div className="text-sm font-medium">
                  {Math.floor(previewTime / 60)}:{(previewTime % 60).toFixed(1).padStart(4, '0')} / {Math.floor(currentTemplate.settings.duration / 60)}:{(currentTemplate.settings.duration % 60).toFixed(1).padStart(4, '0')}
                </div>
                <Slider
                  value={[previewTime]}
                  onValueChange={([value]) => setPreviewTime(value)}
                  min={0}
                  max={currentTemplate.settings.duration}
                  step={0.1}
                  className="w-48"
                />
              </div>

              <div className="flex-1" />

              <div className="flex items-center gap-2">
                <Label htmlFor="zoom-level" className="text-sm">확대</Label>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}
                  >
                    -
                  </Button>
                  <span className="text-sm font-medium w-12 text-center">{zoomLevel}%</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <Label htmlFor="show-grid" className="text-sm">그리드</Label>
              </div>
            </div>

            {/* 미리보기 영역 */}
            {renderPreviewArea()}
          </div>

          {/* 오른쪽 패널 - 요소 속성 */}
          <div className="w-80 border-r bg-white">
            {selectedElement ? (
              renderElementProperties()
            ) : (
              <Card className="h-full">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Settings className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">요소를 선택하여 속성을 편집하세요</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .grid-bg {
          background-image:
            linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px);
          background-size: 10px 10px;
        }
      `}</style>
    </div>
  );
}