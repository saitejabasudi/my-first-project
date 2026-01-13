"use client";
import { Button } from '@/components/ui/button';
import type { JavaFile } from '@/lib/mock-files';
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Play } from 'lucide-react';
import { Logo } from '../logo';

type IdeHeaderProps = {
  activeFile: JavaFile;
  onRun: () => void;
  isCompiling: boolean;
  mobileSidebar: React.ReactNode;
};

export function IdeHeader({ activeFile, onRun, isCompiling, mobileSidebar }: IdeHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between bg-card px-4 border-b">
      <div className="flex items-center gap-2">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" aria-label="Go back to projects">
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </Link>
        <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <div>
                <h1 className="text-lg font-semibold">JavaDroid IDE</h1>
                <p className="text-xs text-muted-foreground">{activeFile.name}</p>
            </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onRun} disabled={isCompiling}>
            <Play className="h-5 w-5 mr-2" />
            Run
        </Button>
        <div className="md:hidden">
            {mobileSidebar}
        </div>
      </div>
    </header>
  );
}
