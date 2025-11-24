// Gemini용 프롬프트 템플릿 - AutoVid 원본 호환

export const AUTOVID_SYSTEM_PROMPT = `당신은 API 스타일의 어시스턴트입니다.

# 엄격한 출력 정책
1. 오직 "RESPONSE_SCHEMA"와 정확히 일치하는 단일 JSON 객체로만 응답하세요.
2. JSON을 마크다운 펜스로 감싸거나, 주석을 추가하거나, 키 순서를 변경하거나, 추가 속성을 포함하지 마세요.
3. 준수할 수 없는 경우 다음으로 응답하세요:
   { "error": "문제에 대한 설명" }

# 요청 스키마 (참조용)
{
  "subject":            string,   // 예: "세상에서 가장 위험한 관광지"
  "requestNumber":      integer,  // 생성할 파트 개수(1 이상)
  "requestLanguage":    string,   // BCP-47, 예: "ko-KR"
  "includeOpeningSegment":  boolean,
  "includeClosingSegment":  boolean,
  "includeImageGenPrompt":  boolean
}

# 응답 스키마 (키는 이 순서로 나타나야 함)
{
  "title": string,
  "openingSegment": {
    "videoSearchKeyword": [ string, ... ],  // 최소 1개
    "script":            [ string, ... ],  // 문장 배열
    "imageGenPrompt":     string
  },
  "snippets": [
    {
      "videoSearchKeyword": [ string, ... ],
      "segmentTitle":       string,
      "rank":               integer,       // 1…requestNumber
      "script":             [ string, ... ],
      "imageGenPrompt":      string
    }
  ]
}

# 특별 제약조건
- openingSegment.script[0]은 시청자 이탈을 방지하는 호기심 훅으로 시작해야 합니다.
- 모든 imageGenPrompt 길이는 120자 이하여야 합니다.
- script 배열의 각 문장은 자연스러운 한국어여야 합니다.
- imageGenPrompt는 영상의 분위기를 잘 나타내는 구체적인 묘사여야 합니다.

시작.`;

export const createAutoVidPrompt = (request: {
  subject: string;
  requestNumber: number;
  requestLanguage: string;
  includeOpeningSegment: boolean;
  includeClosingSegment: boolean;
  includeImageGenPrompt: boolean;
}): string => {
  return `${AUTOVID_SYSTEM_PROMPT}

# 현재 요청
${JSON.stringify(request, null, 2)}`;
};

// 호기심 훅 예시
export const CURIOSITY_HOOKS = [
  "여러분, 상상해보세요...",
  "오늘은 정말 놀라운 이야기를 들려드릴게요",
  "여러분은 알고 계셨나요?",
  "이것만큼은 꼭 알아두셔야 합니다",
  "지금부터 제일 흥미로운 부분이 시작됩니다",
  "여러분의 인생이 바뀔 수도 있습니다",
  "이 비밀을 알게 되면 세상이 다르게 보일 거예요",
  "전문가들만 아는 이야기를 들려드릴게요"
];

// 이미지 생성 프롬프트 템플릿
export const IMAGE_GEN_PROMPT_TEMPLATE = `Create a visually stunning image for a YouTube video about "{subject}". The image should be:

Style: Professional, high-quality, cinematic
Aspect ratio: 9:16 (vertical video)
Mood: {mood}
Key elements: {elements}

Requirements:
- No text or words in the image
- High resolution, detailed
- Visually engaging and shareable
- Suitable for YouTube thumbnail

Keep the prompt under 120 characters.`;

export const VIDEO_SEARCH_KEYWORD_TEMPLATE = `{subject}, {keywords}, documentary, educational, interesting facts`;