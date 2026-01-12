"use client";
import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1 bg-background">
        <Textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          className="h-full min-h-[300px] w-full resize-none border-0 rounded-none bg-transparent p-4 font-code text-base leading-relaxed focus-visible:ring-0"
          placeholder="Write your Java code here..."
          aria-label="Code Editor"
          spellCheck="false"
        />
      </ScrollArea>
    </div>
  );
}
