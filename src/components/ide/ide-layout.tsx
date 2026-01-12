"use client";

import { useState, useCallback, useEffect } from 'react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { IdeHeader } from './ide-header';
import { FileExplorer } from './file-explorer';
import { CodeEditor } from './code-editor';
import { TerminalView } from './terminal-view';
import { useDebounce } from '@/hooks/use-debounce';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

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

// A simple lightweight Java linter
function lintJavaCode(code: string): string[] {
    const errors: string[] = [];
    const lines = code.split('\n');
    let braceStack = 0;
    let parenStack = 0;

    lines.forEach((line, index) => {
        const lineNumber = index + 1;
        const trimmedLine = line.trim();

        // Basic semicolon check for simple statements
        if (
            trimmedLine.length > 0 &&
            !trimmedLine.endsWith(';') &&
            !trimmedLine.endsWith('{') &&
            !trimmedLine.endsWith('}') &&
            !trimmedLine.startsWith('//') &&
            !trimmedLine.startsWith('import') &&
            !trimmedLine.startsWith('package') &&
            !line.match(/^\s*(public|private|protected|static|final|abstract|class|interface|enum)/) &&
            !line.match(/^\s*for\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*if\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*else(\s*if\s*\(.*\))?\s*\{?$/) &&
            !line.match(/^\s*while\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*try\s*\{?$/) &&
            !line.match(/^\s*catch\s*\(.*\)\s*\{?$/) &&
            !line.match(/^\s*finally\s*\{?$/)
        ) {
            errors.push(`Error at line ${lineNumber}: Missing semicolon or invalid statement.`);
        }
        
        // Stack-based brace and parenthesis checking
        for (const char of line) {
            if (char === '{') {
                braceStack++;
            } else if (char === '}') {
                braceStack--;
            } else if (char === '(') {
                parenStack++;
            } else if (char === ')') {
                parenStack--;
            }
        }
    });
    
    if (braceStack !== 0) {
        errors.push("Error: Mismatched curly braces in the file.");
    }
    if (parenStack !== 0) {
        errors.push("Error: Mismatched parentheses in the file.");
    }


    return errors;
}

export function IdeLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<JavaFile>(mockFiles[0]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Welcome to JavaDroid IDE! Ready to compile.']);
  const [lintingEnabled, setLintingEnabled] = useState(true);
  const { toast } = useToast();

  const debouncedCode = useDebounce(activeFile.content, 500);

  useEffect(() => {
    if (lintingEnabled) {
      const errors = lintJavaCode(debouncedCode);
      const otherMessages = terminalOutput.filter(l => !l.startsWith('Error'));
      if (errors.length > 0) {
        setTerminalOutput([...otherMessages, ...errors]);
      } else {
        setTerminalOutput(otherMessages);
      }
    } else {
       setTerminalOutput(prev => prev.filter(l => !l.startsWith('Error')));
    }
  }, [debouncedCode, lintingEnabled]);


  const handleFileSelect = useCallback(
    (file: JavaFile) => {
      if (file.id !== activeFile.id) {
        setActiveFile(file);
        setTerminalOutput(['Welcome to JavaDroid IDE! Ready to compile.']);
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
        </div>
      </main>
    </div>
  );
}
