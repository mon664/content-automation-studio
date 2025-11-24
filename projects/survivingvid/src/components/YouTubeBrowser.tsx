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
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import {
  Search,
  Download,
  Play,
  Eye,
  Clock,
  Calendar,
  User,
  Filter,
  Grid,
  List,
  ExternalLink,
  Bookmark,
  Share2,
  Volume2,
  Video,
  TrendingUp,
  Music,
  Film,
  Gamepad2,
  News,
  Lightbulb,
  Heart,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Star,
  History
} from 'lucide-react';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  thumbnailUrl: string;
  tags: string[];
  categoryId: string;
  category: string;
}

interface SearchFilters {
  query: string;
  duration: 'any' | 'short' | 'medium' | 'long';
  uploadDate: 'any' | 'hour' | 'today' | 'week' | 'month' | 'year';
  category: string;
  sortBy: 'relevance' | 'date' | 'rating' | 'viewCount' | 'title';
}

const VIDEO_CATEGORIES = [
  { value: '', label: '모든 카테고리' },
  { value: '1', label: '영화 & 애니메이션' },
  { value: '2', label: '자동차 & 운송' },
  { value: '10', label: '음악' },
  { value: '15', label: '동물 & 애완동물' },
  { value: '17', label: '스포츠' },
  { value: '19', label: '여행 & 이벤트' },
  { value: '20', label: '게이밍' },
  { value: '22', label: '사람 & 블로그' },
  { value: '23', label: '코미디' },
  { value: '24', label: '엔터테인먼트' },
  { value: '25', label: '뉴스 & 정치' },
  { value: '26', label: '스타일 & 패션' },
  { value: '27', label: '교육' },
  { value: '28', label: '과학 & 기술' }
];

const DURATION_OPTIONS = [
  { value: 'any', label: '모든 길이' },
  { value: 'short', label: '4분 미만' },
  { value: 'medium', label: '4-20분' },
  { value: 'long', label: '20분 이상' }
];

const UPLOAD_DATE_OPTIONS = [
  { value: 'any', label: '모든 시간' },
  { value: 'hour', label: '1시간 이내' },
  { value: 'today', label: '오늘' },
  { value: 'week', label: '이번 주' },
  { value: 'month', label: '이번 달' },
  { value: 'year', label: '올해' }
];

const SORT_OPTIONS = [
  { value: 'relevance', label: '관련성' },
  { value: 'date', label: '업로드 날짜' },
  { value: 'rating', label: '평점' },
  { value: 'viewCount', label: '조회수' },
  { value: 'title', label: '제목' }
];

