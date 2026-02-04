import { cn } from '@/lib/utils';
import { Coffee } from 'lucide-react';

export function Logo({ className }: { className?: string }) {
  return (
    <Coffee className={cn('h-6 w-6', className)} />
  );
}
