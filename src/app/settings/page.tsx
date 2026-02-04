'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Info, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const SettingsItem = ({ title, value }: { title: string, value: string | React.ReactNode }) => (
    <div className="py-4">
        <p className="text-base text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
    </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 pt-6 pb-2">
    {children}
  </div>
);

export default function SettingsPage() {
  const privacyPolicy = "Java Studio Pro is an offline Java coding application. It does not collect, store, or share any personal user data. All code and files remain on the user’s device. No internet access, tracking, or third-party services are used.";

  return (
    <div className="min-h-screen bg-background text-foreground font-body flex flex-col">
      <header className="flex items-center p-4 border-b bg-background">
        <div className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" aria-label="Go back to projects">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>
      <main className="p-4 max-w-2xl mx-auto flex-1 w-full">
        <div className="divide-y divide-border">
            <SettingsItem title="Font" value="Source Code Pro" />
            <SettingsItem title="Font size" value="Default" />
            <SettingsItem title="File Encoding" value="UTF-8" />
            <Dialog>
              <DialogTrigger asChild>
                <div className="py-4 cursor-pointer">
                  <p className="text-base text-foreground">Privacy Policy</p>
                  <p className="text-sm text-muted-foreground">View our privacy policy</p>
                </div>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Privacy Policy</DialogTitle>
                  <DialogDescription className="pt-4">
                    {privacyPolicy}
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            <Link href="/concepts/statement-completion">
              <div className="py-4 cursor-pointer flex justify-between items-center">
                  <div>
                    <p className="text-base text-foreground">Coding Concepts</p>
                    <p className="text-sm text-muted-foreground">Learn about statement completion</p>
                  </div>
                  <Info className="h-5 w-5 text-muted-foreground" />
              </div>
            </Link>
            <SettingsItem title="Current Version" value="1.0.0" />
        </div>

        <SectionTitle>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Data Safety</h2>
        </SectionTitle>

        <div className="divide-y divide-border border-t">
            <SettingsItem 
              title="No Data Collected" 
              value="This application does not collect any personal or sensitive user data. All operations are performed locally on your device." 
            />
            <SettingsItem 
              title="No Data Shared" 
              value="Since no data is collected, no data is shared with any third-party companies or services." 
            />
            <SettingsItem 
              title="Security Practices" 
              value="Your code and project files are stored exclusively on your device's local storage. They are not uploaded to any server." 
            />
            <SettingsItem 
              title="Data Deletion" 
              value="You can delete any project file directly from the project selection screen. Deleting the application will remove all local data." 
            />
        </div>
      </main>
    </div>
  );
}
