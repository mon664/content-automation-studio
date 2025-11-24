import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface YouTubeDownloadRequest {
  url: string;
  quality?: '360p' | '720p' | '1080p' | 'highest' | 'audio-only';
  format?: 'mp4' | 'mp3' | 'webm';
}

interface VideoMetadata {
  title: string;
  description: string;
  duration: string;
  uploader: string;
  uploadDate: string;
  viewCount: string;
  thumbnailUrl: string;
  durationSeconds: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: YouTubeDownloadRequest = await request.json();

    // 요청 데이터 검증
    if (!body.url) {
      return NextResponse.json(
        { error: 'URL 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    const { url, quality = '720p', format = 'mp4' } = body;

    // yt-dlp 설치 확인
    try {
      await execAsync('yt-dlp --version');
    } catch (error) {
      return NextResponse.json(
        {
          error: 'yt-dlp가 설치되지 않았습니다. 먼저 설치해주세요.',
          installInstructions: 'pip install yt-dlp 또는 npm install yt-dlp'
        },
        { status: 500 }
      );
    }

    // 고유 ID 생성
    const downloadId = uuidv4();
    const downloadsDir = path.join(process.cwd(), 'downloads');
    const outputDir = path.join(downloadsDir, downloadId);

    // 다운로드 디렉토리 생성
    await fs.mkdir(outputDir, { recursive: true });

    // 비디오 정보 추출
    const metadata = await getVideoMetadata(url);

    if (!metadata) {
      return NextResponse.json(
        { error: '비디오 정보를 가져올 수 없습니다.' },
        { status: 400 }
      );
    }

    // 다운로드 옵션 설정
    let downloadCommand = '';
    let outputFile = '';

    if (format === 'mp3' || quality === 'audio-only') {
      // 오디오만 다운로드
      outputFile = `${downloadId}/audio.%(ext)s`;
      downloadCommand = `yt-dlp --extract-audio --audio-format mp3 --audio-quality 0 -o "${outputFile}" "${url}"`;
    } else {
      // 비디오 다운로드
      const formatMap: { [key: string]: string } = {
        '360p': 'worst[height<=360]',
        '720p': 'worst[height<=720]',
        '1080p': 'worst[height<=1080]',
        'highest': 'best'
      };

      const formatSelector = formatMap[quality] || 'worst[height<=720]';
      outputFile = `${downloadId}/video.%(ext)s`;
      downloadCommand = `yt-dlp -f "${formatSelector}" -o "${outputFile}" "${url}"`;
    }

    // 다운로드 실행
    console.log(`다운로드 시작: ${url}`);
    const { stdout, stderr } = await execAsync(downloadCommand, {
      cwd: downloadsDir,
      timeout: 300000 // 5분 타임아웃
    });

    if (stderr && !stderr.includes('100%')) {
      console.error('다운로드 오류:', stderr);
      return NextResponse.json(
        {
          error: '다운로드에 실패했습니다.',
          details: stderr
        },
        { status: 500 }
      );
    }

    // 다운로드된 파일 확인
    const files = await fs.readdir(outputDir);
    const downloadedFile = files.find(file =>
      file.endsWith('.mp4') || file.endsWith('.mp3') || file.endsWith('.webm')
    );

    if (!downloadedFile) {
      return NextResponse.json(
        { error: '다운로드된 파일을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    const filePath = path.join(outputDir, downloadedFile);
    const fileStats = await fs.stat(filePath);

    return NextResponse.json({
      success: true,
      data: {
        downloadId,
        metadata,
        fileInfo: {
          fileName: downloadedFile,
          filePath,
          fileSize: fileStats.size,
          format,
          quality
        }
      }
    });

  } catch (error) {
    console.error('YouTube 다운로드 API 오류:', error);

    return NextResponse.json(
      {
        error: '다운로드에 실패했습니다.',
        details: error instanceof Error ? error.message : '알 수 없는 오류'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid YouTube 다운로드 API',
    endpoints: {
      POST: '/api/youtube/download',
      description: 'yt-dlp를 사용한 YouTube 비디오/오디오 다운로드'
    },
    usage: {
      url: 'string (필수) - YouTube 비디오 URL',
      quality: 'string (선택) - 비디오 품질 (360p, 720p, 1080p, highest, audio-only)',
      format: 'string (선택) - 파일 형식 (mp4, mp3, webm)'
    },
    examples: {
      download: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        quality: '720p',
        format: 'mp4'
      },
      audioOnly: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        quality: 'audio-only',
        format: 'mp3'
      }
    },
    requirements: {
      'yt-dlp': 'yt-dlp가 시스템에 설치되어 있어야 합니다',
      'permissions': '다운로드 디렉토리에 쓰기 권한 필요'
    }
  });
}

async function getVideoMetadata(url: string): Promise<VideoMetadata | null> {
  try {
    // yt-dlp로 비디오 메타데이터 추출
    const command = `yt-dlp --dump-json --no-download "${url}"`;
    const { stdout } = await execAsync(command);

    const data = JSON.parse(stdout);

    return {
      title: data.title || 'Unknown Title',
      description: data.description || '',
      duration: data.duration || '0:00',
      uploader: data.uploader || 'Unknown Uploader',
      uploadDate: data.upload_date || '',
      viewCount: data.view_count?.toString() || '0',
      thumbnailUrl: data.thumbnail || '',
      durationSeconds: data.duration || 0
    };

  } catch (error) {
    console.error('메타데이터 추출 오류:', error);

    // 기본 메타데이터 추출 시도
    try {
      const command = `yt-dlp --get-title --get-description --get-duration --get-uploader --get-upload-date --get-view-count --get-thumbnail "${url}"`;
      const { stdout } = await execAsync(command);

      const lines = stdout.split('\n');
      return {
        title: lines[0]?.replace('Title: ', '') || 'Unknown Title',
        description: lines[1]?.replace('Description: ', '') || '',
        duration: lines[2]?.replace('Duration: ', '') || '0:00',
        uploader: lines[3]?.replace('Uploader: ', '') || 'Unknown Uploader',
        uploadDate: lines[4]?.replace('Upload date: ', '') || '',
        viewCount: lines[5]?.replace('View count: ', '') || '0',
        thumbnailUrl: lines[6]?.replace('Thumbnail: ', '') || '',
        durationSeconds: 0
      };
    } catch (fallbackError) {
      console.error('기본 메타데이터 추출 실패:', fallbackError);
      return null;
    }
  }
}