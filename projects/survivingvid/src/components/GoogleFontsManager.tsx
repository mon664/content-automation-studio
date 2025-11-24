'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import {
  Search,
  Download,
  Eye,
  Grid,
  List,
  Type,
  Star,
  Filter,
  Check,
  X,
  Plus,
  Minus,
  RotateCw,
  FileText,
  Folder,
  Upload,
  Trash2,
  Settings,
  Palette,
  Copy,
  ExternalLink
} from 'lucide-react';

interface GoogleFont {
  family: string;
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace';
  variants: string[];
  subsets: string[];
  popularity: number;
  lastModified: string;
  files: { [key: string]: string };
}

interface DownloadedFont {
  id: string;
  family: string;
  variant: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  downloadDate: string;
  category: string;
}

interface FontPreviewSettings {
  text: string;
  size: number;
  weight: string;
  style: string;
  color: string;
  backgroundColor: string;
  lineHeight: number;
  letterSpacing: number;
}

const FONT_CATEGORIES = [
  { value: 'all', label: '모든 카테고리' },
  { value: 'serif', label: 'Serif' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'display', label: 'Display' },
  { value: 'handwriting', label: 'Handwriting' },
  { value: 'monospace', label: 'Monospace' }
];

const FONT_WEIGHTS = [
  { value: '100', label: 'Thin (100)' },
  { value: '200', label: 'Extra Light (200)' },
  { value: '300', label: 'Light (300)' },
  { value: '400', label: 'Regular (400)' },
  { value: '500', label: 'Medium (500)' },
  { value: '600', label: 'Semi Bold (600)' },
  { value: '700', label: 'Bold (700)' },
  { value: '800', label: 'Extra Bold (800)' },
  { value: '900', label: 'Black (900)' }
];

const FONT_STYLES = [
  { value: 'normal', label: '일반' },
  { value: 'italic', label: '기울임' }
];

const PREVIEW_TEXTS = [
  '한글 폰트 테스트',
  'The quick brown fox jumps over the lazy dog',
  '가나다라마바사',
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  '1234567890!@#$%^&*()',
  '자동 영상 생성을 위한 폰트 미리보기'
];

