// Toast UI Editor - Simple Version
let editor = null;

// DOMPurify fallback
let DOMPurify;
if (typeof window !== 'undefined' && window.DOMPurify) {
    DOMPurify = window.DOMPurify;
} else {
    DOMPurify = {
        sanitize: (html) => {
            return html
                .replace(/<script[^>]*>.*?<\/script>/gi, '')
                .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '');
        }
    };
}

// Simple Toast Editor Class
class SimpleToastEditor {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id '${containerId}' not found`);
        }

        this.autoSaveInterval = null;
        this.lastSaveTime = null;
        this.init();
    }

    init() {
        try {
            this.editor = new toastui.Editor({
                el: this.container,
                height: '500px',
                initialValue: '',
                initialEditType: 'wysiwyg',
                previewStyle: 'vertical',
                hideModeSwitch: false,
                placeholder: '여기에 콘텐츠를 작성해주세요...',
                autofocus: true,
                useCommandShortcut: true,
                usageStatistics: false,
                hooks: {
                    addImageBlobHook: this.handleImageUpload.bind(this),
                    beforePreviewRender: this.beforePreviewRender.bind(this)
                },
                toolbarItems: [
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'image', 'link'],
                    ['code', 'codeblock'],
                    ['scrollSync']
                ]
            });

            // Auto-save 기능 시작
            this.startAutoSave();

            // 키보드 단축키 추가
            this.addKeyboardShortcuts();

            console.log('Toast UI Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Toast UI Editor:', error);
            throw error;
        }
    }

    handleImageUpload(blob, callback) {
        // 이미지 업로드 처리
        this.uploadImage(blob).then(url => {
            callback(url, 'image');
        }).catch(error => {
            console.error('Image upload failed:', error);
            showToast('이미지 업로드에 실패했습니다.', 'error');
            callback(null, 'image');
        });
    }

    async uploadImage(blob) {
        try {
            // FormData 생성
            const formData = new FormData();
            const filename = `editor_image_${Date.now()}.png`;
            formData.append('image', blob, filename);

            // WebDAV 업로드 API 호출 (새로운 엔드포인트 필요)
            const response = await fetch('/api/editor/upload-image', {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                return data.url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);

            // Fallback: Base64 이미지로 변환
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.readAsDataURL(blob);
            });
        }
    }

    beforePreviewRender(html) {
        // HTML 정화 및 강화
        return DOMPurify.sanitize(html, {
            ALLOWED_TAGS: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                'p', 'br', 'strong', 'em', 'u', 's', 'del',
                'ul', 'ol', 'li',
                'blockquote', 'pre', 'code',
                'img', 'a', 'hr',
                'table', 'thead', 'tbody', 'tr', 'th', 'td'
            ],
            ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
            ALLOW_DATA_ATTR: false
        });
    }

    startAutoSave() {
        // 30초마다 자동 저장
        this.autoSaveInterval = setInterval(() => {
            const content = this.getMarkdown();
            if (content && content !== localStorage.getItem('editor_draft_content')) {
                this.saveDraft();
            }
        }, 30000);
    }

    saveDraft() {
        const content = this.getMarkdown();
        localStorage.setItem('editor_draft_content', content);
        localStorage.setItem('editor_draft_time', new Date().toISOString());
        this.lastSaveTime = new Date();
        showToast('초안이 자동 저장되었습니다.', 'info');
    }

    loadDraft() {
        const content = localStorage.getItem('editor_draft_content');
        if (content) {
            this.setContent(content);
            const saveTime = localStorage.getItem('editor_draft_time');
            if (saveTime) {
                showToast(`${new Date(saveTime).toLocaleString()}에 저장된 초안을 불러왔습니다.`, 'info');
            }
        }
    }

    addKeyboardShortcuts() {
        // 추가 키보드 단축키
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveContent();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.clearContent();
                        break;
                }
            }
        });
    }

    setContent(content) {
        if (this.editor) {
            this.editor.setHTML(content);
        }
    }

    getContent() {
        if (this.editor) {
            return this.editor.getHTML();
        }
        return '';
    }

    getMarkdown() {
        if (this.editor) {
            return this.editor.getMarkdown();
        }
        return '';
    }

    clearContent() {
        if (this.editor) {
            this.editor.setHTML('');
            showToast('콘텐츠가 지워졌습니다.', 'info');
        }
    }

    insertText(text) {
        if (this.editor) {
            this.editor.insertText(text);
        }
    }

    setMarkdown(markdown) {
        if (this.editor) {
            this.editor.setMarkdown(markdown);
        }
    }

    saveContent() {
        const content = this.getMarkdown();
        localStorage.setItem('editor_current_content', content);
        showToast('콘텐츠가 저장되었습니다.', 'success');

        // 부모 함수에 저장 이벤트 전달
        if (typeof window.onEditorSave === 'function') {
            window.onEditorSave(content);
        }
    }

    exportToHTML() {
        const html = this.getContent();
        const blob = new Blob([html], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog_post_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('HTML 파일로 내보내기 완료', 'success');
    }

    exportToMarkdown() {
        const markdown = this.getMarkdown();
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blog_post_${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Markdown 파일로 내보내기 완료', 'success');
    }

    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
        }
    }
}

// Global openEditor function
function openEditor(title, content) {
    try {
        // Clean up existing editor
        if (editor) {
            editor.destroy();
            editor = null;
        }

        // Create modal
        const modal = document.createElement('div');
        modal.className = 'editor-modal';

        modal.innerHTML = `
            <div class="modal-header">
                <h3><i class="fas fa-edit"></i> Toast UI Editor - ${title}</h3>
                <div class="modal-header-buttons">
                    <button onclick="editor.exportToMarkdown()" class="btn" title="Markdown 내보내기" style="background: rgba(255,255,255,0.2); color: white; padding: 5px 10px;">
                        <i class="fas fa-file-code"></i>
                    </button>
                    <button onclick="editor.exportToHTML()" class="btn" title="HTML 내보내기" style="background: rgba(255,255,255,0.2); color: white; padding: 5px 10px;">
                        <i class="fas fa-file-alt"></i>
                    </button>
                    <button onclick="editor.loadDraft()" class="btn" title="초안 불러오기" style="background: rgba(255,255,255,0.2); color: white; padding: 5px 10px;">
                        <i class="fas fa-folder-open"></i>
                    </button>
                    <button onclick="closeEditorModal()" class="btn" title="닫기" style="background: rgba(255,255,255,0.2); color: white; padding: 5px 10px;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
            <div class="modal-content">
                <div id="toastEditorContainer"></div>
            </div>
            <div class="modal-footer">
                <div class="modal-footer-left">
                    <button onclick="editor.clearContent()" class="btn btn-warning">
                        <i class="fas fa-eraser"></i> 내용 지우기
                    </button>
                    <button onclick="editor.saveDraft()" class="btn btn-info">
                        <i class="fas fa-save"></i> 초안 저장
                    </button>
                </div>
                <div class="modal-footer-right">
                    <button onclick="editor.saveContent()" class="btn btn-success">
                        <i class="fas fa-save"></i> 저장
                    </button>
                    <button onclick="closeEditorModal()" class="btn btn-secondary">
                        <i class="fas fa-times"></i> 닫기
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Initialize editor after modal is added to DOM
        setTimeout(() => {
            try {
                editor = new SimpleToastEditor('toastEditorContainer');

                // Set initial content
                const initialContent = `<h1>${title}</h1>\n${content}`;
                editor.setContent(initialContent);

                // Add save method
                editor.saveContent = function() {
                    const content = this.getContent();
                    console.log('Content saved:', content);
                    showToast('콘텐츠가 저장되었습니다.', 'success');
                };

                // ESC key close
                const handleEsc = (e) => {
                    if (e.key === 'Escape') {
                        closeEditorModal();
                        document.removeEventListener('keydown', handleEsc);
                    }
                };
                document.addEventListener('keydown', handleEsc);

            } catch (error) {
                console.error('Editor initialization failed:', error);
                showToast('에디터 초기화에 실패했습니다.', 'error');
                closeEditorModal();
            }
        }, 100);

    } catch (error) {
        console.error('Failed to open editor:', error);
        showToast('에디터를 열 수 없습니다.', 'error');
    }
}

// Global closeEditorModal function
function closeEditorModal() {
    try {
        if (editor) {
            editor.destroy();
            editor = null;
        }

        const modal = document.querySelector('.editor-modal');
        if (modal) {
            modal.remove();
        }
    } catch (error) {
        console.error('Failed to close editor:', error);
    }
}

// Simple toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Make sure everything is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document loaded, Toast UI Editor ready');
});