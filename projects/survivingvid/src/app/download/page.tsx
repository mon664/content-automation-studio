'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Download,
  Play,
  Clock,
  Eye,
  Calendar,
  User,
  Music,
  Video,
  FileVideo,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { YouTubeVideoInfo, DownloadProgress } from '@/types/youtube';

export default function DownloadPage() {
  const { user, userProfile } = useAuth();
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('720p');
  const [format, setFormat] = useState('mp4');
  const [loading, setLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<YouTubeVideoInfo | null>(null);
  const [downloadHistory, setDownloadHistory] = useState<DownloadProgress[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  // 다운로드 내역 로드
  useEffect(() => {
    if (user) {
      loadDownloadHistory();
    }
  }, [user]);

  const loadDownloadHistory = async () => {
    try {
      // 여기에 다운로드 내역 로드 로직 구현
      // 임시로 빈 배열
      setDownloadHistory([]);
    } catch (error) {
      console.error('다운로드 내역 로드 오류:', error);
    }
  };

  // URL 유효성 검사
  const isValidUrl = (url: string): boolean => {
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)/;
    return youtubeRegex.test(url);
  };

  // 비디오 정보 가져오기
  const fetchVideoInfo = async () => {
    if (!url.trim() || !isValidUrl(url)) {
      alert('유효한 YouTube URL을 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (data.success) {
        setVideoInfo(data.data);
        setShowInfo(true);
      } else {
        alert(data.error || '비디오 정보를 가져올 수 없습니다.');
      }
    } catch (error) {
      console.error('비디오 정보 가져오기 오류:', error);
      alert('비디오 정보를 가져오는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 다운로드 시작
  const startDownload = async () => {
    if (!user || !videoInfo) {
      alert('로그인이 필요하거나 비디오 정보가 없습니다.');
      return;
    }

    // 크레딧 확인
    const freeCredits = userProfile?.credits?.free || 0;
    if (freeCredits < 1) {
      alert('크레딧이 부족합니다. (S-CRD 1개 필요)');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/youtube/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          quality,
          format,
          userId: user.uid
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('다운로드가 시작되었습니다!');
        setShowInfo(false);
        setUrl('');
        setVideoInfo(null);
        await loadDownloadHistory(); // 내역 새로고침
      } else {
        alert(data.error || '다운로드를 시작할 수 없습니다.');
      }
    } catch (error) {
      console.error('다운로드 시작 오류:', error);
      alert('다운로드를 시작하는 데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">YouTube 다운로드</h1>
          <p className="text-gray-600 mt-2">YouTube 영상과 오디오를 다운로드하세요 (S-CRD 1개)</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              비디오/오디오
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <FileVideo className="w-3 h-3" />
              다양한 포맷
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              고품질 다운로드
            </Badge>
          </div>
        </div>

        {/* 다운로드 입력 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              다운로드
            </CardTitle>
            <CardDescription>
              YouTube URL을 입력하여 비디오나 오디오를 다운로드하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URL 입력 */}
            <div className="space-y-2">
              <Label htmlFor="url">YouTube URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full"
              />
            </div>

            {/* 다운로드 옵션 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quality">화질</Label>
                <Select value={quality} onValueChange={setQuality}>
                  <SelectTrigger>
                    <SelectValue placeholder="화질 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="audio-only">오디오 전용</SelectItem>
                    <SelectItem value="360p">360p</SelectItem>
                    <SelectItem value="720p">720p (권장)</SelectItem>
                    <SelectItem value="1080p">1080p</SelectItem>
                    <SelectItem value="highest">최고 화질</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">포맷</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="포맷 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp4">MP4 (비디오)</SelectItem>
                    <SelectItem value="mp3">MP3 (오디오)</SelectItem>
                    <SelectItem value="webm">WebM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <Button
                onClick={fetchVideoInfo}
                disabled={loading || !url.trim()}
                variant="outline"
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    정보 가져오기
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    정보 확인
                  </>
                )}
              </Button>

              {showInfo && (
                <Button
                  onClick={startDownload}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      다운로드 중...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      다운로드 시작
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 비디오 정보 */}
        {showInfo && videoInfo && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                비디오 정보
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 썸네일 및 기본 정보 */}
                <div className="space-y-4">
                  <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    {videoInfo.thumbnail && (
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 line-clamp-2">{videoInfo.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{videoInfo.uploader}</span>
                    </div>
                  </div>
                </div>

                {/* 상세 정보 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">재생 시간</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {videoInfo.durationFormatted}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">조회수</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {videoInfo.viewCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">업로드일</span>
                    <span className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(videoInfo.uploadDate).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">파일 크기</span>
                    <span className="text-sm font-medium">
                      {videoInfo.fileSizeHuman}
                    </span>
                  </div>

                  {videoInfo.tags.length > 0 && (
                    <div>
                      <span className="text-sm text-gray-600">태그</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {videoInfo.tags.slice(0, 5).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {videoInfo.tags.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{videoInfo.tags.length - 5}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 다운로드 내역 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              다운로드 내역
            </CardTitle>
            <CardDescription>
              최근 다운로드한 목록입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            {downloadHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Download className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>다운로드 내역이 없습니다</p>
                <p className="text-sm mt-1">YouTube 영상을 다운로드해보세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {downloadHistory.map((item, index) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        item.status === 'completed'
                          ? 'bg-green-100 text-green-600'
                          : item.status === 'error'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {item.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : item.status === 'error' ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{item.filename}</div>
                        <div className="text-sm text-gray-600">
                          {new Date(item.createdAt).toLocaleString('ko-KR')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' && (
                        <Badge variant="secondary">완료</Badge>
                      )}
                      {item.status === 'error' && (
                        <Badge variant="destructive">오류</Badge>
                      )}
                      {item.status === 'downloading' && (
                        <Badge variant="outline">진행중 {item.progress}%</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 사용 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              사용 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">지원되는 기능</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>YouTube 영상 다운로드 (다양한 화질)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>오디오 전용 다운로드 (MP3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>메타데이터 정보 추출</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>자동 썸네일 다운로드</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">사용료 안내</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>다운로드 시 S-CRD 1개 차감</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>일일 로그인 보너스로 크레딧 획득 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>Shop에서 크레딧 구매 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>다운로드 내역 자동 저장</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}