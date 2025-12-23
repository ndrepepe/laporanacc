import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
    en: {
        // Tools & Admin
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
        
        // Admin Dashboard
        'manage_users': 'User Management',
        'manage_branches': 'Branch Management',
        'system_settings': 'Settings',
        'manage_app_users': 'Manage Application Users',
        'search_users_placeholder': 'Search by name or email...',
        'update_role': 'Update Role',
        'role_updated_success': 'User role updated successfully!',
        'branch_list_title': 'Branch List',
        'add_branch_title': 'Add New Branch',
        'branch_name_label': 'Branch Name',
        'branch_name_placeholder': 'e.g. Jakarta Pusat',
        'add_branch_button': 'Add Branch',
        'branch_added_success': 'Branch added successfully!',
        'branch_deleted_success': 'Branch deleted successfully!',
        'confirm_delete_branch': 'Are you sure you want to delete this branch?',
        'system_status': 'System Status',
        'active_users': 'Active Users',
        'total_reports': 'Total Reports',
        'maintenance_mode': 'Maintenance Mode',
        
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
        
        // Submission Forms & Titles
        'submit_daily_report_title': 'Submit Daily Report',
        'daily_report_submission': 'Daily Report Submission',
        'tasks_completed_today': 'Tasks Completed Today',
        'describe_completed_tasks': 'Describe your completed tasks...',
        'issues_encountered': 'Issues Encountered',
        'describe_issues_encountered': 'Describe any problems or obstacles...',
        'suggestions_recommendations': 'Suggestions & Recommendations',
        'enter_suggestions': 'Any ideas for improvement?',
        'submit_report_button': 'Submit Daily Report',
        'role_not_assigned_error': 'You do not have a functional role assigned yet. Please contact your manager.',
        'unsupported_role': 'Unsupported Role',
        'role_no_form': 'The role {role} does not have a specific form assigned.',
        
        // Accounting Form
        'new_customers_count_label': 'New Customers Count',
        'new_sales_count_label': 'New Sales Count',
        'new_customer_names_label': 'New Customer Names',
        'new_sales_names_label': 'New Sales Names',
        'worked_on_lph_label': 'Worked on LPH today?',
        'customer_confirmation_status_label': 'Customer Confirmation Status',
        'submit_accounting_report': 'Submit Accounting Report',
        
        // Cashier Form
        'payments_count': 'Payments Count',
        'total_payments': 'Total Payments',
        'incentive_report_progress': 'Incentive Report Progress',
        'incentive_report_progress_placeholder': 'Progress details...',
        'worked_on_lph': 'Worked on LPH',
        'customer_confirmation_done': 'Customer Confirmation Done',
        'submitting': 'Submitting...',
        'report_submitted_successfully': 'Report submitted successfully!',
        'payments_count_label': 'Number of Payments',
        'total_payments_label': 'Total Amount Collected',
        'incentive_report_progress_label': 'Incentive Report Progress',
        'customer_confirmation_done_label': 'Confirmation Completed?',
        'describe_incentive_progress': 'Detail your progress on incentive reporting...',
        
        // Consignment Form
        'lpk_entered_bsoft_label': 'LPK Entered in B-Soft',
        'submit_consignment_report': 'Submit Consignment Report',
        
        // View Reports
        'my_daily_reports_title': 'My Daily Reports',
        'reports_submitted_by_you': 'Reports Submitted By You',
        'error_loading_reports': 'Error loading reports',
        'no_reports_submitted': 'No reports submitted yet.',
        'view_subordinate_reports_title': 'Subordinate Reports',
        'no_permission_subordinates': 'You do not have permission to view subordinate reports.',
        'reports_viewable_by': 'Reports viewable by',
        'no_reports_match_filters': 'No reports match your current filters.',
        'no_subordinate_reports_found': 'No subordinate reports found.',
        'error_loading_subordinate_reports': 'Error loading subordinate reports.',
        
        // Filters
        'pick_date_range': 'Pick a date range',
        'filter_by_role': 'Filter by role',
        'all_roles': 'All Roles',
        'filter_by_employee_name': 'Search employee name...',
        'clear_filters': 'Clear Filters',
        
        // Summary Page
        'statistical_summary_title': 'Statistical Summary',
        'error_loading_data': 'Error loading summary data',
        'failed_to_load_summary': 'Failed to load summary data',
        'period_totals_title': 'Period Totals (Last 30 Days)',
        'total_new_customers': 'Total New Customers',
        'total_new_sales': 'Total New Sales',
        'total_payments_count': 'Total Payments Count',
        'total_payments_amount': 'Total Payments Amount',
        'total_lpk_entered': 'Total LPK Entered',
        'daily_breakdown_title': 'Daily Breakdown',
        'daily_metrics_title': 'Daily Performance Metrics',
        'no_report_data_available': 'No report data available for the current period.',
        'new_customers': 'New Customers',
        'new_sales': 'New Sales',
        'payments_amount': 'Payments Amount',
        'lpk_entered': 'LPK Entered',
        
        // Submission Status
        'daily_submission_status': 'Daily Submission Status',
        'failed_to_load_submission_data': 'Failed to load submission data',
        'user': 'User',
        'reports_submitted': 'Reports Submitted',
        'no_reports_submitted_on': 'No reports submitted on {date}.',
        
        // Notifications
        'unread': 'unread',
        'mark_all_read': 'Mark All as Read',
        'recent_alerts': 'Recent Alerts',
        'no_notifications': 'No new notifications.',
        'read': 'Read',
        'error_loading_notifications': 'Error loading notifications',
        'failed_to_load_notifications': 'Failed to load notifications.',
        
        // User Management (Admin)
        'add_new_employee_title': 'Add New Employee',
        'user_created_successfully': 'User account created successfully! They can now log in.',
        'create_user_account': 'Create User Account',
        'first_name': 'First Name',
        'last_name': 'Last Name',
        'email': 'Email',
        'temporary_password': 'Temporary Password',
        'select_employee_role': 'Select Employee Role',
        'add_user_button': 'Add Employee Account',
        'creating': 'Creating...',
        'report_date': 'Report Date',

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
        'retry': 'Retry',

        // General
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
        'save_changes': 'Save Changes',
        'success': 'Success',
        'error': 'Error',
        'deleting': 'Deleting...',
        'adding': 'Adding...',
        'updating': 'Updating...',
        'view_history_title': 'View History',
        'viewed_status': 'Status',
        'viewed': 'Viewed',
        'not_yet_viewed': 'Not yet viewed',
        'viewed_by': 'Viewed by',
        'viewed_on': 'on',
    },
    id: {
        // Alat & Admin
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

        // Dasbor Admin
        'manage_users': 'Manajemen Pengguna',
        'manage_branches': 'Manajemen Cabang',
        'system_settings': 'Pengaturan',
        'manage_app_users': 'Kelola Pengguna Aplikasi',
        'search_users_placeholder': 'Cari berdasarkan nama atau email...',
        'update_role': 'Perbarui Peran',
        'role_updated_success': 'Peran pengguna berhasil diperbarui!',
        'branch_list_title': 'Daftar Cabang',
        'add_branch_title': 'Tambah Cabang Baru',
        'branch_name_label': 'Nama Cabang',
        'branch_name_placeholder': 'misal: Jakarta Pusat',
        'add_branch_button': 'Tambah Cabang',
        'branch_added_success': 'Cabang berhasil ditambahkan!',
        'branch_deleted_success': 'Cabang berhasil dihapus!',
        'confirm_delete_branch': 'Apakah Anda yakin ingin menghapus cabang ini?',
        'system_status': 'Status Sistem',
        'active_users': 'Pengguna Aktif',
        'total_reports': 'Total Laporan',
        'maintenance_mode': 'Mode Pemeliharaan',

        // Navigasi
        'dashboard': 'Dasbor',
        'submit_report': 'Kirim Laporan',
        'my_reports': 'Laporan Saya',
        'notifications': 'Notifikasi',
        'view_subordinates': 'Lihat Bawahan',
        'summary': 'Ringkasan',
        'admin_dashboard': 'Dasbor Admin',
        'add_employee': 'Tambah Karyawan',
        'logout': 'Keluar',

        // Formulir Kirim & Judul
        'submit_daily_report_title': 'Kirim Laporan Harian',
        'daily_report_submission': 'Pengiriman Laporan Harian',
        'tasks_completed_today': 'Tugas yang Diselesaikan Hari Ini',
        'describe_completed_tasks': 'Jelaskan tugas yang telah Anda selesaikan...',
        'issues_encountered': 'Masalah yang Dihadapi',
        'describe_issues_encountered': 'Jelaskan masalah atau hambatan apa pun...',
        'suggestions_recommendations': 'Saran & Rekomendasi',
        'enter_suggestions': 'Ada ide untuk perbaikan?',
        'submit_report_button': 'Kirim Laporan Harian',
        'role_not_assigned_error': 'Anda belum memiliki peran fungsional. Silakan hubungi manajer Anda.',
        'unsupported_role': 'Peran Tidak Didukung',
        'role_no_form': 'Peran {role} tidak memiliki formulir khusus.',

        // Formulir Akunting
        'new_customers_count_label': 'Jumlah Pelanggan Baru',
        'new_sales_count_label': 'Jumlah Penjualan Baru',
        'new_customer_names_label': 'Nama-nama Pelanggan Baru',
        'new_sales_names_label': 'Nama-nama Penjualan Baru',
        'worked_on_lph_label': 'Mengerjakan LPH hari ini?',
        'customer_confirmation_status_label': 'Status Konfirmasi Pelanggan',
        'submit_accounting_report': 'Kirim Laporan Akunting',

        // Formulir Kasir
        'payments_count': 'Jumlah Pembayaran',
        'total_payments': 'Total Pembayaran',
        'incentive_report_progress': 'Progress Laporan Insentif',
        'incentive_report_progress_placeholder': 'Detail progress...',
        'worked_on_lph': 'Mengerjakan LPH',
        'customer_confirmation_done': 'Konfirmasi Pelanggan Selesai',
        'submitting': 'Mengirim...',
        'report_submitted_successfully': 'Laporan berhasil dikirim!',
        'payments_count_label': 'Jumlah Pembayaran',
        'total_payments_label': 'Total Jumlah yang Dikumpulkan',
        'incentive_report_progress_label': 'Progress Laporan Insentif',
        'customer_confirmation_done_label': 'Konfirmasi Selesai?',
        'describe_incentive_progress': 'Detailkan progress Anda pada laporan insentif...',

        // Formulir Konsinyasi
        'lpk_entered_bsoft_label': 'LPK Dimasukkan ke B-Soft',
        'submit_consignment_report': 'Kirim Laporan Konsinyasi',

        // Lihat Laporan
        'my_daily_reports_title': 'Laporan Harian Saya',
        'reports_submitted_by_you': 'Laporan yang Anda Kirim',
        'error_loading_reports': 'Kesalahan saat memuat laporan',
        'no_reports_submitted': 'Belum ada laporan yang dikirim.',
        'view_subordinate_reports_title': 'Laporan Bawahan',
        'no_permission_subordinates': 'Anda tidak memiliki izin untuk melihat laporan bawahan.',
        'reports_viewable_by': 'Laporan yang dapat dilihat oleh',
        'no_reports_match_filters': 'Tidak ada laporan yang cocok dengan filter Anda.',
        'no_subordinate_reports_found': 'Tidak ada laporan bawahan ditemukan.',
        'error_loading_subordinate_reports': 'Kesalahan saat memuat laporan bawahan.',

        // Filter
        'pick_date_range': 'Pilih rentang tanggal',
        'filter_by_role': 'Filter berdasarkan peran',
        'all_roles': 'Semua Peran',
        'filter_by_employee_name': 'Cari nama karyawan...',
        'clear_filters': 'Hapus Filter',

        // Halaman Ringkasan
        'statistical_summary_title': 'Ringkasan Statistik',
        'error_loading_data': 'Kesalahan saat memuat data ringkasan',
        'failed_to_load_summary': 'Gagal memuat data ringkasan',
        'period_totals_title': 'Total Periode (30 Hari Terakhir)',
        'total_new_customers': 'Total Pelanggan Baru',
        'total_new_sales': 'Total Penjualan Baru',
        'total_payments_count': 'Total Jumlah Pembayaran',
        'total_payments_amount': 'Total Nominal Pembayaran',
        'total_lpk_entered': 'Total LPK yang Dimasukkan',
        'daily_breakdown_title': 'Rincian Harian',
        'daily_metrics_title': 'Metrik Performa Harian',
        'no_report_data_available': 'Tidak ada data laporan yang tersedia untuk periode ini.',
        'new_customers': 'Pelanggan Baru',
        'new_sales': 'Penjualan Baru',
        'payments_amount': 'Nominal Pembayaran',
        'lpk_entered': 'LPK Masuk',

        // Status Pengiriman
        'daily_submission_status': 'Status Pengiriman Harian',
        'failed_to_load_submission_data': 'Gagal memuat data pengiriman',
        'user': 'Pengguna',
        'reports_submitted': 'Laporan Terkirim',
        'no_reports_submitted_on': 'Tidak ada laporan yang dikirim pada {date}.',

        // Notifikasi
        'unread': 'belum dibaca',
        'mark_all_read': 'Tandai Semua Sudah Dibaca',
        'recent_alerts': 'Peringatan Terbaru',
        'no_notifications': 'Tidak ada notifikasi baru.',
        'read': 'Baca',
        'error_loading_notifications': 'Kesalahan saat memuat notifikasi',
        'failed_to_load_notifications': 'Gagal memuat notifikasi.',

        // Manajemen Pengguna (Admin)
        'add_new_employee_title': 'Tambah Karyawan Baru',
        'user_created_successfully': 'Akun pengguna berhasil dibuat! Mereka sekarang dapat login.',
        'create_user_account': 'Buat Akun Pengguna',
        'first_name': 'Nama Depan',
        'last_name': 'Nama Belakang',
        'email': 'Email',
        'temporary_password': 'Kata Sandi Sementara',
        'select_employee_role': 'Pilih Peran Karyawan',
        'add_user_button': 'Tambah Akun Karyawan',
        'creating': 'Membuat...',
        'report_date': 'Tanggal Laporan',

        // Halaman Utama
        'welcome': 'Selamat Datang',
        'your_current_role': 'Peran Anda Saat Ini',
        'role_not_assigned': 'Peran belum ditetapkan',
        'guidance_prefix': 'Gunakan navigasi bilah sisi untuk',
        'action_submit_report': 'Kirim laporan harian Anda',
        'action_view_reports': 'Lihat laporan Anda',
        'action_check_notifications': 'Periksa notifikasi Anda',
        'action_view_summaries': 'Lihat ringkasan statistik',
        'action_view_subordinate_reports': 'Lihat laporan bawahan',
        'retry': 'Coba Lagi',

        // Umum
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
        'save_changes': 'Simpan Perubahan',
        'success': 'Berhasil',
        'error': 'Kesalahan',
        'deleting': 'Menghapus...',
        'adding': 'Menambahkan...',
        'updating': 'Memperbarui...',
        'view_history_title': 'Riwayat Dilihat',
        'viewed_status': 'Status',
        'viewed': 'Sudah Dilihat',
        'not_yet_viewed': 'Belum Dilihat',
        'viewed_by': 'Dilihat oleh',
        'viewed_on': 'pada',
    },
};

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const storedLang = localStorage.getItem('app_language');
        if (storedLang === 'en' || storedLang === 'id') {
            return storedLang;
        }
    }
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