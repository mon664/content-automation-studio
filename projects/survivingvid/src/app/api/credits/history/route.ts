import { NextRequest, NextResponse } from 'next/server';
import { CreditService } from '@/lib/credits';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    const history = await CreditService.getTransactionHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: history,
        total: history.length
      }
    });

  } catch (error) {
    console.error('크레딧 내역 조회 API 오류:', error);

    return NextResponse.json(
      {
        error: '크레딧 내역 조회에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}