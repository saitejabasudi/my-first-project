"use client";

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { IdeHeader } from './ide-header';
import { CodeEditor } from './code-editor';
import { Button } from '@/components/ui/button';
import { Play, X, Trash2 } from 'lucide-react';
import { FileExplorer } from './file-explorer';
import { AIAssistant } from './ai-assistant';
import { TerminalView } from './terminal-view';
import { Card } from '../ui/card';

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

  useEffect(() => {
    let files: JavaFile[] = [];
    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjectsJson) {
        files = JSON.parse(storedProjectsJson);
      } else {
        files = mockFiles;
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
      }
      setAllFiles(files);
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
      files = mockFiles;
      setAllFiles(files);
    }

    const fileIdFromUrl = searchParams.get('file');
    const fileToLoad = files.find(f => f.id === fileIdFromUrl) || files.find(f => f.name === 'Main.java');
    
    if (fileToLoad) {
      setActiveFile(fileToLoad);
    } else if (files.length > 0) {
      const firstFile = files[0];
      setActiveFile(firstFile);
      router.replace(`/ide?file=${firstFile.id}`);
    } else {
        router.push('/');
    }
  }, [searchParams, router]);

  const handleCodeChange = useCallback((newCode: string) => {
    if (!activeFile) return;
    
    const updatedFile = { ...activeFile, content: newCode };
    setActiveFile(updatedFile);

    try {
      const updatedFiles = allFiles.map((f: JavaFile) => f.id === activeFile.id ? updatedFile : f);
      setAllFiles(updatedFiles);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (error) {
        console.error("Failed to save project to localStorage", error);
    }
  }, [activeFile, allFiles]);

  const handleFileSelect = useCallback((fileId: string) => {
    const fileToSelect = allFiles.find(f => f.id === fileId);
    if(fileToSelect) {
        setActiveFile(fileToSelect);
        router.push(`/ide?file=${fileId}`);
    }
  }, [allFiles, router]);

  const handleFileClose = useCallback((fileIdToClose: string) => {
    setAllFiles(currentFiles => {
        const updatedFiles = currentFiles.filter(f => f.id !== fileIdToClose);
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedFiles));
        } catch(e) {
            console.error(e)
        }

        if (activeFile?.id === fileIdToClose) {
            if (updatedFiles.length > 0) {
                handleFileSelect(updatedFiles[0].id);
            } else {
                router.push('/');
            }
        }
        return updatedFiles;
    });
  }, [activeFile, router, handleFileSelect]);

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
  
  if (!activeFile) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            Loading project...
        </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <IdeHeader activeFile={activeFile} />
      <main className="flex flex-1 overflow-hidden">
        <div className="w-64 hidden sm:block border-r">
          <FileExplorer 
            files={allFiles}
            activeFileId={activeFile.id}
            onFileSelect={handleFileSelect}
            onFileClose={handleFileClose}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <div className="border-b">
              <div className="px-2 py-1">
                <Button variant="ghost" size="sm" className="h-8 gap-2 bg-accent/20">
                    <X className="h-4 w-4" onClick={(e) => { e.stopPropagation(); handleFileClose(activeFile.id); }}/>
                    <span>{activeFile.name}</span>
                </Button>
              </div>
          </div>
          <div className="flex-1 flex flex-col overflow-auto">
            <div className="flex-1 overflow-auto">
              <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} />
            </div>
            {showOutput && (
              <div className="flex-shrink-0 h-1/3 border-t">
                  <Card className="h-full flex flex-col rounded-none">
                      <div className="flex items-center justify-between p-2 border-b">
                          <span className="text-sm font-medium">Output</span>
                          <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOutput([])} disabled={isCompiling}>
                                  <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowOutput(false)}>
                                  <X className="h-4 w-4" />
                              </Button>
                          </div>
                      </div>
                      <TerminalView output={output} />
                  </Card>
              </div>
            )}
          </div>
          <Button onClick={handleCompile} disabled={isCompiling} className="absolute bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg" size="icon">
            <Play className="h-7 w-7 text-primary-foreground fill-primary-foreground" />
          </Button>
        </div>
        <div className="w-80 hidden lg:block border-l">
          <AIAssistant />
        </div>
      </main>
    </div>
  );
}
