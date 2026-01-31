'use client';
import { useState, useEffect } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Code, Trash2, Settings } from 'lucide-react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';
import { Logo } from '@/components/logo';
import { Progress } from '@/components/ui/progress';
import { FullLogo } from '@/components/full-logo';
import { ThemeToggle } from '@/components/theme-toggle';

const PROJECTS_STORAGE_KEY = 'java-ide-projects';
const INITIALIZED_KEY = 'java-ide-initialized';

function SplashScreen({ onTransitionEnd }: { onTransitionEnd: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          onTransitionEnd();
          return 100;
        }
        return prev + 1;
      });
    }, 20);

    return () => clearInterval(timer);
  }, [onTransitionEnd]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground font-body">
      <FullLogo />
      <p className="text-muted-foreground mb-4 mt-4">Loading Projects...</p>
      <Progress value={progress} className="w-64 h-1" />
    </div>
  );
}


export default function ProjectSelectionPage() {
  const [loading, setLoading] = useState(true);
  const [isCreateProjectOpen, setCreateProjectOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [projects, setProjects] = useState<JavaFile[]>([]);
  const router = useRouter();

  useEffect(() => {
    let storedProjects: JavaFile[] = [];
    try {
      const storedProjectsJson = localStorage.getItem(PROJECTS_STORAGE_KEY);
      const isInitialized = localStorage.getItem(INITIALIZED_KEY);

      if (storedProjectsJson) {
        const parsed = JSON.parse(storedProjectsJson);
        if (Array.isArray(parsed)) {
            storedProjects = parsed;
        }
      }

      if (!isInitialized && storedProjects.length === 0) {
          storedProjects = mockFiles;
          try {
              localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(mockFiles));
              localStorage.setItem(INITIALIZED_KEY, 'true');
          } catch (error) {
              console.error("Failed to save default projects to localStorage", error);
          }
      }
    } catch (error) {
      console.error("Failed to parse projects from localStorage", error);
    }
    setProjects(storedProjects);
  }, []);

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const formattedName = newProjectName.trim().replace(/[^a-zA-Z0-9]/g, '');
    if (!formattedName) return;

    const newFile: JavaFile = {
      id: formattedName.toLowerCase() + '-' + Date.now(),
      name: `${formattedName}.java`,
      content: `public class ${formattedName} {\n    public static void main(String[] args) {\n        System.out.println("Hello from ${formattedName}!");\n    }\n}`,
    };

    const updatedProjects = [...projects, newFile];
    setProjects(updatedProjects);
    try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
    } catch (error) {
        console.error("Failed to save projects to localStorage", error);
    }
    
    setCreateProjectOpen(false);
    setNewProjectName('');
    router.push(`/ide?file=${newFile.id}`);
  };
  
  const handleDeleteClick = (fileId: string) => {
    setProjects(currentProjects => {
      const updatedProjects = currentProjects.filter(p => p.id !== fileId);
      try {
        localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(updatedProjects));
      } catch (error) {
        console.error("Failed to save projects to localStorage", error);
      }
      return updatedProjects;
    });
  };
  
  if (loading) {
    return <SplashScreen onTransitionEnd={() => setLoading(false)} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Logo className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Java Projects</h1>
        </div>
        <div className="flex items-center">
            <ThemeToggle />
            <Link href="/settings">
                <Button variant="ghost" size="icon">
                  <Settings className="h-6 w-6" />
                </Button>
            </Link>
            <Dialog open={isCreateProjectOpen} onOpenChange={setCreateProjectOpen}>
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
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateProject()}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" onClick={handleCreateProject}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
        </div>
      </header>
      <main className="p-4">
        <div className="grid gap-4">
          {projects.map((file) => (
              <div key={file.id} className="relative group">
                <Link href={`/ide?file=${file.id}`} passHref>
                    <Card className="hover:border-primary transition-colors cursor-pointer bg-card">
                    <CardContent className="pt-6 flex items-center justify-between">
                        <div className="flex items-start gap-4">
                            <div className="bg-secondary p-3 rounded-lg">
                                <Code className="h-6 w-6 text-secondary-foreground" />
                            </div>
                            <div>
                                <h3 className="font-semibold">{file.name}</h3>
                                <p className="text-sm text-muted-foreground">Tap to edit</p>
                            </div>
                        </div>
                    </CardContent>
                    </Card>
                </Link>
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1/2 right-4 -translate-y-1/2 h-10 w-10 text-destructive-foreground opacity-0 group-hover:opacity-100 md:opacity-50"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteClick(file.id);
                    }}
                >
                    <Trash2 className="h-5 w-5" />
                </Button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
