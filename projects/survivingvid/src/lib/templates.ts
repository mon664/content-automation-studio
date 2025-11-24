// 템플릿 시스템 - AutoVid 8개 템플릿 완전 복사

import { Template } from '@/types/autovid';

// 모든 템플릿 데이터
export const AUTOLID_TEMPLATES: { [key: string]: Template } = {
  'BLACK': {
    Id: "9fa9a756-3374-49fb-80db-e7f53178f547",
    IsDefault: true,
    TemplateName: "BLACK DEFAULT",
    BackgroundColor: "#FF000000",
    TopHeightPercent: 15.0,
    BottomHeightPercent: 15.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 255, G: 232, B: 9 },
        X: 0.017197220413773064,
        Y: 0.00972380638122556,
        Content: "Channel Name",
        FontSize: 48.0,
        FontColor: "#FFE809",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 255, B: 255 },
        X: 0.021288836443865047,
        Y: 0.866513252258303,
        Content: "Description",
        FontSize: 44.0,
        FontColor: "#FFFFFF",
        FontFamilyName: "Segoe UI Semibold",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'WHITE': {
    Id: "8fa9a756-3374-49fb-80db-e7f53178f547",
    IsDefault: false,
    TemplateName: "WHITE DEFAULT",
    BackgroundColor: "#FFFFFFFF",
    TopHeightPercent: 15.0,
    BottomHeightPercent: 15.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 74, G: 88, B: 191 },
        X: 0.017197220413773064,
        Y: 0.00972380638122556,
        Content: "Channel Name",
        FontSize: 48.0,
        FontColor: "#4A58BF",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 0, G: 0, B: 0 },
        X: 0.021288836443865047,
        Y: 0.866513252258303,
        Content: "Description",
        FontSize: 44.0,
        FontColor: "#000000",
        FontFamilyName: "Segoe UI Semibold",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-BeigeBrown': {
    Id: "789b4b30-93a7-46ed-b528-f546017844f1",
    IsDefault: false,
    TemplateName: "StoryCard BeigeBrown",
    BackgroundColor: "#FFFFFBE5",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 127, G: 105, B: 82 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#7F6952",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 127, G: 105, B: 82 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#7F6952",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 127, G: 105, B: 82 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#7F6952",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 127, G: 105, B: 82 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#7F6952",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 127, G: 105, B: 82 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#7F6952",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-BeigeRed': {
    Id: "0fc874f5-c5ef-4973-b006-ecddd701f156",
    IsDefault: false,
    TemplateName: "StoryCard BeigeRed",
    BackgroundColor: "#FFFFFBE5",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-BlackPink': {
    Id: "f4c296c3-a5ec-4017-9469-64988a3f0145",
    IsDefault: false,
    TemplateName: "StoryCard BlackPink",
    BackgroundColor: "#FF000000",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 255, G: 77, B: 159 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#FF4D9F",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 77, B: 159 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#FF4D9F",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 77, B: 159 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#FF4D9F",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 77, B: 159 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#FF4D9F",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 77, B: 159 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#FF4D9F",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-WhiteBlue': {
    Id: "7d87f396-2912-4df1-a957-cbe6dfa1c458",
    IsDefault: false,
    TemplateName: "StoryCard WhiteBlue",
    BackgroundColor: "#FFFFFFFF",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 96, G: 140, B: 255 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#608CFF",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 96, G: 140, B: 255 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#608CFF",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 96, G: 140, B: 255 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#608CFF",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 96, G: 140, B: 255 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#608CFF",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 96, G: 140, B: 255 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#608CFF",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-WhiteGreen': {
    Id: "8047feac-52d0-4322-a7a9-70ec493c2c9f",
    IsDefault: false,
    TemplateName: "StoryCard WhiteGreen",
    BackgroundColor: "#FFFFFFFF",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 78, G: 255, B: 182 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#4EFFB6",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 78, G: 255, B: 182 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#4EFFB6",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 78, G: 255, B: 182 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#4EFFB6",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 78, G: 255, B: 182 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#4EFFB6",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 78, G: 255, B: 182 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#4EFFB6",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  },
  'StoryCard-WhiteRed': {
    Id: "1b82df66-e71d-4681-9bf4-cdd75c0fa68e",
    IsDefault: false,
    TemplateName: "StoryCard WhiteRed",
    BackgroundColor: "#FFFFFFFF",
    TopHeightPercent: 32.0,
    BottomHeightPercent: 7.0,
    FixedTexts: [
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.0234375,
        Y: 0.0833333358168602,
        Content: "<",
        FontSize: 60.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.0859375,
        Y: 0.0833333358168602,
        Content: "CHANNEL NAME",
        FontSize: 50.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI Bold",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.9453125,
        Y: 0.0833333358168602,
        Content: "☰",
        FontSize: 40.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.1171875,
        Y: 0.1666666716337204,
        Content: "Views",
        FontSize: 30.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      },
      {
        FontColorAsColor: { A: 255, R: 255, G: 91, B: 113 },
        X: 0.1171875,
        Y: 0.2083333283662796,
        Content: "Posted by",
        FontSize: 20.0,
        FontColor: "#FF5B71",
        FontFamilyName: "Segoe UI",
        IsBold: false
      }
    ],
    Stickers: []
  }
};

