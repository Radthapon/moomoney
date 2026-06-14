'use client';
import { useEffect, useState } from 'react';
import { seedDefaultData } from '@/lib/db';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Request persistent storage so browser never evicts IndexedDB data
    if (navigator.storage?.persist) {
      navigator.storage.persist();
    }
    seedDefaultData().then(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="flex flex-col items-center gap-3 text-ink-soft">
          <div className="w-9 h-9 border-[3px] border-brand-100 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-sm">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-page">
      {/* Mobile-first single column, centered on larger screens */}
      <div className="relative w-full max-w-[460px] min-h-screen bg-page">
        <main className="pb-28">{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
