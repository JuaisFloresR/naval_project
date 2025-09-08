'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className={cn(
        "flex-1 transition-all duration-300 ease-in-out",
        isOpen ? "lg:ml-32" : "lg:ml-0"
      )}>
        {children}
      </main>
    </div>
  );
}