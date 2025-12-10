import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Notifications = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <Card>
        <CardHeader>
          <CardTitle>Notification List Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>You will receive alerts here when reports are submitted or when your report is viewed by a manager.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Notifications;