// Gemini API 통합 - AutoVid 스크립트 생성 대체

import { GoogleGenerativeAI } from '@google/generative-ai';
import { ScriptRequest, ScriptResponse } from '@/types/autovid';
import { createAutoVidPrompt } from './prompts';

export class GeminiScriptGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateScript(request: ScriptRequest): Promise<ScriptResponse> {
    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json'
        }
      });

      const prompt = createAutoVidPrompt(request);

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // JSON 파싱
      let parsedResponse: ScriptResponse;
      try {
        // 마크다운 코드 블록 제거
        const cleanText = text.replace(/```json\s*|\s*```/g, '').trim();
        parsedResponse = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('JSON 파싱 오류:', parseError);
        console.error('원본 응답:', text);
        throw new Error('AI 응답을 파싱할 수 없습니다.');
      }

      // 응답 유효성 검사
      this.validateResponse(parsedResponse, request);

      return parsedResponse;
    } catch (error) {
      console.error('Gemini 스크립트 생성 오류:', error);
      throw error;
    }
  }

  private validateResponse(response: any, request: ScriptRequest): void {
    if (!response.title) {
      throw new Error('응답에 title이 없습니다.');
    }

    if (!response.openingSegment) {
      throw new Error('응답에 openingSegment가 없습니다.');
    }

    if (!response.snippets || !Array.isArray(response.snippets)) {
      throw new Error('응답에 snippets 배열이 없습니다.');
    }

    if (response.snippets.length !== request.requestNumber) {
      throw new Error(`요청된 ${request.requestNumber}개의 스니펫 대신 ${response.snippets.length}개의 스니펫을 받았습니다.`);
    }

    // 각 스니펫 검사
    for (let i = 0; i < response.snippets.length; i++) {
      const snippet = response.snippets[i];
      if (!snippet.segmentTitle || !snippet.script || !snippet.imageGenPrompt) {
        throw new Error(`스니펫 ${i + 1}에 필수 필드가 없습니다.`);
      }

      if (snippet.rank !== i + 1) {
        console.warn(`스니펫 ${i + 1}의 순위가 ${snippet.rank}로 설정되어 있어 수정합니다.`);
        snippet.rank = i + 1;
      }

      // 이미지 프롬프트 길이 검사
      if (snippet.imageGenPrompt.length > 120) {
        console.warn(`스니펫 ${i + 1}의 이미지 프롬프트가 120자를 초과합니다.`);
      }
    }

    // 오프닝 세그먼트 검사
    if (response.openingSegment.imageGenPrompt && response.openingSegment.imageGenPrompt.length > 120) {
      console.warn('오프닝 세그먼트의 이미지 프롬프트가 120자를 초과합니다.');
    }
  }

  async generateScriptWithRetry(
    request: ScriptRequest,
    maxRetries: number = 3
  ): Promise<ScriptResponse> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateScript(request);
      } catch (error) {
        lastError = error as Error;
        console.warn(`스크립트 생성 시도 ${attempt}/${maxRetries} 실패:`, error);

        if (attempt < maxRetries) {
          // 재시도 전 약간의 딜레이
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw lastError!;
  }

  // 스크립트 품질 점수 계산
  calculateScriptQuality(script: ScriptResponse): number {
    let score = 0;
    const maxScore = 100;

    // 제목 품질 (20점)
    if (script.title && script.title.length >= 10 && script.title.length <= 100) {
      score += 20;
    }

    // 오프닝 훅 품질 (15점)
    if (script.openingSegment.script.length > 0) {
      const firstSentence = script.openingSegment.script[0];
      if (this.hasCuriosityHook(firstSentence)) {
        score += 15;
      }
    }

    // 스니펫 균형성 (25점)
    if (script.snippets.length > 0) {
      const avgScriptLength = script.snippets.reduce((sum, s) => sum + s.script.length, 0) / script.snippets.length;
      if (avgScriptLength >= 2 && avgScriptLength <= 5) {
        score += 25;
      }
    }

    // 이미지 프롬프트 품질 (20점)
    let validImagePrompts = 0;
    const allImagePrompts = [script.openingSegment.imageGenPrompt, ...script.snippets.map(s => s.imageGenPrompt)];
    for (const prompt of allImagePrompts) {
      if (prompt && prompt.length <= 120) {
        validImagePrompts++;
      }
    }
    if (validImagePrompts === allImagePrompts.length) {
      score += 20;
    }

    // 전체 구조 (20점)
    if (script.title && script.openingSegment && script.snippets.length > 0) {
      score += 20;
    }

    return Math.min(score, maxScore);
  }

  private hasCuriosityHook(sentence: string): boolean {
    const hooks = [
      '?', '!', '알고 계셨나요?', '상상해보세요', '비밀', '놀라운',
      ' shock', 'surprising', 'amazing', 'incredible'
    ];

    return hooks.some(hook => sentence.toLowerCase().includes(hook));
  }
}

// 싱글톤 인스턴스
let geminiInstance: GeminiScriptGenerator | null = null;

export const getGeminiInstance = (): GeminiScriptGenerator => {
  if (!geminiInstance) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_AI_API_KEY 환경 변수가 필요합니다.');
    }
    geminiInstance = new GeminiScriptGenerator(apiKey);
  }
  return geminiInstance;
};

// 편의 함수
export const generateVideoScript = async (request: ScriptRequest): Promise<ScriptResponse> => {
  const generator = getGeminiInstance();
  return generator.generateScriptWithRetry(request);
};