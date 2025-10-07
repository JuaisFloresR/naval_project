'use client';

import { Users, Home, Settings, Ship, Component, Menu, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';
import Link from 'next/link';
import { usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
}

const navigation = [
  { name: "Dashboard", icon: Home, href: "/" },
  { name: "Users", icon: Users, href: "/users" },
  { name: "Ships", icon: Ship, href: "/ships" },
  { name: "Parts", icon: Component, href: "/parts" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

export default function Sidebar({ className }: SidebarProps) {
  const { isOpen, setIsOpen } = useSidebar();
  const pathname = usePathname();

  return (
    <>
      {/* Botón de menú fijo (visible siempre) */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-white shadow-md hover:bg-gray-50 transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto z-40'
          //  ,
          ,
          isOpen
            ? 'translate-x-0'
            : '-translate-x-full',
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Perfil */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  John Doe
                </p>
                <p className="text-xs text-gray-500 truncate">Admin</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
