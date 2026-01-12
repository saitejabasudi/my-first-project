"use client";
import { Button } from '@/components/ui/button';
import { Loader2, Menu, Play, Bot } from 'lucide-react';
import type { JavaFile } from '@/lib/mock-files';

type IdeHeaderProps = {
  activeFile: JavaFile;
  isCompiling: boolean;
  onCompile: () => void;
  onToggleSidebar: () => void;
};

export function IdeHeader({ activeFile, isCompiling, onCompile, onToggleSidebar }: IdeHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onToggleSidebar}
          aria-label="Toggle file explorer"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <Bot className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">JavaDroid IDE</h1>
        </div>
        <span className="hidden sm:inline text-sm text-muted-foreground font-code bg-secondary px-2 py-1 rounded-md">
          {activeFile.name}
        </span>
      </div>
      <Button onClick={onCompile} disabled={isCompiling} className="bg-primary hover:bg-primary/90">
        {isCompiling ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        Compile & Run
      </Button>
    </header>
  );
}
