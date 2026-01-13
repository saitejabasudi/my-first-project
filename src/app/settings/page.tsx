
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const SettingsItem = ({ title, value }: { title: string, value: string }) => (
    <div className="py-4">
        <p className="text-base text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
    </div>
);

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
            <Link href="/" passHref>
              <Button variant="ghost" size="icon" aria-label="Go back to projects">
                <ChevronLeft className="h-6 w-6" />
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Settings</h1>
        </div>
      </header>
      <main className="p-4">
        <div className="divide-y divide-border">
            <SettingsItem title="Font" value="RobotoMono" />
            <SettingsItem title="Font size" value="Small" />
            <SettingsItem title="Open the file charset" value="UTF-8" />
            <SettingsItem title="Donate" value="Buy a cup of coffee for developer.☕" />
            <SettingsItem title="Current Version" value="3.3.8" />
        </div>
      </main>
    </div>
  );
}
