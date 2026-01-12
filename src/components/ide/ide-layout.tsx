"use client";

import { useState, useCallback, useEffect } from 'react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { IdeHeader } from './ide-header';
import { CodeEditor } from './code-editor';
import { TerminalView } from './terminal-view';
import { useDebounce } from '@/hooks/use-debounce';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Play, Trash2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
            !/^\s*(public|private|protected|static|final|abstract|class|interface|enum|@interface)/.test(line) &&
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
    
    if (braceStack.length > 0) {
        errors.push(`Error: Mismatched curly braces. Unclosed brace from line ${braceStack.pop()}.`);
    }
    if (parenStack.length > 0) {
        errors.push(`Error: Mismatched parentheses. Unclosed parenthesis from line ${parenStack.pop()}.`);
    }


    return errors;
}

export function IdeLayout() {
  const [files, setFiles] = useState<JavaFile[]>(mockFiles);
  const [activeFileId, setActiveFileId] = useState<string>(mockFiles[0].id);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to Java Studio Pro! Ready to compile.']);
  const [lintingEnabled, setLintingEnabled] = useState(true);
  const { toast } = useToast();

  const activeFile = files.find(f => f.id === activeFileId) || files[0];
  const debouncedCode = useDebounce(activeFile.content, 500);

  useEffect(() => {
    if (lintingEnabled) {
      const errors = lintJavaCode(debouncedCode);
      setTerminalOutput(prev => {
        const otherMessages = prev.filter(l => !l.startsWith('Error'));
        if (errors.length > 0) {
          return [...otherMessages, ...errors];
        }
        return otherMessages;
      });
    } else {
       setTerminalOutput(prev => prev.filter(l => !l.startsWith('Error')));
    }
  }, [debouncedCode, lintingEnabled]);


  const handleFileSelect = useCallback(
    (fileId: string) => {
      if (fileId !== activeFileId) {
        setActiveFileId(fileId);
        setTerminalOutput(['Welcome to Java Studio Pro! Ready to compile.']);
      }
    },
    [activeFileId]
  );
  
  const handleCloseFile = (fileId: string) => {
    if (files.length === 1) {
        toast({ title: "Cannot close the last file", variant: "destructive"});
        return;
    }
    const fileIndex = files.findIndex(f => f.id === fileId);
    const newFiles = files.filter(f => f.id !== fileId);
    setFiles(newFiles);

    if (activeFileId === fileId) {
        const newActiveIndex = Math.max(0, fileIndex -1);
        setActiveFileId(newFiles[newActiveIndex].id);
    }
  }


  const handleCodeChange = useCallback((newCode: string) => {
    setFiles(files => files.map(f => f.id === activeFileId ? {...f, content: newCode} : f));
  }, [activeFileId]);

  const handleCompile = useCallback(() => {
    setIsCompiling(true);
    setTerminalOutput((prev) => [...prev, `\n> Compiling ${activeFile.name}...`]);

    setTimeout(() => {
      const errors = lintJavaCode(activeFile.content);
      if (errors.length > 0) {
        setTerminalOutput((prev) => [...prev, 'Compilation failed with errors:', ...errors]);
        setIsCompiling(false);
        toast({
          variant: 'destructive',
          title: 'Compilation Failed',
          description: `Please fix the errors in ${activeFile.name}.`,
        });
        return;
      }

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
    setFiles(files => files.map(f => f.id === activeFileId ? {...f, content: formattedCode} : f));
    toast({ description: 'Code formatted.' });
  }, [activeFile.content, activeFileId, toast]);

  const handleClearTerminal = useCallback(() => {
    setTerminalOutput([]);
  }, []);

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <IdeHeader activeFile={activeFile} />
      <main className="flex flex-1 flex-col overflow-hidden relative">
        <Tabs value={activeFileId} onValueChange={handleFileSelect} className="flex flex-col flex-1 overflow-hidden">
            <div className="px-4 border-b">
                <TabsList className="bg-transparent p-0">
                    {files.map(file => (
                    <TabsTrigger key={file.id} value={file.id} className="relative data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 border-primary rounded-none pr-8">
                        {file.name}
                        <div 
                            role="button"
                            aria-label={`Close ${file.name}`}
                            className="absolute top-0 right-0 h-full w-8 flex items-center justify-center rounded-sm hover:bg-accent"
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                e.preventDefault(); 
                                handleCloseFile(file.id);
                            }}
                        >
                            <X className="h-4 w-4" />
                        </div>
                    </TabsTrigger>
                    ))}
                </TabsList>
            </div>
          {files.map(file => (
            <TabsContent key={file.id} value={file.id} className="flex-1 overflow-hidden mt-0">
               <div className="flex flex-1 flex-col h-full">
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor code={file.content} onCodeChange={handleCodeChange} onFormat={handleFormatCode} />
                    </div>
                </div>
            </TabsContent>
          ))}
        </Tabs>

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
