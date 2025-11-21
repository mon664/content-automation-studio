// DOMPurify 전역으로 사용 가능한지 확인
let DOMPurify;
if (typeof window !== 'undefined' && window.DOMPurify) {
    DOMPurify = window.DOMPurify;
} else {
    // DOMPurify가 없는 경우 기본 HTML 정제 함수 사용
    DOMPurify = {
        sanitize: (html) => {
            // 간단한 HTML 정제 (보안을 위해 실제로는 DOMPurify 사용 권장)
            return html
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
    };
}

// Toast UI Editor - 한국형 리치 텍스트 에디터
class ToastEditor {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }

        this.options = {
            el: this.container,
            height: '500px',
            initialValue: '',
            initialEditType: 'wysiwyg',
            previewStyle: 'vertical',
            hideModeSwitch: false,
            toolbarItems: [
                ['heading', 'bold', 'italic', 'strike'],
                ['hr', 'quote'],
                ['ul', 'ol', 'task', 'indent', 'outdent'],
                ['table', 'image', 'link'],
                ['code', 'codeblock'],
                ['scrollSync']
            ],
            plugins: [
                // Color Syntax 플러그인 (선택적)
                // [
                //     'colorSyntax', {
                //         preset: ['#ff0000', '#00ff00', '#0000ff']
                //     }
                // ]
            ],
            customHTMLSanitizer: (html) => {
                // 기본 HTML Sanitizer 사용 (보안 강화)
                return DOMPurify.sanitize(html);
            },
            ...options
        };

        this.editor = null;
        this.draftKey = 'toast_editor_draft';
        this.init();
    }

    init() {
        try {
            // Toast UI Editor 초기화
            this.editor = new toastui.Editor(this.options);

            // 이벤트 리스너 설정
            this.setupEventListeners();

            // 단축키 설정
            this.setupKeyboardShortcuts();

            console.log('Toast UI Editor 초기화 완료');
        } catch (error) {
            console.error('Toast UI Editor 초기화 실패:', error);
            this.showError('에디터 초기화에 실패했습니다.');
        }
    }

    setupEventListeners() {
        // 콘텐츠 변경 시 자동 저장
        this.editor.on('change', () => {
            this.autoSave();
        });

        // 이미지 파일 드롭 이벤트
        this.editor.eventManager.addEventType('dropImage');
        this.editor.eventManager.listen('dropImage', (ev) => {
            this.handleImageDrop(ev.dataTransfer);
        });

        // 이미지 붙여넣기 이벤트
        this.editor.eventManager.addEventType('pasteImage');
        this.editor.eventManager.listen('pasteImage', (ev) => {
            this.handleImagePaste(ev.clipboardData);
        });
    }

    setupKeyboardShortcuts() {
        // 단축키 설정
        const shortcuts = {
            'Ctrl+s': () => this.saveDraft(),
            'Ctrl+b': () => this.execCommand('bold'),
            'Ctrl+i': () => this.execCommand('italic'),
            'Ctrl+u': () => this.execCommand('underline'),
            'Ctrl+z': () => this.execCommand('undo'),
            'Ctrl+y': () => this.execCommand('redo')
        };

        document.addEventListener('keydown', (e) => {
            const key = this.getShortcutKey(e);
            if (shortcuts[key]) {
                e.preventDefault();
                shortcuts[key]();
            }
        });
    }

    getShortcutKey(e) {
        const parts = [];
        if (e.ctrlKey || e.metaKey) parts.push('Ctrl');
        if (e.altKey) parts.push('Alt');
        if (e.shiftKey) parts.push('Shift');
        parts.push(e.key);
        return parts.join('+');
    }

    // 콘텐츠 설정
    setContent(content) {
        if (this.editor) {
            this.editor.setHTML(content);
        }
    }

    // 콘텐츠 가져오기
    getContent() {
        if (this.editor) {
            return this.editor.getHTML();
        }
        return '';
    }

    // 마크다운 콘텐츠 가져오기
    getMarkdown() {
        if (this.editor) {
            return this.editor.getMarkdown();
        }
        return '';
    }

    // 텍스트만 가져오기
    getText() {
        if (this.editor) {
            return this.editor.getText();
        }
        return '';
    }

    // AI 생성 콘텐츠 설정
    setAIContent(title, content) {
        const fullContent = `<h1>${title}</h1>\n${content}`;
        this.setContent(fullContent);
    }

    // 이미지 처리
    async handleImageDrop(dataTransfer) {
        const files = Array.from(dataTransfer.files);
        await this.uploadImages(files);
    }

    async handleImagePaste(clipboardData) {
        const items = Array.from(clipboardData.items);
        const imageItems = items.filter(item => item.type.startsWith('image/'));

        if (imageItems.length > 0) {
            const files = imageItems.map(item => item.getAsFile());
            await this.uploadImages(files);
        }
    }

    async uploadImages(files) {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        for (const file of imageFiles) {
            try {
                const imageUrl = await this.uploadImage(file);
                if (imageUrl) {
                    const markdown = `![${file.name}](${imageUrl})`;
                    this.editor.insertText(markdown);
                }
            } catch (error) {
                console.error('이미지 업로드 실패:', error);
                this.showError('이미지 업로드에 실패했습니다.');
            }
        }
    }

    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/editor/upload-image', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const result = await response.json();
                return result.url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            return null;
        }
    }

    // 명령 실행
    execCommand(command, value = null) {
        if (this.editor) {
            this.editor.exec(command, value);
        }
    }

    // 자동 저장
    autoSave() {
        const content = this.getContent();
        const title = this.extractTitle(content);
        const draft = {
            title: title || '제목 없음',
            content: content,
            markdown: this.getMarkdown(),
            timestamp: new Date().toISOString()
        };

        localStorage.setItem(this.draftKey, JSON.stringify(draft));
    }

    // 초안 저장
    saveDraft() {
        this.autoSave();
        this.showSuccess('초안이 저장되었습니다.');
    }

    // 초안 로드
    loadDraft() {
        try {
            const draftData = localStorage.getItem(this.draftKey);
            if (draftData) {
                const draft = JSON.parse(draftData);
                const timeDiff = new Date() - new Date(draft.timestamp);

                // 24시간 이내의 초안만 로드
                if (timeDiff < 24 * 60 * 60 * 1000) {
                    this.setContent(draft.content);
                    console.log('초안을 로드했습니다:', draft.title);
                } else {
                    localStorage.removeItem(this.draftKey);
                }
            }
        } catch (error) {
            console.error('초안 로드 실패:', error);
        }
    }

    // 초안 삭제
    clearDraft() {
        localStorage.removeItem(this.draftKey);
        this.showSuccess('초안을 삭제했습니다.');
    }

    // 제목 추출
    extractTitle(content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const h1 = tempDiv.querySelector('h1');
        return h1 ? h1.textContent.trim() : '';
    }

    // 발행 준비
    prepareForPublish() {
        const content = this.getContent();
        const markdown = this.getMarkdown();
        const title = this.extractTitle(content);

        return {
            title: title,
            content: content,
            markdown: markdown,
            text: this.getText(),
            wordCount: this.getText().split(/\s+/).length,
            characterCount: this.getText().length
        };
    }

    // 콘텐츠 발행
    async publishContent() {
        const publishData = this.prepareForPublish();

        // 발행 확인
        const confirmed = confirm(`"${publishData.title}" 콘텐츠를 발행하시겠습니까?`);
        if (!confirmed) return;

        try {
            // 발행 API 호출 (실제 구현 필요)
            const response = await fetch('/api/content/publish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(publishData)
            });

            if (response.ok) {
                this.showSuccess('콘텐츠가 성공적으로 발행되었습니다.');
                this.clearDraft();

                // 발행 후 처리 (예: 페이지 이동)
                setTimeout(() => {
                    window.location.href = '/publishing';
                }, 2000);
            } else {
                throw new Error('발행 실패');
            }
        } catch (error) {
            console.error('발행 실패:', error);
            this.showError('콘텐츠 발행에 실패했습니다.');
        }
    }

    // 알림 표시
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    showError(message) {
        this.showToast(message, 'error');
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            max-width: 300px;
            font-size: 14px;
            opacity: 0;
            transform: translateY(100%);
            transition: all 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // 애니메이션
        setTimeout(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateY(0)';
        }, 100);

        // 자동 제거
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(100%)';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // 에디터 파괴
    destroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }

    // 에디터 포커스
    focus() {
        if (this.editor) {
            this.editor.focus();
        }
    }

    // 에디터 리사이즈
    setHeight(height) {
        if (this.editor) {
            this.editor.setHeight(height);
        }
    }

    // 에디터 모드 전환
    switchMode(mode) {
        if (this.editor) {
            this.editor.changeMode(mode);
        }
    }

    // 툴바 표시/숨김
    toggleToolbar() {
        if (this.editor) {
            const toolbar = this.editor.el.querySelector('.toastui-editor-toolbar');
            if (toolbar) {
                toolbar.style.display = toolbar.style.display === 'none' ? 'block' : 'none';
            }
        }
    }
}

