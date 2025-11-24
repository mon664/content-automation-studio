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
import { Slider } from '@/components/ui/slider';
import {
  Search,
  Download,
  Play,
  Pause,
  Volume2,
  Grid,
  List,
  Music,
  Clock,
  Headphones,
  Filter,
  Star,
  Heart,
  Share2,
  ExternalLink,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Plus,
  Check,
  X
} from 'lucide-react';

interface PixabayTrack {
  id: number;
  title: string;
  artist: string;
  genre: string;
  mood: string;
  duration: number;
  downloadUrl: string;
  previewUrl: string;
  license: string;
  likes: number;
  views: number;
  tags: string[];
  fileType: string;
  fileSize: number;
  waveformUrl?: string;
  thumbnailUrl?: string;
}

interface DownloadedTrack {
  id: string;
  trackId: number;
  title: string;
  artist: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  duration: number;
  downloadDate: string;
  genre: string;
  mood: string;
}

interface Playlist {
  id: string;
  name: string;
  description: string;
  tracks: DownloadedTrack[];
  createdAt: string;
  updatedAt: string;
}

const MUSIC_GENRES = [
  { value: 'all', label: '모든 장르' },
  { value: 'cinematic', label: '시네마틱' },
  { value: 'corporate', label: '기업' },
  { value: 'rock', label: '록' },
  { value: 'pop', label: '팝' },
  { value: 'electronic', label: '일렉트로닉' },
  { value: 'jazz', label: '재즈' },
  { value: 'classical', label: '클래식' },
  { value: 'folk', label: '포크' },
  { value: 'ambient', label: '앰비언트' },
  { value: 'blues', label: '블루스' },
  { value: 'country', label: '컨트리' }
];

const MOODS = [
  { value: 'all', label: '모든 분위기' },
  { value: 'happy', label: '행복' },
  { value: 'sad', label: '슬픔' },
  { value: 'energetic', label: '활기참' },
  { value: 'calm', label: '차분함' },
  { value: 'dramatic', label: '드라마틱' },
  { value: 'romantic', label: '낭만적' },
  { value: 'mysterious', label: '신비로움' },
  { value: 'uplifting', label: '긍정적' },
  { value: 'dark', label: '어두움' }
];

const DURATION_FILTERS = [
  { value: 'all', label: '모든 길이' },
  { value: 'short', label: '1분 미만' },
  { value: 'medium', label: '1-3분' },
  { value: 'long', label: '3분 이상' }
];

