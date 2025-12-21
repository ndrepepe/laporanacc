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
    if (isSheetOpen) setIsSheetOpen(false);
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

  if (profile?.role && USER_MANAGER_ROLES.includes(profile.role)) {
    navItems.push({ to: "/users/add", icon: UserPlus, label: t('add_employee') });
  }

  if (profile?.role && SUBORDINATE_VIEWER_ROLES.includes(profile.role)) {
    navItems.push({ to: "/reports/subordinates", icon: Users, label: t('view_subordinates') });
  }

  if (profile?.role && SUMMARY_VIEWER_ROLES.includes(profile.role)) {
    navItems.push({ to: "/summary", icon: BarChart, label: t('summary') });
  }

  if (profile?.role === ADMIN_ROLE) {
    navItems.push({ to: "/admin", icon: Settings, label: t('admin_dashboard') });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full p-4 bg-card">
      <div className="mb-8 px-2">
        <h2 className="text-xl font-extrabold text-gradient tracking-widest">
          ANDI OFFSET
        </h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-[10px] uppercase tracking-tighter text-muted-foreground truncate max-w-[150px]">
            {profile?.role || t('role_not_assigned')}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefreshProfile}
            disabled={isRefreshing}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={cn("h-3 w-3", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>
      <nav className="flex-grow space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => isMobile && setIsSheetOpen(false)}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 text-sm",
                isActive
                  ? "bg-primary/10 text-primary font-bold border border-primary/20"
                  : "text-muted-foreground hover:bg-accent/10"
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-border">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 h-10"
        >
          <LogOut className="h-4 w-4 mr-3" />
          {t('logout')}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b z-40 flex items-center px-4">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2">
              <div className="flex flex-col gap-1">
                <span className="w-5 h-0.5 bg-foreground"></span>
                <span className="w-5 h-0.5 bg-foreground"></span>
                <span className="w-5 h-0.5 bg-foreground"></span>
              </div>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 border-r-0">
            <NavContent />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-bold text-gradient tracking-tight">ANDI OFFSET</h1>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-64 border-r border-border bg-card h-screen sticky top-0 shadow-sm">
      <NavContent />
    </div>
  );
};

export default SidebarNav;