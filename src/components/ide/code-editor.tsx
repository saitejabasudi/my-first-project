"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines);
  }, [code]);
  
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  return (
    <div className="flex h-full flex-col">
        <div className="flex flex-1 overflow-hidden bg-background">
            <div 
                ref={lineNumbersRef}
                className="w-12 text-right pr-2 pt-4 font-code text-base text-muted-foreground select-none overflow-y-hidden"
                aria-hidden="true"
            >
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <Textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => onCodeChange(e.target.value)}
              onScroll={handleScroll}
              className="h-full min-h-full w-full flex-1 resize-none border-0 rounded-none bg-transparent p-4 font-code text-base leading-relaxed focus-visible:ring-0"
              placeholder="Write your Java code here..."
              aria-label="Code Editor"
              spellCheck="false"
            />
        </div>
    </div>
  );
}
