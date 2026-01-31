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
import { InputDialog } from './input-dialog';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';
const INITIALIZED_KEY = 'java-ide-initialized';

function lintJavaCode(code: string, filename: string): string[] {
    const errors: string[] = [];
    if (!code) {
        errors.push("Error: Source code is empty.");
        return errors;
    }

    const className = filename.replace('.java', '');
    const classRegex = new RegExp(`public\\s+class\\s+${className}`);
    if (!classRegex.test(code)) {
        errors.push(`Error: Missing 'public class ${className}'. The public class name must match the file name.`);
    }

    const mainMethodRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*(\[\s*\]\s*args|args\s*\[\s*\])\s*\)/;
    if (!mainMethodRegex.test(code)) {
        errors.push(`Error: Missing 'public static void main(String[] args)' method entry point.`);
    }

    const stringAndCommentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*")/g;
    const braceStack: { char: string, index: number }[] = [];
    const parenStack: { char: string, index: number }[] = [];
    
    const codeSegments: { text: string, offset: number }[] = [];
    let lastIndex = 0;
    let match;

    while((match = stringAndCommentRegex.exec(code)) !== null) {
      const codePart = code.substring(lastIndex, match.index);
      if (codePart) {
        codeSegments.push({ text: codePart, offset: lastIndex });
      }
      lastIndex = match.index + match[0].length;
    }
    const lastCodePart = code.substring(lastIndex);
    if(lastCodePart) {
       codeSegments.push({ text: lastCodePart, offset: lastIndex });
    }

    for (const segment of codeSegments) {
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
        errors.push(`Error on line ${lineNumber}: Mismatched curly braces. Unclosed brace '{' found.`);
    });
    parenStack.forEach(paren => {
        const lineNumber = code.substring(0, paren.index).split('\n').length;
        errors.push(`Error on line ${lineNumber}: Mismatched parentheses. Unclosed parenthesis '(' found.`);
    });

    const importRegex = /^\s*import\s+([a-zA-Z0-9_.*]+);/gm;
    while ((match = importRegex.exec(code)) !== null) {
      const fullImport = match[1];
      if (!fullImport.startsWith('java.') && !fullImport.startsWith('javax.')) {
        const line = code.substring(0, match.index).split('\n').length;
        errors.push(`Error at line ${line}: Unsupported import 'import ${fullImport};'. Only standard java.* and javax.* libraries are supported.`);
      }
    }

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
  const [onInputDialogSubmit, setOnInputDialogSubmit] = useState<{ resolver: (inputs: string[]) => void; rejecter: (reason?: any) => void; } | null>(null);

  useEffect(() => {
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
        // If there are no files at all, push to homepage
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
                setActiveFile(null); // Explicitly clear the active file
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
    setConsoleOutput([`> Validating and compiling ${activeFile.name}...`]);
    setErrorOutput([]);

    await new Promise(resolve => setTimeout(resolve, 500));

    const errors = lintJavaCode(activeFile.content, activeFile.name);

    if (errors.length > 0) {
        setConsoleOutput(prev => [...prev, 'Compilation failed. See Problems tab for details.']);
        setErrorOutput(errors);
        setActiveTab('problems');
        setIsCompiling(false);
        toast({
            variant: 'destructive',
            title: 'Compilation Failed',
            description: `Found ${errors.length} error(s) in ${activeFile.name}.`,
        });
        return;
    }

    let userInputs: string[] = [];
    const usesScanner = /new\s+Scanner\s*\(\s*System\.in\s*\)/.test(activeFile.content);

    if (usesScanner) {
        const promptRegex = /System\.out\.print\s*\(\s*"(.*?)"\s*\);/g;
        const prompts = [...activeFile.content.matchAll(promptRegex)].map(match => match[1]);
        setInputPrompts(prompts);
        
        try {
            userInputs = await new Promise<string[]>((resolve, reject) => {
                setOnInputDialogSubmit({ resolver: resolve, rejecter: reject });
                setInputDialogOpen(true);
            });
        } catch (e) {
            setIsCompiling(false);
            setShowOutput(false);
            return;
        }
    }

    setConsoleOutput(prev => [...prev, 'Compilation successful.', '> Running...']);

    const prelude = `
        class ArrayList extends Array { add(val) { this.push(val); return true; } get(index) { return this[index]; } size() { return this.length; } isEmpty() { return this.length === 0; } remove(index) { return this.splice(index, 1)[0]; } toString() { return \`[\${this.join(', ')}]\`; } }
        class HashMap extends Map { constructor() { super(); } put(key, value) { this.set(key, value); return value; } isEmpty() { return this.size === 0; } containsKey(key) { return this.has(key); } remove(key) { const v = this.get(key); this.delete(key); return v; } clear() { super.clear(); } values() { return Array.from(super.values()); } keySet() { return Array.from(this.keys()); } toString() { let parts = []; for (let [key, value] of this.entries()) { parts.push(key + '=' + value); } return '{' + parts.join(', ') + '}';} }
        let __scanner_inputs__ = []; let __scanner_cursor__ = 0; function __init_scanner__(inputs) { __scanner_inputs__ = inputs.flatMap(i => i.split(/\\s+|\\r?\\n/)).filter(Boolean); __scanner_cursor__ = 0; }
        
        const System = { 
            out: {
                println: (val) => mock_println(val),
                print: (val) => mock_print(val),
            },
            in: 'System.in', 
            currentTimeMillis: () => Date.now() 
        };

        class Scanner { constructor(source) { if (source !== System.in) throw new Error("Scanner can only be used with System.in."); } nextLine() { return __scanner_inputs__[__scanner_cursor__++] || ""; } nextInt() { return parseInt(this.nextLine(), 10) || 0; } nextDouble() { return parseFloat(this.nextLine()) || 0.0; } next() { return this.nextLine(); } hasNext() { return __scanner_cursor__ < __scanner_inputs__.length; } close() {} }

        // New Library Shims
        const MathContext = {}; // Dummy object for BigDecimal syntax
        class BigDecimal { constructor(val) { this.value = Number(val); } add(other) { return new BigDecimal(this.value + other.value); } subtract(other) { return new BigDecimal(this.value - other.value); } multiply(other) { return new BigDecimal(this.value * other.value); } divide(other, scale, roundingMode) { return new BigDecimal(this.value / other.value); } toString() { return this.value.toString(); } }
        class BigInteger { constructor(val) { try { this.value = BigInt(val); } catch(e) { this.value = BigInt(0); } } add(other) { return new BigInteger(this.value + other.value); } subtract(other) { return new BigInteger(this.value - other.value); } multiply(other) { return new BigInteger(this.value * other.value); } divide(other) { return new BigInteger(this.value / other.value); } toString() { return this.value.toString(); } }
        class Random { nextInt(bound) { if(bound) { return Math.floor(Math.random() * bound); } return Math.floor(Math.random() * 2**32) - 2**31; } nextDouble() { return Math.random(); } }
        class Date extends globalThis.Date { constructor(...args) { super(...args); } }
        class SimpleDateFormat { constructor(pattern) { this.pattern = pattern; /* Pattern is ignored in this simulation */ } format(date) { if (date instanceof globalThis.Date) { return date.toLocaleString(); } return ''; } }
    `;

    let mainBody = '';
    const mainSignatureRegex = /public\s+static\s+void\s+main\s*\(\s*String\s*(\[\s*\]\s*args|args\s*\[\s*\])\s*\)\s*\{/;
    const mainSignatureMatch = activeFile.content.match(mainSignatureRegex);

    if (mainSignatureMatch && typeof mainSignatureMatch.index === 'number') {
        const code = activeFile.content;
        const startIndex = mainSignatureMatch.index + mainSignatureMatch[0].length;
        const codeToSearch = code.substring(startIndex);
        
        let braceCount = 1;
        let bodyEndIndex = -1;

        const stringAndCommentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*")/g;
        
        const codeSegments: {text: string, index: number}[] = [];
        let lastRegexIndex = 0;
        let regexMatch;

        while((regexMatch = stringAndCommentRegex.exec(codeToSearch)) !== null) {
            const codePart = codeToSearch.substring(lastRegexIndex, regexMatch.index);
            if (codePart) {
                codeSegments.push({ text: codePart, index: lastRegexIndex });
            }
            lastRegexIndex = regexMatch.index + regexMatch[0].length;
        }
        const lastCodePart = codeToSearch.substring(lastRegexIndex);
        if(lastCodePart) {
           codeSegments.push({ text: lastCodePart, index: lastRegexIndex });
        }

        for (const segment of codeSegments) {
            for (let i = 0; i < segment.text.length; i++) {
                const char = segment.text[i];
                if (char === '{') {
                    braceCount++;
                } else if (char === '}') {
                    braceCount--;
                    if (braceCount === 0) {
                        bodyEndIndex = segment.index + i;
                        break;
                    }
                }
            }
            if (bodyEndIndex !== -1) {
                break;
            }
        }
        
        if (bodyEndIndex !== -1) {
            mainBody = codeToSearch.substring(0, bodyEndIndex);
        }
    }

    let simulatedOutput: string[] = [];
    const runtimeErrors: string[] = [];

    if (mainBody) {
        try {
            const stringAndCommentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*")/g;
            const parts: string[] = [];
            let lastIndex = 0;
            let match;

            while((match = stringAndCommentRegex.exec(mainBody)) !== null) {
                parts.push(mainBody.substring(lastIndex, match.index));
                parts.push(match[0]);
                lastIndex = match.index + match[0].length;
            }
            parts.push(mainBody.substring(lastIndex));

            const processedParts = parts.map((part, index) => {
                if (index % 2 === 0) { // It's a code segment
                    return part
                        .replace(/(String|int|double|float|boolean|char)\s*\[\s*\]/g, 'let')
                        .replace(/(final\s+)?(String|int|double|float|boolean|char|ArrayList|HashMap|Scanner|Random|Date|BigDecimal|BigInteger|SimpleDateFormat)(<.*?>)?\s+/g, (match, p1) => p1 ? 'const ' : 'let ')
                        .replace(/new\s+(ArrayList|HashMap)<.*?>\s*\(\)/g, 'new $1()')
                        .replace(/Integer\.parseInt/g, 'parseInt');
                } else { // It's a string or comment, return as is
                    return part;
                }
            });

            const jsCode = processedParts.join('');

            let outputBuffer: string[] = [];
            let lineBuffer = '';

            const mock_println = (val = '') => { outputBuffer.push(lineBuffer + (val?.toString() ?? '')); lineBuffer = ''; };
            const mock_print = (val = '') => { lineBuffer += (val?.toString() ?? ''); };
            
            const scannerInit = usesScanner ? `__init_scanner__(${JSON.stringify(userInputs)});` : '';
            const fullCodeToRun = prelude + scannerInit + jsCode;

            const sandboxedExecutor = new Function('mock_println', 'mock_print', fullCodeToRun);
            sandboxedExecutor(mock_println, mock_print);

            if (lineBuffer) outputBuffer.push(lineBuffer);
            simulatedOutput = outputBuffer;
        } catch (e: any) {
            runtimeErrors.push(`Runtime Error: ${e.message}. Check your code for errors.`);
        }
    }

    if (runtimeErrors.length > 0) {
        setErrorOutput(runtimeErrors);
        setActiveTab('problems');
    } else {
        setConsoleOutput(prev => [...prev, ...simulatedOutput, '\nExecution finished.']);
        setActiveTab('console');
    }

    setIsCompiling(false);
  }, [activeFile, toast]);
  
  const handleDialogSubmit = (inputs: string[]) => {
    if(onInputDialogSubmit) onInputDialogSubmit.resolver(inputs);
    setInputDialogOpen(false);
    setOnInputDialogSubmit(null);
  };

  const handleDialogClose = () => {
    if(onInputDialogSubmit?.rejecter) onInputDialogSubmit.rejecter(new Error("Input dialog closed by user"));
    setInputDialogOpen(false);
    setOnInputDialogSubmit(null);
  }

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
