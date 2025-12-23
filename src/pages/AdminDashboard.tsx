import DashboardLayout from "@/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserManagement from "../components/admin/UserManagement";
import BranchManagement from "../components/admin/BranchManagement";
import SystemSettings from "../components/admin/SystemSettings";
import { useLanguage } from "@/contexts/LanguageContext";

const AdminDashboard = () => {
  const { t } = useLanguage();

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('admin_dashboard')}</h1>
      
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="users">{t('manage_users')}</TabsTrigger>
          <TabsTrigger value="branches">{t('manage_branches')}</TabsTrigger>
          <TabsTrigger value="settings">{t('system_settings')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="mt-6">
          <UserManagement />
        </TabsContent>
        
        <TabsContent value="branches" className="mt-6">
          <BranchManagement />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default AdminDashboard;