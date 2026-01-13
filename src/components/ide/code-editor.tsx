
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
    const keywordRegex = /\b(public|class|static|void|main|String|System|out|println|if|else|for|while|switch|case|break|continue|return|int|double|boolean|char|new)\b/g;
    let lastIndex = 0;
    const parts = [];
    let match;

    while((match = keywordRegex.exec(segment)) !== null) {
      const nonKeywordPart = segment.substring(lastIndex, match.index);
       if (nonKeywordPart) {
        parts.push(
          <React.Fragment key={`${key}-non-keyword-${lastIndex}`}>
            {nonKeywordPart.split('').map((char, index) => 
              (char === '{' || char === '}') ? 
              <span key={`${key}-brace-${lastIndex}-${index}`} className="text-syntax-highlight">{char}</span> : char
            )}
          </React.Fragment>
        );
      }

      const keywordPart = match[0];
      parts.push(<span key={`${key}-keyword-${match.index}`} className="text-syntax-keyword">{keywordPart}</span>);
      lastIndex = match.index + keywordPart.length;
    }

    const remainingPart = segment.substring(lastIndex);
    if(remainingPart) {
        parts.push(
          <React.Fragment key={`${key}-remaining-${lastIndex}`}>
            {remainingPart.split('').map((char, index) => 
              (char === '{' || char === '}') ? 
              <span key={`${key}-brace-rem-${lastIndex}-${index}`} className="text-syntax-highlight">{char}</span> : char
            )}
          </React.Fragment>
        );
    }

    return parts;
  };

  const renderHighlightedCode = () => {
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
