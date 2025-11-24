'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Calendar,
  Gift,
  ShoppingBag,
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { CreditTransaction, CreditUsage } from '@/types/credits';
import { CreditService } from '@/lib/credits';

export default function CreditsPage() {
  const { user, userProfile, loading } = useAuth();
  const [balance, setBalance] = useState<any>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 사용 가능한 기능 및 비용
  const availableActions: CreditUsage[] = [
    {
      action: 'generate_script',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: 'AI 스크립트 생성'
    },
    {
      action: 'generate_images',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: 'AI 이미지 생성 (1개당)'
    },
    {
      action: 'render_video',
      cost: { 'S-CRD': 2, 'E-CRD': 0 },
      description: '영상 렌더링'
    },
    {
      action: 'download_youtube',
      cost: { 'S-CRD': 1, 'E-CRD': 0 },
      description: 'YouTube 영상 다운로드'
    },
    {
      action: 'export_high_quality',
      cost: { 'S-CRD': 0, 'E-CRD': 1 },
      description: '고품질 내보내기'
    }
  ];

  // 데이터 로드
  useEffect(() => {
    if (user) {
      loadCreditData();
    }
  }, [user]);

  const loadCreditData = async () => {
    if (!user) return;

    try {
      setLoadingData(true);

      // 잔액 조회
      const balanceResponse = await fetch(`/api/credits/balance?userId=${user.uid}`);
      const balanceData = await balanceResponse.json();

      if (balanceData.success) {
        setBalance(balanceData.data);
      }

      // 트랜잭션 내역 조회
      const historyResponse = await fetch(`/api/credits/history?userId=${user.uid}&limit=20`);
      const historyData = await historyResponse.json();

      if (historyData.success) {
        setTransactions(historyData.data.transactions);
      }

    } catch (error) {
      console.error('크레딧 데이터 로드 오류:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadCreditData();
    setRefreshing(false);
  };

  // 일일 로그인 보너스 받기
  const claimDailyBonus = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/credits/daily-bonus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();

      if (data.success) {
        await refreshData();
        alert('일일 로그인 보너스를 받았습니다! (S-CRD +1)');
      } else {
        alert(data.error || '보너스 받기에 실패했습니다.');
      }

    } catch (error) {
      console.error('일일 보너스 오류:', error);
      alert('보너스 받기에 실패했습니다.');
    }
  };

  if (loading || loadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">크레딧 관리</h1>
            <p className="text-gray-600 mt-1">사용 가능한 크레딧을 확인하고 관리하세요</p>
          </div>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {/* 크레딧 잔액 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900">무료 크레딧</CardTitle>
                <Gift className="w-5 h-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {balance?.['S-CRD'] || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">S-CRD</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">일일 보너스</span>
                  <Badge variant="secondary">+1</Badge>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={claimDailyBonus}
                  className="w-full"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  일일 보너스 받기
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900">유료 크레딧</CardTitle>
                <ShoppingBag className="w-5 h-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {balance?.['E-CRD'] || 0}
              </div>
              <p className="text-sm text-gray-600 mt-1">E-CRD</p>
              <div className="mt-4">
                <Button size="sm" className="w-full" asChild>
                  <a href="/shop">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    크레딧 구매하기
                  </a>
                </Button>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </Card>

          <Card className="relative overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-medium text-gray-900">총 크레딧</CardTitle>
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {(balance?.['S-CRD'] || 0) + (balance?.['E-CRD'] || 0)}
              </div>
              <p className="text-sm text-gray-600 mt-1">전체 크레딧</p>
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">구독 플랜</span>
                  <Badge variant="outline">
                    {userProfile?.subscription?.plan?.toUpperCase() || 'FREE'}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-10 -mt-10 opacity-50"></div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 크레딧 사용 비용 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                기능별 크레딧 비용
              </CardTitle>
              <CardDescription>
                각 기능 사용 시 필요한 크레딧입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {availableActions.map((action, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{action.description}</div>
                      <div className="text-sm text-gray-600">{action.action}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {action.cost['S-CRD'] > 0 && (
                        <Badge variant="secondary">
                          S-CRD {action.cost['S-CRD']}
                        </Badge>
                      )}
                      {action.cost['E-CRD'] > 0 && (
                        <Badge variant="secondary">
                          E-CRD {action.cost['E-CRD']}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 최근 트랜잭션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                최근 사용 내역
              </CardTitle>
              <CardDescription>
                최근 크레딧 사용 및 충전 내역입니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                {transactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>사용 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((transaction, index) => (
                      <div key={transaction.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'spend'
                            ? 'bg-red-100 text-red-600'
                            : transaction.type === 'earn'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'spend' ? (
                            <TrendingDown className="w-4 h-4" />
                          ) : transaction.type === 'earn' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <Gift className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900">
                            {transaction.description}
                          </div>
                          <div className="text-sm text-gray-600">
                            {new Date(transaction.createdAt?.toDate?.() || transaction.createdAt).toLocaleString('ko-KR')}
                          </div>
                        </div>
                        <div className={`font-bold ${
                          transaction.type === 'spend' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {transaction.type === 'spend' ? '-' : '+'}
                          {transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* 크레딧 안내 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              크레딧 안내
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  무료 크레딧 (S-CRD) 획득 방법
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>신규 가입 시 10개 지급</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>일일 로그인 보너스 1개</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>친구 추천 시 5개 지급 (추가 예정)</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-purple-600" />
                  유료 크레딧 (E-CRD) 구매
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>Shop 페이지에서 다양한 패키지 구매 가능</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>월간 구독 플랜 시 매달 지급</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span>대용량 패키지 구매 시 추가 보너스</span>
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