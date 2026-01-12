"use client";

import { useState, useCallback } from 'react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { IdeHeader } from './ide-header';
import { FileExplorer } from './file-explorer';
import { CodeEditor } from './code-editor';
import { TerminalView } from './terminal-view';

function formatJavaCode(code: string): string {
  const lines = code.split('\n');
  let indentLevel = 0;
  const indentSize = 4;
  const formattedLines = lines.map((line) => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('}') || trimmedLine.startsWith(')')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }
    const indentedLine = ' '.repeat(indentLevel * indentSize) + trimmedLine;
    if (trimmedLine.endsWith('{') || trimmedLine.endsWith('(')) {
      indentLevel++;
    }
    return indentedLine;
  });
  return formattedLines.join('\n');
}

export function IdeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<JavaFile>(mockFiles[0]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to JavaDroid IDE! Ready to compile.']);
  const { toast } = useToast();

  const handleFileSelect = useCallback(
    (file: JavaFile) => {
      if (file.id !== activeFile.id) {
        setActiveFile(file);
      }
      setSidebarOpen(false);
    },
    [activeFile.id]
  );

  const handleCodeChange = useCallback((newCode: string) => {
    setActiveFile((prev) => ({ ...prev, content: newCode }));
  }, []);

  const handleCompile = useCallback(() => {
    setIsCompiling(true);
    setTerminalOutput((prev) => [...prev, `\n> Compiling ${activeFile.name}...`]);

    setTimeout(() => {
      setTerminalOutput((prev) => [...prev, 'Compilation successful.']);
      setTerminalOutput((prev) => [...prev, '> Running...']);
      setTimeout(() => {
        setTerminalOutput((prev) => [...prev, ...activeFile.output.split('\n'), '\nExecution finished.']);
        setIsCompiling(false);
        toast({
          title: 'Execution Complete',
          description: `${activeFile.name} ran successfully.`,
        });
      }, 500);
    }, 1500);
  }, [activeFile, toast]);

  const handleFormatCode = useCallback(() => {
    const formattedCode = formatJavaCode(activeFile.content);
    setActiveFile((prev) => ({ ...prev, content: formattedCode }));
    toast({ description: 'Code formatted.' });
  }, [activeFile.content, toast]);

  const handleClearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background">
      <IdeHeader
        activeFile={activeFile}
        isCompiling={isCompiling}
        onCompile={handleCompile}
        onToggleSidebar={() => setSidebarOpen(true)}
      />
      <main className="flex flex-1 overflow-hidden">
        <aside className="hidden w-72 border-r md:block">
          <FileExplorer files={mockFiles} activeFileId={activeFile.id} onFileSelect={handleFileSelect} />
        </aside>
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 border-r-0">
            <FileExplorer files={mockFiles} activeFileId={activeFile.id} onFileSelect={handleFileSelect} />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 flex-col">
          <div className="flex-1 overflow-hidden">
            <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} onFormat={handleFormatCode} />
          </div>
          <div className="h-1/3 min-h-[150px] border-t">
            <TerminalView output={terminalOutput} onClear={handleClearTerminal} />
          </div>
        </div>
      </main>
    </div>
  );
}
