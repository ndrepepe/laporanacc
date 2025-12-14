import { cn } from "@/lib/utils";
import { Home, LogOut, FileText, Users, Bell, BarChart, Settings, Eye, UserPlus } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/Button"; // Use custom Button
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { UserRole } from "@/lib/roles"; // Import UserRole
import { useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage

const SUBORDINATE_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];
const USER_MANAGER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager']; // New role group
const SUMMARY_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const ADMIN_ROLE: UserRole = 'Senior Manager';

const SidebarNav = () => {
  const { profile } = useAuth();
  const { t } = useLanguage(); // Use translation hook
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const baseNavItems = [
    { to: "/", icon: Home, label: t('dashboard') },
    { to: "/report/submit", icon: FileText, label: t('submit_report') },
    { to: "/reports/view", icon: Eye, label: t('my_reports') },
    { to: "/notifications", icon: Bell, label: t('notifications') },
  ];

  let navItems = [...baseNavItems];
  
  // Conditionally add Add User link (after Notifications, index 4)
  if (profile?.role && USER_MANAGER_ROLES.includes(profile.role)) {
    navItems.splice(4, 0, { to: "/users/add", icon: UserPlus, label: t('add_employee') });
  }

  // Conditionally add View Subordinate Reports link for managers/supervisors
  if (profile?.role && SUBORDINATE_VIEWER_ROLES.includes(profile.role)) {
    // Find the insertion point (after Notifications or Add Employee)
    const insertionIndex = navItems.findIndex(item => item.to === "/notifications") + 1;
    
    // Check if Add Employee was inserted, if so, insert after it.
    const addUserIndex = navItems.findIndex(item => item.to === "/users/add");
    const subordinateIndex = addUserIndex !== -1 ? addUserIndex + 1 : insertionIndex;

    // Ensure we don't duplicate if the role is in both groups (e.g., Senior Manager)
    if (!navItems.some(item => item.to === "/reports/subordinates")) {
        navItems.splice(subordinateIndex, 0, { to: "/reports/subordinates", icon: Users, label: t('view_subordinates') });
    }
  }
  
  // Conditionally add Summary link for Accounting Managers and Senior Managers
  if (profile?.role && SUMMARY_VIEWER_ROLES.includes(profile.role)) {
    // Find the insertion point (after View Subordinates or the last inserted item)
    const lastReportIndex = navItems.findIndex(item => item.to === "/reports/subordinates");
    const summaryIndex = lastReportIndex !== -1 ? lastReportIndex + 1 : navItems.findIndex(item => item.to === "/users/add") + 1;
    
    if (!navItems.some(item => item.to === "/summary")) {
        navItems.splice(summaryIndex, 0, { to: "/summary", icon: BarChart, label: t('summary') });
    }
  }

  // Conditionally add Admin link
  if (profile?.role === ADMIN_ROLE) {
    navItems.push({ to: "/admin", icon: Settings, label: t('admin_dashboard') });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gradient tracking-widest">
          ANDI OFFSET
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {profile?.role || "Loading Role..."}
        </p>
      </div>
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && setIsSheetOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-300",
                "hover:bg-accent/20 hover:text-accent-foreground",
                isActive
                  ? "bg-primary/20 text-primary font-semibold border border-primary/50 neon-glow"
                  : "text-muted-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-destructive hover:text-destructive">
          <LogOut className="h-5 w-5 mr-3" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          {/* Fixed position for mobile trigger button */}
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Home className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0 bg-sidebar dark:bg-background">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-sidebar dark:bg-card h-screen sticky top-0 shadow-2xl dark:shadow-primary/10">
      <NavContent />
    </div>
  );
};

export default SidebarNav;