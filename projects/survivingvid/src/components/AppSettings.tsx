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
  Settings as SettingsIcon,
  Database,
  Server,
  Cloud,
  Key,
  Shield,
  Bell,
  Monitor,
  Cpu,
  HardDrive,
  Wifi,
  Globe,
  Users,
  FileText,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Copy,
  Check,
  X,
  AlertCircle,
  CheckCircle,
  Info,
  Zap,
  Target,
  BarChart3,
  Activity,
  Lock,
  Unlock,
  Mail,
  MessageSquare,
  Smartphone,
  Clock,
  Calendar,
  TrendingUp,
  File,
  Folder,
  Archive,
  Camera,
  Music,
  Type,
  Palette,
  Brush
} from 'lucide-react';

interface AppSettings {
  general: {
    appName: string;
    appVersion: string;
    company: string;
    supportEmail: string;
    website: string;
    timezone: string;
    language: string;
    dateFormat: string;
    timeFormat: string;
  };
  api: {
    geminiApiKey: string;
    vertexAiApiKey: string;
    youtubeApiKey: string;
    pixabayApiKey: string;
    googleFontsApiKey: string;
    apiBaseUrl: string;
    requestTimeout: number;
    maxRetries: number;
    enableCaching: boolean;
    cacheExpiry: number;
  };
  storage: {
    localPath: string;
    cloudProvider: string;
    cloudBucket: string;
    cloudRegion: string;
    maxStorageSize: number;
    cleanupInterval: number;
    autoCleanup: boolean;
    backupEnabled: boolean;
    backupInterval: string;
  };
  performance: {
    maxConcurrentTasks: number;
    videoQuality: string;
    renderTimeout: number;
    gpuAcceleration: boolean;
    memoryLimit: number;
    cpuPriority: string;
    tempDir: string;
    logLevel: string;
  };
  ai: {
    defaultModel: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    topK: number;
    enableSafety: boolean;
    customPrompts: boolean;
    promptTemplates: string[];
  };
  integrations: {
    slackWebhook: string;
    discordWebhook: string;
    telegramBot: string;
    emailProvider: string;
    smtpServer: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  security: {
    enable2FA: boolean;
    sessionTimeout: number;
    passwordPolicy: boolean;
    maxLoginAttempts: number;
    lockoutDuration: number;
    enableAudit: boolean;
    encryptionKey: string;
    apiRateLimit: number;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    slackEnabled: boolean;
    webhookUrl: string;
    emailTemplates: string[];
    notificationChannels: string[];
  };
}

const SYSTEM_STATUS = {
  cpu: 45,
  memory: 62,
  disk: 78,
  network: 92,
  uptime: '15일 7시간 32분',
  lastRestart: '2024-11-09 12:30:00',
  activeConnections: 127,
  queuedTasks: 8,
  completedTasks: 1247,
  failedTasks: 3,
  avgResponseTime: 245
};

const LOG_LEVELS = [
  { value: 'error', label: 'Error' },
  { value: 'warn', label: 'Warning' },
  { value: 'info', label: 'Info' },
  { value: 'debug', label: 'Debug' }
];

const CPU_PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'normal', label: 'Normal' },
  { value: 'high', label: 'High' },
  { value: 'realtime', label: 'Realtime' }
];

const VIDEO_QUALITIES = [
  { value: '360p', label: '360p (SD)' },
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '4k', label: '4K (Ultra HD)' }
];

