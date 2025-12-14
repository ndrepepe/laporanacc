import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole } from "@/lib/roles";
import ApplicationTools from "@/components/tools/ApplicationTools"; // New import

const SUMMARY_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const SUBORDINATE_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

const Index = () => {
  const { profile, user } = useAuth();

  const getGuidanceMessage = (role: UserRole | undefined) => {
    if (!role) {
        return "Use the sidebar navigation to navigate the application.";
    }

    let actions = ["Submit your daily report", "View your reports", "Check your notifications"];

    if (SUMMARY_ROLES.includes(role)) {
        actions.push("View statistical summaries");
    } else if (SUBORDINATE_ROLES.includes(role)) {
        actions.push("View subordinate reports");
    }

    // Format the list of actions into a readable sentence
    if (actions.length === 1) {
        return `Use the sidebar navigation to ${actions[0]}.`;
    } else if (actions.length === 2) {
        return `Use the sidebar navigation to ${actions[0]} and ${actions[1]}.`;
    } else {
        const lastAction = actions.pop();
        return `Use the sidebar navigation to ${actions.join(', ')}, and ${lastAction}.`;
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-4xl font-extrabold tracking-widest lg:text-5xl text-gradient mb-6">
        Welcome, {profile?.first_name || user?.email}!
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Current Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary tracking-wider">
              {profile?.role || "Role not assigned"}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              {getGuidanceMessage(profile?.role)}
            </p>
          </CardContent>
        </Card>
        
        <ApplicationTools />
      </div>

      <MadeWithDyad />
    </DashboardLayout>
  );
};

export default Index;