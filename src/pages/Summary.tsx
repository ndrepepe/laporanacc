import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Summary = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Statistical Summary</h1>
      <Card>
        <CardHeader>
          <CardTitle>Charts and Metrics Placeholder</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Daily and monthly summaries and charts will be implemented here.</p>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Summary;