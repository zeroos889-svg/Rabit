import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Monitor, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { toast } from '@/lib/toast';

type Theme = 'light' | 'dark' | 'system';
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink';

const accentColors: { value: AccentColor; label: string; color: string }[] = [
  { value: 'blue', label: 'أزرق', color: 'bg-blue-500' },
  { value: 'green', label: 'أخضر', color: 'bg-green-500' },
  { value: 'purple', label: 'بنفسجي', color: 'bg-purple-500' },
  { value: 'orange', label: 'برتقالي', color: 'bg-orange-500' },
  { value: 'red', label: 'أحمر', color: 'bg-red-500' },
  { value: 'pink', label: 'وردي', color: 'bg-pink-500' },
];

export function EnhancedThemeToggle() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'system';
    }
    return 'system';
  });
  
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('accentColor') as AccentColor) || 'blue';
    }
    return 'blue';
  });

  // Handle system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme(mediaQuery.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Apply theme on mount and change
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      applyTheme(systemTheme);
    } else {
      applyTheme(theme);
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Apply accent color
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous accent classes
    accentColors.forEach(({ value }) => {
      root.classList.remove(`accent-${value}`);
    });
    
    // Add new accent class
    root.classList.add(`accent-${accentColor}`);
    localStorage.setItem('accentColor', accentColor);
  }, [accentColor]);

  const applyTheme = (resolvedTheme: 'light' | 'dark') => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    
    const themeNames = {
      light: isRTL ? 'الوضع الفاتح' : 'Light Mode',
      dark: isRTL ? 'الوضع الداكن' : 'Dark Mode',
      system: isRTL ? 'تلقائي (النظام)' : 'System Default',
    };
    
    toast.info(isRTL ? 'تم تغيير السمة' : 'Theme Changed', {
      description: themeNames[newTheme],
    });
  };

  const handleAccentChange = (newAccent: AccentColor) => {
    setAccentColor(newAccent);
    
    const color = accentColors.find(c => c.value === newAccent);
    toast.info(isRTL ? 'تم تغيير اللون' : 'Accent Changed', {
      description: color?.label || newAccent,
    });
  };

  const getCurrentIcon = () => {
    if (theme === 'system') return <Monitor className="h-4 w-4" />;
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    return <Sun className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {getCurrentIcon()}
          <span className="sr-only">
            {isRTL ? 'تبديل السمة' : 'Toggle theme'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={isRTL ? 'start' : 'end'} className="w-48">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          {isRTL ? 'السمة' : 'Theme'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('light')}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          <span>{isRTL ? 'فاتح' : 'Light'}</span>
          {theme === 'light' && (
            <span className="mr-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('dark')}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          <span>{isRTL ? 'داكن' : 'Dark'}</span>
          {theme === 'dark' && (
            <span className="mr-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleThemeChange('system')}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          <span>{isRTL ? 'تلقائي' : 'System'}</span>
          {theme === 'system' && (
            <span className="mr-auto text-primary">✓</span>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuLabel>
          {isRTL ? 'لون التمييز' : 'Accent Color'}
        </DropdownMenuLabel>
        
        <div className="grid grid-cols-6 gap-1 p-2">
          {accentColors.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => handleAccentChange(value)}
              className={`
                w-6 h-6 rounded-full ${color} 
                hover:scale-110 transition-transform
                ${accentColor === value ? 'ring-2 ring-offset-2 ring-primary' : ''}
              `}
              title={label}
            />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default EnhancedThemeToggle;
