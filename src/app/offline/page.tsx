
'use client';

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground">
      <div className="text-center">
        <div className="mb-6 text-6xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-muted-foreground"
          >
            <line x1="2" y1="2" x2="22" y2="22" />
            <path d="M8.5 16.5a5 5 0 0 1 7 0" />
            <path d="M2 8.82a15 15 0 0 1 4.17-2.65" />
            <path d="M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
            <path d="M16.85 11.25a10 10 0 0 1 2.22 1.68" />
            <path d="M5 13a10 10 0 0 1 5.24-2.76" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 className="mb-2 text-2xl font-bold">You&apos;re Offline</h1>
        <p className="mb-6 text-muted-foreground">
          Java Studio Pro works offline, but some features may be limited.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
