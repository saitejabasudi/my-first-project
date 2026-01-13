"use client";
import { Button } from '@/components/ui/button';
import type { JavaFile } from '@/lib/mock-files';
import React from 'react';

type IdeHeaderProps = {
  activeFile: JavaFile;
  onRun: () => void;
  isCompiling: boolean;
  mobileSidebar: React.ReactNode;
};

export function IdeHeader({ activeFile, onRun, isCompiling, mobileSidebar }: IdeHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between bg-card px-4">
      <div className="flex items-center gap-2">
        <div>
          <h1 className="text-lg font-semibold">Java Studio Pro</h1>
          <p className="text-xs text-muted-foreground">Nothing changed</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={onRun} disabled={isCompiling}>RUN</Button>
        {mobileSidebar}
      </div>
    </header>
  );
}
