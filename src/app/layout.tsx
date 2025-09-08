import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Sidebar from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Dashboard - User Management',
  description: 'Modern dashboard for user management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <div className="min-h-screen bg-gray-50 flex">
            <Sidebar />
            <main className="flex-1 transition-all duration-300 lg:ml-64">
              {children}
            </main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}