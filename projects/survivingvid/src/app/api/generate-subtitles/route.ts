import { NextRequest, NextResponse } from 'next/server';
import { getASSGenerator } from '@/lib/subtitles';
import { ScriptResponse } from '@/types/autovid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    if (!body.script) {
      return NextResponse.json(
        { error: 'script 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    const script: ScriptResponse = body.script;
    const format: string = body.format || 'ass'; // 'ass' 또는 'srt'
    const duration: number = body.duration || 5; // 기본 5초

    // ASS 자막 생성
    const assGenerator = getASSGenerator();
    const assFile = assGenerator.generateASSFile({
      title: script.title,
      opening: script.openingSegment?.script || [],
      snippets: script.snippets,
      duration: duration
    });

    let result: string;
    let contentType: string;
    let fileName: string;

    if (format === 'srt') {
      result = assGenerator.convertToSRT(assFile);
      contentType = 'text/plain';
      fileName = 'subtitles.srt';
    } else {
      result = assGenerator.generateASSText(assFile);
      contentType = 'text/x-ass';
      fileName = 'subtitles.ass';
    }

    // Base64로 인코딩하여 반환
    const base64Content = Buffer.from(result, 'utf-8').toString('base64');

    return NextResponse.json({
      success: true,
      data: {
        content: base64Content,
        format: format,
        fileName: fileName,
        contentType: contentType,
        totalDialogues: assFile.dialogues.length,
        totalStyles: assFile.styles.length
      }
    });

  } catch (error) {
    console.error('자막 생성 API 오류:', error);

    return NextResponse.json(
      {
        error: '자막 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid 자막 생성 API',
    endpoints: {
      POST: '/api/generate-subtitles',
      description: 'ASS/SRT 형식의 자막 생성'
    },
    usage: {
      script: 'ScriptResponse (필수) - 생성된 스크립트 데이터',
      format: 'string (선택) - 출력 형식 (ass 또는 srt, 기본값: ass)',
      duration: 'number (선택) - 자막 표시 시간 (초, 기본값: 5)'
    },
    availableFormats: {
      ass: 'Advanced SubStation Alpha format',
      srt: 'SubRip Text format'
    },
    styles: {
      Title: '100pt, 중앙 정렬, 나눔스퀘어 Bold',
      Default: '72pt, 하단 정렬, 나눔스퀘어 Regular',
      Rank: '100pt, 하단 좌측 정렬, 나눔스퀘어 Bold'
    }
  });
}