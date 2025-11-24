import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { YouTubeVideoInfo, DownloadOptions, DownloadProgress } from '@/types/youtube';
import { CreditService } from './credits';

const execAsync = promisify(exec);

export class YouTubeDownloader {
  private static readonly DOWNLOAD_DIR = path.join(process.cwd(), 'downloads');
  private static readonly PROGRESS_FILE = 'youtube-progress.json';

  static {
    // 다운로드 디렉토리 생성
    if (!fs.existsSync(this.DOWNLOAD_DIR)) {
      fs.mkdirSync(this.DOWNLOAD_DIR, { recursive: true });
    }
  }

  // YouTube 영상 정보 추출
  static async getVideoInfo(url: string): Promise<YouTubeVideoInfo> {
    try {
      const command = `yt-dlp --dump-json --no-download "${url}"`;
      const { stdout } = await execAsync(command);

      const info = JSON.parse(stdout);

      return {
        id: info.id,
        title: info.title || '제목 없음',
        description: info.description || '',
        duration: info.duration || 0,
        durationFormatted: this.formatDuration(info.duration || 0),
        uploader: info.uploader || '알 수 없음',
        uploaderId: info.uploader_id || '',
        uploadDate: info.upload_date || '',
        viewCount: info.view_count || 0,
        likeCount: info.like_count || 0,
        thumbnail: info.thumbnail || '',
        thumbnails: info.thumbnails || [],
        formats: this.parseFormats(info.formats || []),
        audioFormats: this.parseFormats(info.formats?.filter((f: any) => f.acodec && f.acodec !== 'none') || []),
        videoFormats: this.parseFormats(info.formats?.filter((f: any) => f.vcodec && f.vcodec !== 'none') || []),
        fileSize: info.filesize || 0,
        fileSizeHuman: this.formatFileSize(info.filesize || 0),
        tags: info.tags || [],
        category: info.categories?.[0] || '',
        language: info.language || ''
      };

    } catch (error) {
      console.error('YouTube 영상 정보 추출 오류:', error);
      throw new Error('YouTube 영상 정보를 가져올 수 없습니다.');
    }
  }

  // 다운로드 시작
  static async startDownload(
    url: string,
    options: DownloadOptions,
    userId: string
  ): Promise<DownloadProgress> {
    const downloadId = uuidv4();
    const progress: DownloadProgress = {
      id: downloadId,
      url,
      status: 'pending',
      progress: 0,
      speed: 0,
      eta: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      filename: '',
      createdAt: new Date()
    };

    // 진행 상태 저장
    await this.saveProgress(downloadId, progress);

    // 백그라운드에서 다운로드 시작
    this.downloadInBackground(downloadId, url, options, userId);

    return progress;
  }

  // 백그라운드 다운로드
  private static async downloadInBackground(
    downloadId: string,
    url: string,
    options: DownloadOptions,
    userId: string
  ) {
    try {
      // 진행 상태 업데이트
      await this.updateProgress(downloadId, {
        status: 'downloading',
        progress: 0
      });

      const filename = `${downloadId}_${Date.now()}.${options.container}`;
      const outputPath = path.join(this.DOWNLOAD_DIR, filename);

      // yt-dlp 명령어 생성
      let command = `yt-dlp "${url}" -o "${outputPath}"`;

      if (options.formatId) {
        command += ` -f "${options.formatId}"`;
      } else {
        // 품질 기반 포맷 선택
        if (options.type === 'audio') {
          command += ' -f bestaudio';
        } else if (options.type === 'video') {
          command += ` -f "best[height<=${options.quality === 'highest' ? '1080' : options.quality === 'medium' ? '720' : '360'}] + bestaudio/best"`;
        }
      }

      // 컨테이너 강제
      command += ` --merge-output-format ${options.container}`;

      // 다운로드 실행
      const child = exec(command);

      // 진행 상태 모니터링
      let lastProgress = 0;

      child.stdout?.on('data', (data) => {
        const output = data.toString();

        // yt-dlp 진행률 파싱
        const progressMatch = output.match(/(\d+(?:\.\d+)?)%/);
        const speedMatch = output.match(/(\d+(?:\.\d+)?)KiB\/s/);
        const etaMatch = output.match(/ETA\s+(\d+):(\d+)/);

        if (progressMatch) {
          const progress = parseFloat(progressMatch[1]);

          // 10%마다 업데이트
          if (progress - lastProgress >= 10) {
            this.updateProgress(downloadId, {
              progress,
              speed: speedMatch ? parseFloat(speedMatch[1]) * 1024 : 0,
              eta: etaMatch ? (parseInt(etaMatch[1]) * 60 + parseInt(etaMatch[2])) : 0
            });
            lastProgress = progress;
          }
        }
      });

      // 다운로드 완료
      child.on('close', async (code) => {
        if (code === 0) {
          // 크레딧 차감
          try {
            await CreditService.spendCredits(userId, 'download_youtube', 1, {
              url,
              downloadId,
              filename
            });
          } catch (creditError) {
            console.error('크레딧 차감 오류:', creditError);
          }

          // 진행 상태 완료
          const stats = fs.statSync(outputPath);
          await this.updateProgress(downloadId, {
            status: 'completed',
            progress: 100,
            downloadedBytes: stats.size,
            totalBytes: stats.size,
            filename,
            completedAt: new Date()
          });

        } else {
          await this.updateProgress(downloadId, {
            status: 'error',
            error: `다운로드 실패 (종료 코드: ${code})`
          });
        }
      });

      child.on('error', async (error) => {
        await this.updateProgress(downloadId, {
          status: 'error',
          error: error.message
        });
      });

    } catch (error) {
      await this.updateProgress(downloadId, {
        status: 'error',
        error: error instanceof Error ? error.message : '알 수 없는 오류'
      });
    }
  }

