import { NextRequest, NextResponse } from 'next/server';
import { getVertexAIInstance } from '@/lib/vertex-ai';
import { ScriptResponse, AIImageModel } from '@/types/autovid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 요청 데이터 검증
    if (!body.script || !body.model) {
      return NextResponse.json(
        { error: 'script와 model 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    const script: ScriptResponse = body.script;
    const model: AIImageModel = body.model || 'flux-realistic';

    // Vertex AI 이미지 생성
    const vertexAI = getVertexAIInstance();
    const results = await vertexAI.generateImagesForScript(script, model);

    const allImages = [results.opening, ...results.snippets].filter(Boolean);

    return NextResponse.json({
      success: true,
      data: {
        images: allImages,
        openingImage: results.opening,
        snippetImages: results.snippets,
        model: model,
        totalGenerated: allImages.length
      }
    });

  } catch (error) {
    console.error('이미지 생성 API 오류:', error);

    return NextResponse.json(
      {
        error: '이미지 생성에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid 이미지 생성 API',
    endpoints: {
      POST: '/api/generate-images',
      description: 'Vertex AI를 사용한 이미지 생성'
    },
    usage: {
      script: 'ScriptResponse (필수) - 생성된 스크립트 데이터',
      model: 'AIImageModel (선택) - 이미지 생성 모델 (기본값: flux-realistic)'
    },
    availableModels: {
      'animagine31': '애니메이션 스타일',
      'chibitoon': '치비 만화 스타일',
      'enna-sketch': '스케치 스타일',
      'flux-dark': 'FLUX 다크톤',
      'flux-realistic': 'FLUX 사실적',
      'flux-webtoon': 'FLUX 웹툰 스타일'
    }
  });
}