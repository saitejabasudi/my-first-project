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
        <path d="M14.5 4l-5 16" />
        <path d="M8 4H4l6 8-6 8h4l6-8-6-8z" />
        <path d="M16 4h4l-6 8 6 8h-4l-6-8 6-8z" />
    </svg>
  );
}
