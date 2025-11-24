import { NextRequest, NextResponse } from 'next/server';
import { generateVideoScript } from '@/lib/gemini';
import { ScriptRequest } from '@/types/autovid';

export async function POST(request: NextRequest) {
  try {
    const body: ScriptRequest = await request.json();

    // 요청 데이터 검증
    if (!body.subject || !body.requestNumber || !body.requestLanguage) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 스크립트 생성
    const script = await generateVideoScript(body);

    return NextResponse.json({
      success: true,
      data: script
    });

  } catch (error) {
    console.error('스크립트 생성 API 오류:', error);

    return NextResponse.json(
      {
        error: '스크립트 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid 스크립트 생성 API',
    endpoints: {
      POST: '/api/generate-script',
      description: 'AI 스크립트 생성'
    },
    usage: {
      subject: 'string (필수) - 영상 주제',
      requestNumber: 'number (필수) - 생성할 파트 수',
      requestLanguage: 'string (필수) - 언어 코드 (ko-KR, en-US)',
      includeOpeningSegment: 'boolean (선택) - 오프닝 포함 여부',
      includeClosingSegment: 'boolean (선택) - 클로징 포함 여부',
      includeImageGenPrompt: 'boolean (선택) - 이미지 생성 프롬프트 포함 여부'
    }
  });
}