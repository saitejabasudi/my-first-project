"use client";
import React, { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

type TerminalViewProps = {
  output: string[];
};

export function TerminalView({ output }: TerminalViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex h-full flex-col bg-card">
      <ScrollArea className="flex-1">
        <pre className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4">
          {output.map((line, index) => (
            <div key={index} className={line.toLowerCase().startsWith('error') ? 'text-destructive' : ''}>
              {line}
            </div>
          ))}
          <div ref={endRef} />
        </pre>
      </ScrollArea>
    </div>
  );
}
