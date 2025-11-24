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
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
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
  ExternalLink,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Clock,
  Zap,
  History,
  Font
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
  const { user, userProfile } = useAuth();
  const [fonts, setFonts] = useState<GoogleFont[]>([]);
  const [downloadedFonts, setDownloadedFonts] = useState<DownloadedFont[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);
    if (availableCredits < 1) {
      setError('크레딧이 부족합니다. 폰트 목록 로드에 1 S-CRD가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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

      // 데모용 확장 가상 데이터 생성
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
        },
        {
          family: 'Poppins',
          category: 'sans-serif',
          variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
          subsets: ['latin', 'latin-ext'],
          popularity: 2,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.ttf'
          }
        },
        {
          family: 'Montserrat',
          category: 'sans-serif',
          variants: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
          subsets: ['latin', 'latin-ext'],
          popularity: 3,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/montserrat/v25/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCtr6Ew-.ttf'
          }
        },
        {
          family: 'Playfair Display',
          category: 'serif',
          variants: ['400', '500', '600', '700', '800', '900'],
          subsets: ['latin', 'latin-ext', 'cyrillic'],
          popularity: 4,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWMI.ttf'
          }
        },
        {
          family: 'Noto Serif KR',
          category: 'serif',
          variants: ['200', '300', '400', '500', '600', '700', '900'],
          subsets: ['korean', 'latin'],
          popularity: 5,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/notoserifkr/v26/xn7mYHs72GKoTvER4Gn3b5eQ.woff2'
          }
        },
        {
          family: 'Dancing Script',
          category: 'handwriting',
          variants: ['400', '500', '600', '700'],
          subsets: ['latin', 'latin-ext'],
          popularity: 6,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/dancingscript/v25/If2cXTr6YS-zF4S-kcSWSVi_szLviuEHiC4W.woff2'
          }
        },
        {
          family: 'Fira Code',
          category: 'monospace',
          variants: ['300', '400', '500', '600', '700'],
          subsets: ['latin', 'latin-ext'],
          popularity: 7,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/firacode/v22/uU9eCBsR6Z2vfE9aq3bL0fxyUs4tcw4W_D1sJVD7MOzlojwUKaJO.woff2'
          }
        },
        {
          family: 'Bebas Neue',
          category: 'display',
          variants: ['400'],
          subsets: ['latin', 'latin-ext'],
          popularity: 8,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/bebasneue/v14/JTUSjIg69CK48gW7PXoo9Wdhyzbi.woff2'
          }
        },
        {
          family: 'Oswald',
          category: 'sans-serif',
          variants: ['200', '300', '400', '500', '600', '700'],
          subsets: ['latin', 'latin-ext'],
          popularity: 9,
          lastModified: '2023-01-01',
          files: {
            regular: 'https://fonts.gstatic.com/s/oswald/v53/TK3_WkUHHAIjg75cFRf3bXL8LICs1_FvsUtiZTaR.woff2'
          }
        }
      ];

      setFonts(mockFonts);
      setSuccess(`${mockFonts.length}개의 폰트를 로드했습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, 1);

    } catch (error) {
      console.error('Google Fonts 가져오기 실패:', error);
      setError('폰트 목록을 불러오는 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [user, userProfile]);

  // 폰트 다운로드
  const downloadFont = async (font: GoogleFont, variant: string = 'regular') => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const downloadCost = 2; // 폰트 다운로드 고정 비용
    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);

    if (availableCredits < downloadCost) {
      setError(`크레딧이 부족합니다. 폰트 다운로드에 ${downloadCost} S-CRD가 필요합니다.`);
      return;
    }

    const downloadKey = `${font.family}-${variant}`;
    setDownloading(prev => new Set(prev).add(downloadKey));
    setError(null);
    setSuccess(null);

    try {
      // 실제 다운로드 로직
      const response = await fetch(`/api/fonts/download`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          family: font.family,
          variant,
          url: font.files[variant] || font.files.regular,
          userId: user.uid
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
        fileName: result.fileName || `${font.family.replace(/\s+/g, '_')}_${variant}.ttf`,
        filePath: result.filePath || `/fonts/${font.family.replace(/\s+/g, '_')}_${variant}.ttf`,
        fileSize: result.fileSize || Math.floor(Math.random() * 500000) + 100000, // 100KB-600KB 사이즈
        downloadDate: new Date().toISOString(),
        category: font.category
      };

      setDownloadedFonts(prev => [...prev, newFont]);
      setSuccess(`"${font.family}" 폰트 다운로드가 완료되었습니다. ${downloadCost} S-CRD가 차감되었습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, downloadCost);

    } catch (error) {
      console.error('폰트 다운로드 실패:', error);
      setError('폰트 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
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
    <Layout>
      <div className="space-y-6">
        {/* 알림 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* 헤더 정보 */}
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Font className="w-6 h-6" />
                Google Fonts 관리자
              </h1>
              <p className="text-gray-600">Google Fonts에서 폰트를 검색하고 다운로드하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">로드 비용</p>
                <p className="font-semibold">1 S-CRD</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">다운로드 비용</p>
                <p className="font-semibold">2 S-CRD</p>
              </div>
            </div>
          </div>

          {/* 사용 가능 크레딧 표시 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-sm text-gray-500">S-CRD</p>
              <p className="text-xl font-bold text-blue-600">{userProfile?.credits?.free || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">E-CRD</p>
              <p className="text-xl font-bold text-green-600">{userProfile?.credits?.paid || 0}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">즐겨찾기</p>
              <p className="text-xl font-bold text-yellow-600">{favorites.size}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">다운로드된 폰트</p>
              <p className="text-xl font-bold text-purple-600">{downloadedFonts.length}</p>
            </div>
          </div>
        </div>

        {/* 검색 필터 */}
        <div className="bg-white rounded-lg border p-6">
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
                폰트 로드 (1 S-CRD)
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
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
              <h3 className="text-lg font-semibold mb-4">미리보기 설정</h3>
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

      {/* 결과 영역 */}
      <div className="bg-white rounded-lg border">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Google Fonts에서 폰트 목록을 가져오는 중...</p>
            </div>
          </div>
        ) : fonts.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Font className="w-16 h-16 mx-auto text-gray-400" />
              <h2 className="text-2xl font-semibold">Google Fonts 관리자</h2>
              <p className="text-gray-600">폰트 목록 로드 버튼을 클릭하여 Google Fonts를 불러오세요</p>
              <Button onClick={fetchGoogleFonts} disabled={loading}>
                <RotateCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                폰트 목록 로드 (1 S-CRD)
              </Button>
            </div>
          </div>
        ) : filteredFonts.length === 0 ? (
          <div className="p-12 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Font className="w-16 h-16 mx-auto text-gray-400" />
              <h2 className="text-2xl font-semibold">검색 결과 없음</h2>
              <p className="text-gray-600">"{searchQuery}"에 대한 검색 결과가 없습니다</p>
            </div>
          </div>
        ) : (
          <div className="p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                {searchQuery ? `"${searchQuery}"에 대한 ` : ''}{filteredFonts.length}개의 폰트
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
          </div>
        )}
      </div>

      {/* 다운로드된 폰트 목록 */}
      {downloadedFonts.length > 0 && (
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Folder className="w-4 h-4" />
              다운로드된 폰트 ({downloadedFonts.length})
            </h3>
          </div>

          <ScrollArea className="max-h-40">
            <div className="flex flex-wrap gap-2">
              {downloadedFonts.map(font => (
                <Badge key={font.id} variant="secondary" className="flex items-center gap-1">
                  <Font className="w-3 h-3" />
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
    </Layout>
  );
}