'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { TerminalView } from '@/components/ide/terminal-view';
import { Card } from '@/components/ui/card';

const OUTPUT_STORAGE_KEY = 'java-ide-output';

export default function OutputPage() {
  const [output, setOutput] = useState<string[]>(['Loading output...']);
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileId = searchParams.get('file');

  useEffect(() => {
    const updateOutput = () => {
        try {
            const storedOutput = localStorage.getItem(OUTPUT_STORAGE_KEY);
            if (storedOutput) {
                setOutput(JSON.parse(storedOutput));
            } else {
                setOutput(['No output found.']);
            }
        } catch (error) {
            console.error("Failed to load output from localStorage", error);
            setOutput(['Error loading output.']);
        }
    };
    
    updateOutput();

    window.addEventListener('storage', updateOutput);
    return () => window.removeEventListener('storage', updateOutput);

  }, []);

  const handleBackToEditor = () => {
    if (fileId) {
      router.push(`/ide?file=${fileId}`);
    } else {
      router.push('/ide');
    }
  };

  const handleClear = () => {
    setOutput([]);
    localStorage.removeItem(OUTPUT_STORAGE_KEY);
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBackToEditor}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-base font-semibold">Compilation Output</h1>
            <p className="text-xs text-muted-foreground">JavaDroid IDE</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleClear}>
            <Trash2 className="h-5 w-5" />
            <span className="sr-only">Clear Output</span>
        </Button>
      </header>
      <main className="flex-1 overflow-auto p-4">
        <Card className="h-full">
            <TerminalView output={output} />
        </Card>
      </main>
    </div>
  );
}
