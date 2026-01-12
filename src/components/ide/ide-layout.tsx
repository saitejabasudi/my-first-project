
"use client";

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { IdeHeader } from './ide-header';
import { CodeEditor } from './code-editor';
import { TerminalView } from './terminal-view';
import { useDebounce } from '@/hooks/use-debounce';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Play, Trash2 } from 'lucide-react';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';

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

function lintJavaCode(code: string): string[] {
    const errors: string[] = [];
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
            !trimmedLine.startsWith('import') &&
            !trimmedLine.startsWith('package') &&
            !/^\s*(public|private|protected|static|final|abstract|class|interface|enum|@interface|implements|extends)/.test(trimmedLine) &&
            !line.match(/^\s*(public|private|protected|static|final|abstract|synchronized|native|strictfp)?\s*[\w<>[\]]+\s+\w+\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*@/) && // annotations
            !line.match(/^\s*}/) && // closing brace on new line
            !line.match(/^\s*for\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*if\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*else(\s*if\s*\(.*\))?\s*\{?$/) &&
            !line.match(/^\s*while\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*try\s*\{?$/) &&
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
  const [activeFile, setActiveFile] = useState<JavaFile | null>(null);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to Java Studio Pro! Ready to compile.']);
  const [lintingEnabled, setLintingEnabled] = useState(true);
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    let allFiles: JavaFile[] = [];
    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      allFiles = storedProjectsJson ? JSON.parse(storedProjectsJson) : mockFiles;
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
      allFiles = mockFiles;
    }

    const fileIdFromUrl = searchParams.get('file');
    const fileToLoad = allFiles.find(f => f.id === fileIdFromUrl);
    
    if (fileToLoad) {
      setActiveFile(fileToLoad);
    } else if (allFiles.length > 0) {
      // Fallback to first file if URL param is invalid or missing
      setActiveFile(allFiles[0]);
      router.replace(`/ide?file=${allFiles[0].id}`);
    }
  }, [searchParams, router]);

  const debouncedCode = useDebounce(activeFile?.content ?? '', 500);

  useEffect(() => {
    if (lintingEnabled && activeFile) {
      const errors = lintJavaCode(debouncedCode);
       setTerminalOutput(prev => {
        const otherMessages = prev.filter(l => !l.startsWith('Error'));
        if (errors.length > 0) {
          return [...errors, ...otherMessages];
        }
        return otherMessages;
      });
    } else {
       setTerminalOutput(prev => prev.filter(l => !l.startsWith('Error')));
    }
  }, [debouncedCode, lintingEnabled, activeFile]);


  const handleCodeChange = useCallback((newCode: string) => {
    if (!activeFile) return;
    const updatedFile = { ...activeFile, content: newCode };
    setActiveFile(updatedFile);

    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const allFiles = storedProjectsJson ? JSON.parse(storedProjectsJson) : mockFiles;
      const updatedFiles = allFiles.map((f: JavaFile) => f.id === activeFile.id ? updatedFile : f);
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedFiles));
    } catch (error) {
        console.error("Failed to save project to localStorage", error);
    }

  }, [activeFile]);

  const handleCompile = useCallback(() => {
    if (!activeFile) return;

    setIsCompiling(true);
    setTerminalOutput((prev) => [...prev, `\n> Compiling ${activeFile.name}...`]);

    setTimeout(() => {
      const errors = lintJavaCode(activeFile.content);
      if (errors.length > 0) {
        setTerminalOutput((prev) => ['Compilation failed with errors:', ...errors]);
        setIsCompiling(false);
        toast({
          variant: 'destructive',
          title: 'Compilation Failed',
          description: `Please fix the errors in ${activeFile.name}.`,
        });
        return;
      }

      setTerminalOutput((prev) => ['Compilation successful.', '> Running...', ...activeFile.output.split('\n'), '\nExecution finished.']);
      setIsCompiling(false);
      toast({
        title: 'Execution Complete',
        description: `${activeFile.name} ran successfully.`,
      });
    }, 1500);
  }, [activeFile, toast]);

  const handleFormatCode = useCallback(() => {
    if (!activeFile) return;
    const formattedCode = formatJavaCode(activeFile.content);
    handleCodeChange(formattedCode);
    toast({ description: 'Code formatted.' });
  }, [activeFile, handleCodeChange, toast]);

  const handleClearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);
  
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
      <main className="flex flex-1 flex-col overflow-hidden relative">
        <div className="flex-1 flex flex-col overflow-hidden">
             <CodeEditor code={activeFile.content} onCodeChange={handleCodeChange} onFormat={handleFormatCode} />
        </div>

        <div className="flex h-1/3 min-h-[150px] flex-col border-t">
          <div className="flex items-center justify-between border-b px-4 py-2">
              <h3 className="font-semibold text-sm">Terminal</h3>
              <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="linting-toggle" checked={lintingEnabled} onCheckedChange={setLintingEnabled} />
                    <Label htmlFor="linting-toggle" className="text-sm">Real-time Errors</Label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={handleClearTerminal} aria-label="Clear Terminal">
                    <Trash2 className="h-4 w-4" />
                  </Button>
              </div>
          </div>
          <TerminalView output={terminalOutput} onClear={handleClearTerminal} />
        </div>

        <Button onClick={handleCompile} disabled={isCompiling} className="absolute bottom-24 right-6 h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg" size="icon">
          <Play className="h-8 w-8 text-white fill-white" />
        </Button>
      </main>
    </div>
  );
}
