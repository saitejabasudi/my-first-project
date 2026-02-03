"use client";
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

type TerminalViewProps = {
  output: string[];
};

export function TerminalView({ output }: TerminalViewProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom whenever output changes
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [output]);

  return (
    <div className="flex h-full flex-col bg-card">
      <ScrollArea className="flex-1">
        <div className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4 min-h-full">
            {output.map((line, index) => {
                const isError = line.toLowerCase().startsWith('error');
                return (
                    <div key={index} className={isError ? 'text-destructive' : ''}>
                        {line || '\u00A0'}
                    </div>
                );
            })}
            <div ref={bottomRef} className="h-px w-full" aria-hidden="true" />
        </div>
      </ScrollArea>
    </div>
  );
}
