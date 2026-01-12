
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Code, Moon, Sun, Share2, MoreVertical, History, Plus } from 'lucide-react';
import { mockFiles, type JavaFile } from '@/lib/mock-files';

export default function ProjectSelectionPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [open, setOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const router = useRouter();

  const toggleTheme = () => {
    const newIsDarkMode = !isDarkMode;
    setIsDarkMode(newIsDarkMode);
    document.documentElement.classList.toggle('dark', newIsDarkMode);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const formattedName = newProjectName.trim().replace(/\s/g, '');
    const newFile: JavaFile = {
      id: formattedName.toLowerCase() + '-' + Date.now(),
      name: `${formattedName}.java`,
      content: `public class ${formattedName} {\n    public static void main(String[] args) {\n        System.out.println("Hello, ${formattedName}!");\n    }\n}`,
      output: `Hello, ${formattedName}!`,
    };

    // Store new file in localStorage to be picked up by the IDE page
    localStorage.setItem('newlyCreatedFile', JSON.stringify(newFile));

    setOpen(false);
    setNewProjectName('');
    router.push('/ide');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Code className="h-6 w-6 text-primary" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="p-4 sm:p-6">
        <Card className="mb-8 shadow-lg">
          <CardContent className="pt-6">
            <h1 className="text-3xl font-bold mb-2">
              Code Java on the go, <span className="text-primary">Professionally.</span>
            </h1>
            <p className="text-muted-foreground mb-6">
              A full-featured IDE environment in your pocket. Write, compile, and run Java code instantly.
            </p>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="mr-2 h-5 w-5" />
                  New Project
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
          </CardContent>
        </Card>
        
        <div className="flex items-center gap-2 mb-4">
          <History className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Recent Projects</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {mockFiles.map((file) => (
            <Link href="/ide" key={file.id} passHref>
                <Card className="hover:border-primary transition-colors cursor-pointer">
                  <CardContent className="pt-6 flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-lg">
                          <Code className="h-6 w-6 text-secondary-foreground" />
                      </div>
                      <div>
                          <h3 className="font-semibold">{file.name.replace('.java', '')}</h3>
                          <p className="text-sm text-muted-foreground">Last edited: 10/01/2026</p>
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
