import { 
  Project, 
  User, 
  Issue, 
  Sprint, 
  Epic, 
  Comment, 
  ActivityEvent, 
  Notification, 
  Settings, 
  SavedFilter,
  SLAStatus
} from '../types';
import { 
  INITIAL_PROJECTS, 
  INITIAL_USERS, 
  INITIAL_ISSUES, 
  INITIAL_SPRINTS, 
  INITIAL_EPICS, 
  INITIAL_COMMENTS, 
  INITIAL_ACTIVITY, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_SETTINGS 
} from '../data/seedData';

const KEYS = {
  PROJECTS: 'inbox_projects',
  ISSUES: 'inbox_issues',
  USERS: 'inbox_users',
  SPRINTS: 'inbox_sprints',
  EPICS: 'inbox_epics',
  COMMENTS: 'inbox_comments',
  ACTIVITY: 'inbox_activity',
  NOTIFICATIONS: 'inbox_notifications',
  SETTINGS: 'inbox_settings',
  SAVED_FILTERS: 'inbox_saved_filters',
  CURRENT_USER: 'inbox_current_user_id',
  AUTH_SESSION: 'inbox_auth_session',
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.warn(`[Inbox Storage] Error parsing key ${key}, falling back to initial data`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`[Inbox Storage] Error writing key ${key}`, err);
  }
}

