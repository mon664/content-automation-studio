from flask import Blueprint, request, jsonify
import requests
import os
import tempfile
import uuid
from datetime import datetime
from werkzeug.utils import secure_filename

# WebDAV 클라이언트 임포트 (의존성 문제 방지)
try:
    import webdavclient
    WEBDAV_AVAILABLE = True
except ImportError:
    WEBDAV_AVAILABLE = False
    print("Warning: webdavclient not available. Storage features will be disabled.")

storage_bp = Blueprint('storage', __name__)

# WebDAV 설정
WEBDAV_URL = os.getenv('WEBDAV_URL', 'https://rausu.infini-cloud.net/dav')
WEBDAV_USERNAME = os.getenv('WEBDAV_USERNAME', 'hhtsta')
WEBDAV_PASSWORD = os.getenv('WEBDAV_PASSWORD', 'RXYf3uYhCbL9Ezwa')

class WebDAVManager:
    def __init__(self):
        self.webdav_url = WEBDAV_URL
        self.username = WEBDAV_USERNAME
        self.password = WEBDAV_PASSWORD
        self.client = None

    def connect(self):
        """WebDAV 연결"""
        if not WEBDAV_AVAILABLE:
            print("WebDAV client not available")
            return False

        try:
            self.client = webdavclient.Client(
                url=self.webdav_url,
                username=self.username,
                password=self.password
            )
            return True
        except Exception as e:
            print(f"WebDAV 연결 실패: {e}")
            return False

    def upload_file(self, local_path, remote_path=None, folder_type='uploads'):
        """파일 업로드"""
        if not WEBDAV_AVAILABLE:
            return {'success': False, 'error': 'WebDAV not available'}

        try:
            if not self.client:
                self.connect()

            if not remote_path:
                # 고유 파일명 생성
                timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]
                filename = os.path.basename(local_path)
                name, ext = os.path.splitext(filename)
                remote_filename = f"{timestamp}_{unique_id}_{name}{ext}"

                # 폴더 구조: /uploads/YYYY/MM/
                folder_path = f"/{folder_type}/{datetime.now().strftime('%Y/%m')}"
                remote_path = f"{folder_path}/{remote_filename}"

                # 폴더 생성
                self.create_folder(folder_path)

            # 파일 업로드
            self.client.upload_sync(local_path, remote_path)
            public_url = f"{self.webdav_url}{remote_path}"

            return {
                'success': True,
                'url': public_url,
                'remote_path': remote_path,
                'filename': os.path.basename(remote_path)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def download_file(self, remote_path, local_path=None):
        """파일 다운로드"""
        try:
            if not self.client:
                self.connect()

            if not local_path:
                # 임시 파일 경로 생성
                temp_dir = tempfile.gettempdir()
                filename = os.path.basename(remote_path)
                local_path = os.path.join(temp_dir, filename)

            self.client.download_sync(remote_path, local_path)
            return {
                'success': True,
                'local_path': local_path,
                'filename': os.path.basename(remote_path)
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def list_files(self, path="/uploads"):
        """파일 목록 조회"""
        try:
            if not self.client:
                self.connect()

            files = self.client.list(path)
            file_list = []

            for item in files:
                file_info = {
                    'name': getattr(item, 'name', 'Unknown'),
                    'size': getattr(item, 'size', 0),
                    'modified': getattr(item, 'modified', None),
                    'is_directory': getattr(item, 'is_dir', lambda: False)(),
                    'path': getattr(item, 'path', item.name if hasattr(item, 'name') else 'Unknown')
                }
                file_list.append(file_info)

            return {
                'success': True,
                'files': file_list,
                'current_path': path
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def delete_file(self, remote_path):
        """파일 삭제"""
        try:
            if not self.client:
                self.connect()

            self.client.unlink(remote_path)
            return {'success': True}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def create_folder(self, folder_path):
        """폴더 생성"""
        try:
            if not self.client:
                self.connect()

            self.client.mkdir(folder_path)
            return {'success': True}
        except Exception as e:
            # 폴더가 이미 존재하면 성공으로 처리
            if "already exists" in str(e).lower():
                return {'success': True}
            return {'success': False, 'error': str(e)}

    def get_file_info(self, remote_path):
        """파일 정보 조회"""
        try:
            if not self.client:
                self.connect()

            info = self.client.info(remote_path)
            return {
                'success': True,
                'name': info.name,
                'size': info.size,
                'modified': info.modified,
                'is_directory': info.is_dir(),
                'path': info.path
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}

# WebDAV 매니저 인스턴스
webdav_manager = WebDAVManager()

@storage_bp.route('/upload', methods=['POST'])
def upload_file():
    """파일 업로드 API"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # 파일 보안 검사
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400

    folder_type = request.form.get('folder_type', 'uploads')

    try:
        # 임시 파일 저장
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            file.save(tmp_file.name)

            # WebDAV에 업로드
            upload_result = webdav_manager.upload_file(tmp_file.name, folder_type=folder_type)

            # 임시 파일 삭제
            os.unlink(tmp_file.name)

            if upload_result['success']:
                return jsonify({
                    'success': True,
                    'file_info': upload_result,
                    'original_filename': file.filename,
                    'size': os.path.getsize(tmp_file.name) if os.path.exists(tmp_file.name) else 0
                })
            else:
                return jsonify({'error': upload_result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/download/<path:file_path>')
def download_file(file_path):
    """파일 다운로드 API"""
    try:
        download_result = webdav_manager.download_file(file_path)

        if download_result['success']:
            # 파일을 클라이언트에 전송
            return send_file(download_result['local_path'], as_attachment=True)
        else:
            return jsonify({'error': download_result['error']}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/list', methods=['GET'])
def list_files():
    """파일 목록 조회 API"""
    path = request.args.get('path', '/uploads')

    try:
        files_result = webdav_manager.list_files(path)

        if files_result['success']:
            return jsonify(files_result)
        else:
            return jsonify({'error': files_result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/delete', methods=['DELETE'])
def delete_file():
    """파일 삭제 API"""
    data = request.get_json()

    if not data or 'file_path' not in data:
        return jsonify({'error': 'File path is required'}), 400

    file_path = data['file_path']

    try:
        delete_result = webdav_manager.delete_file(file_path)

        if delete_result['success']:
            return jsonify({
                'success': True,
                'message': f'File {file_path} deleted successfully'
            })
        else:
            return jsonify({'error': delete_result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/info/<path:file_path>')
def get_file_info(file_path):
    """파일 정보 조회 API"""
    try:
        info_result = webdav_manager.get_file_info(file_path)

        if info_result['success']:
            return jsonify(info_result)
        else:
            return jsonify({'error': info_result['error']}), 404

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/create-folder', methods=['POST'])
def create_folder():
    """폴더 생성 API"""
    data = request.get_json()

    if not data or 'folder_path' not in data:
        return jsonify({'error': 'Folder path is required'}), 400

    folder_path = data['folder_path']

    try:
        create_result = webdav_manager.create_folder(folder_path)

        if create_result['success']:
            return jsonify({
                'success': True,
                'message': f'Folder {folder_path} created successfully'
            })
        else:
            return jsonify({'error': create_result['error']}), 500

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/stats', methods=['GET'])
def get_storage_stats():
    """저장소 통계 API"""
    try:
        # 전체 파일 목록 가져오기
        uploads_result = webdav_manager.list_files('/uploads')

        if not uploads_result['success']:
            return jsonify({'error': 'Failed to get file list'}), 500

        files = uploads_result['files']
        total_files = len([f for f in files if not f.get('is_directory', False)])
        total_size = sum(f.get('size', 0) for f in files if not f.get('is_directory', False))

        # 월별 폴더 통계
        monthly_stats = {}
        for file_item in files:
            if not file_item.get('is_directory', False):
                path_parts = file_item['path'].split('/')
                if len(path_parts) >= 3 and path_parts[1] == 'uploads':
                    year_month = f"{path_parts[2]}/{path_parts[3]}" if len(path_parts) > 3 else path_parts[2]
                    if year_month not in monthly_stats:
                        monthly_stats[year_month] = {'count': 0, 'size': 0}
                    monthly_stats[year_month]['count'] += 1
                    monthly_stats[year_month]['size'] += file_item.get('size', 0)

        return jsonify({
            'success': True,
            'stats': {
                'total_files': total_files,
                'total_size': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'monthly_stats': monthly_stats,
                'storage_provider': 'Infini Cloud WebDAV',
                'storage_limit': '20GB (free)',
                'last_updated': datetime.now().isoformat()
            }
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@storage_bp.route('/health', methods=['GET'])
def storage_health():
    """저장소 상태 확인 API"""
    try:
        # WebDAV 연결 테스트
        connect_result = webdav_manager.connect()

        # 기본 폴더 생성 테스트
        if connect_result:
            test_folder = '/uploads/test'
            folder_result = webdav_manager.create_folder(test_folder)

        return jsonify({
            'success': True,
            'status': 'healthy' if connect_result else 'unhealthy',
            'webdav_url': WEBDAV_URL,
            'connected': connect_result,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

def allowed_file(filename):
    """허용된 파일 형식 검사"""
    ALLOWED_EXTENSIONS = {
        'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp',
        'mp4', 'avi', 'mov', 'wmv', 'flv', 'webm',
        'mp3', 'wav', 'ogg', 'flac', 'aac',
        'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
        'zip', 'rar', 'tar', 'gz'
    }

    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_file_size_mb(size_bytes):
    """바이트를 MB로 변환"""
    return round(size_bytes / (1024 * 1024), 2)