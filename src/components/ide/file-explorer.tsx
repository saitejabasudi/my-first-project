
"use client";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JavaFile } from '@/lib/mock-files';
import { FileCode, Folder, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

type FileExplorerProps = {
  files: JavaFile[];
  activeFileId: string;
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
};

export function FileExplorer({ files, activeFileId, onFileSelect, onFileDelete }: FileExplorerProps) {
  return (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
            <Folder className="h-5 w-5 text-primary" />
            <span>Files</span>
        </h2>
        <Link href="/" passHref>
             <Button variant="ghost" size="icon" aria-label="Go to project selection">
              <Plus className="h-6 w-6" />
            </Button>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <div key={file.id} className="relative group">
              <Button
                variant={file.id === activeFileId ? 'secondary' : 'ghost'}
                className="w-full justify-start gap-2 text-left h-auto py-2"
                onClick={() => onFileSelect(file.id)}
              >
                <FileCode className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate font-code flex-grow">{file.name}</span>
              </Button>
              <Button 
                variant="destructive" 
                size="icon" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                    e.stopPropagation();
                    onFileDelete(file.id);
                }}
                aria-label={`Delete file ${file.name}`}
              >
                  <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
