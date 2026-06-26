'use client';

import { ReactNode } from 'react';
import { Navigation } from './Navigation';
import { GlobalChatLauncher } from './GlobalChatLauncher';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-dark-base">
      <Navigation />
      <main className="container-max py-8">{children}</main>
      <GlobalChatLauncher />
    </div>
  );
}