export const storage = {
  // Initialize and ensure seed data is loaded
  init(): void {
    if (!localStorage.getItem(KEYS.PROJECTS)) safeSet(KEYS.PROJECTS, INITIAL_PROJECTS);
    if (!localStorage.getItem(KEYS.USERS)) {
      safeSet(KEYS.USERS, INITIAL_USERS);
    } else {
      // Ensure existing saved users have passwords
      const existingUsers = safeGet<User[]>(KEYS.USERS, INITIAL_USERS);
      let updated = false;
      const verifiedUsers = existingUsers.map(u => {
        if (!u.password) {
          const seedMatch = INITIAL_USERS.find(s => s.id === u.id || s.email === u.email);
          u.password = seedMatch?.password || 'password123';
          updated = true;
        }
        return u;
      });
      if (updated) {
        safeSet(KEYS.USERS, verifiedUsers);
      }
    }
    if (!localStorage.getItem(KEYS.ISSUES)) safeSet(KEYS.ISSUES, INITIAL_ISSUES);
    if (!localStorage.getItem(KEYS.SPRINTS)) safeSet(KEYS.SPRINTS, INITIAL_SPRINTS);
    if (!localStorage.getItem(KEYS.EPICS)) safeSet(KEYS.EPICS, INITIAL_EPICS);
    if (!localStorage.getItem(KEYS.COMMENTS)) safeSet(KEYS.COMMENTS, INITIAL_COMMENTS);
    if (!localStorage.getItem(KEYS.ACTIVITY)) safeSet(KEYS.ACTIVITY, INITIAL_ACTIVITY);
    if (!localStorage.getItem(KEYS.NOTIFICATIONS)) safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    if (!localStorage.getItem(KEYS.SETTINGS)) safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    if (!localStorage.getItem(KEYS.CURRENT_USER)) safeSet(KEYS.CURRENT_USER, INITIAL_USERS[0].id);
    if (!localStorage.getItem(KEYS.SAVED_FILTERS)) {
      const defaultFilters: SavedFilter[] = [
        { id: 'filter-1', name: 'Open High Priority Bugs', filters: { status: 'In Progress', priority: 'High', type: 'Bug' } },
        { id: 'filter-2', name: 'L2 Technical Queue', filters: { supportLevel: 'L2', status: 'In Progress' } },
        { id: 'filter-3', name: 'L3 Engineering Escalations', filters: { supportLevel: 'L3' } },
      ];
      safeSet(KEYS.SAVED_FILTERS, defaultFilters);
    }
  },

  resetToSeedData(): void {
    safeSet(KEYS.PROJECTS, INITIAL_PROJECTS);
    safeSet(KEYS.USERS, INITIAL_USERS);
    safeSet(KEYS.ISSUES, INITIAL_ISSUES);
    safeSet(KEYS.SPRINTS, INITIAL_SPRINTS);
    safeSet(KEYS.EPICS, INITIAL_EPICS);
    safeSet(KEYS.COMMENTS, INITIAL_COMMENTS);
    safeSet(KEYS.ACTIVITY, INITIAL_ACTIVITY);
    safeSet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    safeSet(KEYS.SETTINGS, INITIAL_SETTINGS);
    safeSet(KEYS.CURRENT_USER, INITIAL_USERS[0].id);
    safeSet(KEYS.AUTH_SESSION, { isAuthenticated: false });
  },

  // Auth Session
  getAuthSession(): { isAuthenticated: boolean; userId?: string } {
    return safeGet<{ isAuthenticated: boolean; userId?: string }>(KEYS.AUTH_SESSION, { isAuthenticated: false });
  },
  saveAuthSession(session: { isAuthenticated: boolean; userId?: string }): void {
    safeSet(KEYS.AUTH_SESSION, session);
  },
  clearAuthSession(): void {
    safeSet(KEYS.AUTH_SESSION, { isAuthenticated: false });
  },

  // Projects
  getProjects(): Project[] {
    return safeGet<Project[]>(KEYS.PROJECTS, INITIAL_PROJECTS);
  },
  saveProjects(projects: Project[]): void {
    safeSet(KEYS.PROJECTS, projects);
  },

  // Issues
  getIssues(): Issue[] {
    return safeGet<Issue[]>(KEYS.ISSUES, INITIAL_ISSUES);
  },
  saveIssues(issues: Issue[]): void {
    safeSet(KEYS.ISSUES, issues);
  },

  // Users
  getUsers(): User[] {
    return safeGet<User[]>(KEYS.USERS, INITIAL_USERS);
  },
  saveUsers(users: User[]): void {
    safeSet(KEYS.USERS, users);
  },

  // Current User
  getCurrentUserId(): string {
    return safeGet<string>(KEYS.CURRENT_USER, INITIAL_USERS[0].id);
  },
  saveCurrentUserId(userId: string): void {
    safeSet(KEYS.CURRENT_USER, userId);
  },

  // Sprints
  getSprints(): Sprint[] {
    return safeGet<Sprint[]>(KEYS.SPRINTS, INITIAL_SPRINTS);
  },
  saveSprints(sprints: Sprint[]): void {
    safeSet(KEYS.SPRINTS, sprints);
  },

  // Epics
  getEpics(): Epic[] {
    return safeGet<Epic[]>(KEYS.EPICS, INITIAL_EPICS);
  },
  saveEpics(epics: Epic[]): void {
    safeSet(KEYS.EPICS, epics);
  },

  // Comments
  getComments(): Comment[] {
    return safeGet<Comment[]>(KEYS.COMMENTS, INITIAL_COMMENTS);
  },
  saveComments(comments: Comment[]): void {
    safeSet(KEYS.COMMENTS, comments);
  },

  // Activity
  getActivity(): ActivityEvent[] {
    return safeGet<ActivityEvent[]>(KEYS.ACTIVITY, INITIAL_ACTIVITY);
  },
  saveActivity(activity: ActivityEvent[]): void {
    safeSet(KEYS.ACTIVITY, activity);
  },

  // Notifications
  getNotifications(): Notification[] {
    return safeGet<Notification[]>(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
  },
  saveNotifications(notifications: Notification[]): void {
    safeSet(KEYS.NOTIFICATIONS, notifications);
  },

  // Settings
  getSettings(): Settings {
    return safeGet<Settings>(KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  saveSettings(settings: Settings): void {
    safeSet(KEYS.SETTINGS, settings);
  },

  // Saved Filters
  getSavedFilters(): SavedFilter[] {
    return safeGet<SavedFilter[]>(KEYS.SAVED_FILTERS, []);
  },
  saveSavedFilters(filters: SavedFilter[]): void {
    safeSet(KEYS.SAVED_FILTERS, filters);
  },
};

// Relational Resolvers with safe fallback
export function getUserById(users: User[], id?: string): User {
  if (!id) {
    return {
      id: 'unassigned',
      name: 'Unassigned',
      email: '',
      role: 'Viewer',
      department: '',
      supportLevels: ['L1'],
      avatar: '',
      timezone: 'UTC',
      status: 'Offline',
    };
  }
  const found = users.find(u => u.id === id);
  if (found) return found;
  return {
    id,
    name: 'Unknown User',
    email: '',
    role: 'Viewer',
    department: '',
    supportLevels: ['L1'],
    avatar: '',
    timezone: 'UTC',
    status: 'Offline',
  };
}

export function getProjectById(projects: Project[], id?: string): Project {
  if (!id) {
    return {
      id: 'unknown',
      key: 'INB',
      name: 'Inbox Project',
      description: '',
      leadId: '',
      memberIds: [],
      status: 'Active',
      createdDate: new Date().toISOString(),
    };
  }
  const found = projects.find(p => p.id === id);
  if (found) return found;
  return {
    id,
    key: 'INB',
    name: 'Unknown Project',
    description: '',
    leadId: '',
    memberIds: [],
    status: 'Active',
    createdDate: new Date().toISOString(),
  };
}

export function getSprintById(sprints: Sprint[], id?: string): Sprint | undefined {
  if (!id) return undefined;
  return sprints.find(s => s.id === id);
}

export function getEpicById(epics: Epic[], id?: string): Epic | undefined {
  if (!id) return undefined;
  return epics.find(e => e.id === id);
}

// SLA Calculation helper
export function calculateSLAInfo(issue: Issue): {
  status: SLAStatus;
  responseRemainingMs: number;
  resolutionRemainingMs: number;
  isResponseBreached: boolean;
  isResolutionBreached: boolean;
  resolutionText: string;
} {
  const created = new Date(issue.createdDate).getTime();
  const now = Date.now();
  const resolutionDeadline = created + (issue.resolutionSLAHours * 3600 * 1000);
  const responseDeadline = created + (issue.responseSLAHours * 3600 * 1000);

  const isResolved = issue.status === 'Resolved' || issue.status === 'Closed';
  const resolvedTime = issue.resolvedAt ? new Date(issue.resolvedAt).getTime() : now;

  const resolutionRemainingMs = resolutionDeadline - (isResolved ? resolvedTime : now);
  const isResolutionBreached = isResolved 
    ? (resolvedTime > resolutionDeadline)
    : (now > resolutionDeadline);

  const isFirstResponded = !!issue.firstRespondedAt;
  const respondedTime = issue.firstRespondedAt ? new Date(issue.firstRespondedAt).getTime() : now;
  const responseRemainingMs = responseDeadline - (isFirstResponded ? respondedTime : now);
  const isResponseBreached = isFirstResponded
    ? (respondedTime > responseDeadline)
    : (now > responseDeadline);

  let status: SLAStatus = 'Within SLA';
  if (isResolutionBreached || isResponseBreached) {
    status = 'Breached';
  } else if (!isResolved && resolutionRemainingMs < 2 * 3600 * 1000) {
    // Less than 2 hours remaining
    status = 'At Risk';
  }

  // Format countdown or exceeded
  let resolutionText = '';
  if (isResolved) {
    resolutionText = isResolutionBreached ? 'Breached before resolution' : 'Resolved within SLA';
  } else if (resolutionRemainingMs > 0) {
    const hours = Math.floor(resolutionRemainingMs / (3600 * 1000));
    const mins = Math.floor((resolutionRemainingMs % (3600 * 1000)) / (60 * 1000));
    resolutionText = `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m remaining`;
  } else {
    const exceededMs = Math.abs(resolutionRemainingMs);
    const hours = Math.floor(exceededMs / (3600 * 1000));
    const mins = Math.floor((exceededMs % (3600 * 1000)) / (60 * 1000));
    resolutionText = `Exceeded by ${hours}h ${mins}m`;
  }

  return {
    status,
    responseRemainingMs,
    resolutionRemainingMs,
    isResponseBreached,
    isResolutionBreached,
    resolutionText,
  };
}

export function resetAllDataToSeed(): void {
  storage.resetToSeedData();
}

export function exportAllDataAsJSON(): string {
  const allData = {
    projects: storage.getProjects(),
    issues: storage.getIssues(),
    users: storage.getUsers(),
    sprints: storage.getSprints(),
    epics: storage.getEpics(),
    comments: storage.getComments(),
    activity: storage.getActivity(),
    notifications: storage.getNotifications(),
    settings: storage.getSettings(),
    savedFilters: storage.getSavedFilters(),
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
  };
  return JSON.stringify(allData, null, 2);
}

export function importDataFromJSON(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);
    if (!data || typeof data !== 'object') return false;
    if (Array.isArray(data.projects)) storage.saveProjects(data.projects);
    if (Array.isArray(data.issues)) storage.saveIssues(data.issues);
    if (Array.isArray(data.users)) storage.saveUsers(data.users);
    if (Array.isArray(data.sprints)) storage.saveSprints(data.sprints);
    if (Array.isArray(data.epics)) storage.saveEpics(data.epics);
    if (Array.isArray(data.comments)) storage.saveComments(data.comments);
    if (Array.isArray(data.activity)) storage.saveActivity(data.activity);
    if (Array.isArray(data.notifications)) storage.saveNotifications(data.notifications);
    if (data.settings && typeof data.settings === 'object') storage.saveSettings(data.settings);
    if (Array.isArray(data.savedFilters)) storage.saveSavedFilters(data.savedFilters);
    return true;
  } catch (err) {
    console.error('Failed to import JSON data', err);
    return false;
  }
}

