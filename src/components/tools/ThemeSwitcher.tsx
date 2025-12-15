import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Switch } from "@/components/ui/switch"; // Import Switch component
import { Label } from "@/components/ui/label"; // Import Label component

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  // next-themes returns 'system' initially, so we check the resolved theme
  const resolvedTheme = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  return (
    <div className="flex items-center justify-between p-4 border border-border rounded-lg bg-card shadow-md transition-colors duration-200">
      <span className="font-medium">{t('theme_switcher')}</span>
      
      <div className="flex items-center space-x-2">
        <Sun className="h-4 w-4 text-yellow-500" />
        
        <Label htmlFor="theme-switch" className="sr-only">{t('theme_switcher')}</Label>
        <Switch
          id="theme-switch"
          checked={isDarkMode}
          onCheckedChange={handleToggle}
          // Ensure switch colors are theme-aware
          className="data-[state=checked]:bg-primary data-[state=unchecked]:bg-input"
        />
        
        <Moon className="h-4 w-4 text-blue-500" />
      </div>
    </div>
  );
};

export default ThemeSwitcher;