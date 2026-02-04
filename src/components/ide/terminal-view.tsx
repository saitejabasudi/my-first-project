"use client";
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

type TerminalViewProps = {
  output: string[];
};

export function TerminalView({ output }: TerminalViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Automatically scroll to the bottom whenever output changes
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [output]);

  return (
    <div className="flex h-full flex-col bg-card">
      <ScrollArea className="flex-1">
        <div className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4 min-h-full">
            {output.map((line, index) => {
                const isError = line.toLowerCase().startsWith('error') || line.toLowerCase().includes('runtime error');
                return (
                    <div key={index} className={isError ? 'text-destructive' : ''}>
                        {line || '\u00A0'}
                    </div>
                );
            })}
            {/* Dedicated scroll anchor */}
            <div ref={scrollRef} className="h-px w-full" aria-hidden="true" />
        </div>
      </ScrollArea>
    </div>
  );
}
