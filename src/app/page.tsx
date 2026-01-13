'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileCode } from 'lucide-react';
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

  if (loading) {
    return <SplashScreen progress={progress} />;
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
            <Link href={`/ide?file=${file.id}`} key={file.id} passHref>
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
          ))}
        </div>
      </main>
    </div>
  );
}
