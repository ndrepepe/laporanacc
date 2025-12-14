import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'id';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
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

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

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