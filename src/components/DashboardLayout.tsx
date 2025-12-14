import React from 'react';
import SidebarNav from './SidebarNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils'; // Import cn

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-background">
      <SidebarNav />
      {/* On mobile, we need extra padding on the left (pl-16) to clear the fixed sidebar trigger button (top-4 left-4) */}
      <main className={cn(
        isMobile ? "flex-grow p-4 pt-20 pl-16" : "flex-grow p-8",
        "bg-background" // Ensure main content area respects theme background
      )}>
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;