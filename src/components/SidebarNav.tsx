import { cn } from "@/lib/utils";
import { Home, LogOut, FileText, Users, Bell, BarChart } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/report/submit", icon: FileText, label: "Submit Report" },
  { to: "/reports/view", icon: Users, label: "View Reports" },
  { to: "/summary", icon: BarChart, label: "Summary" },
  { to: "/notifications", icon: Bell, label: "Notifications" },
];

const SidebarNav = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const NavContent = () => (
    <div className="flex flex-col h-full p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-primary">Daily Reports</h2>
        <p className="text-sm text-muted-foreground mt-1">
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
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
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
          <Button variant="outline" size="icon" className="fixed top-4 left-4 z-50">
            <Home className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[250px] p-0">
          <NavContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <div className="hidden md:flex flex-col w-64 border-r bg-sidebar h-screen sticky top-0">
      <NavContent />
    </div>
  );
};

export default SidebarNav;