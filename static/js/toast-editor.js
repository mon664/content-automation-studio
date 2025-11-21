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
                toolbarItems: [
                    ['heading', 'bold', 'italic', 'strike'],
                    ['hr', 'quote'],
                    ['ul', 'ol', 'task', 'indent', 'outdent'],
                    ['table', 'image', 'link'],
                    ['code', 'codeblock'],
                    ['scrollSync']
                ]
            });

            console.log('Toast UI Editor initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Toast UI Editor:', error);
            throw error;
        }
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

    destroy() {
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
                <h3><i class="fas fa-edit"></i> Toast UI Editor</h3>
                <button onclick="closeEditorModal()" class="btn" style="background: rgba(255,255,255,0.2); color: white; padding: 5px 10px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-content">
                <div id="toastEditorContainer"></div>
            </div>
            <div class="modal-footer">
                <button onclick="editor.saveContent()" class="btn btn-success">
                    <i class="fas fa-save"></i> 저장
                </button>
                <button onclick="closeEditorModal()" class="btn btn-secondary">
                    <i class="fas fa-times"></i> 닫기
                </button>
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