"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Share2, Menu } from 'lucide-react';
import type { JavaFile } from '@/lib/mock-files';
import { useEffect, useState } from 'react';

type IdeHeaderProps = {
  activeFile: JavaFile;
};

export function IdeHeader({ activeFile }: IdeHeaderProps) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle('dark', newIsDarkMode);
  };


  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
      <div className="flex items-center gap-2">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-base font-semibold font-code">{activeFile.name}</h1>
          <p className="text-xs text-muted-foreground">JavaDroid IDE</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
