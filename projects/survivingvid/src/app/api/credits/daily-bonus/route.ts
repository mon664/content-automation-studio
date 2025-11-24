import { NextRequest, NextResponse } from 'next/server';
import { CreditService } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const bonusReceived = await CreditService.giveDailyLoginBonus(userId);

    if (bonusReceived) {
      return NextResponse.json({
        success: true,
        message: '일일 로그인 보너스를 받았습니다! (S-CRD +1)'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: '오늘 이미 보너스를 받았습니다.'
      }, { status: 400 });
    }

  } catch (error) {
    console.error('일일 보너스 API 오류:', error);

    return NextResponse.json(
      {
        error: '일일 보너스 지급에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}