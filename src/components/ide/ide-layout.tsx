"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputDialog } from './input-dialog';
import { Logo } from '@/components/logo';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';
const INITIALIZED_KEY = 'java-ide-initialized';

function getCodeSegments(code: string): { text: string, offset: number, isCode: boolean }[] {
    const segments: { text: string, offset: number, isCode: boolean }[] = [];
    const stringAndCommentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*")|('(?:\\[\s\S]|[^'\\])*')/g;
    
    let lastIndex = 0;
    let match;

    while((match = stringAndCommentRegex.exec(code)) !== null) {
        if (match.index > lastIndex) {
            segments.push({
                text: code.substring(lastIndex, match.index),
                offset: lastIndex,
                isCode: true
            });
        }
        segments.push({
            text: match[0],
            offset: match.index,
            isCode: false
        });
        lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < code.length) {
        segments.push({
            text: code.substring(lastIndex),
            offset: lastIndex,
            isCode: true
        });
    }
    
    return segments;
}

function lintJavaCode(code: string, filename: string): string[] {
    const errors: string[] = [];
    if (!code) {
        errors.push("Error: Source code is empty.");
        return errors;
    }

    const className = filename.replace('.java', '');
    const classRegex = new RegExp(`public\\s+class\\s+${className}\\b`);
    if (!classRegex.test(code)) {
        errors.push(`Error: Missing 'public class ${className}'. The public class name must match the file name.`);
    }

    const mainMethodRegex = /\bpublic\s+static\s+void\s+main\s*\(\s*String\s*(\[\]\s*\w+|\w+\s*\[\]|\.\.\.\s*\w+)\s*\)/;
    if (!mainMethodRegex.test(code)) {
        errors.push(`Error: Missing valid 'public static void main(String[] args)' entry point.`);
    }

    const segments = getCodeSegments(code);
    const braceStack: { char: string, index: number }[] = [];
    const parenStack: { char: string, index: number }[] = [];

    for (const segment of segments) {
        if (!segment.isCode) continue;
        
        for (let i = 0; i < segment.text.length; i++) {
            const char = segment.text[i];
            const globalIndex = segment.offset + i;
            
            if (char === '{') {
                braceStack.push({ char, index: globalIndex });
            } else if (char === '}') {
                if (braceStack.length === 0) {
                    const lineNumber = code.substring(0, globalIndex).split('\n').length;
                    errors.push(`Error at line ${lineNumber}: Extra closing brace '}'.`);
                } else {
                    braceStack.pop();
                }
            } else if (char === '(') {
                parenStack.push({ char, index: globalIndex });
            } else if (char === ')') {
                if (parenStack.length === 0) {
                    const lineNumber = code.substring(0, globalIndex).split('\n').length;
                    errors.push(`Error at line ${lineNumber}: Extra closing parenthesis ')'.`);
                } else {
                    parenStack.pop();
                }
            }
        }
    }
    
    braceStack.forEach(brace => {
        const lineNumber = code.substring(0, brace.index).split('\n').length;
        errors.push(`Error on line ${lineNumber}: Unclosed brace '{' found.`);
    });
    parenStack.forEach(paren => {
        const lineNumber = code.substring(0, paren.index).split('\n').length;
        errors.push(`Error on line ${lineNumber}: Unclosed parenthesis '(' found.`);
    });

    return errors;
}

