// ASS 자막 시스템 - AutoVid 완전 호환

export interface ASSStyle {
  Name: string;
  Fontname: string;
  Fontsize: number;
  PrimaryColour: string;
  SecondaryColour: string;
  OutlineColour: string;
  BackColour: string;
  Bold: number;
  Italic: number;
  Underline: number;
  StrikeOut: number;
  ScaleX: number;
  ScaleY: number;
  Spacing: number;
  Angle: number;
  BorderStyle: number;
  Outline: number;
  Shadow: number;
  Alignment: number;
  MarginL: number;
  MarginR: number;
  MarginV: number;
  Encoding: number;
}

export interface ASSDialogue {
  Layer: number;
  Start: string;
  End: string;
  Style: string;
  Name: string;
  MarginL: number;
  MarginR: number;
  MarginV: number;
  Effect: string;
  Text: string;
}

export interface ASSFile {
  scriptInfo: {
    ScriptType: string;
    PlayResX: number;
    PlayResY: number;
    WrapStyle: number;
  };
  styles: ASSStyle[];
  dialogues: ASSDialogue[];
}

// AutoVid 기본 스타일 정의
export const AUTOVID_STYLES: ASSStyle[] = [
  {
    Name: 'Title',
    Fontname: '나눔스퀘어 Bold',
    Fontsize: 100,
    PrimaryColour: '&H00FFFFFF',
    SecondaryColour: '&H00FFFFFF',
    OutlineColour: '&H00000000',
    BackColour: '&H80000000',
    Bold: 0,
    Italic: 0,
    Underline: 0,
    StrikeOut: 0,
    ScaleX: 100,
    ScaleY: 100,
    Spacing: 0,
    Angle: 0,
    BorderStyle: 1,
    Outline: 1,
    Shadow: 0,
    Alignment: 4, // 중앙 정렬
    MarginL: 10,
    MarginR: 10,
    MarginV: 10,
    Encoding: 1
  },
  {
    Name: 'Default',
    Fontname: '나눔스퀘어 Regular',
    Fontsize: 72,
    PrimaryColour: '&H00FFFFFF',
    SecondaryColour: '&H00FFFFFF',
    OutlineColour: '&H00000000',
    BackColour: '&H80000000',
    Bold: 0,
    Italic: 0,
    Underline: 0,
    StrikeOut: 0,
    ScaleX: 100,
    ScaleY: 100,
    Spacing: 0,
    Angle: 0,
    BorderStyle: 1,
    Outline: 1,
    Shadow: 0,
    Alignment: 2, // 하단 중앙 정렬
    MarginL: 10,
    MarginR: 10,
    MarginV: 10,
    Encoding: 1
  },
  {
    Name: 'Rank',
    Fontname: '나눔스퀘어 Bold',
    Fontsize: 100,
    PrimaryColour: '&H00FFFFFF',
    SecondaryColour: '&H00FFFFFF',
    OutlineColour: '&H00000000',
    BackColour: '&H80000000',
    Bold: 0,
    Italic: 0,
    Underline: 0,
    StrikeOut: 0,
    ScaleX: 100,
    ScaleY: 100,
    Spacing: 0,
    Angle: 0,
    BorderStyle: 1,
    Outline: 1,
    Shadow: 0,
    Alignment: 2, // 하단 좌측 정렬
    MarginL: 0,
    MarginR: 10,
    MarginV: 0,
    Encoding: 1
  }
];

export class ASSGenerator {
  private scriptInfo = {
    ScriptType: 'v4.00+',
    PlayResX: 1080,
    PlayResY: 1920,
    WrapStyle: 0
  };

  generateASSFile(scriptData: {
    title?: string;
    opening?: string[];
    snippets?: Array<{
      title: string;
      rank: number;
      script: string[];
    }>;
    duration?: number;
  }): ASSFile {
    const dialogues: ASSDialogue[] = [];
    const duration = scriptData.duration || 5; // 기본 5초
    let currentTime = 0;

    // 타이틀 생성
    if (scriptData.title) {
      dialogues.push(this.createDialogue({
        start: this.formatTime(currentTime),
        end: this.formatTime(currentTime + duration),
        style: 'Title',
        text: scriptData.title
      }));
      currentTime += duration + 1; // 1초 간격
    }

    // 오프닝 세그먼트
    if (scriptData.opening && scriptData.opening.length > 0) {
      for (const line of scriptData.opening) {
        dialogues.push(this.createDialogue({
          start: this.formatTime(currentTime),
          end: this.formatTime(currentTime + duration),
          style: 'Default',
          text: line
        }));
        currentTime += duration;
      }
    }

    // 스니펫들
    if (scriptData.snippets) {
      for (const snippet of scriptData.snippets) {
        // 순위 표시
        dialogues.push(this.createDialogue({
          start: this.formatTime(currentTime),
          end: this.formatTime(currentTime + 2),
          style: 'Rank',
          text: `${snippet.rank}. ${snippet.title}`
        }));
        currentTime += 3;

        // 스크립트 내용
        for (const line of snippet.script) {
          dialogues.push(this.createDialogue({
            start: this.formatTime(currentTime),
            end: this.formatTime(currentTime + duration),
            style: 'Default',
            text: line
          }));
          currentTime += duration;
        }
      }
    }

    return {
      scriptInfo: this.scriptInfo,
      styles: AUTOVID_STYLES,
      dialogues
    };
  }

