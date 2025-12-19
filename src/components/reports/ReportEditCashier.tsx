"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";

interface ReportData {
  id: string;
  user_id: string;
  report_date: string;
  payments_count: number;
  total_payments: number;
  worked_on_lph: boolean;
  customer_confirmation_done: boolean;
  incentive_report_progress?: string;
  created_at: string;
}

interface ProfileData {
  id: string;
  first_name: string;
  last_name: string;
  role: string;
}

const ReportEditCashier = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [report, setReport] = useState<ReportData | null>(null);
  const [allProfiles, setAllProfiles] = useState<ProfileData[]>([]);

  const isKasirInsentifReport = report?.incentive_report_progress !== undefined;

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("reports_cashier")
          .select("*")
          .eq("id", window.location.pathname.split("/").pop())
          .single();

        if (error) throw error;
        setReport(data);

        // Fetch all profiles for the select dropdown
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, role")
          .order("first_name");

        if (profiles) {
          setAllProfiles(profiles);
        }
      } catch (err: any) {
        setError(err.message || "Failed to fetch report");
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, []);

  const [formData, setFormData] = useState({
    user_id: "",
    report_date: "",
    payments_count: "",
    total_payments: "",
    worked_on_lph: false,
    customer_confirmation_done: false,
    incentive_report_progress: ""
  });

  useEffect(() => {
    if (report) {
      setFormData({
        user_id: report.user_id,
        report_date: report.report_date,
        payments_count: report.payments_count.toString(),
        total_payments: report.total_payments.toString(),
        worked_on_lph: report.worked_on_lph,
        customer_confirmation_done: report.customer_confirmation_done,
        incentive_report_progress: report.incentive_report_progress || ""
      });
    }
  }, [report]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!report) {
        throw new Error("Report not found");
      }

      const reportData = {
        user_id: formData.user_id,
        report_date: formData.report_date,
        payments_count: parseInt(formData.payments_count) || 0,
        total_payments: parseFloat(formData.total_payments) || 0,
        worked_on_lph: formData.worked_on_lph,
        customer_confirmation_done: formData.customer_confirmation_done,
      };

      if (isKasirInsentifReport && formData.incentive_report_progress) {
        (reportData as any).incentive_report_progress = formData.incentive_report_progress;
      }

      const { error: updateError } = await supabase
        .from("reports_cashier")
        .update(reportData)
        .eq("id", report.id);

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Error updating report:", err);
      setError(err.message || "Failed to update report");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('error')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!report) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t('error')}</AlertTitle>
        <AlertDescription>Report not found</AlertDescription>
      </Alert>
    );
  }

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>{t('success')}</AlertTitle>
        <AlertDescription>
          {t('report_updated_successfully')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="user_id">{t('assigned_to')}</Label>
          <Select value={formData.user_id} onValueChange={(value) => handleInputChange("user_id", value)}>
            <SelectTrigger>
              <SelectValue placeholder={t('select_user')} />
            </SelectTrigger>
            <SelectContent>
              {allProfiles.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.first_name} {user.last_name} ({user.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="report_date">{t('report_date')}</Label>
          <Input
            id="report_date"
            type="date"
            value={formData.report_date}
            onChange={(e) => handleInputChange("report_date", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="payments_count">{t('payments_count')}</Label>
          <Input
            id="payments_count"
            type="number"
            min="0"
            value={formData.payments_count}
            onChange={(e) => handleInputChange("payments_count", e.target.value)}
            placeholder="0"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="total_payments">{t('total_payments')}</Label>
          <Input
            id="total_payments"
            type="number"
            step="0.01"
            min="0"
            value={formData.total_payments}
            onChange={(e) => handleInputChange("total_payments", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        {isKasirInsentifReport && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="incentive_report_progress">{t('incentive_report_progress')}</Label>
            <Textarea
              id="incentive_report_progress"
              value={formData.incentive_report_progress}
              onChange={(e) => handleInputChange("incentive_report_progress", e.target.value)}
              placeholder={t('incentive_report_progress_placeholder')}
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            id="worked_on_lph"
            type="checkbox"
            checked={formData.worked_on_lph}
            onChange={(e) => handleInputChange("worked_on_lph", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="worked_on_lph" className="text-sm">
            {t('worked_on_lph')}
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="customer_confirmation_done"
            type="checkbox"
            checked={formData.customer_confirmation_done}
            onChange={(e) => handleInputChange("customer_confirmation_done", e.target.checked)}
            className="rounded border-gray-300 text-primary focus:ring-primary"
          />
          <Label htmlFor="customer_confirmation_done" className="text-sm">
            {t('customer_confirmation_done')}
          </Label>
        </div>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t('updating')}
          </>
        ) : (
          t('update_report')
        )}
      </Button>
    </form>
  );
};

export default ReportEditCashier;