"use client";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Sun, Moon, Menu } from 'lucide-react';
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
      <div className="flex items-center gap-4">
        <Link href="/" passHref>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-lg font-semibold">Hello World</h1>
          <p className="text-sm text-muted-foreground">Java Studio Pro</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-8 w-8">
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
            <Menu className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
