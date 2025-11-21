class RichTextEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.options = {
            placeholder: '내용을 입력하세요...',
            theme: 'snow',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'indent': '-1'}, { 'indent': '+1' }],
                    [{ 'align': [] }],
                    ['blockquote', 'code-block'],
                    [{ 'direction': 'rtl' }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],
                    [{ 'font': [] }],
                    ['clean'],
                    ['link', 'image', 'video']
                ]
            },
            ...options
        };

        this.quill = null;
        this.titleInput = null;
        this.mediaFiles = [];
        this.previewMode = 'desktop';

        this.init();
    }

    init() {
        this.createEditorStructure();
        this.initQuillEditor();
        this.initEventListeners();
        this.initMediaUpload();
        this.initPreview();
    }

    createEditorStructure() {
        this.container.innerHTML = `
            <div class="editor-container">
                <!-- 상단 툴바 -->
                <div class="editor-toolbar">
                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="bold" title="굵게">
                            <i class="fas fa-bold"></i>
                        </button>
                        <button class="toolbar-btn" data-action="italic" title="기울임">
                            <i class="fas fa-italic"></i>
                        </button>
                        <button class="toolbar-btn" data-action="underline" title="밑줄">
                            <i class="fas fa-underline"></i>
                        </button>
                        <button class="toolbar-btn" data-action="strike" title="취소선">
                            <i class="fas fa-strikethrough"></i>
                        </button>
                    </div>

                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="header-1" title="제목1">
                            H1
                        </button>
                        <button class="toolbar-btn" data-action="header-2" title="제목2">
                            H2
                        </button>
                        <button class="toolbar-btn" data-action="header-3" title="제목3">
                            H3
                        </button>
                    </div>

                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="list-ordered" title="순서 목록">
                            <i class="fas fa-list-ol"></i>
                        </button>
                        <button class="toolbar-btn" data-action="list-bullet" title="글머리 기호">
                            <i class="fas fa-list-ul"></i>
                        </button>
                        <button class="toolbar-btn" data-action="indent" title="들여쓰기">
                            <i class="fas fa-indent"></i>
                        </button>
                        <button class="toolbar-btn" data-action="outdent" title="내어쓰기">
                            <i class="fas fa-outdent"></i>
                        </button>
                    </div>

                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="align-left" title="왼쪽 정렬">
                            <i class="fas fa-align-left"></i>
                        </button>
                        <button class="toolbar-btn" data-action="align-center" title="가운데 정렬">
                            <i class="fas fa-align-center"></i>
                        </button>
                        <button class="toolbar-btn" data-action="align-right" title="오른쪽 정렬">
                            <i class="fas fa-align-right"></i>
                        </button>
                        <button class="toolbar-btn" data-action="align-justify" title="양쪽 정렬">
                            <i class="fas fa-align-justify"></i>
                        </button>
                    </div>

                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="blockquote" title="인용">
                            <i class="fas fa-quote-left"></i>
                        </button>
                        <button class="toolbar-btn" data-action="code-block" title="코드 블록">
                            <i class="fas fa-code"></i>
                        </button>
                        <button class="toolbar-btn" data-action="link" title="링크">
                            <i class="fas fa-link"></i>
                        </button>
                        <button class="toolbar-btn" data-action="table" title="표">
                            <i class="fas fa-table"></i>
                        </button>
                    </div>

                    <div class="toolbar-group">
                        <button class="toolbar-btn" data-action="undo" title="실행 취소">
                            <i class="fas fa-undo"></i>
                        </button>
                        <button class="toolbar-btn" data-action="redo" title="다시 실행">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="toolbar-btn" data-action="clean" title="서식 제거">
                            <i class="fas fa-eraser"></i>
                        </button>
                    </div>
                </div>

                <!-- 에디터 메인 레이아웃 -->
                <div class="editor-layout">
                    <!-- 좌측 추가 메뉴 -->
                    <div class="editor-sidebar">
                        <button class="sidebar-btn" data-media="image" title="사진">
                            <i class="fas fa-image"></i>
                            <span>사진</span>
                        </button>
                        <button class="sidebar-btn" data-media="video" title="동영상">
                            <i class="fas fa-video"></i>
                            <span>동영상</span>
                        </button>
                        <button class="sidebar-btn" data-media="sticker" title="스티커">
                            <i class="fas fa-smile"></i>
                            <span>스티커</span>
                        </button>
                        <button class="sidebar-btn" data-media="file" title="파일">
                            <i class="fas fa-paperclip"></i>
                            <span>파일</span>
                        </button>
                    </div>

                    <!-- 본문 영역 -->
                    <div class="editor-content">
                        <div class="title-section">
                            <input type="text" class="title-input" placeholder="제목을 입력하세요..." id="editorTitle">
                        </div>
                        <div class="quill-editor" id="editorContent"></div>
                    </div>
                </div>

                <!-- 미리보기 섹션 -->
                <div class="preview-section">
                    <div class="preview-tabs">
                        <button class="preview-tab active" data-preview="desktop">
                            <i class="fas fa-desktop"></i> 데스크톱
                        </button>
                        <button class="preview-tab" data-preview="mobile">
                            <i class="fas fa-mobile"></i> 모바일
                        </button>
                    </div>
                    <div class="preview-container preview-desktop" id="previewContainer">
                        <div class="preview-content" id="previewContent">
                            <h2 id="previewTitle">제목이 여기에 표시됩니다</h2>
                            <div id="previewBody">내용이 여기에 표시됩니다...</div>
                        </div>
                    </div>
                </div>

                <!-- 액션 버튼 -->
                <div class="editor-actions">
                    <button class="action-btn btn-draft" id="saveDraft">
                        <i class="fas fa-save"></i> 임시저장
                    </button>
                    <button class="action-btn btn-preview" id="togglePreview">
                        <i class="fas fa-eye"></i> 미리보기
                    </button>
                    <button class="action-btn btn-publish" id="publishContent">
                        <i class="fas fa-paper-plane"></i> 발행하기
                    </button>
                </div>
            </div>

            <!-- 미디어 삽입 모달 -->
            <div class="media-modal" id="mediaModal">
                <div class="media-modal-content">
                    <div class="modal-header">
                        <h3 id="modalTitle">미디어 삽입</h3>
                        <button class="close-modal" id="closeModal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="media-upload-area" id="uploadArea">
                        <div class="upload-icon">
                            <i class="fas fa-cloud-upload-alt"></i>
                        </div>
                        <div class="upload-text">파일을 여기에 드래그하거나 클릭하여 업로드</div>
                        <div class="upload-hint">지원 형식: JPG, PNG, GIF, MP4 (최대 10MB)</div>
                        <input type="file" id="fileInput" accept="image/*,video/*" style="display: none;" multiple>
                    </div>

                    <div class="media-grid" id="mediaGrid">
                        <!-- 업로드된 미디어가 여기에 표시됩니다 -->
                    </div>
                </div>
            </div>
        `;

        this.titleInput = document.getElementById('editorTitle');
    }

    initQuillEditor() {
        // Quill 라이브러리 로드
        this.loadScript('https://cdn.quilljs.com/1.3.6/quill.js', () => {
            this.quill = new Quill('#editorContent', this.options);

            // 내용 변경 시 미리보기 업데이트
            this.quill.on('text-change', () => {
                this.updatePreview();
            });

            // 제목 변경 시 미리보기 업데이트
            this.titleInput.addEventListener('input', () => {
                this.updatePreview();
            });
        });
    }

    loadScript(src, callback) {
        let script = document.createElement('script');
        script.src = src;
        script.onload = callback;
        document.head.appendChild(script);
    }

    initEventListeners() {
        // 툴바 버튼 이벤트
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.toolbar-btn')) {
                const btn = e.target.closest('.toolbar-btn');
                const action = btn.dataset.action;
                this.handleToolbarAction(action);
            }
        });

        // 사이드바 미디어 버튼 이벤트
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-btn')) {
                const btn = e.target.closest('.sidebar-btn');
                const mediaType = btn.dataset.media;
                this.openMediaModal(mediaType);
            }
        });

        // 미리보기 탭 이벤트
        this.container.addEventListener('click', (e) => {
            if (e.target.closest('.preview-tab')) {
                const tab = e.target.closest('.preview-tab');
                const previewType = tab.dataset.preview;
                this.switchPreview(previewType);
            }
        });

        // 미디어 모달 이벤트
        document.getElementById('closeModal').addEventListener('click', () => {
            this.closeMediaModal();
        });

        document.getElementById('mediaModal').addEventListener('click', (e) => {
            if (e.target.id === 'mediaModal') {
                this.closeMediaModal();
            }
        });

        // 액션 버튼 이벤트
        document.getElementById('saveDraft').addEventListener('click', () => {
            this.saveDraft();
        });

        document.getElementById('togglePreview').addEventListener('click', () => {
            this.togglePreview();
        });

        document.getElementById('publishContent').addEventListener('click', () => {
            this.publishContent();
        });

        // 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDraft();
                        break;
                    case 'p':
                        e.preventDefault();
                        this.publishContent();
                        break;
                    case 'b':
                        e.preventDefault();
                        this.formatText('bold');
                        break;
                    case 'i':
                        e.preventDefault();
                        this.formatText('italic');
                        break;
                    case 'u':
                        e.preventDefault();
                        this.formatText('underline');
                        break;
                }
            }
        });
    }

    initMediaUpload() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');

        // 클릭으로 파일 선택
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });

        // 파일 선택 처리
        fileInput.addEventListener('change', (e) => {
            this.handleFileUpload(e.target.files);
        });

        // 드래그 앤 드롭
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileUpload(e.dataTransfer.files);
        });
    }

    initPreview() {
        // 초기 미리보기 업데이트
        setTimeout(() => {
            this.updatePreview();
        }, 100);
    }

    handleToolbarAction(action) {
        if (!this.quill) return;

        const range = this.quill.getSelection();

        switch(action) {
            case 'bold':
            case 'italic':
            case 'underline':
            case 'strike':
                this.formatText(action);
                break;
            case 'header-1':
            case 'header-2':
            case 'header-3':
                const headerLevel = parseInt(action.split('-')[1]);
                this.quill.format('header', headerLevel);
                break;
            case 'list-ordered':
                this.quill.format('list', 'ordered');
                break;
            case 'list-bullet':
                this.quill.format('list', 'bullet');
                break;
            case 'align-left':
            case 'align-center':
            case 'align-right':
            case 'align-justify':
                this.quill.format('align', action.split('-')[1]);
                break;
            case 'blockquote':
                this.quill.format('blockquote', true);
                break;
            case 'code-block':
                this.quill.format('code-block', true);
                break;
            case 'undo':
                this.quill.history.undo();
                break;
            case 'redo':
                this.quill.history.redo();
                break;
            case 'clean':
                this.quill.removeFormat(range);
                break;
            case 'link':
                this.insertLink();
                break;
            case 'table':
                this.insertTable();
                break;
        }
    }

    formatText(format) {
        const range = this.quill.getSelection();
        this.quill.format(format, !this.quill.getFormat(range)[format]);
    }

    insertLink() {
        const url = prompt('링크 주소를 입력하세요:', 'https://');
        if (url) {
            const range = this.quill.getSelection();
            this.quill.format('link', url);
        }
    }

    insertTable() {
        // 간단한 테이블 삽입 (실제 구현은 더 복잡할 수 있음)
        const table = `
            <table style="border-collapse: collapse; width: 100%;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">셀 1</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">셀 2</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">셀 3</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">셀 4</td>
                </tr>
            </table>
        `;

        const range = this.quill.getSelection();
        this.quill.clipboard.dangerouslyPasteHTML(range, table);
    }

    openMediaModal(mediaType) {
        const modal = document.getElementById('mediaModal');
        const modalTitle = document.getElementById('modalTitle');

        // 모달 타이틀 업데이트
        const titles = {
            'image': '이미지 삽입',
            'video': '동영상 삽입',
            'sticker': '스티커 삽입',
            'file': '파일 삽입'
        };

        modalTitle.textContent = titles[mediaType] || '미디어 삽입';

        // 파일 입력 타입 설정
        const fileInput = document.getElementById('fileInput');
        fileInput.accept = mediaType === 'video' ? 'video/*' : 'image/*';

        modal.classList.add('active');
    }

    closeMediaModal() {
        document.getElementById('mediaModal').classList.remove('active');
    }

    async handleFileUpload(files) {
        const mediaGrid = document.getElementById('mediaGrid');

        for (let file of files) {
            if (file.size > 10 * 1024 * 1024) { // 10MB 제한
                this.showToast('파일 크기는 10MB를 초과할 수 없습니다.', 'error');
                continue;
            }

            try {
                const mediaItem = await this.processMediaFile(file);
                this.mediaFiles.push(mediaItem);

                // 미디어 그리드에 추가
                const mediaElement = this.createMediaElement(mediaItem);
                mediaGrid.appendChild(mediaElement);

            } catch (error) {
                this.showToast('파일 업로드 중 오류가 발생했습니다: ' + error.message, 'error');
            }
        }
    }

    async processMediaFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                const mediaItem = {
                    id: Date.now() + Math.random(),
                    name: file.name,
                    type: file.type.startsWith('image/') ? 'image' : 'video',
                    size: file.size,
                    url: e.target.result,
                    uploadDate: new Date().toISOString()
                };

                resolve(mediaItem);
            };

            reader.onerror = () => reject(new Error('파일 읽기 실패'));
            reader.readAsDataURL(file);
        });
    }

    createMediaElement(mediaItem) {
        const div = document.createElement('div');
        div.className = 'media-item';
        div.dataset.mediaId = mediaItem.id;

        if (mediaItem.type === 'image') {
            div.innerHTML = `
                <img src="${mediaItem.url}" alt="${mediaItem.name}">
                <div class="media-item-info">${mediaItem.name}</div>
                <button class="media-remove" onclick="editor.removeMedia('${mediaItem.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
        } else {
            div.innerHTML = `
                <video src="${mediaItem.url}" style="width: 100%; height: 120px; object-fit: cover;"></video>
                <div class="media-item-info">${mediaItem.name}</div>
                <button class="media-remove" onclick="editor.removeMedia('${mediaItem.id}')">
                    <i class="fas fa-times"></i>
                </button>
            `;
        }

        div.addEventListener('click', () => {
            this.insertMediaToEditor(mediaItem);
        });

        return div;
    }

    insertMediaToEditor(mediaItem) {
        if (!this.quill) return;

        const range = this.quill.getSelection();

        if (mediaItem.type === 'image') {
            this.quill.insertEmbed(range.index, 'image', mediaItem.url);
        } else {
            // 비디오 삽입 (HTML 형태로)
            const videoHtml = `<video src="${mediaItem.url}" controls style="max-width: 100%; height: auto;"></video>`;
            this.quill.clipboard.dangerouslyPasteHTML(range, videoHtml);
        }

        this.closeMediaModal();
        this.showToast('미디어가 삽입되었습니다.', 'success');
    }

    removeMedia(mediaId) {
        this.mediaFiles = this.mediaFiles.filter(item => item.id !== mediaId);

        const mediaElement = document.querySelector(`[data-media-id="${mediaId}"]`);
        if (mediaElement) {
            mediaElement.remove();
        }

        this.showToast('미디어가 제거되었습니다.', 'success');
    }

    updatePreview() {
        const title = this.titleInput.value || '제목이 여기에 표시됩니다';
        const content = this.quill ? this.quill.root.innerHTML : '내용이 여기에 표시됩니다...';

        document.getElementById('previewTitle').textContent = title;
        document.getElementById('previewBody').innerHTML = content;
    }

    switchPreview(type) {
        // 탭 활성화 상태 변경
        document.querySelectorAll('.preview-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-preview="${type}"]`).classList.add('active');

        // 프리뷰 컨테이너 클래스 변경
        const container = document.getElementById('previewContainer');
        container.className = `preview-container preview-${type}`;

        this.previewMode = type;
    }

    togglePreview() {
        const previewSection = document.querySelector('.preview-section');
        const isHidden = previewSection.style.display === 'none';

        previewSection.style.display = isHidden ? 'block' : 'none';
    }

    saveDraft() {
        const content = {
            title: this.titleInput.value,
            content: this.quill ? this.quill.root.innerHTML : '',
            plainText: this.quill ? this.quill.getText() : '',
            mediaFiles: this.mediaFiles,
            savedAt: new Date().toISOString()
        };

        // 로컬 스토리지에 저장
        localStorage.setItem('editorDraft', JSON.stringify(content));

        this.showToast('콘텐츠가 임시저장되었습니다.', 'success');
    }

    loadDraft() {
        const saved = localStorage.getItem('editorDraft');
        if (saved) {
            const content = JSON.parse(saved);
            this.titleInput.value = content.title;

            if (this.quill && content.content) {
                this.quill.root.innerHTML = content.content;
            }

            this.mediaFiles = content.mediaFiles || [];

            // 미디어 그리드 업데이트
            const mediaGrid = document.getElementById('mediaGrid');
            mediaGrid.innerHTML = '';

            this.mediaFiles.forEach(mediaItem => {
                const mediaElement = this.createMediaElement(mediaItem);
                mediaGrid.appendChild(mediaElement);
            });

            this.updatePreview();
            this.showToast('임시저장된 콘텐츠를 불러왔습니다.', 'success');
        }
    }

    publishContent() {
        const title = this.titleInput.value.trim();
        const content = this.quill ? this.quill.getText().trim() : '';

        if (!title) {
            this.showToast('제목을 입력해주세요.', 'error');
            return;
        }

        if (content.length < 10) {
            this.showToast('내용을 더 입력해주세요.', 'error');
            return;
        }

        const publishData = {
            title: title,
            content: this.quill.root.innerHTML,
            plainText: content,
            mediaFiles: this.mediaFiles,
            publishAt: new Date().toISOString()
        };

        // 발행 이벤트 발생
        this.onPublish(publishData);

        this.showToast('콘텐츠 발행 준비가 완료되었습니다.', 'success');
    }

    onPublish(data) {
        // 외부에서 재정의할 발행 콜백
        console.log('Publishing content:', data);

        // 콘텐츠 페이지와 연동
        if (typeof preparePublishContent === 'function') {
            preparePublishContent(data.title, data.content);
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `editor-toast ${type}`;
        toast.textContent = message;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }

    // AI 콘텐츠 설정
    setAIContent(title, content) {
        this.titleInput.value = title;

        if (this.quill && content) {
            this.quill.root.innerHTML = content;
        }

        this.updatePreview();
        this.showToast('AI가 생성한 콘텐츠를 불러왔습니다.', 'success');
    }

    // 콘텐츠 가져오기
    getContent() {
        return {
            title: this.titleInput.value,
            content: this.quill ? this.quill.root.innerHTML : '',
            plainText: this.quill ? this.quill.getText() : '',
            mediaFiles: this.mediaFiles
        };
    }

    // 에디터 초기화
    clear() {
        this.titleInput.value = '';
        if (this.quill) {
            this.quill.setText('');
        }
        this.mediaFiles = [];
        document.getElementById('mediaGrid').innerHTML = '';
        this.updatePreview();
    }
}

// 전역 에디터 인스턴스
let editor = null;