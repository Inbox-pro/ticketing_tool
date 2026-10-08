export type Language = 'en' | 'de' | 'nl';

export interface LanguageOption {
  code: Language;
  label: string; // "ENG", "GER", "DUT"
  flag: string;  // "🇬🇧", "🇩🇪", "🇳🇱"
  name: string;  // "English", "Deutsch", "Nederlands"
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'ENG', flag: '🇬🇧', name: 'English' },
  { code: 'de', label: 'GER', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'nl', label: 'DUT', flag: '🇳🇱', name: 'Nederlands' },
];

export const DEFAULT_LANGUAGE: Language = 'en';

export type TranslationSchema = {
  nav: Record<string, string>;
  common: Record<string, string>;
  status: Record<string, string>;
  priority: Record<string, string>;
  type: Record<string, string>;
  support: Record<string, string>;
  sla: Record<string, string>;
  role: Record<string, string>;
  projectStatus: Record<string, string>;
  userStatus: Record<string, string>;
  sprintStatus: Record<string, string>;
  dashboard: Record<string, string>;
  issues: Record<string, string>;
  issueDetail: Record<string, string>;
  board: Record<string, string>;
  backlog: Record<string, string>;
  supportCenter: Record<string, string>;
  reports: Record<string, string>;
  projects: Record<string, string>;
  projectDetail: Record<string, string>;
  team: Record<string, string>;
  admin: Record<string, string>;
  settings: Record<string, string>;
  profile: Record<string, string>;
  docs: Record<string, string>;
  auth: Record<string, string>;
  modals: Record<string, string>;
  notifications: Record<string, string>;
  toasts: Record<string, string>;
  accessDenied: Record<string, string>;
};