  generateASSText(assFile: ASSFile): string {
    const lines: string[] = [];

    // Script Info 섹션
    lines.push('[Script Info]');
    for (const [key, value] of Object.entries(assFile.scriptInfo)) {
      lines.push(`${key}: ${value}`);
    }
    lines.push('');

    // V4+ Styles 섹션
    lines.push('[V4+ Styles]');
    lines.push('Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding');

    for (const style of assFile.styles) {
      const styleLine = [
        `Style: ${style.Name}`,
        style.Fontname,
        style.Fontsize.toString(),
        style.PrimaryColour,
        style.SecondaryColour,
        style.OutlineColour,
        style.BackColour,
        style.Bold.toString(),
        style.Italic.toString(),
        style.Underline.toString(),
        style.StrikeOut.toString(),
        style.ScaleX.toString(),
        style.ScaleY.toString(),
        style.Spacing.toString(),
        style.Angle.toString(),
        style.BorderStyle.toString(),
        style.Outline.toString(),
        style.Shadow.toString(),
        style.Alignment.toString(),
        style.MarginL.toString(),
        style.MarginR.toString(),
        style.MarginV.toString(),
        style.Encoding.toString()
      ].join(',');
      lines.push(styleLine);
    }
    lines.push('');

    // Events 섹션
    lines.push('[Events]');
    lines.push('Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text');

    for (const dialogue of assFile.dialogues) {
      const dialogueLine = [
        `Dialogue: ${dialogue.Layer}`,
        dialogue.Start,
        dialogue.End,
        dialogue.Style,
        dialogue.Name,
        dialogue.MarginL.toString(),
        dialogue.MarginR.toString(),
        dialogue.MarginV.toString(),
        dialogue.Effect,
        dialogue.Text
      ].join(',');
      lines.push(dialogueLine);
    }

    return lines.join('\n');
  }

  private createDialogue(params: {
    start: string;
    end: string;
    style: string;
    text: string;
  }): ASSDialogue {
    return {
      Layer: 0,
      Start: params.start,
      End: params.end,
      Style: params.style,
      Name: '',
      MarginL: 0,
      MarginR: 0,
      MarginV: 0,
      Effect: '',
      Text: params.text
    };
  }

  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const cs = Math.floor((seconds % 1) * 100);

    return `${hours.toString().padStart(1, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${cs.toString().padStart(2, '0')}`;
  }

  // ASS 파일을 SRT로 변환 (다른 플랫폼 호환성)
  convertToSRT(assFile: ASSFile): string {
    const srtLines: string[] = [];
    let index = 1;

    for (const dialogue of assFile.dialogues) {
      const startTime = this.parseTime(dialogue.Start);
      const endTime = this.parseTime(dialogue.End);

      srtLines.push(index.toString());
      srtLines.push(`${this.formatSRTTime(startTime)} --> ${this.formatSRTTime(endTime)}`);
      srtLines.push(dialogue.Text);
      srtLines.push(''); // 빈 줄

      index++;
    }

    return srtLines.join('\n');
  }

  private parseTime(assTime: string): number {
    const [timePart, csPart] = assTime.split('.');
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    const centiseconds = parseInt(csPart || '0', 10);

    return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
  }

  private formatSRTTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
  }
}

// 기본 ASS 템플릿 (AutoVid 원본)
export const DEFAULT_ASS_TEMPLATE = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Title,나눔스퀘어 Bold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,4,10,10,10,1
Style: Default,나눔스퀘어 Regular,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1
Style: Rank,나눔스퀘어 Bold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,0,0,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:00.00,0:00:05.00,Default,,0000,0000,0000,,Your subtitle text here`;

// 싱글톤 인스턴스
let assGeneratorInstance: ASSGenerator | null = null;

export const getASSGenerator = (): ASSGenerator => {
  if (!assGeneratorInstance) {
    assGeneratorInstance = new ASSGenerator();
  }
  return assGeneratorInstance;
};