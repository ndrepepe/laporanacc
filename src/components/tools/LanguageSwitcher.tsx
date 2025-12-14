import { useLanguage, Language } from "@/contexts/LanguageContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";

const LanguageSwitcher = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (value: string) => {
    setLanguage(value as Language);
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <span className="font-medium">{t('language_switcher')}</span>
      <Select value={language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-32">
          <Globe className="h-4 w-4 mr-2" />
          <SelectValue placeholder={t('current_language')} />
        </SelectTrigger>
        <SelectContent className="dark:glass-effect">
          <SelectItem value="en">{t('english')}</SelectItem>
          <SelectItem value="id">{t('indonesian')}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;