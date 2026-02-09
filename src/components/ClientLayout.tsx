'use client';

import { AppProvider } from '@/lib/context';
import BottomNav from './BottomNav';
import { ReactNode } from 'react';

export default function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <div className="max-w-lg mx-auto min-h-screen relative pb-16">
        {children}
      </div>
      <BottomNav />
    </AppProvider>
  );
}
