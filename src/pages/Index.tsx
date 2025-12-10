import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";

const Index = () => {
  const { profile, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome, {profile?.first_name || user?.email}!
        </h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Current Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-primary">
              {profile?.role || "Role not assigned"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Use the sidebar navigation to submit your daily report or view summaries.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8">
          <Button onClick={handleLogout} variant="outline">
            Logout
          </Button>
        </div>
      </div>
      <MadeWithDyad />
    </DashboardLayout>
  );
};

export default Index;