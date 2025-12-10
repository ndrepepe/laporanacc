import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const SubmitReport = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>Report Form Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The specific form for your role will appear here.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SubmitReport;