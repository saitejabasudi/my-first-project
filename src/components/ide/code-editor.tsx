"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';

type CodeEditorProps = {
  code: string;
  onCodeChange: (code: string) => void;
};

export function CodeEditor({ code, onCodeChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlighterRef = useRef<HTMLDivElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    const lines = code.split('\n').length;
    setLineCount(lines > 0 ? lines : 1);
  }, [code]);
  
  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current && highlighterRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
        highlighterRef.current.scrollTop = textareaRef.current.scrollTop;
        highlighterRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const highlightSegment = (segment: string, key: string) => {
    return segment.split('').map((char, index) => {
      if (char === '{' || char === '}') {
        return <span key={`${key}-${index}`} className="text-syntax-highlight">{char}</span>;
      }
      return char;
    });
  };

  const renderHighlightedCode = () => {
    // We append a newline to ensure the last line is always rendered
    const codeToRender = code + '\n';
    const stringRegex = /"([^"\\]|\\.)*"/g;
    
    let lastIndex = 0;
    const parts = [];
    let match;

    while((match = stringRegex.exec(codeToRender)) !== null) {
      const nonStringPart = codeToRender.substring(lastIndex, match.index);
      if (nonStringPart) {
        parts.push(
          <React.Fragment key={`non-string-${lastIndex}`}>
            {highlightSegment(nonStringPart, `non-string-segment-${lastIndex}`)}
          </React.Fragment>
        );
      }

      const stringPart = match[0];
      parts.push(<span key={`string-${match.index}`} className="text-syntax-string">{stringPart}</span>);
      lastIndex = match.index + stringPart.length;
    }
    
    const remainingPart = codeToRender.substring(lastIndex);
    if(remainingPart) {
       parts.push(
          <React.Fragment key={`non-string-${lastIndex}`}>
            {highlightSegment(remainingPart, `remaining-segment-${lastIndex}`)}
          </React.Fragment>
        );
    }
    
    return parts;
  };

  return (
    <div className="flex h-full flex-col">
        <div className="flex flex-1 overflow-hidden bg-background relative">
            <div 
                ref={lineNumbersRef}
                className="w-12 text-right pr-2 pt-4 font-code text-base text-muted-foreground select-none overflow-y-hidden bg-background z-10"
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
                  className="absolute inset-0 h-full w-full resize-none border-0 rounded-none bg-transparent p-4 pl-4 font-code text-base leading-relaxed focus-visible:ring-0 z-20 text-transparent caret-white"
                  placeholder="Write your Java code here..."
                  aria-label="Code Editor"
                  spellCheck="false"
                />
                <pre 
                    ref={highlighterRef}
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full resize-none border-0 rounded-none bg-transparent p-4 pl-4 font-code text-base leading-relaxed overflow-auto z-10 pointer-events-none whitespace-pre-wrap"
                >
                    {renderHighlightedCode()}
                </pre>
            </div>
        </div>
    </div>
  );
}