  // 다운로드 진행 상태 조회
  static async getProgress(downloadId: string): Promise<DownloadProgress | null> {
    try {
      const progressFile = path.join(this.DOWNLOAD_DIR, `${downloadId}.json`);
      if (!fs.existsSync(progressFile)) {
        return null;
      }

      const data = fs.readFileSync(progressFile, 'utf8');
      return JSON.parse(data);

    } catch (error) {
      console.error('진행 상태 조회 오류:', error);
      return null;
    }
  }

  // 진행 상태 저장
  private static async saveProgress(downloadId: string, progress: DownloadProgress): Promise<void> {
    try {
      const progressFile = path.join(this.DOWNLOAD_DIR, `${downloadId}.json`);
      fs.writeFileSync(progressFile, JSON.stringify(progress, null, 2));
    } catch (error) {
      console.error('진행 상태 저장 오류:', error);
    }
  }

  // 진행 상태 업데이트
  private static async updateProgress(downloadId: string, updates: Partial<DownloadProgress>): Promise<void> {
    try {
      const currentProgress = await this.getProgress(downloadId);
      if (!currentProgress) return;

      const updatedProgress = { ...currentProgress, ...updates };
      await this.saveProgress(downloadId, updatedProgress);
    } catch (error) {
      console.error('진행 상태 업데이트 오류:', error);
    }
  }

  // 다운로드 취소
  static async cancelDownload(downloadId: string): Promise<boolean> {
    try {
      await this.updateProgress(downloadId, {
        status: 'cancelled'
      });

      // 파일 삭제
      const progress = await this.getProgress(downloadId);
      if (progress && progress.filename) {
        const filePath = path.join(this.DOWNLOAD_DIR, progress.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      return true;
    } catch (error) {
      console.error('다운로드 취소 오류:', error);
      return false;
    }
  }

  // 다운로드 목록 조회
  static async getDownloadList(userId?: string): Promise<DownloadProgress[]> {
    try {
      const files = fs.readdirSync(this.DOWNLOAD_DIR);
      const progressFiles = files.filter(file => file.endsWith('.json'));

      const downloads: DownloadProgress[] = [];

      for (const file of progressFiles) {
        try {
          const filePath = path.join(this.DOWNLOAD_DIR, file);
          const data = fs.readFileSync(filePath, 'utf8');
          const progress: DownloadProgress = JSON.parse(data);

          // userId 필터링 (필요시)
          if (!userId || progress.filename.includes(userId)) {
            downloads.push(progress);
          }
        } catch (error) {
          console.error('파일 읽기 오류:', file, error);
        }
      }

      // 최신순 정렬
      return downloads.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    } catch (error) {
      console.error('다운로드 목록 조회 오류:', error);
      return [];
    }
  }

  // 포맷 파싱
  private static parseFormats(formats: any[]): any[] {
    return formats.map(format => ({
      formatId: format.format_id,
      ext: format.ext,
      resolution: format.resolution || `${format.width}x${format.height}`,
      fps: format.fps || 0,
      filesize: format.filesize || 0,
      filesizeHuman: this.formatFileSize(format.filesize || 0),
      tbr: format.tbr || 0,
      vcodec: format.vcodec || 'none',
      acodec: format.acodec || 'none',
      container: format.container || format.ext,
      quality: format.quality || format.format_note || ''
    }));
  }

  // 시간 포맷
  private static formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }

  // 파일 크기 포맷
  private static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // URL 유효성 검사
  static isValidYouTubeUrl(url: string): boolean {
    const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/|youtube\.com\/playlist\?list=)/;
    return youtubeRegex.test(url);
  }

  // URL에서 비디오 ID 추출
  static extractVideoId(url: string): string | null {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }
}