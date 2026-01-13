'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileCode, Trash2 } from 'lucide-react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { Logo } from '@/components/logo';
import { Progress } from '@/components/ui/progress';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';

function SplashScreen({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-body">
      <div className="flex flex-col items-center">
        <div className="bg-card p-4 rounded-2xl shadow-lg mb-4">
          <Logo className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 font-headline">Java Studio Pro</h1>
        <p className="text-muted-foreground mb-4">Initializing Environment ...</p>
        <Progress value={progress} className="w-64 h-1" />
      </div>
    </div>
  );
}


export default function ProjectSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projects, setProjects] = useState<JavaFile[]>([]);
  const router = useRouter();

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout>();
  const isLongPress = useRef(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);


  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (loading) return;

    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      if (storedProjectsJson) {
        setProjects(JSON.parse(storedProjectsJson));
      } else {
        setProjects(mockFiles);
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error);
      setProjects(mockFiles);
    }
  }, [loading]);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const formattedName = newProjectName.trim().replace(/\s/g, '');
    const newFile: JavaFile = {
      id: formattedName.toLowerCase() + '-' + Date.now(),
      name: `${formattedName}.java`,
      content: `public class ${formattedName} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${formattedName}!");\n    }\n}`,
      output: `Hello from ${formattedName}!`,
    };

    const updatedProjects = [...projects, newFile];
    setProjects(updatedProjects);
    try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
        console.error("Failed to save projects to localStorage", error);
    }
    
    setOpen(false);
    setNewProjectName('');
    router.push(`/ide?file=${newFile.id}`);
  };

  const startPressTimer = (fileId: string) => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setDeletingId(fileId);
    }, 500); // 500ms for long press
  };

  const clearPressTimer = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>, fileId: string) => {
    clearTimeout(longPressTimer.current);
    if (isLongPress.current) {
        event.preventDefault();
        // Keep deletingId set to show the delete button
    } else if (deletingId) {
        setDeletingId(null);
    }
  };

  const handleCardClick = (event: React.MouseEvent<HTMLAnchorElement>, fileId: string) => {
    if (isLongPress.current || deletingId === fileId) {
      event.preventDefault();
      return;
    }
  }

  const handleDeleteClick = (event: React.MouseEvent, fileId: string) => {
    event.stopPropagation(); // prevent card click
    event.preventDefault(); // prevent link navigation
    setDeletingId(fileId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    if (!deletingId) return;
    
    const updatedProjects = projects.filter(p => p.id !== deletingId);
    setProjects(updatedProjects);
    try {
      localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
      console.error("Failed to save projects to localStorage", error);
    }
    
    setShowDeleteConfirm(false);
    setDeletingId(null);
  };

  if (loading) {
    return <SplashScreen progress={progress} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body" onClick={() => { if(deletingId) setDeletingId(null) }}>
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Logo className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Java Projects</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-6 w-6" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Enter a name for your new Java project. This will be used as the class name.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="name"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., MyAwesomeApp"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCreateProject}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>
      <main className="p-4">
        <div className="grid gap-4">
          {projects.map((file) => (
            <div 
              key={file.id} 
              className="relative"
              onMouseDown={() => startPressTimer(file.id)}
              onMouseUp={(e) => clearPressTimer(e, file.id)}
              onTouchStart={() => startPressTimer(file.id)}
              onTouchEnd={(e) => clearPressTimer(e, file.id)}
              onMouseLeave={() => clearTimeout(longPressTimer.current)}
              >
              <Link href={`/ide?file=${file.id}`} onClick={(e) => handleCardClick(e as any, file.id)}>
                <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
                  <CardContent className="pt-6 flex items-start gap-4">
                    <div className="bg-secondary p-3 rounded-lg">
                      <FileCode className="h-6 w-6 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{file.name}</h3>
                      <p className="text-sm text-muted-foreground">Tap to edit</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              {deletingId === file.id && (
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1/2 right-4 -translate-y-1/2 h-10 w-10 z-10"
                    onClick={(e) => handleDeleteClick(e, file.id)}
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
               )}
            </div>
          ))}
        </div>
      </main>
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the file
              and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
