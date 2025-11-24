import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface BGMDownloadRequest {
  trackId: number;
  title: string;
  artist: string;
  url: string;
  genre: string;
  mood: string;
  duration: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: BGMDownloadRequest = await request.json();

    if (!body.trackId || !body.title || !body.url) {
      return NextResponse.json(
        { error: 'BGM 정보가 필요합니다.' },
        { status: 400 }
      );
    }

    const { trackId, title, artist, url, genre, mood, duration } = body;

    // 다운로드 디렉토리 생성
    const bgmDir = path.join(process.cwd(), 'public', 'bgm');
    await fs.mkdir(bgmDir, { recursive: true });

    // 고유 ID 생성
    const downloadId = uuidv4();
    const fileName = `${title.replace(/[^a-z0-9가-힣]/gi, '_')}_${trackId}.mp3`;
    const filePath = path.join(bgmDir, fileName);

    // 파일 다운로드
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('BGM 다운로드 실패');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    // 파일 정보
    const fileStats = await fs.stat(filePath);

    // 메타데이터 파일 생성
    const metadataPath = path.join(bgmDir, `${fileName}.json`);
    const metadata = {
      trackId,
      title,
      artist,
      genre,
      mood,
      duration,
      downloadDate: new Date().toISOString(),
      fileSize: fileStats.size
    };
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

    return NextResponse.json({
      success: true,
      data: {
        downloadId,
        fileName,
        filePath: `/bgm/${fileName}`,
        fileSize: fileStats.size,
        metadata: {
          trackId,
          title,
          artist,
          genre,
          mood,
          duration
        }
      }
    });

  } catch (error) {
    console.error('BGM 다운로드 API 오류:', error);

    return NextResponse.json(
      {
        error: 'BGM 다운로드에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid Pixabay BGM 다운로드 API',
    endpoints: {
      POST: '/api/bgm/download',
      description: 'Pixabay BGM 다운로드'
    },
    usage: {
      trackId: 'number (필수) - 트랙 ID',
      title: 'string (필수) - 트랙 제목',
      artist: 'string (필수) - 아티스트',
      url: 'string (필수) - 다운로드 URL',
      genre: 'string - 장르',
      mood: 'string - 분위기',
      duration: 'number - 재생 시간(초)'
    }
  });
}