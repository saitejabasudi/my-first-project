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

  // A simple function to render error lines with a different color
  const renderOutput = () => {
    return output.map((line, index) => {
        if (line.toLowerCase().startsWith('error')) {
            return <span key={index} className="text-destructive">{line}<br/></span>;
        }
        return <span key={index}>{line}<br/></span>;
    });
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <pre className="font-code text-sm text-muted-foreground whitespace-pre-wrap p-4">
            {renderOutput()}
        </pre>
      </ScrollArea>
    </div>
  );
}
