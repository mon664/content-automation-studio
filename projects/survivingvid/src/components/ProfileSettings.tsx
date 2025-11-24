'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Upload,
  Save,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Bell,
  Volume2,
  Palette,
  Moon,
  Sun,
  Languages,
  Clock,
  Shield,
  Key,
  Smartphone,
  Monitor,
  Download,
  Trash2,
  Copy,
  Check,
  X,
  RefreshCw,
  Zap,
  Trophy,
  Star,
  BarChart3,
  Users,
  Heart,
  Share2
} from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  bio: string;
  avatar: string;
  phone: string;
  location: string;
  website: string;
  language: string;
  timezone: string;
  joinDate: string;
  lastLogin: string;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'banned';
  role: 'user' | 'creator' | 'admin';
}

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  autoSave: boolean;
  defaultVideoQuality: '360p' | '720p' | '1080p' | '4k';
  autoPlayPreviews: boolean;
  showAdvancedOptions: boolean;
  compactMode: boolean;
}

interface UserStats {
  videosCreated: number;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalDownloads: number;
  storageUsed: number;
  storageLimit: number;
  subscription: 'free' | 'premium' | 'pro';
  joinDate: string;
  streak: number;
  achievements: string[];
}

const LANGUAGES = [
  { value: 'ko', label: '한국어' },
  { value: 'en', label: 'English' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ru', label: 'Русский' }
];

const TIMEZONES = [
  { value: 'Asia/Seoul', label: '서울 (GMT+9)' },
  { value: 'Asia/Tokyo', label: '도쿄 (GMT+9)' },
  { value: 'Asia/Shanghai', label: '상하이 (GMT+8)' },
  { value: 'UTC', label: 'UTC (GMT+0)' },
  { value: 'America/New_York', label: '뉴욕 (GMT-5)' },
  { value: 'America/Los_Angeles', label: '로스앤젤레스 (GMT-8)' },
  { value: 'Europe/London', label: '런던 (GMT+0)' },
  { value: 'Europe/Paris', label: '파리 (GMT+1)' }
];

const ACHIEVEMENTS = [
  { id: 'first_video', name: '첫 영상', description: '첫 번째 영상 생성', icon: '🎬' },
  { id: 'creator_10', name: '크리에이터', description: '10개 영상 생성', icon: '📹' },
  { id: 'views_1000', name: '인기 크리에이터', description: '1000 조회수 달성', icon: '👀' },
  { id: 'likes_100', name: '사랑받는', description: '100 좋아요 받기', icon: '❤️' },
  { id: 'streak_7', name: '꾸준함', description: '7일 연속 사용', icon: '🔥' },
  { id: 'early_adopter', name: '얼리어답터', description: '서비스 초기 사용자', icon: '🌟' }
];

export default function ProfileSettings() {
  const [profile, setProfile] = useState<UserProfile>({
    id: 'user_123',
    username: 'user123',
    email: 'user@example.com',
    fullName: '홍길동',
    bio: 'AI 영상 생성을 좋아합니다.',
    avatar: '/default-avatar.png',
    phone: '+82 10-1234-5678',
    location: '서울, 대한민국',
    website: 'https://example.com',
    language: 'ko',
    timezone: 'Asia/Seoul',
    joinDate: '2024-01-15',
    lastLogin: '2024-11-24T10:30:00Z',
    isVerified: true,
    status: 'active',
    role: 'user'
  });

  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    language: 'ko',
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    autoSave: true,
    defaultVideoQuality: '1080p',
    autoPlayPreviews: true,
    showAdvancedOptions: false,
    compactMode: false
  });

  const [stats, setStats] = useState<UserStats>({
    videosCreated: 47,
    totalViews: 12580,
    totalLikes: 892,
    totalComments: 156,
    totalDownloads: 234,
    storageUsed: 2.3 * 1024 * 1024 * 1024, // 2.3GB in bytes
    storageLimit: 10 * 1024 * 1024 * 1024, // 10GB in bytes
    subscription: 'premium',
    joinDate: '2024-01-15',
    streak: 12,
    achievements: ['first_video', 'creator_10', 'views_1000', 'likes_100', 'streak_7', 'early_adopter']
  });

  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // 프로필 정보 업데이트
  const updateProfile = async () => {
    setSaving(true);
    try {
      // 실제 API 호출
      // const response = await fetch('/api/user/profile', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(profile)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000)); // 데모용
      console.log('프로필 업데이트 완료');
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 비밀번호 변경
  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    setSaving(true);
    try {
      // 실제 API 호출
      // const response = await fetch('/api/user/change-password', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(passwords)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000)); // 데모용
      console.log('비밀번호 변경 완료');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 설정 저장
  const savePreferences = async () => {
    setSaving(true);
    try {
      // 실제 API 호출
      // const response = await fetch('/api/user/preferences', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(preferences)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000)); // 데모용
      console.log('설정 저장 완료');
    } catch (error) {
      console.error('설정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // 포맷팅 함수들
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStoragePercentage = () => {
    return (stats.storageUsed / stats.storageLimit) * 100;
  };

  // 성과 배지 렌더링
  const renderAchievement = (achievementId: string) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return null;

    return (
      <div key={achievementId} className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
        <span className="text-2xl">{achievement.icon}</span>
        <div>
          <h4 className="font-medium text-sm">{achievement.name}</h4>
          <p className="text-xs text-gray-600">{achievement.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-gray-50">
      <ScrollArea className="h-full">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* 프로필 헤더 */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gray-200 rounded-full overflow-hidden">
                    {profile.avatar ? (
                      <img src={profile.avatar} alt="프로필" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-2xl font-bold">{profile.fullName}</h1>
                    {profile.isVerified && (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <Badge variant="outline">{profile.role}</Badge>
                    <Badge variant={profile.status === 'active' ? 'default' : 'secondary'}>
                      {profile.status}
                    </Badge>
                  </div>
                  <p className="text-gray-600 mb-2">@{profile.username}</p>
                  <p className="text-gray-700 mb-3">{profile.bio}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="w-4 h-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {profile.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(profile.joinDate)} 가입</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="space-y-2">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{formatBytes(stats.storageUsed)}</div>
                      <div className="text-sm text-gray-600">사용 중</div>
                    </div>
                    <div className="w-32">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${getStoragePercentage()}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-600 text-center mt-1">
                        {formatBytes(stats.storageLimit)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 설정 탭 */}
          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="profile">프로필</TabsTrigger>
              <TabsTrigger value="preferences">환경설정</TabsTrigger>
              <TabsTrigger value="security">보안</TabsTrigger>
              <TabsTrigger value="notifications">알림</TabsTrigger>
              <TabsTrigger value="stats">통계</TabsTrigger>
              <TabsTrigger value="subscription">구독</TabsTrigger>
            </TabsList>

            {/* 프로필 설정 */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">이름</Label>
                      <Input
                        id="fullName"
                        value={profile.fullName}
                        onChange={(e) => setProfile(prev => ({ ...prev, fullName: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="username">사용자명</Label>
                      <Input
                        id="username"
                        value={profile.username}
                        onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">전화번호</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">위치</Label>
                      <Input
                        id="location"
                        value={profile.location}
                        onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="website">웹사이트</Label>
                      <Input
                        id="website"
                        value={profile.website}
                        onChange={(e) => setProfile(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">자기소개</Label>
                    <Textarea
                      id="bio"
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={updateProfile} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      프로필 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 환경설정 */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>환경설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium">언어 및 지역</h3>
                      <div className="space-y-2">
                        <Label htmlFor="language">언어</Label>
                        <Select
                          value={preferences.language}
                          onValueChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                        >
                          <SelectTrigger id="language">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGES.map(lang => (
                              <SelectItem key={lang.value} value={lang.value}>
                                {lang.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">시간대</Label>
                        <Select
                          value={profile.timezone}
                          onValueChange={(value) => setProfile(prev => ({ ...prev, timezone: value }))}
                        >
                          <SelectTrigger id="timezone">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMEZONES.map(tz => (
                              <SelectItem key={tz.value} value={tz.value}>
                                {tz.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium">테마</h3>
                      <div className="space-y-2">
                        <Label>테마 선택</Label>
                        <div className="flex items-center gap-2">
                          <Button
                            variant={preferences.theme === 'light' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, theme: 'light' }))}
                          >
                            <Sun className="w-4 h-4 mr-2" />
                            라이트
                          </Button>
                          <Button
                            variant={preferences.theme === 'dark' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, theme: 'dark' }))}
                          >
                            <Moon className="w-4 h-4 mr-2" />
                            다크
                          </Button>
                          <Button
                            variant={preferences.theme === 'auto' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setPreferences(prev => ({ ...prev, theme: 'auto' }))}
                          >
                            <Monitor className="w-4 h-4 mr-2" />
                            자동
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">동영상 설정</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-save">자동 저장</Label>
                          <p className="text-sm text-gray-600">작업 내용을 자동으로 저장합니다</p>
                        </div>
                        <Switch
                          id="auto-save"
                          checked={preferences.autoSave}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoSave: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="auto-play-previews">미리보기 자동 재생</Label>
                          <p className="text-sm text-gray-600">동영상 미리보기를 자동으로 재생합니다</p>
                        </div>
                        <Switch
                          id="auto-play-previews"
                          checked={preferences.autoPlayPreviews}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoPlayPreviews: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="show-advanced">고급 옵션 표시</Label>
                          <p className="text-sm text-gray-600">고급 편집 옵션을 항상 표시합니다</p>
                        </div>
                        <Switch
                          id="show-advanced"
                          checked={preferences.showAdvancedOptions}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showAdvancedOptions: checked }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="default-quality">기본 비디오 품질</Label>
                        <Select
                          value={preferences.defaultVideoQuality}
                          onValueChange={(value: any) => setPreferences(prev => ({ ...prev, defaultVideoQuality: value }))}
                        >
                          <SelectTrigger id="default-quality">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="360p">360p</SelectItem>
                            <SelectItem value="720p">720p</SelectItem>
                            <SelectItem value="1080p">1080p</SelectItem>
                            <SelectItem value="4k">4K</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={savePreferences} disabled={saving}>
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      설정 저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 보안 설정 */}
            <TabsContent value="security">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>비밀번호 변경</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="current-password">현재 비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="current-password"
                          type={showPasswords.current ? 'text' : 'password'}
                          value={passwords.current}
                          onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password">새 비밀번호</Label>
                      <div className="relative">
                        <Input
                          id="new-password"
                          type={showPasswords.new ? 'text' : 'password'}
                          value={passwords.new}
                          onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showPasswords.confirm ? 'text' : 'password'}
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <Button onClick={changePassword} disabled={saving} className="w-full">
                      {saving ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Lock className="w-4 h-4 mr-2" />
                      )}
                      비밀번호 변경
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>2단계 인증</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">2단계 인증</h4>
                        <p className="text-sm text-gray-600">추가 보안 계층을 설정합니다</p>
                      </div>
                      <Switch />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">로그인 알림</h4>
                        <p className="text-sm text-gray-600">새 기기 로그인 시 알림을 받습니다</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">세션 관리</h4>
                        <p className="text-sm text-gray-600">현재 활성 세션: 3개</p>
                      </div>
                      <Button variant="outline" size="sm">
                        관리
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* 알림 설정 */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>알림 설정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">이메일 알림</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>이메일 알림</Label>
                          <p className="text-sm text-gray-600">중요한 업데이트와 알림을 이메일로 받습니다</p>
                        </div>
                        <Switch
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>마케팅 이메일</Label>
                          <p className="text-sm text-gray-600">프로모션과 새로운 기능 정보를 받습니다</p>
                        </div>
                        <Switch
                          checked={preferences.marketingEmails}
                          onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, marketingEmails: checked }))}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="font-medium">푸시 알림</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>푸시 알림</Label>
                        <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                      </div>
                      <Switch
                        checked={preferences.pushNotifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 통계 */}
            <TabsContent value="stats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-8 h-8 text-blue-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.videosCreated}</div>
                        <div className="text-sm text-gray-600">생성된 영상</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Eye className="w-8 h-8 text-green-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">총 조회수</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Heart className="w-8 h-8 text-red-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalLikes.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">총 좋아요</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Download className="w-8 h-8 text-purple-500" />
                      <div>
                        <div className="text-2xl font-bold">{stats.totalDownloads.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">총 다운로드</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>성과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {stats.achievements.map(renderAchievement)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 구독 */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>구독 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 border-2 border-blue-500 rounded-lg bg-blue-50">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold">Premium</h3>
                        <p className="text-gray-600">현재 요금제</p>
                      </div>
                      <Badge variant="default" className="bg-blue-500">활성</Badge>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between">
                        <span>저장 공간:</span>
                        <span>{formatBytes(stats.storageLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>월간 생성 한도:</span>
                        <span>무제한</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HD 영상:</span>
                        <span>사용 가능</span>
                      </div>
                      <div className="flex justify-between">
                        <span>4K 영상:</span>
                        <span>사용 가능</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1">
                        구독 관리
                      </Button>
                      <Button variant="outline" className="flex-1">
                        결제 정보
                      </Button>
                    </div>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    구독은 언제든 취소할 수 있습니다.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    </div>
  );
}