'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import Sidebar from '@/components/Sidebar';
import { cn } from '@/lib/utils';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div className="bg-gray-50 min-h-screen flex relative overflow-hidden">
      <Sidebar />
      <main
        className={cn(
          "flex-1 overflow-y-auto transition-all duration-300 ease-in-out ",
          // Solo en pantallas grandes se aplica el margen cuando está abierto
          isOpen ? "lg:ml-64" : "lg:ml-0",
          // En móviles, nunca desplazamos el contenido
          "ml-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
