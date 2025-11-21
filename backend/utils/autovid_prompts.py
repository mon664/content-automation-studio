"""
AutoVid 스타일 AI 비디오 스크립트 생성 프롬프트 템플릿
Content Automation Studio에서 비디오 콘텐츠 생성용
"""

def generate_autovid_prompt(subject, request_number=5, request_language="ko-KR",
                           include_opening=True, include_closing=True, include_image_prompt=True):
    """
    AutoVid 스타일의 구조화된 비디오 스크립트 생성 프롬프트

    Args:
        subject (str): 비디오 주제
        request_number (int): 생성할 파트 개수
        request_language (str): 언어 코드 (예: "ko-KR")
        include_opening (bool): 오프닝 세그먼트 포함 여부
        include_closing (bool): 클로징 세그먼트 포함 여부
        include_image_prompt (bool): 이미지 생성 프롬프트 포함 여부

    Returns:
        str: Gemini API용 프롬프트
    """

    return f"""You are an AI video script generator for Content Automation Studio.

# STRICT OUTPUT POLICY
1. Respond **only** with a single JSON object that exactly matches "RESPONSE_SCHEMA".
2. Do **NOT** wrap the JSON in markdown fences, add comments, change key order, or include extra properties.
3. If you cannot comply, respond with:
   {{ "error": "EXPLANATION_OF_PROBLEM" }}

# REQUEST INPUT
{{
  "subject": "{subject}",
  "requestNumber": {request_number},
  "requestLanguage": "{request_language}",
  "includeOpeningSegment": {include_opening},
  "includeClosingSegment": {include_closing},
  "includeImageGenPrompt": {include_image_prompt}
}}

# RESPONSE_SCHEMA  (keys must appear in this order)
{{
  "title": string,
  "openingSegment": {{
    "videoSearchKeyword": [ string, ... ],  // 최소 1개
    "script": [ string, ... ],  // 문장 배열
    "imageGenPrompt": string
  }},
  "snippets": [
    {{
      "videoSearchKeyword": [ string, ... ],
      "segmentTitle": string,
      "rank": integer,       // 1…requestNumber
      "script": [ string, ... ],
      "imageGenPrompt": string
    }}
  ],
  "closingSegment": {{
    "videoSearchKeyword": [ string, ... ],
    "script": [ string, ... ],
    "imageGenPrompt": string
  }}
}}

# SPECIAL_CONSTRAINTS
- openingSegment.script[0] MUST start with a curiosity-hook that prevents viewer drop-off.
- 모든 imageGenPrompt 길이는 120자 이하.
- Each snippet should be 30-60 seconds when spoken.
- Scripts should be conversational and engaging.
- videoSearchKeyword should be relevant for stock video search.
- Rank segments from most interesting to least interesting.

# CONTENT GUIDELINES
- Generate engaging, click-worthy content
- Use storytelling techniques
- Include surprising facts or statistics
- Create emotional connection with viewers
- End with strong call-to-action

Generate a complete video script about "{subject}" following the above schema exactly.

Begin."""

def generate_blog_to_video_prompt(blog_content, target_video_length="5분"):
    """
    블로그 콘텐츠를 비디오 스크립트로 변환하는 프롬프트

    Args:
        blog_content (str): 원본 블로그 콘텐츠
        target_video_length (str): 목표 비디오 길이

    Returns:
        str: Gemini API용 프롬프트
    """

    return f"""You are converting blog content to engaging video scripts.

# BLOG CONTENT
{blog_content}

# TASK
Convert this blog content into a video script with the following structure:

# RESPONSE_SCHEMA
{{
  "title": " catchy video title",
  "openingSegment": {{
    "videoSearchKeyword": ["keyword1", "keyword2"],
    "script": ["hook question", "introduction"],
    "imageGenPrompt": "compelling opening image prompt (120 chars max)"
  }},
  "snippets": [
    {{
      "videoSearchKeyword": ["relevant keywords"],
      "segmentTitle": "engaging segment title",
      "rank": 1,
      "script": ["key point 1", "supporting detail 1", "transition 1"],
      "imageGenPrompt": "relevant image prompt (120 chars max)"
    }}
  ],
  "closingSegment": {{
    "videoSearchKeyword": ["conclusion keywords"],
    "script": ["summary", "call to action"],
    "imageGenPrompt": "memorable closing image (120 chars max)"
  }}
}}

# CONVERSION GUIDELINES
- Extract the most engaging points from the blog
- Transform text-heavy content into conversational speech
- Add visual storytelling elements
- Create suspense and curiosity hooks
- Optimize for {target_video_length} video length
- Include 3-5 main segments

Convert the blog content following this exact schema.

Begin."""

def generate_youtube_seo_prompt(title, description):
    """
    YouTube SEO 최적화를 위한 메타데이터 생성 프롬프트

    Args:
        title (str): 비디오 제목
        description (str): 비디오 설명

    Returns:
        str: Gemini API용 프롬프트
    """

    return f"""Generate YouTube SEO metadata for this video.

# VIDEO INFO
Title: {title}
Description: {description}

# Generate YouTube optimization data:
- Tags (15-20 relevant keywords)
- Playlist suggestions
- End screen suggestions
- Card placement suggestions

# RESPONSE_FORMAT
{{
  "tags": ["tag1", "tag2", ...],
  "playlistIdeas": ["playlist1", "playlist2", ...],
  "endScreenSuggestions": ["suggestion1", "suggestion2", ...],
  "cardPlacements": [
    {{"time": "0:30", "type": "link", "title": "related video title"}},
    {{"time": "2:15", "type": "poll", "question": "engagement question"}}
  ],
  "thumbnailIdeas": ["thumbnail idea 1", "thumbnail idea 2", "thumbnail idea 3"]
}}

Generate complete SEO metadata."""