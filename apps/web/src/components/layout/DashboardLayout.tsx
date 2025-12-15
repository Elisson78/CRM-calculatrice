'use client';

import { ReactNode } from 'react';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    role: 'admin' | 'entreprise' | 'client';
    nom?: string | null;
    entreprise?: {
      nom: string;
      slug: string;
    } | null;
  };
  onLogout: () => void;
}

export default function DashboardLayout({ children, user, onLogout }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar user={user} onLogout={onLogout} />
      
      {/* Main content with mobile padding */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