// 템플릿 관리 클래스
export class TemplateManager {
  static getTemplate(name: string): Template | null {
    return AUTOLID_TEMPLATES[name] || null;
  }

  static getAllTemplates(): Template[] {
    return Object.values(AUTOLID_TEMPLATES);
  }

  static getDefaultTemplate(): Template {
    return AUTOLID_TEMPLATES['BLACK'];
  }

  static getTemplateNames(): string[] {
    return Object.keys(AUTOLID_TEMPLATES);
  }

  static updateTemplate(name: string, updates: Partial<Template>): Template | null {
    const template = AUTOLID_TEMPLATES[name];
    if (!template) return null;

    const updatedTemplate = { ...template, ...updates };
    AUTOLID_TEMPLATES[name] = updatedTemplate;

    return updatedTemplate;
  }

  static createTemplate(template: Template): void {
    AUTOLID_TEMPLATES[template.TemplateName] = template;
  }

  static deleteTemplate(name: string): boolean {
    if (name === 'BLACK' || name === 'WHITE') {
      return false; // 기본 템플릿은 삭제 불가
    }

    return delete AUTOLID_TEMPLATES[name];
  }

  // 템플릿을 HTML/CSS로 변환
  static templateToCSS(template: Template): string {
    const baseCSS = `
      .template-container {
        width: 1080px;
        height: 1920px;
        background-color: ${template.BackgroundColor};
        position: relative;
        overflow: hidden;
      }

      .template-content {
        position: absolute;
        top: ${template.TopHeightPercent}%;
        left: 0;
        right: 0;
        bottom: ${template.BottomHeightPercent}%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
    `;

    const fixedTextsCSS = template.FixedTexts.map((text, index) => `
      .fixed-text-${index} {
        position: absolute;
        left: ${text.X * 100}%;
        top: ${text.Y * 100}%;
        font-size: ${text.FontSize}px;
        color: ${text.FontColor};
        font-family: ${text.FontFamilyName};
        font-weight: ${text.IsBold ? 'bold' : 'normal'};
        z-index: 10;
      }
    `).join('\n');

    return baseCSS + fixedTextsCSS;
  }

  // 템플릿 미리보기 생성
  static generatePreview(template: Template, content?: string): string {
    const previewHTML = `
      <div class="template-preview" style="
        width: 270px;
        height: 480px;
        background-color: ${template.BackgroundColor};
        position: relative;
        overflow: hidden;
        transform: scale(0.25);
        transform-origin: top left;
      ">
        <div style="position: absolute; top: ${template.TopHeightPercent}%; left: 0; right: 0; bottom: ${template.BottomHeightPercent}%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
          ${content || '<h2>Preview Content</h2>'}
        </div>
        ${template.FixedTexts.map((text, index) => `
          <div style="
            position: absolute;
            left: ${text.X * 100}%;
            top: ${text.Y * 100}%;
            font-size: ${text.FontSize / 4}px;
            color: ${text.FontColor};
            font-family: ${text.FontFamilyName};
            font-weight: ${text.IsBold ? 'bold' : 'normal'};
            z-index: 10;
          ">${text.Content}</div>
        `).join('')}
      </div>
    `;

    return previewHTML;
  }
}