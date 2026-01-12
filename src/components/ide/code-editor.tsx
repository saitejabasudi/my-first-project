"use client";
import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Code } from 'lucide-react';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
  onFormat: () => void;
};

export function CodeEditor({ code, onCodeChange, onFormat }: CodeEditorProps) {
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
      <div className="flex items-center justify-end border-t bg-card p-1 sm:p-2">
        <Button variant="ghost" size="sm" onClick={onFormat}>
          <Code className="mr-2 h-4 w-4" />
          Format
        </Button>
      </div>
    </div>
  );
}
