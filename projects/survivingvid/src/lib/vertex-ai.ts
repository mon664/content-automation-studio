// Vertex AI Imagen 통합 - AutoVid 이미지 생성 대체

import { VertexAI } from '@google-cloud/vertexai';
import { AIImageModel } from '@/types/autovid';

// Vertex AI 모델 매핑
const VERTEX_AI_MODELS = {
  'animagine31': 'imagen-3.0-generate-001',
  'chibitoon': 'imagen-3.0-generate-001',
  'enna-sketch': 'imagen-3.0-generate-001',
  'flux-dark': 'imagen-3.0-generate-001',
  'flux-realistic': 'imagen-3.0-generate-001',
  'flux-webtoon': 'imagen-3.0-generate-001'
} as const;

// 모델별 프롬프트 스타일
const MODEL_PROMPT_STYLES = {
  'animagine31': {
    style: 'anime illustration, Japanese animation style, vibrant colors, detailed artwork',
    mood: 'energetic, dynamic, anime aesthetic'
  },
  'chibitoon': {
    style: 'chibi cartoon style, cute characters, simplified features, playful',
    mood: 'adorable, friendly, whimsical'
  },
  'enna-sketch': {
    style: 'pencil sketch, hand-drawn, artistic, monochrome with touches of color',
    mood: 'artistic, creative, thoughtful'
  },
  'flux-dark': {
    style: 'dark theme, dramatic lighting, high contrast, moody atmosphere',
    mood: 'mysterious, intense, dramatic'
  },
  'flux-realistic': {
    style: 'photorealistic, high resolution, professional photography, detailed',
    mood: 'authentic, professional, lifelike'
  },
  'flux-webtoon': {
    style: 'webtoon manhwa style, clean lines, digital art, Korean comic aesthetic',
    mood: 'modern, engaging, colorful'
  }
} as const;

export class VertexAIImageGenerator {
  private vertexAI: VertexAI;

  constructor(projectId: string, location: string = 'us-central1') {
    this.vertexAI = new VertexAI({
      project: projectId,
      location: location
    });
  }

  async generateImage(
    prompt: string,
    model: AIImageModel = 'flux-realistic',
    options: {
      aspectRatio?: '1:1' | '9:16' | '16:9';
      numberOfImages?: number;
      style?: 'photograph' | 'digital_art' | 'oil_painting' | 'watercolor';
    } = {}
  ): Promise<string[]> {
    try {
      const modelStyle = MODEL_PROMPT_STYLES[model];
      const fullPrompt = `${prompt}. Style: ${modelStyle.style}. Mood: ${modelStyle.mood}`;

      const imagenModel = this.vertexAI.getGenerativeModel({
        model: VERTEX_AI_MODELS[model]
      });

      const request = {
        prompt: fullPrompt,
        numberOfImages: options.numberOfImages || 1,
        aspectRatio: options.aspectRatio || '9:16',
        stylePreset: options.style || 'digital_art',
        safetyFilterLevel: 'block_some',
        personGeneration: 'allow_adult'
      };

      const response = await imagenModel.generateImages(request);

      if (response.images && response.images.length > 0) {
        return response.images.map(image => image.buffer?.toString('base64') || '');
      }

      throw new Error('이미지 생성 실패');
    } catch (error) {
      console.error('Vertex AI 이미지 생성 오류:', error);
      throw error;
    }
  }

  async generateImagesForScript(
    script: any, // ScriptResponse 타입
    model: AIImageModel = 'flux-realistic'
  ): Promise<{ opening: string; snippets: string[] }> {
    const results = {
      opening: '',
      snippets: [] as string[]
    };

    try {
      // 오프닝 이미지 생성
      if (script.openingSegment?.imageGenPrompt) {
        const openingImages = await this.generateImage(
          script.openingSegment.imageGenPrompt,
          model,
          { aspectRatio: '9:16' }
        );
        results.opening = openingImages[0];
      }

      // 스니펫 이미지 생성
      if (script.snippets) {
        for (const snippet of script.snippets) {
          if (snippet.imageGenPrompt) {
            const snippetImages = await this.generateImage(
              snippet.imageGenPrompt,
              model,
              { aspectRatio: '9:16' }
            );
            results.snippets.push(snippetImages[0]);
          }
        }
      }

      return results;
    } catch (error) {
      console.error('스크립트용 이미지 생성 오류:', error);
      throw error;
    }
  }
}

// 유틸리티 함수
export const createImagePrompt = (
  subject: string,
  segmentTitle: string,
  style: AIImageModel = 'flux-realistic'
): string => {
  const styleInfo = MODEL_PROMPT_STYLES[style];

  return `Professional YouTube video thumbnail about "${segmentTitle}" from "${subject}".
  Create a visually compelling image with ${styleInfo.style} that captures the essence of the topic.
  The image should be eye-catching, shareable, and suitable for social media.
  Make it engaging with ${styleInfo.mood} atmosphere. No text or words in the image.`;
};

export const validateImagePrompt = (prompt: string): boolean => {
  return prompt.length <= 120 && !/\b(text|word|letter|font)\b/i.test(prompt);
};

// 싱글톤 인스턴스
let vertexAIInstance: VertexAIImageGenerator | null = null;

export const getVertexAIInstance = (): VertexAIImageGenerator => {
  if (!vertexAIInstance) {
    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
    if (!projectId) {
      throw new Error('GOOGLE_CLOUD_PROJECT_ID 환경 변수가 필요합니다.');
    }
    vertexAIInstance = new VertexAIImageGenerator(projectId);
  }
  return vertexAIInstance;
};