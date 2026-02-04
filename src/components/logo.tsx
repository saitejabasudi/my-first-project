
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-6 w-6', className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 5l-7 7 7 7" />
      <path d="M15 5l7 7-7 7" />
    </svg>
  );
}
