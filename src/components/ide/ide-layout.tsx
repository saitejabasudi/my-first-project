
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { IdeHeader } from './ide-header';
import { CodeEditor } from './code-editor';
import { Button } from '@/components/ui/button';
import { X, Trash2, Menu } from 'lucide-react';
import { FileExplorer } from './file-explorer';
import { TerminalView } from './terminal-view';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';

function lintJavaCode(code: string): string[] {
    const errors: string[] = [];
    if (!code) return errors;
    const lines = code.split('\n');
    const braceStack: number[] = [];
    const parenStack: number[] = [];

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        if (
            trimmedLine.length > 0 &&
            !trimmedLine.endsWith(';') &&
            !trimmedLine.endsWith('{') &&
            !trimmedLine.endsWith('}') &&
            !trimmedLine.startsWith('//') &&
            !trimmedLine.startsWith('/*') &&
            !trimmedLine.endsWith('*/') &&
            !trimmedLine.startsWith('*') &&
            !trimmedLine.startsWith('import ') &&
            !trimmedLine.startsWith('package ') &&
            !/^\s*@(Override|Deprecated|SuppressWarnings|FunctionalInterface)/.test(trimmedLine) &&
            !/^\s*(public|private|protected|static|final|abstract|class|interface|enum|@interface|implements|extends)/.test(trimmedLine) &&
            !line.match(/^\s*(public|private|protected|static|final|abstract|synchronized|native|strictfp)?\s*[\w<>[\].,\s]+\s+\w+\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*}/) &&
            !line.match(/^\s*for\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*if\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*else(\s*if\s*\(.*\))?\s*\{?$/) &&
            !line.match(/^\s*while\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*switch\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*try(\s*\{?|.*)?$/) &&
            !line.match(/^\s*catch\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*finally\s*\{?$/)
        ) {
            errors.push(`Error at line ${lineNumber}: Missing semicolon or incomplete statement.`);
        }
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '{') {
                braceStack.push(lineNumber);
            } else if (char === '}') {
                if(braceStack.length === 0) errors.push(`Error at line ${lineNumber}: Extra closing brace.`);
                else braceStack.pop();
            } else if (char === '(') {
                parenStack.push(lineNumber);
            } else if (char === ')') {
                if (parenStack.length === 0) errors.push(`Error at line ${lineNumber}: Extra closing parenthesis.`);
                else parenStack.pop();
            }
        }
    });
    
    braceStack.forEach(lineNumber => {
        errors.push(`Error: Mismatched curly braces. Unclosed brace from line ${lineNumber}.`);
    });
    parenStack.forEach(lineNumber => {
        errors.push(`Error: Mismatched parentheses. Unclosed parenthesis from line ${lineNumber}.`);
    });

    return errors;
}

export function IdeLayout() {
  const [allFiles, setAllFiles] = useState<JavaFile[]>([]);
  const [activeFile, setActiveFile] = useState<JavaFile | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [output, setOutput] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let files: JavaFile[] = [];
    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjectsJson) {
        const parsedFiles = JSON.parse(storedProjectsJson);
        if (Array.isArray(parsedFiles) && parsedFiles.length > 0) {
            files = parsedFiles;
        }
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
    }
    
    if (files.length === 0) {
        files = mockFiles;
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
        } catch (error) {
           console.error("Failed to save default project to localStorage", error);
        }
    }
    
    setAllFiles(files);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    const fileIdFromUrl = searchParams.get('file');
    let fileToLoad: JavaFile | undefined;
    
    if (allFiles.length > 0) {
        if (fileIdFromUrl) {
            fileToLoad = allFiles.find(f => f.id === fileIdFromUrl);
        }
        
        if (!fileToLoad) {
            fileToLoad = allFiles[0];
        }
    }

    if (fileToLoad) {
        setActiveFile(fileToLoad);
        if (fileToLoad.id !== fileIdFromUrl) {
            router.replace(`/ide?file=${fileToLoad.id}`);
        }
    } else {
        router.push('/');
    }
  }, [searchParams, allFiles, router, isLoaded]);

  const handleCodeChange = useCallback((newCode: string) => {
    if (!activeFile) return;
    
    const updatedFile = { ...activeFile, content: newCode };
    setActiveFile(updatedFile);

    setAllFiles(currentFiles => {
      const updatedFiles = currentFiles.map((f: JavaFile) => f.id === activeFile.id ? updatedFile : f);
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedFiles));
      } catch (error) {
          console.error("Failed to save project to localStorage", error);
      }
      return updatedFiles;
    });
  }, [activeFile]);

  const handleFileSelect = useCallback((fileId: string) => {
    router.push(`/ide?file=${fileId}`);
    setIsSheetOpen(false);
  }, [router]);

  const handleFileClose = useCallback((fileIdToClose: string) => {
    setAllFiles(currentFiles => {
        const filesAfterClose = currentFiles.filter(f => f.id !== fileIdToClose);
        
        if (activeFile?.id === fileIdToClose) {
            if (filesAfterClose.length > 0) {
                router.replace(`/ide?file=${filesAfterClose[0].id}`);
            } else {
                router.push('/');
            }
        }
        
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filesAfterClose));
        } catch(e) {
            console.error("Failed to save updated projects to localStorage", e)
        }
        return filesAfterClose;
    });
  }, [activeFile, router]);

  const handleCompile = useCallback(() => {
    if (!activeFile) return;

    setIsCompiling(true);
    setShowOutput(true);
    setOutput([`> Compiling ${activeFile.name}...`]);

    setTimeout(() => {
      const errors = lintJavaCode(activeFile.content);
      let finalOutput: string[];

      if (errors.length > 0) {
        finalOutput = [`> Compiling ${activeFile.name}...`, 'Compilation failed with errors:', ...errors];
        toast({
          variant: 'destructive',
          title: 'Compilation Failed',
          description: `Please fix the errors in ${activeFile.name}.`,
        });
      } else {
        finalOutput = [`> Compiling ${activeFile.name}...`, 'Compilation successful.', '> Running...', ...activeFile.output.split('\n'), '\nExecution finished.'];
        toast({
          title: 'Execution Complete',
          description: `${activeFile.name} ran successfully.`,
        });
      }
      setOutput(finalOutput);
      setIsCompiling(false);
    }, 1500);
  }, [activeFile, toast]);

  
  if (!activeFile || !isLoaded) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            Loading project...
        </div>
    );
  }

  const renderMobileSidebar = () => (
    <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-3/4 bg-card">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>File Explorer</SheetTitle>
            </SheetHeader>
            <FileExplorer 
              files={allFiles}
              activeFileId={activeFile.id}
              onFileSelect={handleFileSelect}
              onFileClose={handleFileClose}
            />
        </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <IdeHeader activeFile={activeFile} onRun={handleCompile} isCompiling={isCompiling} mobileSidebar={renderMobileSidebar()} />
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden md:block md:w-48 flex-shrink-0 bg-card border-r">
          <FileExplorer
            files={allFiles}
            activeFileId={activeFile.id}
            onFileSelect={handleFileSelect}
            onFileClose={handleFileClose}
          />
        </div>
        <div className="flex flex-1 flex-col overflow-auto">
          <div className="flex-1 overflow-auto">
            <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} />
          </div>
        </div>
      </main>

      {showOutput && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center">
              <div className="w-full max-w-4xl h-3/4 flex flex-col bg-card rounded-lg shadow-2xl">
                <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
                    <span className="text-sm font-medium px-2">Output</span>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setOutput([])} disabled={isCompiling}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowOutput(false)}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <TerminalView output={output} />
              </div>
          </div>
        )}
    </div>
  );
}
