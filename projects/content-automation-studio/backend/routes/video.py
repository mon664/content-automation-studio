from flask import Blueprint, request, jsonify
from utils.webdav import WebDAVManager
from utils.ai_client import AIClient
import tempfile
import os
import subprocess

video_bp = Blueprint('video', __name__)

@video_bp.route('/generate-script', methods=['POST'])
def generate_video_script():
    """영상용 스크립트 생성"""
    data = request.get_json()

    if not data or 'content' not in data:
        return jsonify({'error': 'Content is required'}), 400

    content = data['content']
    style = data.get('style', 'informative')  # informative, casual, professional

    try:
        ai_client = AIClient()
        result = ai_client.generate_tts_script(content)

        if result['success']:
            return jsonify({
                'success': True,
                'script': result['text'],
                'style': style,
                'estimated_duration': estimate_duration(result['text'])
            })
        else:
            return jsonify({'error': result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/generate-slideshow', methods=['POST'])
def generate_slideshow():
    """이미지 슬라이드쇼 생성"""
    data = request.get_json()

    if not data or 'script' not in data or 'image_count' not in data:
        return jsonify({'error': 'Script and image count are required'}), 400

    script = data['script']
    image_count = data['image_count']
    topic = data.get('topic', 'AI generated content')

    try:
        # 스크립트를 세그먼트로 분할
        script_segments = divide_script_into_segments(script, image_count)

        # 각 세그먼트에 대한 이미지 생성 프롬프트 생성
        image_prompts = []
        ai_client = AIClient()

        for i, segment in enumerate(script_segments):
            prompt = f"""
            Create a professional image prompt for a slideshow about: {topic}

            Scene {i+1}/{len(script_segments)} context: {segment[:200]}

            Requirements:
            - Professional photography style
            - Clean, modern aesthetic
            - Related to the content theme
            - High quality, well-lit
            - Suitable for business/educational content

            Format: A professional photograph of...
            """

            result = ai_client.generate_text(prompt, max_length=200)
            if result['success']:
                image_prompts.append(result['text'].strip())
            else:
                image_prompts.append(f"Professional image related to {topic}")

        return jsonify({
            'success': True,
            'script_segments': script_segments,
            'image_prompts': image_prompts,
            'total_segments': len(script_segments)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@video_bp.route('/create-video', methods=['POST'])
def create_video():
    """FFmpeg로 영상 생성"""
    data = request.get_json()

    if not data or 'image_urls' not in data or 'audio_url' not in data:
        return jsonify({'error': 'Image URLs and audio URL are required'}), 400

    image_urls = data['image_urls']
    audio_url = data['audio_url']
    output_filename = data.get('filename', f"video_{int(os.times()[4])}.mp4")
    duration_per_image = data.get('duration_per_image', 5)  # 초

    try:
        # 이미지 파일 다운로드
        webdav = WebDAVManager()
        image_files = []

        with tempfile.TemporaryDirectory() as temp_dir:
            for i, url in enumerate(image_urls):
                # 이미지 다운로드
                response = requests.get(url)
                if response.status_code == 200:
                    image_path = os.path.join(temp_dir, f"image_{i:03d}.jpg")
                    with open(image_path, 'wb') as f:
                        f.write(response.content)
                    image_files.append(image_path)

            # 오디오 다운로드
            audio_response = requests.get(audio_url)
            audio_path = os.path.join(temp_dir, "audio.mp3")
            if audio_response.status_code == 200:
                with open(audio_path, 'wb') as f:
                    f.write(audio_response.content)
            else:
                return jsonify({'error': 'Failed to download audio'}), 400

            # FFmpeg 명령어 생성
            output_path = os.path.join(temp_dir, output_filename)

            # 이미지들을 비디오로 변환
            ffmpeg_cmd = [
                'ffmpeg',
                '-y',  # 기존 파일 덮어쓰기
                '-loop', '1',
                '-framerate', '1/5',  # 5초당 1프레임
                '-i', image_files[0],  # 첫 번째 이미지
                '-i', audio_path,
                '-c:v', 'libx264',
                '-c:a', 'aac',
                '-shortest',
                '-pix_fmt', 'yuv420p',
                output_path
            ]

            # 여러 이미지가 있는 경우
            if len(image_files) > 1:
                # 이미지 목록 파일 생성
                concat_list_path = os.path.join(temp_dir, "image_list.txt")
                with open(concat_list_path, 'w') as f:
                    for img_file in image_files:
                        duration = duration_per_image
                        f.write(f"file '{img_file}'\n")
                        f.write(f"duration {duration}\n")

                ffmpeg_cmd = [
                    'ffmpeg',
                    '-y',
                    '-f', 'concat',
                    '-safe', '0',
                    '-i', concat_list_path,
                    '-i', audio_path,
                    '-c:v', 'libx264',
                    '-c:a', 'aac',
                    '-shortest',
                    '-pix_fmt', 'yuv420p',
                    output_path
                ]

            # FFmpeg 실행
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)

            if result.returncode == 0:
                # 생성된 비디오를 WebDAV에 업로드
                upload_result = webdav.upload_file(output_path)

                if upload_result['success']:
                    return jsonify({
                        'success': True,
                        'video_url': upload_result['url'],
                        'filename': output_filename,
                        'duration': get_video_duration(output_path)
                    })
                else:
                    return jsonify({'error': 'Failed to upload video'}), 500
            else:
                return jsonify({
                    'error': 'FFmpeg execution failed',
                    'details': result.stderr
                }), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

def divide_script_into_segments(script, segment_count):
    """스크립트를 지정된 수의 세그먼트로 분할"""
    sentences = script.split('.')
    segments = []
    sentences_per_segment = max(1, len(sentences) // segment_count)

    for i in range(0, len(sentences), sentences_per_segment):
        segment = '.'.join(sentences[i:i + sentences_per_segment]).strip()
        if segment:
            segments.append(segment)

    # 정확한 개수 맞추기
    while len(segments) < segment_count:
        # 마지막 세그먼트 분할
        if segments:
            last_segment = segments[-1]
            mid = len(last_segment) // 2
            segments[-1] = last_segment[:mid].strip()
            segments.insert(len(segments), last_segment[mid:].strip())

    return segments[:segment_count]

def estimate_duration(script):
    """스크립트 음성 길이 추정 (분당 150단어 기준)"""
    word_count = len(script.split())
    duration_seconds = (word_count / 150) * 60
    return round(duration_seconds, 1)

def get_video_duration(video_path):
    """비디오 길이 가져오기"""
    try:
        cmd = [
            'ffprobe',
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video_path
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            return float(result.stdout.strip())
    except:
        pass
    return 0