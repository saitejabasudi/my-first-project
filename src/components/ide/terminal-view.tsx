"use client";
import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';

type TerminalViewProps = {
  output: string[];
  onClear: () => void;
};

export function TerminalView({ output, onClear }: TerminalViewProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex-shrink-0 items-center justify-end border-b px-4 py-2 hidden">
        <Button variant="ghost" size="icon" onClick={onClear} aria-label="Clear Terminal">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <pre className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4">
          {output.map((line, index) => (
            <div key={index} className={line.startsWith('Error') ? 'text-destructive' : ''}>
              {line}
            </div>
          ))}
          <div ref={endRef} />
        </pre>
      </ScrollArea>
    </div>
  );
}
