import React from 'react';
import SidebarNav from './SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background overflow-x-hidden">
      <SidebarNav />
      <main className={cn(
        "flex-grow w-full transition-all duration-300",
        isMobile ? "px-4 pt-20 pb-8" : "p-8",
        "bg-background"
      )}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;