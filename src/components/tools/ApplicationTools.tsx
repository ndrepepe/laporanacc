import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import ThemeSwitcher from './ThemeSwitcher';
import LanguageSwitcher from './LanguageSwitcher';
import PasswordChangeForm from './PasswordChangeForm';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

const ApplicationTools: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('tools_title')}</CardTitle>
      </CardHeader>
      <ScrollArea className="h-[500px]">
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
          <PasswordChangeForm />
        </CardContent>
      </ScrollArea>
    </Card>
  );
};

export default ApplicationTools;