import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-6 w-6', className)}
    >
      <path d="M10 2v2" />
      <path d="M14 2v2" />
      <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
      <path d="M6 8H4a4 4 0 0 0 0 8h2" />
      <path d="M14.5 18H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4.5" />
    </svg>
  );
}
