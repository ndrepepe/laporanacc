import { cn } from "@/lib/utils";
import { Home, LogOut, FileText, Users, Bell, BarChart, Settings, Eye } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/Button"; // Use custom Button
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { UserRole } from "@/lib/roles"; // Import UserRole

const baseNavItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/report/submit", icon: FileText, label: "Submit Report" },
  { to: "/reports/view", icon: Eye, label: "My Reports" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const SUBORDINATE_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];
const SUMMARY_VIEWER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const ADMIN_ROLE: UserRole = 'Senior Manager';

const SidebarNav = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  let navItems = [...baseNavItems];
  
  // Conditionally add View Subordinate Reports link for managers/supervisors
  if (profile?.role && SUBORDINATE_VIEWER_ROLES.includes(profile.role)) {
    // Insert after My Reports (index 3)
    navItems.splice(3, 0, { to: "/reports/subordinates", icon: Users, label: "View Subordinates" });
  }
  
  // Conditionally add Summary link for Accounting Managers and Senior Managers
  if (profile?.role && SUMMARY_VIEWER_ROLES.includes(profile.role)) {
    // Insert after View Subordinates (or My Reports if View Subordinates is absent)
    const subordinateIndex = navItems.findIndex(item => item.to === "/reports/subordinates");
    const summaryIndex = subordinateIndex !== -1 ? subordinateIndex + 1 : 3;
    navItems.splice(summaryIndex, 0, { to: "/summary", icon: BarChart, label: "Summary" });
  }

  // Conditionally add Admin link
  if (profile?.role === ADMIN_ROLE) {
    navItems.push({ to: "/admin", icon: Settings, label: "Admin Dashboard" });
  }

  const NavContent = () => (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-gradient tracking-widest">
          DYAD AI
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
          Logout
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