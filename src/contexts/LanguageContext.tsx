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
    },
    id: {
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