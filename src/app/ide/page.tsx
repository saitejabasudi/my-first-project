import { Suspense } from 'react';
import { IdeLayout } from '@/components/ide/ide-layout';

function IdeLoading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
      Loading project...
    </div>
  );
}

export default function IdePage() {
  return (
    <div className="bg-background">
      <Suspense fallback={<IdeLoading />}>
        <IdeLayout />
      </Suspense>
    </div>
  );
}
