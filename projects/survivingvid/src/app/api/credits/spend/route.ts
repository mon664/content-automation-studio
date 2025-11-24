import { NextRequest, NextResponse } from 'next/server';
import { CreditService } from '@/lib/credits';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, action, quantity = 1, metadata } = body;

    if (!userId || !action) {
      return NextResponse.json(
        { error: '사용자 ID와 액션이 필요합니다.' },
        { status: 400 }
      );
    }

    // 사용 가능 여부 확인
    const canAfford = await CreditService.canAfford(userId, action, quantity);
    if (!canAfford) {
      return NextResponse.json(
        { error: '크레딧이 부족합니다.' },
        { status: 400 }
      );
    }

    // 크레딧 차감
    const transaction = await CreditService.spendCredits(
      userId,
      action,
      quantity,
      metadata
    );

    return NextResponse.json({
      success: true,
      data: {
        transaction,
        remainingBalance: transaction.balance
      }
    });

  } catch (error) {
    console.error('크레딧 차감 API 오류:', error);

    return NextResponse.json(
      {
        error: '크레딧 차감에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}