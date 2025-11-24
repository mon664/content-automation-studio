import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface FontDownloadRequest {
  family: string;
  variant: string;
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FontDownloadRequest = await request.json();

    if (!body.family || !body.url) {
      return NextResponse.json(
        { error: '폰트 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const { family, variant, url } = body;

    // 다운로드 디렉토리 생성
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    await fs.mkdir(fontsDir, { recursive: true });

    // 고유 ID 생성
    const downloadId = uuidv4();
    const extension = url.includes('.woff2') ? '.woff2' :
                     url.includes('.woff') ? '.woff' :
                     url.includes('.ttf') ? '.ttf' : '.ttf';
    const fileName = `${family.replace(/\s+/g, '_')}_${variant}${extension}`;
    const filePath = path.join(fontsDir, fileName);

    // 파일 다운로드
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('폰트 다운로드 실패');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 파일 정보
    const fileStats = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      data: {
        downloadId,
        fileName,
        filePath: `/fonts/${fileName}`,
        fileSize: fileStats.size,
        family,
        variant
      }
    });

  } catch (error) {
    console.error('폰트 다운로드 API 오류:', error);

    return NextResponse.json(
      {
        error: '폰트 다운로드에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid Google Fonts 다운로드 API',
    endpoints: {
      POST: '/api/fonts/download',
      description: 'Google Fonts 다운로드'
    },
    usage: {
      family: 'string (필수) - 폰트 패밀리 이름',
      variant: 'string - 폰트 변형 (기본값: regular)',
      url: 'string (필수) - 폰트 파일 URL'
    }
  });
}