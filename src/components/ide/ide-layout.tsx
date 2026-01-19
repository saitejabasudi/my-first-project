
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';

// Improved linter to validate basic Java structure
function lintJavaCode(code: string, filename: string): string[] {
    const errors: string[] = [];
    if (!code) {
        errors.push("Error: Source code is empty.");
        return errors;
    }

    // 1. Check for public class matching filename
    const className = filename.replace('.java', '');
    const classRegex = new RegExp(`public\\s+class\\s+${className}`);
    if (!classRegex.test(code)) {
        errors.push(`Error: Missing 'public class ${className}'. The public class name must match the file name.`);
    }

    // 2. Check for main method
    const mainMethodRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*\[\s*]\s*args\s*\)/;
    if (!mainMethodRegex.test(code)) {
        errors.push(`Error: Missing 'public static void main(String[] args)' method entry point.`);
    }

    const lines = code.split('\n');
    const braceStack: { char: string, line: number }[] = [];
    const parenStack: { char: string, line: number }[] = [];

    // 3. Check for balanced braces and parentheses
    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        // Ignore comments for brace/paren checking
        const codeLine = line.split('//')[0];
        for (let i = 0; i < codeLine.length; i++) {
            const char = codeLine[i];
            if (char === '{') {
                braceStack.push({ char, line: lineNumber });
            } else if (char === '}') {
                if (braceStack.length === 0) errors.push(`Error at line ${lineNumber}: Extra closing brace '}'.`);
                else braceStack.pop();
            } else if (char === '(') {
                parenStack.push({ char, line: lineNumber });
            } else if (char === ')') {
                if (parenStack.length === 0) errors.push(`Error at line ${lineNumber}: Extra closing parenthesis ')'.`);
                else parenStack.pop();
            }
        }
    });
    
    braceStack.forEach(brace => {
        errors.push(`Error on line ${brace.line}: Mismatched curly braces. Unclosed brace '{' found.`);
    });
    parenStack.forEach(paren => {
        errors.push(`Error on line ${paren.line}: Mismatched parentheses. Unclosed parenthesis '(' found.`);
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
        if (!fileIdFromUrl || fileIdFromUrl !== fileToLoad.id) {
            router.replace(`/ide?file=${fileToLoad.id}`, { scroll: false });
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
                try {
                    localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
                } catch (error) {
                   console.error("Failed to save default project to localStorage", error);
                }
                router.push('/');
            }
        }
        return filesAfterDelete;
    });
  }, [activeFile, router]);

  const runProgram = useCallback(() => {
    if (!activeFile) return;

    setIsCompiling(true);
    setShowOutput(true);
    setConsoleOutput([`> Validating and compiling ${activeFile.name}...`]);
    setErrorOutput([]);

    setTimeout(() => {
        const errors = lintJavaCode(activeFile.content, activeFile.name);

        if (errors.length > 0) {
            setConsoleOutput(prev => [...prev, 'Compilation failed. See Problems tab for details.']);
            setErrorOutput(errors);
            setActiveTab('problems');
            toast({
                variant: 'destructive',
                title: 'Compilation Failed',
                description: `Found ${errors.length} error(s) in ${activeFile.name}.`,
            });
        } else {
            const mainMethodRegex = /public\s+static\s+void\s+main\s*\([^)]*\)\s*\{([\s\S]*)\}/;
            const mainMatch = activeFile.content.match(mainMethodRegex);
            let simulatedOutput: string[] = [];
            let runtimeErrors: string[] = [];

            if (mainMatch) {
                const mainBody = mainMatch[1];
                
                if (mainBody.includes('Scanner')) {
                    runtimeErrors.push("Runtime Error: Interactive input with Scanner is not supported in this version.");
                } else {
                    try {
                        let jsCode = mainBody
                            .replace(/System\.out\.println\((.*?)\);/g, 'mock_println($1);')
                            .replace(/System\.out\.print\((.*?)\);/g, 'mock_print($1);')
                            .replace(/String\[\]/g, 'var')
                            .replace(/String\s/g, 'let ')
                            .replace(/int\s/g, 'let ')
                            .replace(/double\s/g, 'let ')
                            .replace(/float\s/g, 'let ')
                            .replace(/boolean\s/g, 'let ');
                        
                        let outputBuffer: string[] = [];
                        let lineBuffer = '';

                        const mock_println = (val: any = '') => {
                            outputBuffer.push(lineBuffer + (val?.toString() ?? ''));
                            lineBuffer = '';
                        };

                        const mock_print = (val: any = '') => {
                            lineBuffer += (val?.toString() ?? '');
                        };
                        
                        const sandboxedExecutor = new Function('mock_println', 'mock_print', jsCode);
                        sandboxedExecutor(mock_println, mock_print);

                        if (lineBuffer) {
                            outputBuffer.push(lineBuffer);
                        }
                        
                        simulatedOutput = outputBuffer;

                    } catch (e: any) {
                        runtimeErrors.push(`Runtime Error: ${e.message}`);
                    }
                }
            }

            if (runtimeErrors.length > 0) {
                setErrorOutput(runtimeErrors);
                setActiveTab('problems');
                toast({
                    variant: 'destructive',
                    title: 'Runtime Error',
                    description: `Execution failed for ${activeFile.name}.`,
                });

            } else {
                const finalOutput = [`> Compiling ${activeFile.name}...`, 'Compilation successful.', '> Running...', ...simulatedOutput, '\nExecution finished.'];
                if (simulatedOutput.length === 0) {
                    finalOutput.splice(3, 0, '(Program ran with no output to console)');
                }
                setConsoleOutput(finalOutput);
                setActiveTab('console');
                toast({
                    title: 'Execution Complete',
                    description: `${activeFile.name} ran successfully.`,
                });
            }
        }
        setIsCompiling(false);
    }, 1000);
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
          <div className="flex-1 overflow-auto">
            <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} />
          </div>
        </div>
      </main>

      {showOutput && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-4">
              <div className="w-full max-w-4xl h-3/4 flex flex-col bg-card rounded-lg shadow-2xl">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'console' | 'problems')} className="w-full flex flex-col h-full">
                    <div className="flex items-center justify-between p-2 border-b border-border flex-shrink-0">
                        <TabsList className="grid w-auto grid-cols-2">
                            <TabsTrigger value="console">Console</TabsTrigger>
                            <TabsTrigger value="problems">
                                Problems
                                {errorOutput.length > 0 && <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-destructive rounded-full">{errorOutput.length}</span>}
                            </TabsTrigger>
                        </TabsList>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setConsoleOutput([]); setErrorOutput([]); }} disabled={isCompiling} aria-label="Clear output">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowOutput(false)} aria-label="Close output">
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
    </div>
  );
}