export function IdeLayout() {
  const [allFiles, setAllFiles] = useState<JavaFile[]>([]);
  const [activeFile, setActiveFile] = useState<JavaFile | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [errorOutput, setErrorOutput] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'console' | 'problems'>('console');
  
  const [showOutput, setShowOutput] = useState(false);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isInputDialogOpen, setInputDialogOpen] = useState(false);
  const [inputPrompts, setInputPrompts] = useState<string[]>([]);
  const inputResolver = useRef<{ resolve: (v: string[]) => void, reject: (e: any) => void } | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    let files: JavaFile[] = [];
    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const isInitialized = localStorage.getItem(INITIALIZED_KEY);

      if (storedProjectsJson) {
        const parsedFiles = JSON.parse(storedProjectsJson);
        if (Array.isArray(parsedFiles)) {
            files = parsedFiles;
        }
      }
      
      if (!isInitialized && files.length === 0) {
          files = mockFiles;
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
          localStorage.setItem(INITIALIZED_KEY, 'true');
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
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
        if (!fileIdFromUrl || fileIdFromUrl !== fileToLoad.id) {
            router.replace(`/ide?file=${fileToLoad.id}`, { scroll: false });
        }
    } else if (allFiles.length === 0) {
        router.push('/');
    }
  }, [searchParams, allFiles, router, isLoaded]);

  const handleCodeChange = useCallback((newCode: string) => {
    setActiveFile(currentActiveFile => {
      if (!currentActiveFile) return null;
      
      const updatedFile = { ...currentActiveFile, content: newCode };

      setAllFiles(currentFiles => {
        const updatedFiles = currentFiles.map(f =>
          f.id === updatedFile.id ? updatedFile : f
        );
        try {
          localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedFiles));
        } catch (error) {
          console.error("Failed to save project to localStorage", error);
        }
        return updatedFiles;
      });
      
      return updatedFile;
    });
  }, []);

  const handleFileSelect = useCallback((fileId: string) => {
    const fileToLoad = allFiles.find(f => f.id === fileId);
    if(fileToLoad) {
        setActiveFile(fileToLoad);
        router.push(`/ide?file=${fileId}`, { scroll: false });
    }
    setIsSheetOpen(false);
  }, [router, allFiles]);

  const handleFileDelete = useCallback((fileIdToDelete: string) => {
    setAllFiles(currentFiles => {
        const filesAfterDelete = currentFiles.filter(f => f.id !== fileIdToDelete);
        
        try {
            localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(filesAfterDelete));
        } catch(e) {
            console.error("Failed to save updated projects to localStorage", e)
        }

        if (activeFile?.id === fileIdToDelete) {
            if (filesAfterDelete.length > 0) {
                const newActiveFile = filesAfterDelete[0];
                setActiveFile(newActiveFile);
                router.replace(`/ide?file=${newActiveFile.id}`, { scroll: false });
            } else {
                setActiveFile(null);
                router.push('/');
            }
        }
        return filesAfterDelete;
    });
  }, [activeFile, router]);

  const runProgram = useCallback(async () => {
    if (!activeFile) return;

    setIsCompiling(true);
    setShowOutput(true);
    setConsoleOutput([`> Building ${activeFile.name}...`]);
    setErrorOutput([]);

    await new Promise(resolve => setTimeout(resolve, 400));

    const errors = lintJavaCode(activeFile.content, activeFile.name);

    if (errors.length > 0) {
        setConsoleOutput(prev => [...prev, 'Build failed. See Problems tab.']);
        setErrorOutput(errors);
        setActiveTab('problems');
        setIsCompiling(false);
        toast({
            variant: 'destructive',
            title: 'Build Failed',
            description: `Check the problems tab for syntax errors.`,
        });
        return;
    }

    let userInputs: string[] = [];
    const usesScanner = activeFile.content.includes('new Scanner');

    if (usesScanner) {
        const promptRegex = /System\.out\.print\s*\(\s*"(.*?)"\s*\);/g;
        const prompts = [...activeFile.content.matchAll(promptRegex)].map(match => match[1]);
        setInputPrompts(prompts.length > 0 ? prompts : ["Enter input:"]);
        
        try {
            userInputs = await new Promise<string[]>((resolve, reject) => {
                inputResolver.current = { resolve, reject };
                setInputDialogOpen(true);
            });
        } catch (e) {
            setIsCompiling(false);
            setShowOutput(false);
            return;
        }
    }

    setConsoleOutput(prev => [...prev, 'Build successful.', '> Executing...']);

    const prelude = `
        class ArrayList extends Array { 
            add(val) { this.push(val); return true; } 
            get(index) { return this[index]; } 
            size() { return this.length; } 
            isEmpty() { return this.length === 0; } 
            remove(index) { return this.splice(index, 1)[0]; } 
            toString() { return "[" + this.join(', ') + "]"; } 
        }
        class HashMap extends Map { 
            put(key, value) { this.set(key, value); return value; } 
            isEmpty() { return this.size === 0; } 
            containsKey(key) { return this.has(key); } 
            remove(key) { const v = this.get(key); this.delete(key); return v; } 
            values() { return Array.from(super.values()); } 
            keySet() { return Array.from(this.keys()); } 
            toString() { 
                let parts = []; 
                for (let [key, value] of this.entries()) { parts.push(key + '=' + value); } 
                return '{' + parts.join(', ') + '}';
            } 
        }
        let __cursor__ = 0;
        const __inputs__ = ${JSON.stringify(userInputs)}.flatMap(i => i.split(/\s+/)).filter(Boolean);
        
        const System = { 
            out: {
                println: (val = '') => mock_println(val),
                print: (val = '') => mock_print(val),
            },
            in: 'System.in', 
            currentTimeMillis: () => Date.now() 
        };

        class Scanner { 
            constructor(src) {} 
            nextLine() { return __inputs__[__cursor__++] || ""; } 
            nextInt() { return parseInt(this.nextLine(), 10) || 0; } 
            nextDouble() { return parseFloat(this.nextLine()) || 0.0; } 
            next() { return this.nextLine(); } 
            hasNext() { return __cursor__ < __inputs__.length; } 
            close() {} 
        }
        class Random { nextInt(b) { return b ? Math.floor(Math.random()*b) : Math.floor(Math.random()*100); } }
        class Date extends globalThis.Date {}
        class BigDecimal { constructor(v){this.v=Number(v)} add(o){return new BigDecimal(this.v+o.v)} toString(){return this.v.toString()} }
    `;

    let mainBody = '';
    const mainMatch = activeFile.content.match(/\bvoid\s+main\s*\(\s*String\s*(\[\]\s*\w+|\w+\s*\[\]|\.\.\.\s*\w+)\s*\)\s*\{/);
    
    if (mainMatch) {
        const startIdx = mainMatch.index! + mainMatch[0].length;
        const fullRemaining = activeFile.content.substring(startIdx);
        let depth = 1;
        let endIdx = -1;
        
        const segments = getCodeSegments(fullRemaining);
        for (const seg of segments) {
            if (!seg.isCode) continue;
            for (let i = 0; i < seg.text.length; i++) {
                if (seg.text[i] === '{') depth++;
                else if (seg.text[i] === '}') {
                    depth--;
                    if (depth === 0) {
                        endIdx = seg.offset + i;
                        break;
                    }
                }
            }
            if (endIdx !== -1) break;
        }
        
        if (endIdx !== -1) {
            mainBody = fullRemaining.substring(0, endIdx);
        }
    }

    try {
        const transformedCode = mainBody
            .replace(/(final\s+)?(String|int|double|float|boolean|char|ArrayList|HashMap|Scanner|Random|Date|BigDecimal|BigInteger|SimpleDateFormat)(<.*?>)?\s+(\w+)\s*=/g, 'let $4 =')
            .replace(/(final\s+)?(String|int|double|float|boolean|char|ArrayList|HashMap|Scanner|Random|Date|BigDecimal|BigInteger|SimpleDateFormat)(<.*?>)?\s+(\w+)\s*;/g, 'let $4;')
            .replace(/Integer\.parseInt/g, 'parseInt');

        let outputLines: string[] = [];
        let currentLine = '';

        const mock_println = (v: any) => { 
            outputLines.push(currentLine + (v?.toString() ?? '')); 
            currentLine = ''; 
        };
        const mock_print = (v: any) => { 
            currentLine += (v?.toString() ?? ''); 
        };

        const execute = new Function('mock_println', 'mock_print', prelude + transformedCode);
        execute(mock_println, mock_print);

        if (currentLine) outputLines.push(currentLine);
        setConsoleOutput(prev => [...prev, ...outputLines, '\nExecution finished.']);
        setActiveTab('console');
    } catch (e: any) {
        setErrorOutput([`Runtime Error: ${e.message}`]);
        setActiveTab('problems');
    }

    setIsCompiling(false);
  }, [activeFile, toast]);
  
  const handleDialogSubmit = (inputs: string[]) => {
    inputResolver.current?.resolve(inputs);
    setInputDialogOpen(false);
  };

  const handleDialogClose = () => {
    inputResolver.current?.reject(new Error("Input cancelled"));
    setInputDialogOpen(false);
  }

  if (!activeFile || !isLoaded) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
            <Logo className="h-10 w-10 animate-spin text-primary" />
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
              onFileDelete={handleFileDelete}
            />
        </SheetContent>
    </Sheet>
  )

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <IdeHeader activeFile={activeFile} onRun={runProgram} isCompiling={isCompiling} mobileSidebar={renderMobileSidebar()} />
      <main className="flex flex-1 overflow-hidden">
        <div className="hidden md:block md:w-64 flex-shrink-0 bg-card border-r">
          <FileExplorer
            files={allFiles}
            activeFileId={activeFile.id}
            onFileSelect={handleFileSelect}
            onFileDelete={handleFileDelete}
          />
        </div>
        <div className="flex flex-1 flex-col overflow-auto">
          <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} />
        </div>
      </main>

      {showOutput && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-4xl h-3/4 flex flex-col bg-card rounded-lg shadow-2xl border border-border">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'console' | 'problems')} className="w-full flex flex-col h-full">
                    <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
                        <TabsList className="grid w-auto grid-cols-2 h-9">
                            <TabsTrigger value="console" className="px-6">Console</TabsTrigger>
                            <TabsTrigger value="problems" className="px-6">
                                Problems
                                {errorOutput.length > 0 && <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-destructive rounded-full">{errorOutput.length}</span>}
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => { setConsoleOutput([]); setErrorOutput([]); }} aria-label="Clear">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setShowOutput(false)} aria-label="Close">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <TabsContent value="console" className="flex-1 mt-0 overflow-hidden ring-offset-0 focus-visible:ring-0">
                        <TerminalView output={consoleOutput} />
                    </TabsContent>
                    <TabsContent value="problems" className="flex-1 mt-0 overflow-hidden ring-offset-0 focus-visible:ring-0">
                        <TerminalView output={errorOutput} />
                    </TabsContent>
                </Tabs>
              </div>
          </div>
        )}
        {isInputDialogOpen && (
            <InputDialog
                isOpen={isInputDialogOpen}
                prompts={inputPrompts}
                onSubmit={handleDialogSubmit}
                onClose={handleDialogClose}
            />
        )}
    </div>
  );
}
