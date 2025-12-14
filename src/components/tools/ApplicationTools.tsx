import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import PasswordChangeForm from './PasswordChangeForm';
import { useLanguage } from '@/contexts/LanguageContext';

const ApplicationTools: React.FC = () => {
    const { t } = useLanguage();
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('tools_title')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <ThemeSwitcher />
                    <LanguageSwitcher />
                </div>
                <PasswordChangeForm />
            </CardContent>
        </Card>
    );
};

export default ApplicationTools;