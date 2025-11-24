import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { YouTubeDownloader } from '@/lib/youtube';

const execAsync = promisify(exec);

interface YouTubeInfoRequest {
  url: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: YouTubeInfoRequest = await request.json();

    if (!body.url) {
      return NextResponse.json(
        { error: 'URL 필드가 필요합니다.' },
        { status: 400 }
      );
    }

    // URL 유효성 검사
    if (!YouTubeDownloader.isValidYouTubeUrl(body.url)) {
      return NextResponse.json(
        { error: '유효한 YouTube URL이 아닙니다.' },
        { status: 400 }
      );
    }

    // YouTube 영상 정보 추출
    const videoInfo = await YouTubeDownloader.getVideoInfo(body.url);

    return NextResponse.json({
      success: true,
      data: videoInfo
    });

  } catch (error) {
    console.error('YouTube 정보 API 오류:', error);

    // 기존 방식으로 fallback
    try {
      const metadata = await getVideoInfo(body.url);

      if (!metadata) {
        return NextResponse.json(
          { error: '비디오 정보를 가져올 수 없습니다.' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: metadata
      });

    } catch (fallbackError) {
      return NextResponse.json(
        {
          error: '비디오 정보를 가져오는 데 실패했습니다.',
          details: error instanceof Error ? error.message : '알 수 없는 오류'
        },
        { status: 500 }
      );
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'SurvivingVid YouTube 정보 API',
    endpoints: {
      POST: '/api/youtube/info',
      description: 'YouTube 비디오 메타데이터 추출'
    },
    usage: {
      url: 'string (필수) - YouTube 비디오 URL'
    }
  });
}

async function getVideoInfo(url: string) {
  try {
    // yt-dlp로 비디오 메타데이터 추출
    const command = `yt-dlp --dump-json --no-download "${url}"`;
    const { stdout } = await execAsync(command);

    const data = JSON.parse(stdout);

    return {
      id: data.id || '',
      title: data.title || '',
      description: data.description || '',
      duration: data.duration || 0,
      durationString: formatDuration(data.duration || 0),
      uploader: data.uploader || '',
      uploaderId: data.uploader_id || '',
      uploadDate: data.upload_date || '',
      viewCount: data.view_count || 0,
      likeCount: data.like_count || 0,
      thumbnailUrl: data.thumbnail || '',
      thumbnails: data.thumbnails || [],
      formats: data.formats?.map((format: any) => ({
        formatId: format.format_id || '',
        ext: format.ext || '',
        resolution: format.resolution || '',
        fps: format.fps || 0,
        filesize: format.filesize || 0,
        url: format.url || ''
      })) || [],
      tags: data.tags || [],
      category: data.category || '',
      language: data.language || ''
    };

  } catch (error) {
    console.error('메타데이터 추출 오류:', error);

    // 기본 정보 추출 시도
    try {
      const command = `yt-dlp --get-title --get-description --get-duration --get-uploader --get-upload-date --get-view-count --get-thumbnail --get-format "${url}"`;
      const { stdout } = await execAsync(command);

      const lines = stdout.split('\n');

      // 간단한 포맷트 정보 파싱
      const formatLine = lines.find(line => line.includes('Format code'));
      const resolutions = ['360p', '480p', '720p', '1080p', '2160p'];
      const availableFormats = resolutions.filter(res =>
        formatLine?.includes(res) || stdout.includes(res)
      );

      return {
        id: url.split('v=')[1]?.split('&')[0] || '',
        title: lines[0]?.replace('Title: ', '') || '',
        description: lines[1]?.replace('Description: ', '') || '',
        duration: 0,
        durationString: lines[2]?.replace('Duration: ', '') || '',
        uploader: lines[3]?.replace('Uploader: ', '') || '',
        uploaderId: '',
        uploadDate: lines[4]?.replace('Upload date: ', '') || '',
        viewCount: parseInt(lines[5]?.replace('View count: ', '') || '0', 10),
        likeCount: 0,
        thumbnailUrl: lines[6]?.replace('Thumbnail: ', '') || '',
        thumbnails: [],
        formats: availableFormats.map(res => ({
          formatId: res,
          ext: 'mp4',
          resolution: res,
          fps: 30,
          filesize: 0,
          url: url
        })),
        tags: [],
        category: '',
        language: ''
      };
    } catch (fallbackError) {
      console.error('기본 정보 추출 실패:', fallbackError);
      return null;
    }
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}