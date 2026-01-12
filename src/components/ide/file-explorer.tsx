"use client";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { JavaFile } from '@/lib/mock-files';
import { FileCode, Folder } from 'lucide-react';

type FileExplorerProps = {
  files: JavaFile[];
  activeFileId: string;
  onFileSelect: (file: JavaFile) => void;
};

export function FileExplorer({ files, activeFileId, onFileSelect }: FileExplorerProps) {
  return (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Folder className="h-5 w-5 text-primary" />
          <span>Workspace</span>
        </h2>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {files.map((file) => (
            <Button
              key={file.id}
              variant={file.id === activeFileId ? 'secondary' : 'ghost'}
              className="w-full justify-start gap-2"
              onClick={() => onFileSelect(file)}
            >
              <FileCode className="h-4 w-4 text-muted-foreground" />
              <span className="truncate font-code">{file.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
