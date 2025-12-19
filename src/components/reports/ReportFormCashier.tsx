"use client";

import React, { useState } from "react";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/integrations/supabase/auth";
import { supabase } from "@/integrations/supabase/client";

const ReportFormCashier = () => {
  const { t } = useLanguage();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isKasirInsentif = profile?.role === 'Cashier-Insentif';

  const [formData, setFormData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    payments_count: "",
    total_payments: "",
    worked_on_lph: false,
    customer_confirmation_done: false,
    incentive_report_progress: isKasirInsentif ? "" : undefined
  });

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
      if (!profile) {
        throw new Error("User profile not found");
      }

      const reportData = {
        user_id: profile.id,
        report_date: formData.report_date,
        payments_count: parseInt(formData.payments_count) || 0,
        total_payments: parseFloat(formData.total_payments) || 0,
        worked_on_lph: formData.worked_on_lph,
        customer_confirmation_done: formData.customer_confirmation_done,
      };

      if (isKasirInsentif && formData.incentive_report_progress) {
        (reportData as any).incentive_report_progress = formData.incentive_report_progress;
      }

      const { error: submitError } = await supabase
        .from("reports_cashier")
        .insert(reportData);

      if (submitError) {
        throw submitError;
      }

      setSuccess(true);
      setFormData({
        report_date: new Date().toISOString().split('T')[0],
        payments_count: "",
        total_payments: "",
        worked_on_lph: false,
        customer_confirmation_done: false,
        incentive_report_progress: ""
      });

    } catch (err: any) {
      console.error("Error submitting report:", err);
      setError(err.message || "Failed to submit report");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>{t('success')}</AlertTitle>
        <AlertDescription>
          {t('report_submitted_successfully')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {isKasirInsentif && (
          <div className="space-y-2">
            <Label htmlFor="incentive_report_progress">{t('incentive_report_progress')}</Label>
            <Textarea
              id="incentive_report_progress"
              value={formData.incentive_report_progress || ""}
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
            {t('submitting')}
          </>
        ) : (
          t('submit_report')
        )}
      </Button>
    </form>
  );
};

export default ReportFormCashier;