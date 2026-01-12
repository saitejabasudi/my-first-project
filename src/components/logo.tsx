import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
    >
      <rect width="18" height="18" x="3" y="3" rx="2"/>
      <path d="m10 9-2 2 2 2"/>
      <path d="m14 9 2 2-2 2"/>
    </svg>
  );
}
