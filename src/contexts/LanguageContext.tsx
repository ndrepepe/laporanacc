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