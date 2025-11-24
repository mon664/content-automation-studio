'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Editor } from '@toast-ui/react-editor';
import '@toast-ui/editor/dist/toastui-editor.css';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';

interface ToastEditorProps {
  initialValue?: string;
  placeholder?: string;
  height?: string | number;
  previewStyle?: 'vertical' | 'tab';
  initialEditType?: 'wysiwyg' | 'markdown';
  hideModeSwitch?: boolean;
  toolbarItems?: any[][];
  onChange?: (content: string) => void;
  onLoad?: (editor: Editor) => void;
  onCaretChange?: (editor: Editor, position: any) => void;
  onFocus?: (editor: Editor) => void;
  onBlur?: (editor: Editor) => void;
}

const ToastEditor: React.FC<ToastEditorProps> = ({
  initialValue = '',
  placeholder = '내용을 입력하세요...',
  height = '300px',
  previewStyle = 'vertical',
  initialEditType = 'wysiwyg',
  hideModeSwitch = false,
  toolbarItems,
  onChange,
  onLoad,
  onCaretChange,
  onFocus,
  onBlur
}) => {
  const editorRef = useRef<Editor>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (editorRef.current && onChange) {
      const editor = editorRef.current.getInstance();
      editor.removeHook('change');
      editor.addHook('change', () => {
        const content = editor.getHTML();
        onChange(content);
      });
    }
  }, [onChange]);

  const handleLoad = (editor: Editor) => {
    editorRef.current = editor;

    // 자동 저장 기능 추가
    if (typeof window !== 'undefined') {
      const autoSave = () => {
        const content = editor.getHTML();
        localStorage.setItem('toast-editor-content', content);
      };

      // 30초마다 자동 저장
      const autoSaveInterval = setInterval(autoSave, 30000);

      // 컴포넌트 언마운트 시 정리
      return () => {
        clearInterval(autoSaveInterval);
      };
    }

    if (onLoad) {
      onLoad(editor);
    }
  };

  const getImageBlob = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.readAsDataURL(blob);
    });
  };

  const addImageBlobHook = async (blob: Blob, callback: (url: string, altText: string) => void) => {
    // 이미지 업로드 로직 (여기서는 로컬로 처리)
    try {
      const dataUrl = await getImageBlob(blob);
      callback(dataUrl, '이미지');
    } catch (error) {
      console.error('이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const defaultToolbarItems = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'image', 'link'],
    ['code', 'codeblock']
  ];

  if (!isClient) {
    return <div style={{ height: '300px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span>에디터 로딩 중...</span>
    </div>;
  }

  return (
    <div className="toast-editor-container">
      <Editor
        ref={editorRef}
        initialValue={initialValue}
        placeholder={placeholder}
        height={height}
        previewStyle={previewStyle}
        initialEditType={initialEditType}
        hideModeSwitch={hideModeSwitch}
        toolbarItems={toolbarItems || defaultToolbarItems}
        usageStatistics={false}
        useCommandShortcut={true}
        events={{
          load: handleLoad,
          caretChange: onCaretChange,
          focus: onFocus,
          blur: onBlur
        }}
        hooks={{
          addImageBlobHook: addImageBlobHook
        }}
        customHTMLRenderer={{
          htmlBlock: {
            heading(node: any) {
              const level = node.level;
              const text = node.children.map((child: any) => child.literal || '').join('');
              return [
                {
                  type: 'openTag',
                  tagName: `h${level}`,
                  outerHTML: `<h${level}>`
                },
                {
                  type: 'html',
                  outerHTML: text
                },
                {
                  type: 'closeTag',
                  tagName: `h${level}`,
                  outerHTML: `</h${level}>`
                }
              ];
            }
          }
        }}
      />

      <style jsx global>{`
        .toast-editor-container {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          overflow: hidden;
        }

        .toast-ui-editor-defaultUI {
          border: none;
        }

        .toast-ui-editor-defaultUI-toolbar {
          background-color: #f8f9fa;
          border-bottom: 1px solid #e1e5e9;
        }

        .toast-ui-editor-defaultUI-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
        }

        .toast-ui-editor-defaultUI-preview {
          background-color: #ffffff;
        }

        /* Tabler 테마와 통합 */
        .ProseMirror {
          padding: 16px;
          min-height: 200px;
        }

        .ProseMirror:focus {
          outline: none;
        }

        .ProseMirror p {
          margin-bottom: 1rem;
        }

        .ProseMirror h1,
        .ProseMirror h2,
        .ProseMirror h3,
        .ProseMirror h4,
        .ProseMirror h5,
        .ProseMirror h6 {
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          margin-bottom: 1rem;
          padding-left: 2rem;
        }

        .ProseMirror li {
          margin-bottom: 0.25rem;
        }

        .ProseMirror blockquote {
          border-left: 4px solid #e1e5e9;
          padding-left: 1rem;
          margin: 1rem 0;
          color: #6c757d;
        }

        .ProseMirror code {
          background-color: #f8f9fa;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .ProseMirror pre {
          background-color: #f8f9fa;
          padding: 1rem;
          border-radius: 0.375rem;
          overflow-x: auto;
          margin: 1rem 0;
        }

        .ProseMirror table {
          border-collapse: collapse;
          width: 100%;
          margin: 1rem 0;
        }

        .ProseMirror th,
        .ProseMirror td {
          border: 1px solid #e1e5e9;
          padding: 0.5rem;
          text-align: left;
        }

        .ProseMirror th {
          background-color: #f8f9fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

// 에디터 유틸리티 훅
export const useToastEditor = () => {
  const editorRef = useRef<Editor>(null);

  const getEditor = (): Editor | null => {
    return editorRef.current?.getInstance() || null;
  };

  const getContent = (): string => {
    const editor = getEditor();
    return editor ? editor.getHTML() : '';
  };

  const setContent = (content: string): void => {
    const editor = getEditor();
    if (editor) {
      editor.setHTML(content);
    }
  };

  const insertText = (text: string): void => {
    const editor = getEditor();
    if (editor) {
      editor.insertText(text);
    }
  };

  const insertHTML = (html: string): void => {
    const editor = getEditor();
    if (editor) {
      editor.insertHTML(html);
    }
  };

  const getMarkdown = (): string => {
    const editor = getEditor();
    return editor ? editor.getMarkdown() : '';
  };

  const setMarkdown = (markdown: string): void => {
    const editor = getEditor();
    if (editor) {
      editor.setMarkdown(markdown);
    }
  };

  const focus = (): void => {
    const editor = getEditor();
    if (editor) {
      editor.focus();
    }
  };

  const blur = (): void => {
    const editor = getEditor();
    if (editor) {
      editor.blur();
    }
  };

  return {
    editorRef,
    getEditor,
    getContent,
    setContent,
    insertText,
    insertHTML,
    getMarkdown,
    setMarkdown,
    focus,
    blur
  };
};

export default ToastEditor;