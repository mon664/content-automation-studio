'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleIcon } from '@/components/ui/google-icon';
import { Loader2, Chrome } from 'lucide-react';

export default function LoginPage() {
  const { signIn, loading } = useAuth();
  const [signInLoading, setSignInLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setSignInLoading(true);
      await signIn();
    } catch (error) {
      console.error('로그인 실패:', error);
    } finally {
      setSignInLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
              <Chrome className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              SurvivingVid
            </CardTitle>
            <CardDescription className="text-gray-600">
              AI 영상 생성 플랫폼에 오신 것을 환영합니다
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="text-center text-sm text-gray-600">
                <p>Google 계정으로 로그인하여 모든 기능을 이용하세요</p>
              </div>

              <Button
                onClick={handleGoogleSignIn}
                disabled={signInLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition-colors"
              >
                {signInLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    로그인 중...
                  </>
                ) : (
                  <>
                    <GoogleIcon className="w-5 h-5 mr-2" />
                    Google로 로그인
                  </>
                )}
              </Button>
            </div>

            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium text-gray-900 mb-2">로그인 후 이용 가능한 기능</h3>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>AI 스크립트 생성</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>이미지 생성</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>영상 편집</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>크레딧 시스템</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>YouTube 다운로드</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>템플릿 에디터</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <div className="text-center text-xs text-gray-500">
                <p>로그인 시 SurvivingVid의</p>
                <p className="font-medium">서비스 약관 및 개인정보 처리방침</p>
                <p>에 동의하게 됩니다</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>AutoVid v1.3.6.0 완벽 복제</p>
          <p className="text-xs mt-1">© 2024 SurvivingVid</p>
        </div>
      </div>
    </div>
  );
}