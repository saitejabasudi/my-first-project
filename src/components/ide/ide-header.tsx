"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import type { JavaFile } from '@/lib/mock-files';
import React from 'react';

type IdeHeaderProps = {
  activeFile: JavaFile;
  mobileSidebar: React.ReactNode;
};

export function IdeHeader({ activeFile, mobileSidebar }: IdeHeaderProps) {
  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">{activeFile.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {mobileSidebar}
      </div>
    </header>
  );
}
