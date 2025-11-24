'use client';

import React, { useRef, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface ToastEditorProps {
  initialValue?: string;
  placeholder?: string;
  height?: string | number;
  onChange?: (content: string) => void;
}

const ToastEditor: React.FC<ToastEditorProps> = ({
  initialValue = '',
  placeholder = '내용을 입력하세요...',
  height = '300px',
  onChange
}) => {
  const [content, setContent] = useState(initialValue);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  return (
    <div className="toast-editor-container">
      <textarea
        value={content}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ height }}
        className="w-full p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
};

export const useToastEditor = () => {
  const contentRef = useRef<string>('');

  const getContent = (): string => {
    return contentRef.current;
  };

  const setContent = (content: string): void => {
    contentRef.current = content;
  };

  return {
    getContent,
    setContent
  };
};

export default ToastEditor;
