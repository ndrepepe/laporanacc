import { useTheme } from "next-themes";
import { Button } from "@/components/Button";
import { Moon, Sun } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();
  const { t } = useLanguage();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
      <span className="font-medium">{t('theme_switcher')}</span>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={toggleTheme}
        className="w-32"
      >
        {theme === "dark" ? (
          <>
            <Moon className="h-4 w-4 mr-2" /> {t('dark_mode')}
          </>
        ) : (
          <>
            <Sun className="h-4 w-4 mr-2" /> {t('light_mode')}
          </>
        )}
      </Button>
    </div>
  );
};

export default ThemeSwitcher;