export default function YouTubeBrowser() {
  const { user, userProfile } = useAuth();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    duration: 'any',
    uploadDate: 'any',
    category: '',
    sortBy: 'relevance'
  });
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // YouTube API 검색 (데모용 가상 데이터)
  const searchVideos = useCallback(async () => {
    if (!filters.query.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);
    if (availableCredits < 1) {
      setError('크레딧이 부족합니다. 검색에 1크레딧이 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // 실제 구현에서는 YouTube Data API v3 사용
      // const API_KEY = process.env.YOUTUBE_API_KEY;
      // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(filters.query)}&type=video&maxResults=50&key=${API_KEY}`);

      // 데모용 가상 데이터 생성
      await new Promise(resolve => setTimeout(resolve, 1500));

      const mockVideos: YouTubeVideo[] = Array.from({ length: 20 }, (_, i) => {
        const categories = ['엔터테인먼트', '음악', '교육', '스포츠', '게이밍', '뉴스', '뷰티', '요리'];
        const category = categories[Math.floor(Math.random() * categories.length)];

        return {
          videoId: `video_${i}_${Date.now()}`,
          title: `${filters.query} - 관련 동영상 ${i + 1}`,
          description: `이것은 ${filters.query}와 관련된 동영상입니다. 카테고리: ${category}. 테스트용 상세 설명입니다.`,
          channelTitle: `채널 ${i + 1}`,
          channelId: `channel_${i}`,
          publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
          duration: `${Math.floor(Math.random() * 20) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
          viewCount: Math.floor(Math.random() * 1000000),
          likeCount: Math.floor(Math.random() * 100000),
          commentCount: Math.floor(Math.random() * 10000),
          thumbnailUrl: `https://via.placeholder.com/320x180/ff0000/ffffff?text=Video+${i + 1}`,
          tags: [filters.query, category, '테스트', '데모', 'AI생성'],
          categoryId: '22',
          category
        };
      });

      setVideos(mockVideos);
      setSuccess(`${mockVideos.length}개의 동영상을 찾았습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, 1);

    } catch (error) {
      console.error('YouTube 검색 실패:', error);
      setError('검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [filters, user, userProfile]);

  // 비디오 다운로드
  const downloadVideo = async (video: YouTubeVideo) => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const downloadCost = Math.ceil(parseInt(video.duration.split(':')[0]) / 5) + 2; // 5분당 1크레딧 + 기본 2크레딧
    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);

    if (availableCredits < downloadCost) {
      setError(`크레딧이 부족합니다. 다운로드에 ${downloadCost}크레딧이 필요합니다.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // 실제 구현에서는 YouTube 다운로드 API 사용
      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          videoId: video.videoId,
          url: `https://www.youtube.com/watch?v=${video.videoId}`,
          quality: '720p',
          format: 'mp4',
          userId: user.uid
        })
      });

      if (!response.ok) {
        throw new Error('다운로드 실패');
      }

      const result = await response.json();

      // 다운로드 기록 추가
      setDownloadHistory(prev => [video.videoId, ...prev.slice(0, 9)]);

      // 북마크 자동 추가
      setBookmarks(prev => new Set(prev).add(video.videoId));

      setSuccess(`"${video.title}" 다운로드가 시작되었습니다. ${downloadCost}크레딧이 차감되었습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, downloadCost);

    } catch (error) {
      console.error('다운로드 실패:', error);
      setError('다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  // 북마크 토글
  const toggleBookmark = (videoId: string) => {
    setBookmarks(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(videoId)) {
        newBookmarks.delete(videoId);
      } else {
        newBookmarks.add(videoId);
      }
      return newBookmarks;
    });
  };

  // 포맷팅 함수들
  const formatDuration = (duration: string) => {
    return duration;
  };

  const formatViewCount = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatPublishedAt = (date: string) => {
    const now = new Date();
    const published = new Date(date);
    const diffInDays = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return '오늘';
    if (diffInDays === 1) return '어제';
    if (diffInDays < 7) return `${diffInDays}일 전`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)}개월 전`;
    return `${Math.floor(diffInDays / 365)}년 전`;
  };

  // 비디오 카드 렌더링
  const renderVideoCard = (video: YouTubeVideo) => (
    <Card key={video.videoId} className="group hover:shadow-lg transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="relative mb-3">
          <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
          <div className="absolute top-2 left-2 flex gap-1">
            <Button
              size="sm"
              variant="secondary"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedVideo(video);
              }}
            >
              <Play className="w-3 h-3" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium line-clamp-2 text-sm">{video.title}</h3>

          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate">{video.channelTitle}</span>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{formatViewCount(video.viewCount)}</span>
            </div>
            <Separator orientation="vertical" className="h-3" />
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formatPublishedAt(video.publishedAt)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              {video.category}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(video.videoId);
                }}
                className={bookmarks.has(video.videoId) ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${bookmarks.has(video.videoId) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadVideo(video);
                }}
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank');
                }}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // 리스트 뷰 렌더링
  const renderVideoListItem = (video: YouTubeVideo) => (
    <Card key={video.videoId} className="group hover:bg-gray-50 transition-colors">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-40 aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img
                src={video.thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="space-y-2">
              <h3 className="font-medium line-clamp-2">{video.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2">{video.description}</p>

              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  <span>{video.channelTitle}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViewCount(video.viewCount)} 회</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{formatViewCount(video.likeCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  <span>{formatViewCount(video.commentCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{video.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatPublishedAt(video.publishedAt)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {video.category}
                  </Badge>
                  <div className="flex gap-1">
                    {video.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleBookmark(video.videoId)}
                    className={bookmarks.has(video.videoId) ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${bookmarks.has(video.videoId) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => downloadVideo(video)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
              <h1 className="text-2xl font-bold text-gray-900">YouTube 탐색</h1>
              <p className="text-gray-600">YouTube 동영상을 검색하고 다운로드하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">검색 비용</p>
                <p className="font-semibold">1 S-CRD</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">다운로드 비용</p>
                <p className="font-semibold">2+ S-CRD</p>
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
              <p className="text-sm text-gray-500">북마크</p>
              <p className="text-xl font-bold text-purple-600">{bookmarks.size}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">다운로드 기록</p>
              <p className="text-xl font-bold text-orange-600">{downloadHistory.length}</p>
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
                    placeholder="YouTube 동영상 검색..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        searchVideos();
                      }
                    }}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={searchVideos} disabled={loading}>
                <Search className="w-4 h-4 mr-2" />
                검색 (1 S-CRD)
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="duration">길이:</Label>
                <Select
                  value={filters.duration}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger id="duration" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="upload-date">업로드:</Label>
                <Select
                  value={filters.uploadDate}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, uploadDate: value }))}
                >
                  <SelectTrigger id="upload-date" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {UPLOAD_DATE_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="category">카테고리:</Label>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger id="category" className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VIDEO_CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Label htmlFor="sort-by">정렬:</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value: any) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger id="sort-by" className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
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
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">YouTube에서 동영상 검색 중...</p>
              </div>
            </div>
          ) : videos.length === 0 ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Video className="w-16 h-16 mx-auto text-gray-400" />
                <h2 className="text-2xl font-semibold">YouTube 브라우저</h2>
                <p className="text-gray-600">검색어를 입력하고 동영상을 찾아보세요</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  "{filters.query}"에 대한 {videos.length}개의 검색 결과
                </p>
              </div>

              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {videos.map(renderVideoCard)}
                </div>
              ) : (
                <div className="space-y-4">
                  {videos.map(renderVideoListItem)}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 비디오 미리보기 모달 */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold line-clamp-1">{selectedVideo.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    ✕
                  </Button>
                </div>

                <div className="aspect-video bg-gray-200 rounded-lg mb-4">
                  <img
                    src={selectedVideo.thumbnailUrl}
                    alt={selectedVideo.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>

                <div className="space-y-4">
                  <p className="text-gray-600">{selectedVideo.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">채널</Label>
                      <p>{selectedVideo.channelTitle}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">조회수</Label>
                      <p>{formatViewCount(selectedVideo.viewCount)} 회</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">재생시간</Label>
                      <p>{selectedVideo.duration}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">업로드</Label>
                      <p>{formatPublishedAt(selectedVideo.publishedAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-500">예상 다운로드 비용</p>
                      <p className="font-semibold">
                        {Math.ceil(parseInt(selectedVideo.duration.split(':')[0]) / 5) + 2} S-CRD
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => downloadVideo(selectedVideo)}
                        disabled={loading}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        다운로드
                      </Button>
                      <Button
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${selectedVideo.videoId}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        YouTube에서 보기
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}