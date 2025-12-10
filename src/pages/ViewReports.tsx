import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ViewReports = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">View Employee Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Report Viewer Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Reports from staff you supervise will be displayed here, along with filtering options.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ViewReports;