export default function PixabayBGMManager() {
  const [tracks, setTracks] = useState<PixabayTrack[]>([]);
  const [downloadedTracks, setDownloadedTracks] = useState<DownloadedTrack[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedMood, setSelectedMood] = useState('all');
  const [durationFilter, setDurationFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [downloading, setDownloading] = useState<Set<number>>(new Set());

  // Pixabay API에서 음악 검색
  const searchMusic = useCallback(async () => {
    setLoading(true);
    try {
      // 실제 Pixabay API 사용
      const API_KEY = process.env.NEXT_PUBLIC_PIXABAY_API_KEY;
      const url = new URL('https://pixabay.com/api/');
      url.searchParams.set('key', API_KEY || '');
      url.searchParams.set('q', searchQuery);
      url.searchParams.set('category', 'music');
      url.searchParams.set('per_page', '50');

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error('Pixabay API 호출 실패');
      }

      const data = await response.json();
      // Pixabay API 응답 형식에 맞게 변환
      const formattedTracks: PixabayTrack[] = data.hits.map((hit: any) => ({
        id: hit.id,
        title: hit.tags || 'Unknown Title',
        artist: 'Unknown Artist', // Pixabay 음악은 아티스트 정보가 없을 수 있음
        genre: selectedGenre === 'all' ? 'various' : selectedGenre,
        mood: selectedMood === 'all' ? 'neutral' : selectedMood,
        duration: 180, // 기본값 3분
        downloadUrl: hit.url,
        previewUrl: hit.previewURL,
        license: 'Pixabay License',
        likes: hit.likes || 0,
        views: hit.views || 0,
        tags: hit.tags ? hit.tags.split(', ') : [],
        fileType: 'mp3',
        fileSize: hit.fileSize || 0
      }));

      setTracks(formattedTracks);

      // 데모용 가상 데이터
      const mockTracks: PixabayTrack[] = [
        {
          id: 1,
          title: 'Happy Upbeat Background Music',
          artist: 'StockMusic',
          genre: 'pop',
          mood: 'happy',
          duration: 120,
          downloadUrl: 'https://example.com/track1.mp3',
          previewUrl: 'https://example.com/track1_preview.mp3',
          license: 'Creative Commons',
          likes: 1234,
          views: 56789,
          tags: ['happy', 'upbeat', 'background'],
          fileType: 'mp3',
          fileSize: 2840000
        },
        {
          id: 2,
          title: 'Dramatic Cinematic Music',
          artist: 'FilmScore',
          genre: 'cinematic',
          mood: 'dramatic',
          duration: 180,
          downloadUrl: 'https://example.com/track2.mp3',
          previewUrl: 'https://example.com/track2_preview.mp3',
          license: 'Royalty Free',
          likes: 890,
          views: 34567,
          tags: ['dramatic', 'cinematic', 'epic'],
          fileType: 'mp3',
          fileSize: 4260000
        }
      ];

      setTracks(mockTracks);

    } catch (error) {
      console.error('Pixabay 음악 검색 실패:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre, selectedMood]);

  // 음악 다운로드
  const downloadTrack = async (track: PixabayTrack) => {
    setDownloading(prev => new Set(prev).add(track.id));

    try {
      const response = await fetch('/api/bgm/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          url: track.downloadUrl,
          genre: track.genre,
          mood: track.mood,
          duration: track.duration
        })
      });

      if (!response.ok) {
        throw new Error('음악 다운로드 실패');
      }

      const result = await response.json();

      // 다운로드된 트랙 목록에 추가
      const newTrack: DownloadedTrack = {
        id: `track_${Date.now()}`,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        fileName: result.fileName,
        filePath: result.filePath,
        fileSize: result.fileSize,
        duration: track.duration,
        downloadDate: new Date().toISOString(),
        genre: track.genre,
        mood: track.mood
      };

      setDownloadedTracks(prev => [...prev, newTrack]);
    } catch (error) {
      console.error('음악 다운로드 실패:', error);
    } finally {
      setDownloading(prev => {
        const newSet = new Set(prev);
        newSet.delete(track.id);
        return newSet;
      });
    }
  };

  // 오디오 재생/정지
  const togglePlay = useCallback((trackId: number) => {
    if (currentlyPlaying === trackId && isPlaying) {
      setIsPlaying(false);
    } else {
      setCurrentlyPlaying(trackId);
      setIsPlaying(true);
    }
  }, [currentlyPlaying, isPlaying]);

  // 즐겨찾기 토글
  const toggleFavorite = (trackId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(trackId)) {
        newFavorites.delete(trackId);
      } else {
        newFavorites.add(trackId);
      }
      return newFavorites;
    });
  };

  // 포맷팅 함수들
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) {
      return `${(bytes / 1048576).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} bytes`;
  };

  // 트랙 필터링
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         track.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre;
    const matchesMood = selectedMood === 'all' || track.mood === selectedMood;

    let matchesDuration = true;
    if (durationFilter === 'short') {
      matchesDuration = track.duration < 60;
    } else if (durationFilter === 'medium') {
      matchesDuration = track.duration >= 60 && track.duration <= 180;
    } else if (durationFilter === 'long') {
      matchesDuration = track.duration > 180;
    }

    return matchesSearch && matchesGenre && matchesMood && matchesDuration;
  });

  // 트랙 카드 렌더링
  const renderTrackCard = (track: PixabayTrack) => {
    const isFavorite = favorites.has(track.id);
    const isDownloaded = downloadedTracks.some(t => t.trackId === track.id);
    const isCurrentlyPlaying = currentlyPlaying === track.id && isPlaying;

    return (
      <Card key={track.id} className="group hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm line-clamp-2">{track.title}</CardTitle>
              <p className="text-xs text-gray-600 mt-1">{track.artist}</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(track.id)}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
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
          {/* 오디오 플레이어 */}
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => togglePlay(track.id)}
                className={isCurrentlyPlaying ? 'bg-blue-100' : ''}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <div className="flex-1">
                <div className="h-1 bg-gray-300 rounded-full">
                  <div
                    className="h-1 bg-blue-500 rounded-full transition-all"
                    style={{ width: isCurrentlyPlaying ? '30%' : '0%' }}
                  />
                </div>
              </div>
              <span className="text-xs text-gray-600">
                {formatDuration(track.duration)}
              </span>
            </div>
          </div>

          {/* 트랙 정보 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {track.genre}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {track.mood}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(track.duration)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Volume2 className="w-3 h-3" />
                <span>{formatFileSize(track.fileSize)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Heart className="w-3 h-3" />
              <span>{track.likes.toLocaleString()}</span>
              <span className="mx-1">•</span>
              <Headphones className="w-3 h-3" />
              <span>{track.views.toLocaleString()}</span>
            </div>
          </div>

          {/* 태그 */}
          <div className="flex flex-wrap gap-1">
            {track.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => downloadTrack(track)}
              disabled={downloading.has(track.id)}
              className="flex-1"
            >
              {downloading.has(track.id) ? (
                <div className="w-4 h-4 mr-2 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              다운로드
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => window.open(track.downloadUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 리스트 뷰 렌더링
  const renderTrackListItem = (track: PixabayTrack) => {
    const isFavorite = favorites.has(track.id);
    const isDownloaded = downloadedTracks.some(t => t.trackId === track.id);
    const isCurrentlyPlaying = currentlyPlaying === track.id && isPlaying;

    return (
      <Card key={track.id} className="group hover:bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* 재생 컨트롤 */}
            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => togglePlay(track.id)}
                className={isCurrentlyPlaying ? 'bg-blue-100' : ''}
              >
                {isCurrentlyPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* 트랙 정보 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-medium line-clamp-1">{track.title}</h3>
                <Badge variant="outline" className="text-xs">
                  {track.genre}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {track.mood}
                </Badge>
                {isFavorite && <Heart className="w-4 h-4 text-red-500 fill-current" />}
                {isDownloaded && (
                  <Badge variant="default" className="text-xs">
                    <Check className="w-3 h-3 mr-1" />
                    다운로드됨
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                <span>{track.artist}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatDuration(track.duration)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  <span>{formatFileSize(track.fileSize)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{track.likes.toLocaleString()}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Headphones className="w-3 h-3" />
                  <span>{track.views.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {track.tags.slice(0, 5).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleFavorite(track.id)}
                className={isFavorite ? 'text-red-500' : ''}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadTrack(track)}
                disabled={downloading.has(track.id)}
              >
                {downloading.has(track.id) ? (
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                다운로드
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(track.downloadUrl, '_blank')}
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
    if (searchQuery || selectedGenre !== 'all' || selectedMood !== 'all') {
      searchMusic();
    }
  }, [searchQuery, selectedGenre, selectedMood, searchMusic]);

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
                  placeholder="음악 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      searchMusic();
                    }
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <Button onClick={searchMusic} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              검색
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="genre">장르:</Label>
              <Select
                value={selectedGenre}
                onValueChange={setSelectedGenre}
              >
                <SelectTrigger id="genre" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MUSIC_GENRES.map(genre => (
                    <SelectItem key={genre.value} value={genre.value}>
                      {genre.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="mood">분위기:</Label>
              <Select
                value={selectedMood}
                onValueChange={setSelectedMood}
              >
                <SelectTrigger id="mood" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map(mood => (
                    <SelectItem key={mood.value} value={mood.value}>
                      {mood.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="duration">길이:</Label>
              <Select
                value={durationFilter}
                onValueChange={setDurationFilter}
              >
                <SelectTrigger id="duration" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_FILTERS.map(filter => (
                    <SelectItem key={filter.value} value={filter.value}>
                      {filter.label}
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
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Pixabay에서 음악 검색 중...</p>
            </div>
          </div>
        ) : filteredTracks.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <Music className="w-16 h-16 mx-auto text-gray-400" />
              <h2 className="text-2xl font-semibold">Pixabay BGM 관리자</h2>
              <p className="text-gray-600">검색어를 입력하고 배경음악을 찾아보세요</p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full p-4">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                총 {filteredTracks.length}개의 트랙
              </p>
            </div>

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTracks.map(renderTrackCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTracks.map(renderTrackListItem)}
              </div>
            )}
          </ScrollArea>
        )}
      </div>

      {/* 다운로드된 음악 목록 */}
      {downloadedTracks.length > 0 && (
        <div className="border-t bg-white p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium flex items-center gap-2">
              <Music className="w-4 h-4" />
              다운로드된 음악 ({downloadedTracks.length})
            </h3>
          </div>

          <ScrollArea className="max-h-32">
            <div className="space-y-2">
              {downloadedTracks.slice(0, 5).map(track => (
                <div key={track.id} className="flex items-center gap-2 text-sm bg-gray-50 rounded p-2">
                  <Music className="w-4 h-4 text-gray-500" />
                  <span className="flex-1 truncate">{track.title}</span>
                  <span className="text-gray-500">{track.artist}</span>
                  <span className="text-gray-500">{formatDuration(track.duration)}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}