export default function AppSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    general: {
      appName: 'SurvivingVid',
      appVersion: '1.0.0',
      company: 'AI Creative Labs',
      supportEmail: 'support@survivingvid.com',
      website: 'https://survivingvid.com',
      timezone: 'Asia/Seoul',
      language: 'ko',
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h'
    },
    api: {
      geminiApiKey: '',
      vertexAiApiKey: '',
      youtubeApiKey: '',
      pixabayApiKey: '',
      googleFontsApiKey: '',
      apiBaseUrl: 'https://api.survivingvid.com',
      requestTimeout: 30000,
      maxRetries: 3,
      enableCaching: true,
      cacheExpiry: 3600
    },
    storage: {
      localPath: '/storage',
      cloudProvider: 'aws',
      cloudBucket: 'survivingvid-storage',
      cloudRegion: 'ap-northeast-2',
      maxStorageSize: 1000, // GB
      cleanupInterval: 24, // hours
      autoCleanup: true,
      backupEnabled: true,
      backupInterval: 'daily'
    },
    performance: {
      maxConcurrentTasks: 5,
      videoQuality: '1080p',
      renderTimeout: 1800, // seconds
      gpuAcceleration: true,
      memoryLimit: 8192, // MB
      cpuPriority: 'normal',
      tempDir: '/tmp',
      logLevel: 'info'
    },
    ai: {
      defaultModel: 'gemini-pro',
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      topK: 40,
      enableSafety: true,
      customPrompts: true,
      promptTemplates: []
    },
    integrations: {
      slackWebhook: '',
      discordWebhook: '',
      telegramBot: '',
      emailProvider: 'smtp',
      smtpServer: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    },
    security: {
      enable2FA: true,
      sessionTimeout: 3600,
      passwordPolicy: true,
      maxLoginAttempts: 5,
      lockoutDuration: 900,
      enableAudit: true,
      encryptionKey: '',
      apiRateLimit: 100
    },
    notifications: {
      emailEnabled: true,
      pushEnabled: true,
      slackEnabled: false,
      webhookUrl: '',
      emailTemplates: [],
      notificationChannels: []
    }
  });

  const [saving, setSaving] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState('general');

  // 설정 저장
  const saveSettings = async () => {
    setSaving(true);
    try {
      // 실제 API 호출
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      await new Promise(resolve => setTimeout(resolve, 1000)); // 데모용
      console.log('설정 저장 완료');
    } catch (error) {
      console.error('설정 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  // API 연결 테스트
  const testConnection = async (service: string) => {
    setTestingConnection(true);
    try {
      // 실제 연결 테스트
      console.log(`${service} 연결 테스트`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log(`${service} 연결 성공`);
    } catch (error) {
      console.error(`${service} 연결 실패:`, error);
    } finally {
      setTestingConnection(false);
    }
  };

  // 설정 초기화
  const resetSettings = async () => {
    if (!confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      return;
    }

    try {
      // 실제 초기화 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('설정 초기화 완료');
      // 기본 설정으로 다시 로드
    } catch (error) {
      console.error('설정 초기화 실패:', error);
    }
  };

  // 백업 내보내기
  const exportBackup = async () => {
    try {
      const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        settings
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survivingvid-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('백업 내보내기 완료');
    } catch (error) {
      console.error('백업 내보내기 실패:', error);
    }
  };

  // 설정값 업데이트
  const updateSetting = (category: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  // 비밀번호 토글
  const togglePassword = (field: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // 상태 카드 렌더링
  const renderStatusCard = (title: string, value: number, icon: React.ReactNode, color: string) => (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="text-sm font-medium">{title}</span>
          </div>
          <span className="text-lg font-semibold">{value}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-${color}-500 transition-all`}
            style={{ width: `${value}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="h-screen bg-gray-50">
      <div className="flex h-full">
        {/* 메인 설정 패널 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-6">
              <div className="mb-6">
                <h1 className="text-3xl font-bold">앱 설정</h1>
                <p className="text-gray-600">SurvivingVid 시스템 설정을 관리합니다</p>
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="general">일반</TabsTrigger>
                  <TabsTrigger value="api">API</TabsTrigger>
                  <TabsTrigger value="storage">저장소</TabsTrigger>
                  <TabsTrigger value="performance">성능</TabsTrigger>
                </TabsList>

                {/* 일반 설정 */}
                <TabsContent value="general">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <SettingsIcon className="w-5 h-5" />
                          기본 정보
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="app-name">앱 이름</Label>
                            <Input
                              id="app-name"
                              value={settings.general.appName}
                              onChange={(e) => updateSetting('general', 'appName', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="app-version">버전</Label>
                            <Input
                              id="app-version"
                              value={settings.general.appVersion}
                              onChange={(e) => updateSetting('general', 'appVersion', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">회사</Label>
                          <Input
                            id="company"
                            value={settings.general.company}
                            onChange={(e) => updateSetting('general', 'company', e.target.value)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="support-email">지원 이메일</Label>
                            <Input
                              id="support-email"
                              type="email"
                              value={settings.general.supportEmail}
                              onChange={(e) => updateSetting('general', 'supportEmail', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="website">웹사이트</Label>
                            <Input
                              id="website"
                              value={settings.general.website}
                              onChange={(e) => updateSetting('general', 'website', e.target.value)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Globe className="w-5 h-5" />
                          지역화
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="timezone">시간대</Label>
                          <Select
                            value={settings.general.timezone}
                            onValueChange={(value) => updateSetting('general', 'timezone', value)}
                          >
                            <SelectTrigger id="timezone">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Asia/Seoul">서울 (GMT+9)</SelectItem>
                              <SelectItem value="UTC">UTC (GMT+0)</SelectItem>
                              <SelectItem value="America/New_York">뉴욕 (GMT-5)</SelectItem>
                              <SelectItem value="Europe/London">런던 (GMT+0)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">언어</Label>
                          <Select
                            value={settings.general.language}
                            onValueChange={(value) => updateSetting('general', 'language', value)}
                          >
                            <SelectTrigger id="language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ko">한국어</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                              <SelectItem value="ja">日本語</SelectItem>
                              <SelectItem value="zh">中文</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="date-format">날짜 형식</Label>
                            <Select
                              value={settings.general.dateFormat}
                              onValueChange={(value) => updateSetting('general', 'dateFormat', value)}
                            >
                              <SelectTrigger id="date-format">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="time-format">시간 형식</Label>
                            <Select
                              value={settings.general.timeFormat}
                              onValueChange={(value) => updateSetting('general', 'timeFormat', value)}
                            >
                              <SelectTrigger id="time-format">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="24h">24시간</SelectItem>
                                <SelectItem value="12h">12시간</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5" />
                          보안
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="2fa">2단계 인증</Label>
                            <p className="text-sm text-gray-600">추가 보안 계층을 활성화합니다</p>
                          </div>
                          <Switch
                            id="2fa"
                            checked={settings.security.enable2FA}
                            onCheckedChange={(checked) => updateSetting('security', 'enable2FA', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="audit">감사 로그</Label>
                            <p className="text-sm text-gray-600">모든 활동을 기록합니다</p>
                          </div>
                          <Switch
                            id="audit"
                            checked={settings.security.enableAudit}
                            onCheckedChange={(checked) => updateSetting('security', 'enableAudit', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="password-policy">비밀번호 정책</Label>
                            <p className="text-sm text-gray-600">강력한 비밀번호를 요구합니다</p>
                          </div>
                          <Switch
                            id="password-policy"
                            checked={settings.security.passwordPolicy}
                            onCheckedChange={(checked) => updateSetting('security', 'passwordPolicy', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5" />
                          알림
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="email-notifications">이메일 알림</Label>
                            <p className="text-sm text-gray-600">중요한 알림을 이메일로 받습니다</p>
                          </div>
                          <Switch
                            id="email-notifications"
                            checked={settings.notifications.emailEnabled}
                            onCheckedChange={(checked) => updateSetting('notifications', 'emailEnabled', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="push-notifications">푸시 알림</Label>
                            <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                          </div>
                          <Switch
                            id="push-notifications"
                            checked={settings.notifications.pushEnabled}
                            onCheckedChange={(checked) => updateSetting('notifications', 'pushEnabled', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* API 설정 */}
                <TabsContent value="api">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Key className="w-5 h-5" />
                          API 키
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="gemini-api-key">Gemini API Key</Label>
                          <div className="relative">
                            <Input
                              id="gemini-api-key"
                              type={showPasswords.gemini ? 'text' : 'password'}
                              value={settings.api.geminiApiKey}
                              onChange={(e) => updateSetting('api', 'geminiApiKey', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => togglePassword('gemini')}
                            >
                              {showPasswords.gemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection('gemini')}
                            disabled={testingConnection}
                          >
                            {testingConnection ? '테스트 중...' : '연결 테스트'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="vertex-ai-api-key">Vertex AI API Key</Label>
                          <div className="relative">
                            <Input
                              id="vertex-ai-api-key"
                              type={showPasswords.vertex ? 'text' : 'password'}
                              value={settings.api.vertexAiApiKey}
                              onChange={(e) => updateSetting('api', 'vertexAiApiKey', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => togglePassword('vertex')}
                            >
                              {showPasswords.vertex ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => testConnection('vertex-ai')}
                            disabled={testingConnection}
                          >
                            {testingConnection ? '테스트 중...' : '연결 테스트'}
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="youtube-api-key">YouTube API Key</Label>
                          <div className="relative">
                            <Input
                              id="youtube-api-key"
                              type={showPasswords.youtube ? 'text' : 'password'}
                              value={settings.api.youtubeApiKey}
                              onChange={(e) => updateSetting('api', 'youtubeApiKey', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => togglePassword('youtube')}
                            >
                              {showPasswords.youtube ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="pixabay-api-key">Pixabay API Key</Label>
                          <div className="relative">
                            <Input
                              id="pixabay-api-key"
                              type={showPasswords.pixabay ? 'text' : 'password'}
                              value={settings.api.pixabayApiKey}
                              onChange={(e) => updateSetting('api', 'pixabayApiKey', e.target.value)}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2"
                              onClick={() => togglePassword('pixabay')}
                            >
                              {showPasswords.pixabay ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Server className="w-5 h-5" />
                          API 설정
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="api-base-url">API Base URL</Label>
                            <Input
                              id="api-base-url"
                              value={settings.api.apiBaseUrl}
                              onChange={(e) => updateSetting('api', 'apiBaseUrl', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="request-timeout">요청 타임아웃 (ms)</Label>
                            <Input
                              id="request-timeout"
                              type="number"
                              value={settings.api.requestTimeout}
                              onChange={(e) => updateSetting('api', 'requestTimeout', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max-retries">최대 재시도 횟수</Label>
                            <Input
                              id="max-retries"
                              type="number"
                              value={settings.api.maxRetries}
                              onChange={(e) => updateSetting('api', 'maxRetries', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cache-expiry">캐시 만료 시간 (초)</Label>
                            <Input
                              id="cache-expiry"
                              type="number"
                              value={settings.api.cacheExpiry}
                              onChange={(e) => updateSetting('api', 'cacheExpiry', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="enable-caching">캐싱 활성화</Label>
                            <p className="text-sm text-gray-600">API 응답을 캐시합니다</p>
                          </div>
                          <Switch
                            id="enable-caching"
                            checked={settings.api.enableCaching}
                            onCheckedChange={(checked) => updateSetting('api', 'enableCaching', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* 저장소 설정 */}
                <TabsContent value="storage">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HardDrive className="w-5 h-5" />
                          로컬 저장소
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="local-path">저장 경로</Label>
                          <Input
                            id="local-path"
                            value={settings.storage.localPath}
                            onChange={(e) => updateSetting('storage', 'localPath', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="temp-dir">임시 폴더</Label>
                          <Input
                            id="temp-dir"
                            value={settings.performance.tempDir}
                            onChange={(e) => updateSetting('performance', 'tempDir', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cloud className="w-5 h-5" />
                          클라우드 저장소
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="cloud-provider">클라우드 제공자</Label>
                            <Select
                              value={settings.storage.cloudProvider}
                              onValueChange={(value) => updateSetting('storage', 'cloudProvider', value)}
                            >
                              <SelectTrigger id="cloud-provider">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="aws">AWS S3</SelectItem>
                                <SelectItem value="google">Google Cloud</SelectItem>
                                <SelectItem value="azure">Azure Blob</SelectItem>
                                <SelectItem value="aliyun">Alibaba Cloud</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cloud-region">지역</Label>
                            <Select
                              value={settings.storage.cloudRegion}
                              onValueChange={(value) => updateSetting('storage', 'cloudRegion', value)}
                            >
                              <SelectTrigger id="cloud-region">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ap-northeast-2">Seoul</SelectItem>
                                <SelectItem value="us-west-2">Oregon</SelectItem>
                                <SelectItem value="europe-west1">Belgium</SelectItem>
                                <SelectItem value="asia-east1">Taiwan</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cloud-bucket">버킷 이름</Label>
                          <Input
                            id="cloud-bucket"
                            value={settings.storage.cloudBucket}
                            onChange={(e) => updateSetting('storage', 'cloudBucket', e.target.value)}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Archive className="w-5 h-5" />
                          백업 및 정리
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="auto-cleanup">자동 정리</Label>
                            <p className="text-sm text-gray-600">오래된 파일을 자동으로 정리합니다</p>
                          </div>
                          <Switch
                            id="auto-cleanup"
                            checked={settings.storage.autoCleanup}
                            onCheckedChange={(checked) => updateSetting('storage', 'autoCleanup', checked)}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="backup-enabled">백업 활성화</Label>
                            <p className="text-sm text-gray-600">정기적으로 데이터를 백업합니다</p>
                          </div>
                          <Switch
                            id="backup-enabled"
                            checked={settings.storage.backupEnabled}
                            onCheckedChange={(checked) => updateSetting('storage', 'backupEnabled', checked)}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max-storage">최대 저장 공간 (GB)</Label>
                            <Input
                              id="max-storage"
                              type="number"
                              value={settings.storage.maxStorageSize}
                              onChange={(e) => updateSetting('storage', 'maxStorageSize', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cleanup-interval">정리 주기 (시간)</Label>
                            <Input
                              id="cleanup-interval"
                              type="number"
                              value={settings.storage.cleanupInterval}
                              onChange={(e) => updateSetting('storage', 'cleanupInterval', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* 성능 설정 */}
                <TabsContent value="performance">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Cpu className="w-5 h-5" />
                          시스템 성능
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="max-tasks">최대 동시 작업</Label>
                            <Input
                              id="max-tasks"
                              type="number"
                              value={settings.performance.maxConcurrentTasks}
                              onChange={(e) => updateSetting('performance', 'maxConcurrentTasks', parseInt(e.target.value))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="memory-limit">메모리 제한 (MB)</Label>
                            <Input
                              id="memory-limit"
                              type="number"
                              value={settings.performance.memoryLimit}
                              onChange={(e) => updateSetting('performance', 'memoryLimit', parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="video-quality">기본 비디오 품질</Label>
                            <Select
                              value={settings.performance.videoQuality}
                              onValueChange={(value) => updateSetting('performance', 'videoQuality', value)}
                            >
                              <SelectTrigger id="video-quality">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {VIDEO_QUALITIES.map(quality => (
                                  <SelectItem key={quality.value} value={quality.value}>
                                    {quality.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cpu-priority">CPU 우선순위</Label>
                            <Select
                              value={settings.performance.cpuPriority}
                              onValueChange={(value) => updateSetting('performance', 'cpuPriority', value)}
                            >
                              <SelectTrigger id="cpu-priority">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {CPU_PRIORITIES.map(priority => (
                                  <SelectItem key={priority.value} value={priority.value}>
                                    {priority.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="render-timeout">렌더링 타임아웃 (초)</Label>
                          <Input
                            id="render-timeout"
                            type="number"
                            value={settings.performance.renderTimeout}
                            onChange={(e) => updateSetting('performance', 'renderTimeout', parseInt(e.target.value))}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="log-level">로그 레벨</Label>
                          <Select
                            value={settings.performance.logLevel}
                            onValueChange={(value) => updateSetting('performance', 'logLevel', value)}
                          >
                            <SelectTrigger id="log-level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LOG_LEVELS.map(level => (
                                <SelectItem key={level.value} value={level.value}>
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <Label htmlFor="gpu-acceleration">GPU 가속</Label>
                            <p className="text-sm text-gray-600">하드웨어 가속을 사용합니다</p>
                          </div>
                          <Switch
                            id="gpu-acceleration"
                            checked={settings.performance.gpuAcceleration}
                            onCheckedChange={(checked) => updateSetting('performance', 'gpuAcceleration', checked)}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>

              {/* 액션 버튼 */}
              <div className="mt-8 flex items-center gap-4">
                <Button onClick={saveSettings} disabled={saving}>
                  {saving ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      설정 저장
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={exportBackup}>
                  <Download className="w-4 h-4 mr-2" />
                  백업 내보내기
                </Button>
                <Button variant="outline" onClick={resetSettings}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  초기화
                </Button>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 시스템 상태 사이드바 */}
        <div className="w-96 border-l bg-white flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              <h2 className="text-xl font-semibold">시스템 상태</h2>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* 시스템 리소스 */}
              <div>
                <h3 className="font-medium mb-4">시스템 리소스</h3>
                <div className="space-y-4">
                  {renderStatusCard('CPU', SYSTEM_STATUS.cpu, <Cpu className="w-4 h-4" />, 'blue')}
                  {renderStatusCard('메모리', SYSTEM_STATUS.memory, <Activity className="w-4 h-4" />, 'green')}
                  {renderStatusCard('디스크', SYSTEM_STATUS.disk, <HardDrive className="w-4 h-4" />, 'yellow')}
                  {renderStatusCard('네트워크', SYSTEM_STATUS.network, <Wifi className="w-4 h-4" />, 'purple')}
                </div>
              </div>

              {/* 시스템 정보 */}
              <div>
                <h3 className="font-medium mb-4">시스템 정보</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">가동 시간:</span>
                    <span className="font-medium">{SYSTEM_STATUS.uptime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">마지막 재시작:</span>
                    <span className="font-medium">{SYSTEM_STATUS.lastRestart}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">활성 연결:</span>
                    <span className="font-medium">{SYSTEM_STATUS.activeConnections}</span>
                  </div>
                </div>
              </div>

              {/* 작업 통계 */}
              <div>
                <h3 className="font-medium mb-4">작업 통계</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">대기 중:</span>
                    <span className="font-medium">{SYSTEM_STATUS.queuedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">완료됨:</span>
                    <span className="font-medium">{SYSTEM_STATUS.completedTasks.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">실패함:</span>
                    <span className="font-medium">{SYSTEM_STATUS.failedTasks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">평균 응답시간:</span>
                    <span className="font-medium">{SYSTEM_STATUS.avgResponseTime}ms</span>
                  </div>
                </div>
              </div>

              {/* 빠른 작업 */}
              <div>
                <h3 className="font-medium mb-4">빠른 작업</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    시스템 새로고침
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    캐시 정리
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    로그 다운로드
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    성능 모니터
                  </Button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}