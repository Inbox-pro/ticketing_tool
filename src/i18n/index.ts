import { Language, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE, TranslationSchema } from './types';
import { en } from './translations/en';
import { de } from './translations/de';
import { nl } from './translations/nl';

export * from './types';

export const translations: Record<Language, TranslationSchema> = {
  en,
  de,
  nl,
};

export const LANGUAGE_STORAGE_KEY = 'inbox_language';

export function getSavedLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY) as Language | null;
    if (saved && (saved === 'en' || saved === 'de' || saved === 'nl')) {
      return saved;
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_LANGUAGE;
}

export function saveLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (e) {
    // ignore
  }
}

/**
 * Nested key path resolution, e.g. "common.save", "nav.dashboard"
 */
export function translateKey(lang: Language, path: string, params?: Record<string, string | number>): string {
  const dict = translations[lang] || translations.en;
  const parts = path.split('.');
  
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English
      let fallback: any = translations.en;
      for (const fbPart of parts) {
        if (fallback && typeof fallback === 'object' && fbPart in fallback) {
          fallback = fallback[fbPart];
        } else {
          return path;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  if (params) {
    let result = current;
    for (const [key, value] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    }
    return result;
  }

  return current;
}

// System value formatters
export function formatStatus(status: string, lang: Language): string {
  const dict = translations[lang]?.status || translations.en.status;
  return dict[status] || status;
}

export function formatPriority(priority: string, lang: Language): string {
  const dict = translations[lang]?.priority || translations.en.priority;
  return dict[priority] || priority;
}

export function formatType(type: string, lang: Language): string {
  const dict = translations[lang]?.type || translations.en.type;
  return dict[type] || type;
}

export function formatSupportLevel(level: string, lang: Language): string {
  const dict = translations[lang]?.support || translations.en.support;
  return dict[level] || level;
}

export function formatRole(role: string, lang: Language): string {
  const dict = translations[lang]?.role || translations.en.role;
  return dict[role] || role;
}

export function formatSLAStatus(slaStatus: string, lang: Language): string {
  const dict = translations[lang]?.sla || translations.en.sla;
  return dict[slaStatus] || slaStatus;
}

export function formatProjectStatus(status: string, lang: Language): string {
  const dict = translations[lang]?.projectStatus || translations.en.projectStatus;
  return dict[status] || status;
}

export function formatUserStatus(status: string, lang: Language): string {
  const dict = translations[lang]?.userStatus || translations.en.userStatus;
  return dict[status] || status;
}

export function formatSprintStatus(status: string, lang: Language): string {
  const dict = translations[lang]?.sprintStatus || translations.en.sprintStatus;
  return dict[status] || status;
}