export default function GoogleFontsManager() {
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [downloadedFonts, setDownloadedFonts] = useState<DownloadedFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [previewSettings, setPreviewSettings] = useState<FontPreviewSettings>({
    text: '한글 폰트 테스트',
    size: 32,
    weight: '400',
    style: 'normal',
    color: '#000000',
    backgroundColor: '#ffffff',
    lineHeight: 1.5,
    letterSpacing: 0
  });
  const [downloading, setDownloading] = useState<Set<string>>(new Set());

  // Google Fonts API에서 폰트 목록 가져오기
  const fetchGoogleFonts = useCallback(async () => {
    setLoading(true);
    try {
      // 실제 Google Fonts API 사용
      const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_FONTS_API_KEY;
      const response = await fetch(
        `https://www.googleapis.com/webfonts/v1/webfonts?key=${API_KEY}&sort=popularity`
      );

      if (!response.ok) {
        throw new Error('Google Fonts API 호출 실패');
      }

      const data = await response.json();
      setFonts(data.items || []);

      // 데모용 가상 데이터
      const mockFonts: GoogleFont[] = [
        {
          family: 'Roboto',
          category: 'sans-serif',
          variants: ['100', '300', '400', '500', '700', '900'],
          subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext', 'greek', 'greek-ext', 'vietnamese'],
          popularity: 1,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5Q.ttf'
          }
        },
        {
          family: 'Noto Sans KR',
          category: 'sans-serif',
          variants: ['100', '300', '400', '500', '700', '900'],
          subsets: ['korean', 'latin'],
          popularity: 1,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/notosanskr/v36/PbykFmXiEBPT4ITbgNA5Cgm20xz64px_1hVWr0wuPNGmlQNMEfU4Y.woff2'
          }
        }
      ];

      setFonts(mockFonts);

    } catch (error) {
      console.error('Google Fonts 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 폰트 다운로드
  const downloadFont = async (font: GoogleFont, variant: string = 'regular') => {
    const downloadKey = `${font.family}-${variant}`;
    setDownloading(prev => new Set(prev).add(downloadKey));

    try {
      // 실제 다운로드 로직
      const response = await fetch(`/api/fonts/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          family: font.family,
          variant,
          url: font.files[variant] || font.files.regular
        })
      });

      if (!response.ok) {
        throw new Error('폰트 다운로드 실패');
      }

      const result = await response.json();

      // 다운로드된 폰트 목록에 추가
      const newFont: DownloadedFont = {
        id: `font_${Date.now()}`,
        family: font.family,
        variant,
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
        downloadDate: new Date().toISOString(),
        category: font.category
      };

      setDownloadedFonts(prev => [...prev, newFont]);
    } catch (error) {
      console.error('폰트 다운로드 실패:', error);
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(downloadKey);
        return newSet;
      });
    }
  };

  // 폰트 삭제
  const deleteFont = (fontId: string) => {
    setDownloadedFonts(prev => prev.filter(font => font.id !== fontId));
  };

  // 즐겨찾기 토글
  const toggleFavorite = (family: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(family)) {
        newFavorites.delete(family);
      } else {
        newFavorites.add(family);
      }
      return newFavorites;
    });
  };

  // 폰트 필터링
  const filteredFonts = fonts.filter(font => {
    const matchesSearch = font.family.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // CSS 스타일 생성
  const getFontStyle = (font: GoogleFont) => {
    return {
      fontFamily: `"${font.family}", ${font.category}`,
      fontSize: `${previewSettings.size}px`,
      fontWeight: previewSettings.weight,
      fontStyle: previewSettings.style,
      color: previewSettings.color,
      backgroundColor: previewSettings.backgroundColor,
      lineHeight: previewSettings.lineHeight,
      letterSpacing: `${previewSettings.letterSpacing}px`
    };
  };

  // 폰트 카드 렌더링
  const renderFontCard = (font: GoogleFont) => {
    const isFavorite = favorites.has(font.family);
    const isDownloaded = downloadedFonts.some(f => f.family === font.family);
    const downloadKey = `${font.family}-${previewSettings.weight}`;

    return (
      <Card key={font.family} className="group hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-1">{font.family}</CardTitle>
              <Badge variant="outline" className="mt-1">
                {font.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(font.family)}
                className={isFavorite ? 'text-yellow-500' : ''}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              {isDownloaded && (
                <Badge variant="default" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  다운로드됨
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 폰트 미리보기 */}
          <div className="border rounded-lg p-4 min-h-[100px] bg-white">
            <div style={getFontStyle(font)}>
              {previewSettings.text}
            </div>
          </div>

          {/* 폰트 정보 */}
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex items-center justify-between">
              <span>변형:</span>
              <span>{font.variants.length}개</span>
            </div>
            <div className="flex items-center justify-between">
              <span>언어:</span>
              <span>{font.subsets.join(', ')}</span>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadFont(font, previewSettings.weight)}
              disabled={downloading.has(downloadKey)}
              className="flex-1"
            >
              {downloading.has(downloadKey) ? (
                <RotateCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              다운로드
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(`https://fonts.google.com/specimen/${encodeURIComponent(font.family)}`, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 리스트 뷰 렌더링
  const renderFontListItem = (font: GoogleFont) => {
    const isFavorite = favorites.has(font.family);
    const isDownloaded = downloadedFonts.some(f => f.family === font.family);

    return (
      <Card key={font.family} className="group hover:bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium text-lg">{font.family}</h3>
                <Badge variant="outline">{font.category}</Badge>
                {isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                {isDownloaded && (
                  <Badge variant="default" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    다운로드됨
                  </Badge>
                )}
              </div>

              {/* 폰트 미리보기 */}
              <div className="border rounded-lg p-3 mb-3 bg-white">
                <div style={getFontStyle(font)}>
                  {previewSettings.text}
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span>변형: {font.variants.length}개</span>
                <span>언어: {font.subsets.join(', ')}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(font.family)}
                className={isFavorite ? 'text-yellow-500' : ''}
              >
                <Star className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadFont(font, previewSettings.weight)}
              >
                <Download className="w-4 h-4 mr-2" />
                다운로드
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(`https://fonts.google.com/specimen/${encodeURIComponent(font.family)}`, '_blank')}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 컴포넌트 초기화
  useEffect(() => {
    fetchGoogleFonts();
  }, [fetchGoogleFonts]);

  return (
    <div className="h-screen flex flex-col">
      {/* 검색 및 필터 */}
      <div className="border-b bg-white p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="폰트 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={fetchGoogleFonts} disabled={loading}>
              <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="category">카테고리:</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger id="category" className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_CATEGORIES.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* 미리보기 설정 */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preview-text">미리보기 텍스트</Label>
                <Select
                  value={previewSettings.text}
                  onValueChange={(value) => setPreviewSettings(prev => ({ ...prev, text: value }))}
                >
                  <SelectTrigger id="preview-text">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PREVIEW_TEXTS.map(text => (
                      <SelectItem key={text} value={text}>
                        {text.slice(0, 20)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-size">크기: {previewSettings.size}px</Label>
                <Input
                  id="font-size"
                  type="range"
                  min="12"
                  max="72"
                  value={previewSettings.size}
                  onChange={(e) => setPreviewSettings(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-weight">두께</Label>
                <Select
                  value={previewSettings.weight}
                  onValueChange={(value) => setPreviewSettings(prev => ({ ...prev, weight: value }))}
                >
                  <SelectTrigger id="font-weight">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_WEIGHTS.map(weight => (
                      <SelectItem key={weight.value} value={weight.value}>
                        {weight.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-style">스타일</Label>
                <Select
                  value={previewSettings.style}
                  onValueChange={(value) => setPreviewSettings(prev => ({ ...prev, style: value }))}
                >
                  <SelectTrigger id="font-style">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FONT_STYLES.map(style => (
                      <SelectItem key={style.value} value={style.value}>
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 영역 */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Google Fonts에서 폰트 목록을 가져오는 중...</p>
            </div>
          </div>
        ) : filteredFonts.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Type className="w-16 h-16 mx-auto text-gray-400" />
              <h2 className="text-2xl font-semibold">Google Fonts 관리자</h2>
              <p className="text-gray-600">검색 결과가 없습니다</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                총 {filteredFonts.length}개의 폰트
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFonts.map(renderFontCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredFonts.map(renderFontListItem)}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* 다운로드된 폰트 목록 */}
      {downloadedFonts.length > 0 && (
        <div className="border-t bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Folder className="w-4 h-4" />
              다운로드된 폰트 ({downloadedFonts.length})
            </h3>
          </div>

          <ScrollArea className="max-h-32">
            <div className="flex flex-wrap gap-2">
              {downloadedFonts.map(font => (
                <Badge key={font.id} variant="secondary" className="flex items-center gap-1">
                  <Type className="w-3 h-3" />
                  {font.family} ({font.variant})
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteFont(font.id)}
                    className="h-auto p-0 ml-1 hover:bg-red-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}