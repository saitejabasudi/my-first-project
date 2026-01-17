
import { Logo } from './logo';
import { cn } from '@/lib/utils';

export function FullLogo({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col items-center', className)}>
        <div className="bg-card p-4 rounded-2xl shadow-lg mb-4">
            <Logo className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-primary font-headline">
            JavaDroid IDE
        </h1>
    </div>
  );
}
