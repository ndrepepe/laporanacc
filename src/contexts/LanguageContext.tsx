import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  // Memperbarui tanda tangan untuk menerima parameter opsional
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Simple dictionary for the few strings we need immediately
const translations: Record<Language, Record<string, string>> = {
    en: {
        // Tools
        'tools_title': 'Application Tools',
        'theme_switcher': 'Theme',
        'language_switcher': 'Language',
        'password_change': 'Change Password',
        'light_mode': 'Light Mode',
        'dark_mode': 'Dark Mode',
        'english': 'English',
        'indonesian': 'Indonesian',
        'current_language': 'Current Language',
        'update_password_title': 'Update Password',
        'new_password': 'New Password',
        'confirm_password': 'Confirm Password',
        'update_button': 'Update Password',
        'password_success': 'Password updated successfully!',
        'password_error': 'Failed to update password.',
        'password_mismatch': 'Passwords do not match.',
        
        // Navigation
        'dashboard': 'Dashboard',
        'submit_report': 'Submit Report',
        'my_reports': 'My Reports',
        'notifications': 'Notifications',
        'view_subordinates': 'View Subordinates',
        'summary': 'Summary',
        'admin_dashboard': 'Admin Dashboard',
        'add_employee': 'Add Employee',
        'logout': 'Logout',
        
        // Index Page
        'welcome': 'Welcome',
        'your_current_role': 'Your Current Role',
        'role_not_assigned': 'Role not assigned',
        'guidance_prefix': 'Use the sidebar navigation to',
        'action_submit_report': 'Submit your daily report',
        'action_view_reports': 'View your reports',
        'action_check_notifications': 'Check your notifications',
        'action_view_summaries': 'View statistical summaries',
        'action_view_subordinate_reports': 'View subordinate reports',

        // General/Report View
        'date': 'Date',
        'report_type': 'Report Type',
        'actions': 'Actions',
        'view': 'View',
        'edit': 'Edit',
        'view_details': 'View Details',
        'submitter': 'Submitter',
        'role': 'Role',
        'action': 'Action',
        'unknown_error': 'Unknown error',
        'access_denied': 'Access Denied',
        'yes': 'Yes',
        'no': 'No',
        'branch_name': 'Branch Name',
        'lpk_count': 'LPK Count',
        'add_lpk_entry': 'Add LPK Entry',
        'lpk_entries_title': 'LPK Entries (Multiple)',
        
        // Submit Report Page
        'submit_daily_report_title': 'Submit Daily Report',
        'daily_report_submission': 'Daily Report Submission',
        'role_not_assigned_error': 'Could not determine user role or profile is missing.',
        'unsupported_role': 'Unsupported Role',
        'role_no_form': 'Your role ({role}) does not have a defined report submission form.',

        // Conjunctions
        'and_conjunction': 'and',
        'or_conjunction': 'or',

        // My Reports Page
        'my_daily_reports_title': 'My Daily Reports',
        'error_loading_reports': 'Error loading reports',
        'no_reports_submitted': 'You have not submitted any reports yet.',
        'reports_submitted_by_you': 'Reports Submitted by You',

        // Notifications Page
        'unread': 'Unread',
        'read': 'Read',
        'mark_all_read': 'Mark All as Read',
        'recent_alerts': 'Recent Alerts',
        'error_loading_notifications': 'Error Loading Notifications',
        'failed_to_load_notifications': 'Failed to load notifications',
        'no_notifications': 'You have no notifications.',

        // Add User Page
        'add_new_employee_title': 'Add New Employee',
        'create_user_account': 'Create User Account',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'email': 'Email',
        'temporary_password': 'Password (Temporary)',
        'select_employee_role': 'Select employee role',
        'add_user_button': 'Add User',
        'failed_to_add_user': 'Failed to add user',
        'user': 'User',
        'created_successfully': 'created successfully',
        'email_confirmation_needed': 'They need to confirm their email.',
        'user_creation_failed_unexpectedly': 'User creation failed unexpectedly.',

        // View Subordinate Reports Page
        'view_subordinate_reports_title': 'View Subordinate Reports',
        'no_permission_subordinates': 'You do not have permission to view subordinate reports.',
        'error_loading_subordinate_reports': 'Error loading subordinate reports.',
        'reports_viewable_by': 'Reports Viewable by',
        'no_reports_match_filters': 'No reports match the current filters.',
        'no_subordinate_reports_found': 'No subordinate reports found for your viewing permissions.',
        
        // Report Filters
        'pick_date_range': 'Pick a date range',
        'filter_by_role': 'Filter by Role',
        'all_roles': 'All Roles',
        'filter_by_employee_name': 'Filter by Employee Name',
        'clear_filters': 'Clear Filters',

        // Daily Submission Status
        'daily_submission_status': 'Daily Submission Status',
        'reports_submitted': 'Reports Submitted',
        'failed_to_load_submission_data': 'Failed to load submission data',
        'no_reports_submitted_on': 'No reports submitted on {date}.',

        // Supervisor/Manager Form
        'tasks_completed_today': 'Tasks Completed Today',
        'describe_completed_tasks': 'Describe your completed tasks...',
        'issues_encountered': 'Issues Encountered',
        'describe_issues_encountered': 'Describe any issues encountered...',
        'suggestions_recommendations': 'Suggestions and Recommendations (Optional)',
        'enter_suggestions': 'Enter suggestions...',
        'submit_report_button': 'Submit Report',

        // Cashier Form
        'payments_count_label': 'Number of Customers Who Made Payment Today',
        'total_payments_label': 'Total Amount of Today’s Payments (IDR)',
        'worked_on_lph_label': 'Did you work on LPH today?',
        'customer_confirmation_done_label': 'Customer Confirmation Done?',
        'submit_cashier_report': 'Submit Cashier Report',

        // Consignment Staff Form
        'received_lpk_label': 'Did you receive LPK from branches today?',
        'lpk_entered_bsoft_label': 'Number of LPK entered into Bsoft',
        'submit_consignment_report': 'Submit Consignment Staff Report',

        // Accounting Form
        'new_customers_count_label': 'Number of New Customers Entered',
        'new_sales_count_label': 'Number of New Sales Entered',
        'new_customer_names_label': 'New Customer Names (List them)',
        'new_sales_names_label': 'New Sales Names (List them)',
        'customer_confirmation_status_label': 'Customer Confirmation Status',
        'submit_accounting_report': 'Submit Accounting Report',
        
        // Summary Page
        'statistical_summary_title': 'Statistical Summary',
        'error_loading_data': 'Error Loading Data',
        'failed_to_load_summary': 'Failed to load summary data',
        'period_totals_title': 'Period Totals (Last 30 Days)',
        'total_new_customers': 'Total New Customers',
        'total_new_sales': 'Total New Sales',
        'total_payments_count': 'Total Payments Count',
        'total_payments_amount': 'Total Payments Amount',
        'total_lpk_entered': 'Total LPK Entered',
        'daily_breakdown_title': 'Daily Breakdown',
        'daily_metrics_title': 'Daily Metrics (Last 30 Days)',
        'no_report_data_available': 'No report data available for the last 30 days.',
        'new_customers': 'New Customers',
        'new_sales': 'New Sales',
        'payments_count': 'Payments Count',
        'payments_amount': 'Payments Amount',
        'lpk_entered': 'LPK Entered',
    },
    id: {
        // Tools
        'tools_title': 'Alat Aplikasi',
        'theme_switcher': 'Tema',
        'language_switcher': 'Bahasa',
        'password_change': 'Ganti Kata Sandi',
        'light_mode': 'Mode Terang',
        'dark_mode': 'Mode Gelap',
        'english': 'Inggris',
        'indonesian': 'Indonesia',
        'current_language': 'Bahasa Saat Ini',
        'update_password_title': 'Perbarui Kata Sandi',
        'new_password': 'Kata Sandi Baru',
        'confirm_password': 'Konfirmasi Kata Sandi',
        'update_button': 'Perbarui Kata Sandi',
        'password_success': 'Kata sandi berhasil diperbarui!',
        'password_error': 'Gagal memperbarui kata sandi.',
        'password_mismatch': 'Kata sandi tidak cocok.',

        // Navigation
        'dashboard': 'Dasbor',
        'submit_report': 'Kirim Laporan',
        'my_reports': 'Laporan Saya',
        'notifications': 'Notifikasi',
        'view_subordinates': 'Lihat Bawahan',
        'summary': 'Ringkasan',
        'admin_dashboard': 'Dasbor Admin',
        'add_employee': 'Tambah Karyawan',
        'logout': 'Keluar',

        // Index Page
        'welcome': 'Selamat Datang',
        'your_current_role': 'Peran Anda Saat Ini',
        'role_not_assigned': 'Peran belum ditetapkan',
        'guidance_prefix': 'Gunakan navigasi bilah sisi untuk',
        'action_submit_report': 'Kirim laporan harian Anda',
        'action_view_reports': 'Lihat laporan Anda',
        'action_check_notifications': 'Periksa notifikasi Anda',
        'action_view_summaries': 'Lihat ringkasan statistik',
        'action_view_subordinate_reports': 'Lihat laporan bawahan',

        // General/Report View
        'date': 'Tanggal',
        'report_type': 'Jenis Laporan',
        'actions': 'Tindakan',
        'view': 'Lihat',
        'edit': 'Edit',
        'view_details': 'Lihat Detail',
        'submitter': 'Pengirim',
        'role': 'Peran',
        'action': 'Tindakan',
        'unknown_error': 'Kesalahan tidak diketahui',
        'access_denied': 'Akses Ditolak',
        'yes': 'Ya',
        'no': 'Tidak',
        'branch_name': 'Nama Cabang',
        'lpk_count': 'Jumlah LPK',
        'add_lpk_entry': 'Tambah Entri LPK',
        'lpk_entries_title': 'Entri LPK (Beberapa)',

        // Submit Report Page
        'submit_daily_report_title': 'Kirim Laporan Harian',
        'daily_report_submission': 'Pengiriman Laporan Harian',
        'role_not_assigned_error': 'Tidak dapat menentukan peran pengguna atau profil hilang.',
        'unsupported_role': 'Peran Tidak Didukung',
        'role_no_form': 'Peran Anda ({role}) tidak memiliki formulir pengiriman laporan yang ditentukan.',

        // Conjunctions
        'and_conjunction': 'dan',
        'or_conjunction': 'atau',

        // My Reports Page
        'my_daily_reports_title': 'Laporan Harian Saya',
        'error_loading_reports': 'Kesalahan memuat laporan',
        'no_reports_submitted': 'Anda belum mengirimkan laporan apa pun.',
        'reports_submitted_by_you': 'Laporan yang Dikirim oleh Anda',

        // Notifications Page
        'unread': 'Belum Dibaca',
        'read': 'Baca',
        'mark_all_read': 'Tandai Semua Sudah Dibaca',
        'recent_alerts': 'Peringatan Terbaru',
        'error_loading_notifications': 'Kesalahan Memuat Notifikasi',
        'failed_to_load_notifications': 'Gagal memuat notifikasi',
        'no_notifications': 'Anda tidak memiliki notifikasi.',

        // Add User Page
        'add_new_employee_title': 'Tambah Karyawan Baru',
        'create_user_account': 'Buat Akun Pengguna',
        'first_name': 'Nama Depan',
        'last_name': 'Nama Belakang',
        'email': 'Email',
        'temporary_password': 'Kata Sandi (Sementara)',
        'select_employee_role': 'Pilih peran karyawan',
        'add_user_button': 'Tambah Pengguna',
        'failed_to_add_user': 'Gagal menambahkan pengguna',
        'user': 'Pengguna',
        'created_successfully': 'berhasil dibuat',
        'email_confirmation_needed': 'Mereka perlu mengkonfirmasi email mereka.',
        'user_creation_failed_unexpectedly': 'Pembuatan pengguna gagal secara tak terduga.',

        // View Subordinate Reports Page
        'view_subordinate_reports_title': 'Lihat Laporan Bawahan',
        'no_permission_subordinates': 'Anda tidak memiliki izin untuk melihat laporan bawahan.',
        'error_loading_subordinate_reports': 'Kesalahan memuat laporan bawahan.',
        'reports_viewable_by': 'Laporan yang Dapat Dilihat oleh',
        'no_reports_match_filters': 'Tidak ada laporan yang cocok dengan filter saat ini.',
        'no_subordinate_reports_found': 'Tidak ada laporan bawahan yang ditemukan untuk izin melihat Anda.',

        // Report Filters
        'pick_date_range': 'Pilih rentang tanggal',
        'filter_by_role': 'Filter berdasarkan Peran',
        'all_roles': 'Semua Peran',
        'filter_by_employee_name': 'Filter berdasarkan Nama Karyawan',
        'clear_filters': 'Hapus Filter',

        // Daily Submission Status
        'daily_submission_status': 'Status Pengiriman Harian',
        'reports_submitted': 'Laporan Terkirim',
        'failed_to_load_submission_data': 'Gagal memuat data pengiriman',
        'no_reports_submitted_on': 'Tidak ada laporan yang dikirimkan pada {date}.',

        // Supervisor/Manager Form
        'tasks_completed_today': 'Tugas Selesai Hari Ini',
        'describe_completed_tasks': 'Jelaskan tugas yang telah Anda selesaikan...',
        'issues_encountered': 'Masalah yang Ditemui',
        'describe_issues_encountered': 'Jelaskan masalah apa pun yang ditemui...',
        'suggestions_recommendations': 'Saran dan Rekomendasi (Opsional)',
        'enter_suggestions': 'Masukkan saran...',
        'submit_report_button': 'Kirim Laporan',

        // Cashier Form
        'payments_count_label': 'Jumlah Pelanggan yang Melakukan Pembayaran Hari Ini',
        'total_payments_label': 'Total Jumlah Pembayaran Hari Ini (IDR)',
        'worked_on_lph_label': 'Apakah Anda mengerjakan LPH hari ini?',
        'customer_confirmation_done_label': 'Konfirmasi Pelanggan Selesai?',
        'submit_cashier_report': 'Kirim Laporan Kasir',

        // Consignment Staff Form
        'received_lpk_label': 'Apakah Anda menerima LPK dari cabang hari ini?',
        'lpk_entered_bsoft_label': 'Jumlah LPK yang dimasukkan ke Bsoft',
        'submit_consignment_report': 'Kirim Laporan Staf Konsinyasi',

        // Accounting Form
        'new_customers_count_label': 'Jumlah Pelanggan Baru yang Dimasukkan',
        'new_sales_count_label': 'Jumlah Penjualan Baru yang Dimasukkan',
        'new_customer_names_label': 'Nama Pelanggan Baru (Daftar)',
        'new_sales_names_label': 'Nama Penjualan Baru (Daftar)',
        'customer_confirmation_status_label': 'Status Konfirmasi Pelanggan',
        'submit_accounting_report': 'Kirim Laporan Akuntansi',

        // Summary Page
        'statistical_summary_title': 'Ringkasan Statistik',
        'error_loading_data': 'Kesalahan Memuat Data',
        'failed_to_load_summary': 'Gagal memuat data ringkasan',
        'period_totals_title': 'Total Periode (30 Hari Terakhir)',
        'total_new_customers': 'Total Pelanggan Baru',
        'total_new_sales': 'Total Penjualan Baru',
        'total_payments_count': 'Total Jumlah Pembayaran',
        'total_payments_amount': 'Total Jumlah Pembayaran',
        'total_lpk_entered': 'Total LPK Dimasukkan',
        'daily_breakdown_title': 'Rincian Harian',
        'daily_metrics_title': 'Metrik Harian (30 Hari Terakhir)',
        'no_report_data_available': 'Tidak ada data laporan tersedia selama 30 hari terakhir.',
        'new_customers': 'Pelanggan Baru',
        'new_sales': 'Penjualan Baru',
        'payments_count': 'Jumlah Pembayaran',
        'payments_amount': 'Jumlah Pembayaran',
        'lpk_entered': 'LPK Dimasukkan',
    },
};

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('app_language');
        if (storedLang === 'en' || storedLang === 'id') {
            return storedLang;
        }
    }
    // Default to Indonesian if not set
    return 'id';
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    localStorage.setItem('app_language', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };
  
  // Fungsi untuk menangani penggantian string dinamis (sekarang bernama 't')
  const t = (key: string, params?: Record<string, string>) => {
      let message = translations[language][key] || key;
      if (params) {
          Object.keys(params).forEach(paramKey => {
              message = message.replace(`{${paramKey}}`, params[paramKey]);
          });
      }
      return message;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};