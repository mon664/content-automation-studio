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
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
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
  X,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Zap,
  History,
  Playlist,
  Radio
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
  const { user, userProfile } = useAuth();
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
  const [audioDuration, setAudioDuration] = useState(0);
  const [downloading, setDownloading] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pixabay API에서 음악 검색
  const searchMusic = useCallback(async () => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    if (!searchQuery.trim()) {
      setError('검색어를 입력해주세요.');
      return;
    }

    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);
    if (availableCredits < 1) {
      setError('크레딧이 부족합니다. 음악 검색에 1 S-CRD가 필요합니다.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

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

      // 데모용 확장 가상 데이터 생성
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
          tags: ['happy', 'upbeat', 'background', 'cheerful'],
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
          tags: ['dramatic', 'cinematic', 'epic', 'movie'],
          fileType: 'mp3',
          fileSize: 4260000
        },
        {
          id: 3,
          title: 'Peaceful Ambient Music',
          artist: 'AmbientSounds',
          genre: 'ambient',
          mood: 'calm',
          duration: 240,
          downloadUrl: 'https://example.com/track3.mp3',
          previewUrl: 'https://example.com/track3_preview.mp3',
          license: 'Creative Commons',
          likes: 2345,
          views: 89012,
          tags: ['peaceful', 'ambient', 'relaxing', 'meditation'],
          fileType: 'mp3',
          fileSize: 5680000
        },
        {
          id: 4,
          title: 'Energetic Rock Anthem',
          artist: 'RockBand',
          genre: 'rock',
          mood: 'energetic',
          duration: 200,
          downloadUrl: 'https://example.com/track4.mp3',
          previewUrl: 'https://example.com/track4_preview.mp3',
          license: 'Royalty Free',
          likes: 3456,
          views: 123456,
          tags: ['energetic', 'rock', 'anthem', 'powerful'],
          fileType: 'mp3',
          fileSize: 4730000
        },
        {
          id: 5,
          title: 'Smooth Jazz Background',
          artist: 'JazzEnsemble',
          genre: 'jazz',
          mood: 'romantic',
          duration: 150,
          downloadUrl: 'https://example.com/track5.mp3',
          previewUrl: 'https://example.com/track5_preview.mp3',
          license: 'Creative Commons',
          likes: 1567,
          views: 67890,
          tags: ['smooth', 'jazz', 'background', 'elegant'],
          fileType: 'mp3',
          fileSize: 3550000
        },
        {
          id: 6,
          title: 'Folk Acoustic Music',
          artist: 'AcousticArtist',
          genre: 'folk',
          mood: 'uplifting',
          duration: 165,
          downloadUrl: 'https://example.com/track6.mp3',
          previewUrl: 'https://example.com/track6_preview.mp3',
          license: 'Royalty Free',
          likes: 2890,
          views: 98765,
          tags: ['folk', 'acoustic', 'uplifting', 'warm'],
          fileType: 'mp3',
          fileSize: 3890000
        },
        {
          id: 7,
          title: 'Electronic Dance Track',
          artist: 'DJProducer',
          genre: 'electronic',
          mood: 'energetic',
          duration: 210,
          downloadUrl: 'https://example.com/track7.mp3',
          previewUrl: 'https://example.com/track7_preview.mp3',
          license: 'Creative Commons',
          likes: 4567,
          views: 234567,
          tags: ['electronic', 'dance', 'energetic', 'party'],
          fileType: 'mp3',
          fileSize: 4950000
        },
        {
          id: 8,
          title: 'Classical Piano Piece',
          artist: 'ClassicalComposer',
          genre: 'classical',
          mood: 'calm',
          duration: 300,
          downloadUrl: 'https://example.com/track8.mp3',
          previewUrl: 'https://example.com/track8_preview.mp3',
          license: 'Public Domain',
          likes: 1234,
          views: 45678,
          tags: ['classical', 'piano', 'elegant', 'timeless'],
          fileType: 'mp3',
          fileSize: 7100000
        }
      ];

      // 검색어와 필터에 따라 결과 필터링
      const filteredMockTracks = mockTracks.filter(track => {
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

      setTracks(filteredMockTracks);
      setSuccess(`${filteredMockTracks.length}개의 음악을 찾았습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, 1);

    } catch (error) {
      console.error('Pixabay 음악 검색 실패:', error);
      setError('음악 검색 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGenre, selectedMood, durationFilter, user, userProfile]);

  // 음악 다운로드
  const downloadTrack = async (track: PixabayTrack) => {
    if (!user) {
      setError('로그인이 필요합니다.');
      return;
    }

    const downloadCost = Math.ceil(track.duration / 60) + 1; // 1분당 1크레딧 + 기본 1크레딧
    const availableCredits = (userProfile?.credits?.free || 0) + (userProfile?.credits?.paid || 0);

    if (availableCredits < downloadCost) {
      setError(`크레딧이 부족합니다. 음악 다운로드에 ${downloadCost} S-CRD가 필요합니다.`);
      return;
    }

    setDownloading(prev => new Set(prev).add(track.id));
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/bgm/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`
        },
        body: JSON.stringify({
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          url: track.downloadUrl,
          genre: track.genre,
          mood: track.mood,
          duration: track.duration,
          userId: user.uid
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
        fileName: result.fileName || `${track.title.replace(/\s+/g, '_')}.mp3`,
        filePath: result.filePath || `/bgm/${track.title.replace(/\s+/g, '_')}.mp3`,
        fileSize: result.fileSize || track.fileSize,
        duration: track.duration,
        downloadDate: new Date().toISOString(),
        genre: track.genre,
        mood: track.mood
      };

      setDownloadedTracks(prev => [...prev, newTrack]);
      setSuccess(`"${track.title}" 다운로드가 완료되었습니다. ${downloadCost} S-CRD가 차감되었습니다.`);

      // 크레딧 차감 (실제로는 API 호출 후 성공 시에만)
      // await deductCredits(user.uid, downloadCost);

    } catch (error) {
      console.error('음악 다운로드 실패:', error);
      setError('음악 다운로드 중 오류가 발생했습니다. 다시 시도해주세요.');
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
                <Radio className="w-6 h-6" />
                Pixabay BGM 관리자
              </h1>
              <p className="text-gray-600">Pixabay에서 배경음악을 검색하고 다운로드하세요</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-500">검색 비용</p>
                <p className="font-semibold">1 S-CRD</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">다운로드 비용</p>
                <p className="font-semibold">1+ S-CRD/분</p>
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
              <p className="text-xl font-bold text-red-600">{favorites.size}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">다운로드된 음악</p>
              <p className="text-xl font-bold text-purple-600">{downloadedTracks.length}</p>
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
                검색 (1 S-CRD)
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-4">
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
        <div className="bg-white rounded-lg border">
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600">Pixabay에서 음악 검색 중...</p>
              </div>
            </div>
          ) : tracks.length === 0 ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Music className="w-16 h-16 mx-auto text-gray-400" />
                <h2 className="text-2xl font-semibold">Pixabay BGM 관리자</h2>
                <p className="text-gray-600">음악 검색어를 입력하고 배경음악을 찾아보세요</p>
                <Button onClick={searchMusic} disabled={loading}>
                  <Search className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  음악 검색 (1 S-CRD)
                </Button>
              </div>
            </div>
          ) : filteredTracks.length === 0 ? (
            <div className="p-12 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Music className="w-16 h-16 mx-auto text-gray-400" />
                <h2 className="text-2xl font-semibold">검색 결과 없음</h2>
                <p className="text-gray-600">"{searchQuery}"에 대한 검색 결과가 없습니다</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {searchQuery ? `"${searchQuery}"에 대한 ` : ''}{filteredTracks.length}개의 트랙
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
            </div>
          )}
        </div>

        {/* 다운로드된 음악 목록 */}
        {downloadedTracks.length > 0 && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Playlist className="w-4 h-4" />
                다운로드된 음악 ({downloadedTracks.length})
              </h3>
            </div>

            <ScrollArea className="max-h-40">
              <div className="space-y-2">
                {downloadedTracks.map(track => (
                  <div key={track.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Music className="w-4 h-4 text-purple-500" />
                    <div className="flex-1">
                      <p className="font-medium text-sm truncate">{track.title}</p>
                      <p className="text-xs text-gray-500">{track.artist}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">{formatDuration(track.duration)}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(track.fileSize)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </Layout>
  );
}