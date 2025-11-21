from flask import Blueprint, request, jsonify
import os
import tempfile
import subprocess
from datetime import datetime, timedelta
import uuid
from gtts import gTTS
from PIL import Image, ImageDraw, ImageFont
import requests

# OpenCV 임포트 (의존성 문제 방지)
try:
    import cv2
    import numpy as np
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    print("Warning: OpenCV not available. Some video features will be disabled.")

video_bp = Blueprint('video', __name__)

@video_bp.route('/generate-script', methods=['POST'])
def generate_video_script():
    """영상용 스크립트 생성"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']
    voice_speed = data.get('voice_speed', 'normal')  # slow, normal, fast
    language = data.get('language', 'ko')  # ko, en

    try:
        # 스크립트 분할
        script_segments = split_script_for_video(content)

        # 각 세그먼트별 음성 생성 준비
        segments_with_timing = []

        for i, segment in enumerate(script_segments):
            # 예상 재생 시간 계산
            duration = estimate_audio_duration(segment, voice_speed)

            segments_with_timing.append({
                'segment_id': i + 1,
                'text': segment,
                'duration': duration,
                'voice_speed': voice_speed,
                'language': language
            })

        return jsonify({
            'success': True,
            'script_segments': segments_with_timing,
            'total_segments': len(segments_with_timing),
            'total_duration': sum(seg['duration'] for seg in segments_with_timing),
            'generated_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/generate-audio', methods=['POST'])
def generate_audio():
    """TTS 음성 생성"""
    data = request.get_json()

    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400

    text = data['text']
    language = data.get('language', 'ko')
    slow = data.get('slow', False)

    try:
        # 고유 파일명 생성
        audio_filename = f"audio_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}.mp3"
        temp_audio_path = os.path.join(tempfile.gettempdir(), audio_filename)

        # gTTS로 음성 생성
        tts = gTTS(text=text, lang=language, slow=slow)
        tts.save(temp_audio_path)

        # WebDAV에 업로드
        from modules.storage import webdav_manager
        upload_result = webdav_manager.upload_file(temp_audio_path, folder_type='audio')

        # 임시 파일 삭제
        os.unlink(temp_audio_path)

        if upload_result['success']:
            return jsonify({
                'success': True,
                'audio_url': upload_result['url'],
                'duration': get_audio_duration(upload_result['url']),
                'text': text,
                'language': language,
                'generated_at': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Failed to upload audio'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/create-slideshow', methods=['POST'])
def create_slideshow():
    """이미지 슬라이드쇼 생성"""
    data = request.get_json()

    if not data or 'script_segments' not in data:
        return jsonify({'error': 'Script segments are required'}), 400

    script_segments = data['script_segments']
    video_style = data.get('style', 'professional')  # professional, casual, cinematic
    resolution = data.get('resolution', '1080p')  # 720p, 1080p, 4k

    try:
        # 해상도 설정
        if resolution == '720p':
            width, height = 1280, 720
        elif resolution == '4k':
            width, height = 3840, 2160
        else:  # 1080p
            width, height = 1920, 1080

        # 슬라이드 이미지 생성
        slide_images = []
        image_urls = []

        for i, segment in enumerate(script_segments):
            # 슬라이드 이미지 생성
            slide_path = create_text_slide(segment['text'], width, height, video_style, i + 1)

            # WebDAV에 업로드
            from modules.storage import webdav_manager
            upload_result = webdav_manager.upload_file(slide_path, folder_type='slides')

            if upload_result['success']:
                slide_images.append(slide_path)
                image_urls.append(upload_result['url'])
                os.unlink(slide_path)  # 임시 파일 삭제

        return jsonify({
            'success': True,
            'slide_count': len(image_urls),
            'image_urls': image_urls,
            'resolution': resolution,
            'style': video_style,
            'created_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/create-video', methods=['POST'])
def create_video():
    """최종 영상 생성 (이미지 + 오디오)"""
    data = request.get_json()

    if not data or 'image_urls' not in data or 'audio_url' not in data:
        return jsonify({'error': 'Image URLs and audio URL are required'}), 400

    image_urls = data['image_urls']
    audio_url = data['audio_url']
    output_filename = data.get('filename', f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}.mp4")
    transition = data.get('transition', 'fade')  # fade, slide, zoom
    background_music = data.get('background_music', False)

    try:
        # 이미지들 다운로드
        image_paths = []
        temp_dir = tempfile.mkdtemp()

        for i, url in enumerate(image_urls):
            response = requests.get(url)
            if response.status_code == 200:
                image_path = os.path.join(temp_dir, f"slide_{i:03d}.jpg")
                with open(image_path, 'wb') as f:
                    f.write(response.content)
                image_paths.append(image_path)

        # 오디오 다운로드
        audio_response = requests.get(audio_url)
        if audio_response.status_code != 200:
            return jsonify({'error': 'Failed to download audio'}), 400

        audio_path = os.path.join(temp_dir, "audio.mp3")
        with open(audio_path, 'wb') as f:
            f.write(audio_response.content)

        # 비디오 생성
        video_path = create_video_from_slideshow(
            image_paths, audio_path, temp_dir, output_filename, transition
        )

        # WebDAV에 업로드
        from modules.storage import webdav_manager
        upload_result = webdav_manager.upload_file(video_path, folder_type='videos')

        # 임시 파일 정리
        import shutil
        shutil.rmtree(temp_dir)

        if upload_result['success']:
            # 영상 정보 가져오기
            video_info = get_video_info(upload_result['url'])

            return jsonify({
                'success': True,
                'video_url': upload_result['url'],
                'filename': upload_result['filename'],
                'video_info': video_info,
                'created_at': datetime.now().isoformat()
            })
        else:
            return jsonify({'error': 'Failed to upload video'}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/create-youtube-short', methods=['POST'])
def create_youtube_short():
    """유튜브 쇼츠 형식 영상 생성 (9:16 비율)"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']
    music = data.get('music', 'trending')  # trending, corporate, cinematic, background
    duration_limit = data.get('duration_limit', 59)  # YouTube Shorts 최대 59초

    try:
        # 콘텐츠를 59초 이내로 조정
        if len(content) > 500:  # 대략적인 단어 수 제한
            content = content[:497] + "..."

        # 스크립트 생성
        script_segments = split_script_for_video(content, max_duration=duration_limit)

        # 세로 모드 슬라이드 생성 (1080x1920)
        slide_images = []
        image_urls = []

        for i, segment in enumerate(script_segments):
            # 세로 슬라이드 생성
            slide_path = create_vertical_slide(segment['text'], 1080, 1920, i + 1)

            # WebDAV 업로드
            from modules.storage import webdav_manager
            upload_result = webdav_manager.upload_file(slide_path, folder_type='shorts-slides')

            if upload_result['success']:
                image_urls.append(upload_result['url'])
                os.unlink(slide_path)

        # 짧은 오디오 생성 (최대 59초)
        short_content = ' '.join([seg['text'] for seg in script_segments])
        # 오디오 생성 및 비디오 제작 로직...

        return jsonify({
            'success': True,
            'message': 'YouTube Shorts creation initiated',
            'slide_count': len(image_urls),
            'image_urls': image_urls,
            'duration_limit': duration_limit,
            'music_style': music,
            'created_at': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def split_script_for_video(content, max_duration=None):
    """비디용 스크립트 분할"""
    sentences = content.split('.')
    segments = []

    # 문장별로 분할하되 적절한 길이로 조절
    current_segment = ""
    current_duration = 0

    for sentence in sentences:
        if not sentence.strip():
            continue

        sentence = sentence.strip() + "."
        sentence_duration = estimate_audio_duration(sentence)

        if current_duration + sentence_duration > (max_duration or 10):
            if current_segment:
                segments.append({
                    'text': current_segment.strip(),
                    'duration': current_duration
                })
                current_segment = sentence
                current_duration = sentence_duration
            else:
                # 문장이 너무 길 경우 강제 분할
                mid = len(sentence) // 2
                segments.append({
                    'text': sentence[:mid].strip(),
                    'duration': estimate_audio_duration(sentence[:mid])
                })
                segments.append({
                    'text': sentence[mid:].strip(),
                    'duration': estimate_audio_duration(sentence[mid:])
                })
        else:
            current_segment += " " + sentence
            current_duration += sentence_duration

    if current_segment.strip():
        segments.append({
            'text': current_segment.strip(),
            'duration': current_duration
        })

    return segments

def estimate_audio_duration(text, speed='normal'):
    """음성 재생 시간 추정 (초)"""
    words_per_minute = {
        'slow': 100,
        'normal': 150,
        'fast': 200
    }

    wpm = words_per_minute.get(speed, 150)
    words = len(text.split())
    duration = (words / wpm) * 60

    return duration

def create_text_slide(text, width, height, style, slide_number):
    """텍스트 슬라이드 생성 (OpenCV 미사용 버전)"""
    # 이미지 생성
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # 스타일별 설정
    if style == 'professional':
        bg_color = '#f8f9fa'
        text_color = '#2c3e50'
        accent_color = '#3498db'
        font_size = width // 20
    elif style == 'cinematic':
        bg_color = '#1a1a1a'
        text_color = '#ffffff'
        accent_color = '#e74c3c'
        font_size = width // 18
    else:  # casual
        bg_color = '#fff8dc'
        text_color = '#333333'
        accent_color = '#27ae60'
        font_size = width // 22

    # 배경색 적용
    img = Image.new('RGB', (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    # 텍스트 줄바꿈
    max_chars_per_line = width // (font_size // 2)
    lines = []
    current_line = ""
    words = text.split()

    for word in words:
        if len(current_line + word) <= max_chars_per_line:
            current_line += word + " "
        else:
            if current_line:
                lines.append(current_line.strip())
            current_line = word + " "
    if current_line:
        lines.append(current_line.strip())

    # 텍스트 그리기
    try:
        # 기본 폰트 사용 (PIL 기본 폰트)
        font = ImageFont.load_default()
    except:
        font = None

    line_height = font_size + 10
    total_text_height = len(lines) * line_height

    # 수직 중앙 정렬
    start_y = (height - total_text_height) // 2

    for i, line in enumerate(lines):
        y_position = start_y + (i * line_height)
        # 수평 중앙 정렬 (근사)
        text_width = len(line) * (font_size // 3)
        x_position = (width - text_width) // 2

        draw.text((x_position, y_position), line, fill=text_color, font=font)

    # 슬라이드 번호 추가
    slide_text = f"{slide_number}"
    draw.text((50, height - 100), slide_text, fill=accent_color, font=font)

    # 임시 파일 저장
    temp_path = os.path.join(tempfile.gettempdir(), f"slide_{uuid.uuid4().hex[:8]}.jpg")
    img.save(temp_path, quality=95)

    return temp_path

def create_vertical_slide(text, width, height, slide_number):
    """세로 슬라이드 생성 (YouTube Shorts용)"""
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)

    # 세로 모드에 최적화된 폰트 크기
    font_size = width // 12
    max_chars_per_line = width // (font_size // 2.5)

    # 텍스트 처리
    lines = []
    current_line = ""
    words = text.split()

    for word in words:
        if len(current_line + word) <= max_chars_per_line:
            current_line += word + " "
        else:
            if current_line:
                lines.append(current_line.strip())
            current_line = word + " "
    if current_line:
        lines.append(current_line.strip())

    # 텍스트 그리기
    try:
        font = ImageFont.load_default()
    except:
        font = None

    line_height = font_size + 15
    total_text_height = len(lines) * line_height

    # 세로 중앙 정렬 (여백 고려)
    start_y = (height - total_text_height) // 3

    for i, line in enumerate(lines):
        y_position = start_y + (i * line_height)
        text_width = len(line) * (font_size // 2.5)
        x_position = (width - text_width) // 2

        draw.text((x_position, y_position), line, fill='#333333', font=font)

    # 슬라이드 번호
    draw.text((30, height - 100), str(slide_number), fill='#3498db', font=font)

    temp_path = os.path.join(tempfile.gettempdir(), f"vertical_slide_{uuid.uuid4().hex[:8]}.jpg")
    img.save(temp_path, quality=90)

    return temp_path

def create_video_from_slideshow(image_paths, audio_path, temp_dir, output_filename, transition='fade'):
    """슬라이드쇼 비디오 생성 (FFmpeg 전용 버전)"""
    video_path = os.path.join(temp_dir, output_filename)

    # FFmpeg로 직접 비디오 생성 (이미지 목록 파일 사용)
    concat_list_path = os.path.join(temp_dir, "image_list.txt")
    with open(concat_list_path, 'w') as f:
        for img_path in image_paths:
            f.write(f"file '{img_path}'\n")
            f.write(f"duration 2\n")  # 각 이미지 2초

    # 오디오와 비디오 결합
    final_video_path = os.path.join(temp_dir, f"final_{output_filename}")
    ffmpeg_cmd = [
        'ffmpeg', '-y',
        '-f', 'concat', '-safe', '0', '-i', concat_list_path,
        '-i', audio_path,
        '-c:v', 'libx264', '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-shortest',
        final_video_path
    ]

    try:
        subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
        return final_video_path
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {e}")
        return None

def get_audio_duration(audio_url):
    """오디오 길이 가져오기"""
    try:
        # FFmpeg 사용하여 오디오 정보 가져오기
        cmd = [
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1', audio_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except:
        pass
    return 0

def get_video_info(video_url):
    """비디오 정보 가져오기"""
    try:
        cmd = [
            'ffprobe', '-v', 'error', '-show_entries', 'format=duration,size',
            '-of', 'default=noprint_wrappers=1:nokey=1', video_url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            lines = result.stdout.strip().split('\n')
            duration = float(lines[0]) if lines[0] else 0
            size = int(lines[1]) if len(lines) > 1 and lines[1] else 0
            return {
                'duration': duration,
                'size': size,
                'size_mb': round(size / (1024 * 1024), 2)
            }
    except:
        pass
    return {'duration': 0, 'size': 0, 'size_mb': 0}