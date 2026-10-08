import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Menu, 
  Search, 
  Plus, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  Command,
  BookOpen
} from 'lucide-react';
import { UserSwitcher } from '../topbar/UserSwitcher';
import { NotificationPanel } from '../topbar/NotificationPanel';
import { GlobalSearchModal } from '../topbar/GlobalSearchModal';
import { CreateIssueModal } from '../issue/CreateIssueModal';
import { InboxLogo } from '../common/InboxLogo';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

interface Props {
  onMobileMenuToggle: () => void;
}

export const Topbar: React.FC<Props> = ({ onMobileMenuToggle }) => {
  const { theme, toggleTheme, unreadNotificationCount, t } = useApp();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Global hotkey: Cmd/Ctrl + K opens search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'c' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        e.preventDefault();
        setIsCreateOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-20 h-14 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-3 sm:px-6 transition-colors duration-150">
        {/* Left: Mobile Toggle & Logo / Quick Search */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition shrink-0"
            aria-label="Toggle navigation menu"
          >
            <Menu size={20} />
          </button>

          {/* Mobile Logo */}
          <Link to="/" className="lg:hidden flex items-center shrink-0">
            <InboxLogo size="xs" showSubtitle={false} />
          </Link>

          {/* Quick Search Bar trigger */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs w-36 sm:w-60 md:w-72 transition border border-zinc-200/50 dark:border-zinc-800"
          >
            <Search size={14} className="shrink-0 text-zinc-400" />
            <span className="truncate text-left flex-1">{t('nav.searchPlaceholder')}</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 font-mono text-[10px] text-zinc-400 bg-white dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700">
              <Command size={10} />K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Language Switcher, Docs, Theme, Notifications, User */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Create Button */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span className="hidden sm:inline">{t('nav.createIssue')}</span>
          </button>

          {/* Language Selector: 🇬🇧 ENG / 🇩🇪 GER / 🇳🇱 DUT */}
          <LanguageSwitcher size="sm" />

          {/* SLA Real-time Monitor Indicator */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-[11px] font-medium">
            <ShieldCheck size={13} className="shrink-0" />
            <span>{t('nav.slaOnline')}</span>
          </div>

          {/* Documentation Link */}
          <Link
            to="/docs"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            title={t('docs.title')}
          >
            <BookOpen size={15} className="text-zinc-500 dark:text-zinc-400" />
            <span className="hidden md:inline">{t('nav.docs')}</span>
          </Link>

          {/* Theme Toggle (Light / Dark) */}
          <button
            onClick={toggleTheme}
            className="p-1.5 sm:p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition relative"
            title={theme === 'light' ? t('settings.themeDark') : t('settings.themeLight')}
            aria-label={`Toggle theme`}
          >
            {theme === 'light' ? (
              <Moon size={16} className="text-zinc-700" />
            ) : (
              <Sun size={16} className="text-amber-400" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(prev => !prev)}
              className="p-1.5 sm:p-2 rounded-lg text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 relative transition"
              title={t('notifications.title')}
            >
              <Bell size={16} />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-zinc-950" />
              )}
            </button>
            <NotificationPanel isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
          </div>

          <div className="h-5 w-px bg-zinc-200 dark:bg-zinc-800 mx-0.5" />

          {/* Active User Switcher */}
          <UserSwitcher />
        </div>
      </header>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <CreateIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </>
  );
};
