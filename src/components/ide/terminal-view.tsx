"use client";
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

type TerminalViewProps = {
  output: string[];
};

export function TerminalView({ output }: TerminalViewProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever output changes
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className="flex h-full flex-col bg-card">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4">
            {output.map((line, index) => {
                const isError = line.toLowerCase().startsWith('error');
                return (
                    <div key={index} className={isError ? 'text-destructive' : ''}>
                        {line || '\u00A0'} {/* Render a non-breaking space for empty lines to preserve them */}
                    </div>
                );
            })}
        </div>
      </ScrollArea>
    </div>
  );
}
