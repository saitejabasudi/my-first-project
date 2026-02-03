"use client";
import React, { useRef, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLPreElement>(null);

  const lineCount = code.split('\n').length || 1;

  useEffect(() => {
    const handleScroll = () => {
      if (lineNumbersRef.current && textareaRef.current && highlighterRef.current) {
        const { scrollTop, scrollLeft } = textareaRef.current;
        lineNumbersRef.current.scrollTop = scrollTop;
        highlighterRef.current.scrollTop = scrollTop;
        highlighterRef.current.scrollLeft = scrollLeft;
      }
    };
    const textarea = textareaRef.current;
    textarea?.addEventListener('scroll', handleScroll);
    return () => textarea?.removeEventListener('scroll', handleScroll);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      // Consistent 4-space indentation
      const newCode = `${code.substring(0, start)}    ${code.substring(end)}`;
      onCodeChange(newCode);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 4;
      }, 0);
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      const textBeforeCursor = code.substring(0, start);
      const currentLineText = textBeforeCursor.split('\n').pop() || '';
      
      const indentMatch = currentLineText.match(/^\s*/);
      let indent = indentMatch ? indentMatch[0] : '';
      
      if (currentLineText.trim().endsWith('{')) {
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
    const keywordRegex = /\b(public|class|static|void|main|String|System|out|println|if|else|for|while|switch|case|break|continue|return|int|double|boolean|char|new|true|false|null|import|package|extends|implements|super|this|throw|throws|try|catch|finally|abstract|final|private|protected|synchronized|volatile|transient|native|strictfp|assert|enum)\b/g;
    return segment.split(keywordRegex).map((part, index) => {
      if (index % 2 === 1) { // It's a keyword
        return <span key={index} className="text-syntax-keyword">{part}</span>;
      }
      return part.split(/([{}()[\],.;])/g).map((subPart, subIndex) => {
        if (subPart.match(/[{}()[\],.;]/)) {
          return <span key={`${index}-${subIndex}`} className="text-syntax-highlight">{subPart}</span>;
        }
        return subPart;
      });
    });
  };

  const renderHighlightedCode = () => {
    const codeToRender = code + '\n';
    const stringAndCommentRegex = /(\/\*[\s\S]*?\*\/)|(\/\/[^\n]*)|("(?:\\[\s\S]|[^"\\])*")|('(?:\\[\s\S]|[^'\\])*')/g;
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    while((match = stringAndCommentRegex.exec(codeToRender)) !== null) {
      const nonProcessedPart = codeToRender.substring(lastIndex, match.index);
      if (nonProcessedPart) {
        parts.push(highlightSegment(nonProcessedPart));
      }

      const matchedPart = match[0];
      if (matchedPart.startsWith('"') || matchedPart.startsWith("'")) {
          parts.push(<span key={`string-${match.index}`} className="text-syntax-string">{matchedPart}</span>);
      } else {
          parts.push(<span key={`comment-${match.index}`} className="text-syntax-comment">{matchedPart}</span>);
      }

      lastIndex = match.index + matchedPart.length;
    }
    
    const remainingPart = codeToRender.substring(lastIndex);
    if(remainingPart) {
       parts.push(highlightSegment(remainingPart));
    }
    
    return <>{parts}</>;
  };

  const editorStyles = "font-code text-base leading-relaxed p-4 border-0 rounded-none resize-none min-w-full";

  return (
    <div className="flex h-full flex-col overflow-hidden">
        <div className="flex flex-1 overflow-hidden bg-background relative">
            <div 
                ref={lineNumbersRef}
                className="w-12 text-right pr-2 select-none overflow-y-hidden bg-muted/30 z-10 text-muted-foreground/50 font-code text-base leading-relaxed pt-4 flex-shrink-0 border-r border-border/20"
                aria-hidden="true"
            >
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <div className="relative w-full h-full overflow-hidden">
                <Textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => onCodeChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={`absolute inset-0 h-full w-full bg-transparent focus-visible:ring-0 z-20 text-transparent caret-foreground whitespace-pre overflow-auto scrollbar-hide ${editorStyles}`}
                  placeholder="Write your Java code here..."
                  aria-label="Code Editor"
                  spellCheck="false"
                />
                <pre 
                    ref={highlighterRef}
                    aria-hidden="true"
                    className={`absolute inset-0 h-full w-full bg-transparent overflow-auto z-10 pointer-events-none whitespace-pre scrollbar-hide ${editorStyles}`}
                >
                    {renderHighlightedCode()}
                </pre>
            </div>
        </div>
    </div>
  );
}
