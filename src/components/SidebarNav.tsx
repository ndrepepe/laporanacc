import { cn } from "@/lib/utils";
import { Home, LogOut, FileText, Users, Bell, BarChart, Settings, Eye, UserPlus, RefreshCw } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/Button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { UserRole } from "@/lib/roles";
import { useLanguage } from "@/contexts/LanguageContext";

const SUBORDINATE_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];
const USER_MANAGER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const SUMMARY_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const ADMIN_ROLE: UserRole = 'Senior Manager';

const SidebarNav = () => {
  const { profile, refreshProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleLogout = async () => {
    // Ensure the mobile sheet is closed before navigating away
    if (isSheetOpen) {
      setIsSheetOpen(false);
    }
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleRefreshProfile = async () => {
    setIsRefreshing(true);
    await refreshProfile();
    setIsRefreshing(false);
  };

  const baseNavItems = [
    { to: "/", icon: Home, label: t('dashboard') },
    { to: "/report/submit", icon: FileText, label: t('submit_report') },
    { to: "/reports/view", icon: Eye, label: t('my_reports') },
    { to: "/notifications", icon: Bell, label: t('notifications') },
  ];

  let navItems = [...baseNavItems];

  // Conditionally add Add User link
  if (profile?.role && USER_MANAGER_ROLES.includes(profile.role)) {
    navItems.splice(4, 0, {
      to: "/users/add",
      icon: UserPlus,
      label: t('add_employee')
    });
  }

  // Conditionally add View Subordinate Reports link
  if (profile?.role && SUBORDINATE_VIEWER_ROLES.includes(profile.role)) {
    const insertionIndex = navItems.findIndex(item => item.to === "/notifications") + 1;
    const addUserIndex = navItems.findIndex(item => item.to === "/users/add");
    const subordinateIndex = addUserIndex !== -1 ? addUserIndex + 1 : insertionIndex;
    
    if (!navItems.some(item => item.to === "/reports/subordinates")) {
      navItems.splice(subordinateIndex, 0, {
        to: "/reports/subordinates",
        icon: Users,
        label: t('view_subordinates')
      });
    }
  }

  // Conditionally add Summary link
  if (profile?.role && SUMMARY_VIEWER_ROLES.includes(profile.role)) {
    const lastReportIndex = navItems.findIndex(item => item.to === "/reports/subordinates");
    const summaryIndex = lastReportIndex !== -1 ? lastReportIndex + 1 : navItems.findIndex(item => item.to === "/users/add") + 1;
    if (!navItems.some(item => item.to === "/summary")) {
      navItems.splice(summaryIndex, 0, {
        to: "/summary",
        icon: BarChart,
        label: t('summary')
      });
    }
  }

  // Conditionally add Admin link
  if (profile?.role === ADMIN_ROLE) {
    navItems.push({
      to: "/admin",
      icon: Settings,
      label: t('admin_dashboard')
    });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full p-4 text-foreground">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gradient tracking-widest">
          ANDI OFFSET
        </h2>
        <div className="flex items-center justify-between mt-1">
          {profile?.role ? (
            <p className="text-xs text-muted-foreground">
              {profile.role}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {t('role_not_assigned')}
            </p>
          )}
          {(!profile || !profile.role) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefreshProfile}
              disabled={isRefreshing}
              className="h-6 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
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
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-destructive hover:text-destructive"
        >
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
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 shadow-2xl dark:shadow-primary/10">
      <NavContent />
    </div>
  );
};

export default SidebarNav;