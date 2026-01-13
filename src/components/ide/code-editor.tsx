
"use client";
import React, { useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);

  const lineCount = code.split('\n').length || 1;
  
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current && highlighterRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
        highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentLine = code.substring(0, start).split('\n').pop() || '';
      const indentMatch = currentLine.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      
      const previousLine = code.substring(0, start).split('\n').slice(-2, -1)[0] || '';
      
      if (previousLine.trim().endsWith('{')) {
          indent += '    ';
      }

      const newCode = `${code.substring(0, start)}\n${indent}${code.substring(end)}`;
      onCodeChange(newCode);

      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length;
      }, 0);
    }
  };

  const highlightSegment = (segment: string) => {
    const keywordRegex = /\b(public|class|static|void|main|String|System|out|println|if|else|for|while|switch|case|break|continue|return|int|double|boolean|char|new)\b/g;
    return segment.split(keywordRegex).map((part, index) => {
      if (index % 2 === 1) { // It's a keyword
        return <span key={index} className="text-syntax-keyword">{part}</span>;
      }
      // Not a keyword, check for braces
      return part.split(/([{}()])/g).map((subPart, subIndex) => {
        if (subPart.match(/[{}()]/)) {
          return <span key={`${index}-${subIndex}`} className="text-syntax-highlight">{subPart}</span>;
        }
        return subPart;
      });
    });
  };

  const renderHighlightedCode = () => {
    const codeToRender = code + '\n'; // Add newline to ensure last line is rendered
    const stringRegex = /("([^"\\]|\\.)*")/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while((match = stringRegex.exec(codeToRender)) !== null) {
      const nonStringPart = codeToRender.substring(lastIndex, match.index);
      if (nonStringPart) {
        parts.push(highlightSegment(nonStringPart));
      }

      const stringPart = match[0];
      parts.push(<span key={`string-${match.index}`} className="text-syntax-string">{stringPart}</span>);
      lastIndex = match.index + stringPart.length;
    }
    
    const remainingPart = codeToRender.substring(lastIndex);
    if(remainingPart) {
       parts.push(highlightSegment(remainingPart));
    }
    
    return <>{parts}</>;
  };

  const editorStyles = "font-code text-base leading-relaxed p-4 border-0 rounded-none resize-none";

  return (
    <div className="flex h-full flex-col">
        <div className="flex flex-1 overflow-hidden bg-background relative">
            <div 
                ref={lineNumbersRef}
                className="w-12 text-right pr-2 select-none overflow-y-hidden bg-background z-10 text-muted-foreground font-code text-base leading-relaxed pt-4"
                aria-hidden="true"
            >
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <div className="relative w-full h-full">
                <Textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  className={`absolute inset-0 h-full w-full bg-transparent focus-visible:ring-0 z-20 text-transparent caret-white ${editorStyles}`}
                  placeholder="Write your Java code here..."
                  aria-label="Code Editor"
                  spellCheck="false"
                />
                <pre 
                    ref={highlighterRef}
                    aria-hidden="true"
                    className={`absolute inset-0 h-full w-full bg-transparent overflow-auto z-10 pointer-events-none whitespace-pre-wrap ${editorStyles}`}
                >
                    {renderHighlightedCode()}
                </pre>
            </div>
        </div>
    </div>
  );
}
