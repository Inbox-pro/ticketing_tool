import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { SUPPORTED_LANGUAGES, Language } from '../../i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';

interface Props {
  variant?: 'dropdown' | 'segmented';
  size?: 'sm' | 'md';
  className?: string;
}

export const LanguageSwitcher: React.FC<Props> = ({ 
  variant = 'dropdown', 
  size = 'md',
  className = '' 
}) => {
  const { language, setLanguage, addToast, t } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentOption = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (code: Language) => {
    if (code !== language) {
      setLanguage(code);
      const selected = SUPPORTED_LANGUAGES.find(l => l.code === code);
      if (selected) {
        addToast(
          t('toasts.languageChanged'),
          t('toasts.languageChangedDesc', { lang: selected.name }),
          'info'
        );
      }
    }
    setIsOpen(false);
  };

  if (variant === 'segmented') {
    return (
      <div 
        className={`inline-flex items-center p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 ${className}`}
        role="group"
        aria-label="Language selection"
      >
        {SUPPORTED_LANGUAGES.map(opt => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => handleSelect(opt.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all select-none ${
                isSelected
                  ? 'bg-white dark:bg-zinc-900 text-blue-600 dark:text-blue-400 shadow-xs ring-1 ring-zinc-200/50 dark:ring-zinc-700/50'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-700/50'
              }`}
            >
              <span className="text-sm leading-none" role="img" aria-label={opt.name}>{opt.flag}</span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`inline-flex items-center justify-between gap-1.5 rounded-lg border transition select-none ${
          size === 'sm' 
            ? 'px-2 py-1 text-xs' 
            : 'px-2.5 py-1.5 text-xs'
        } bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-200 font-medium shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={t('settings.languageLabel')}
      >
        <span className="text-sm leading-none" role="img" aria-label={currentOption.name}>{currentOption.flag}</span>
        <span className="font-semibold tracking-wide">{currentOption.label}</span>
        <ChevronDown size={13} className={`text-zinc-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-1.5 w-32 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg p-1 z-50 animate-in fade-in zoom-in-95 duration-100"
          role="menu"
          aria-orientation="vertical"
        >
          {SUPPORTED_LANGUAGES.map(opt => {
            const isSelected = opt.code === language;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => handleSelect(opt.code)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
                role="menuitem"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none" role="img" aria-label={opt.name}>{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} className="text-blue-600 dark:text-blue-400 stroke-[2.5]" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