// 전역 에디터 변수
let editor = null;

// openEditor 함수 수정 (전역)
function openEditor(title, content, metadata) {
    try {
        // 기존 에디터가 있으면 파괴
        if (editor) {
            editor.destroy();
            editor = null;
        }

        // 모달 생성
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            flex-direction: column;
            z-index: 10000;
        `;

        // 모달 콘텐츠
        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 2px solid #e9ecef; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                <h3 style="margin: 0; font-size: 1.5rem;">
                    <i class="fas fa-edit"></i> AI 콘텐츠 편집기
                </h3>
                <button onclick="this.closest('.modal').remove()" style="background: rgba(255,255,255,0.2); border: none; color: white; padding: 8px 15px; border-radius: 8px; cursor: pointer; font-size: 18px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="flex: 1; overflow: auto; background: white;">
                <div id="toastEditorContainer" style="width: 100%; height: 100%;"></div>
            </div>
            <div style="padding: 20px; border-top: 2px solid #e9ecef; background: #f8f9fa; display: flex; gap: 15px; justify-content: flex-end;">
                <button onclick="editor.saveDraft()" style="background: linear-gradient(45deg, #95a5a6, #7f8c8d); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-save"></i> 임시저장
                </button>
                <button onclick="editor.publishContent()" style="background: linear-gradient(45deg, #3498db, #2980b9); color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    <i class="fas fa-paper-plane"></i> 발행하기
                </button>
            </div>
        `;

        modal.className = 'modal';
        document.body.appendChild(modal);

        // Toast UI Editor 초기화
        setTimeout(() => {
            try {
                editor = new ToastEditor('toastEditorContainer', {
                    height: 'calc(100% - 40px)',
                    initialValue: `<h1>${title}</h1>\n${content}`,
                    initialEditType: 'wysiwyg',
                    previewStyle: 'vertical',
                    toolbarItems: [
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock'],
                        ['scrollSync']
                    ]
                });

                // 임시저장된 콘텐츠 로드
                editor.loadDraft();

                console.log('Toast UI Editor 초기화 완료');
            } catch (error) {
                console.error('Toast UI Editor 초기화 실패:', error);
                alert('에디터 초기화에 실패했습니다.');
            }
        }, 100);

    } catch (error) {
        console.error('openEditor error:', error);
        alert('에디터를 열 수 없습니다.');
    }
}