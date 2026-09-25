import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  SupportLevel,
  IssueStatus,
  Priority,
  IssueType,
  EscalationRecord
} from '../types';
import { storage } from '../services/storage';

export interface ToastItem {
  id: string;
  title: string;
  message?: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

interface AppContextType {
  projects: Project[];
  issues: Issue[];
  users: User[];
  currentUser: User;
  sprints: Sprint[];
  epics: Epic[];
  comments: Comment[];
  activity: ActivityEvent[];
  notifications: Notification[];
  settings: Settings;
  savedFilters: SavedFilter[];
  theme: 'light' | 'dark';
  toasts: ToastItem[];
  unreadNotificationCount: number;
  isAuthenticated: boolean;

  // Authentication
  login: (userIdOrEmail: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserPassword: (userId: string, newPassword: string) => boolean;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  addToast: (title: string, message?: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;

  // Issue Actions
  createIssue: (data: Omit<Issue, 'id' | 'createdDate' | 'updatedDate' | 'escalationHistory' | 'attachments' | 'responseSLAHours' | 'resolutionSLAHours'>) => Issue;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  deleteIssue: (id: string) => void;
  escalateIssue: (issueId: string, toLevel: SupportLevel, reason: string, assignedToUserId?: string) => void;
  
  // Comments
  addComment: (issueId: string, content: string, type: 'public' | 'internal') => void;
  editComment: (commentId: string, content: string) => void;
  deleteComment: (commentId: string) => void;

  // Attachments
  addAttachment: (issueId: string, file: { filename: string; fileType: string; fileSize: number }) => void;
  deleteAttachment: (issueId: string, attachmentId: string) => void;

  // Projects
  createProject: (data: Omit<Project, 'id' | 'createdDate'>) => Project;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;

  // Sprints
  createSprint: (data: Omit<Sprint, 'id'>) => Sprint;
  updateSprint: (id: string, data: Partial<Sprint>) => void;
  startSprint: (id: string) => void;
  completeSprint: (id: string, targetSprintId?: string) => void;
  deleteSprint: (id: string) => void;

  // Epics
  createEpic: (data: Omit<Epic, 'id'>) => Epic;
  updateEpic: (id: string, data: Partial<Epic>) => void;
  deleteEpic: (id: string) => void;

  // Team Users
  addUser: (data: Omit<User, 'id'>) => User;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  switchUser: (userId: string) => void;
  setCurrentUser: (user: User) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Settings
  updateSettings: (newSettings: Partial<Settings>) => void;
  resetAllData: () => void;

  // Filters
  saveFilter: (name: string, filters: SavedFilter['filters']) => void;
  deleteFilter: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize storage once
  useEffect(() => {
    storage.init();
  }, []);

  const [projects, setProjects] = useState<Project[]>(() => storage.getProjects());
  const [issues, setIssues] = useState<Issue[]>(() => storage.getIssues());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [currentUserId, setCurrentUserId] = useState<string>(() => storage.getCurrentUserId());
  const [sprints, setSprints] = useState<Sprint[]>(() => storage.getSprints());
  const [epics, setEpics] = useState<Epic[]>(() => storage.getEpics());
  const [comments, setComments] = useState<Comment[]>(() => storage.getComments());
  const [activity, setActivity] = useState<ActivityEvent[]>(() => storage.getActivity());
  const [notifications, setNotifications] = useState<Notification[]>(() => storage.getNotifications());
  const [settings, setSettings] = useState<Settings>(() => storage.getSettings());
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => storage.getSavedFilters());
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return storage.getAuthSession().isAuthenticated;
  });

  // Theme management
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = storage.getSettings().theme;
    if (saved === 'dark') return 'dark';
    if (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next: 'light' | 'dark' = prev === 'light' ? 'dark' : 'light';
      const newSettings: Settings = { ...settings, theme: next };
      setSettings(newSettings);
      storage.saveSettings(newSettings);
      return next;
    });
  }, [settings]);

  const setThemeExplicit = useCallback((mode: 'light' | 'dark') => {
    const newSettings: Settings = { ...settings, theme: mode };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    setTheme(mode);
  }, [settings]);

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    const newSettings: Settings = { ...settings, theme: mode };
    setSettings(newSettings);
    storage.saveSettings(newSettings);
    if (mode === 'dark') setTheme('dark');
    else if (mode === 'light') setTheme('light');
    else {
      setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
  }, [settings]);

  // Current user resolution
  const currentUser = useMemo(() => {
    const found = users.find(u => u.id === currentUserId);
    return found || users[0] || {
      id: 'user-1',
      name: 'Tejas Chauhan',
      email: 'tejas@inbox.Gold mine.io',
      role: 'Admin',
      department: 'Engineering',
      supportLevels: ['L1', 'L2', 'L3'],
      avatar: '',
      timezone: 'UTC',
      status: 'Active',
    };
  }, [users, currentUserId]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  // Toast Helpers
  const addToast = useCallback((title: string, message?: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Sync state helpers
  const logActivity = useCallback((event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newEvent: ActivityEvent = {
      ...event,
      id: 'act-' + Date.now(),
      timestamp: new Date().toISOString(),
    };
    setActivity(prev => {
      const next = [newEvent, ...prev];
      storage.saveActivity(next);
      return next;
    });
  }, []);

  const pushNotification = useCallback((notif: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
    const newNotif: Notification = {
      ...notif,
      id: 'notif-' + Date.now(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications(prev => {
      const next = [newNotif, ...prev];
      storage.saveNotifications(next);
      return next;
    });
  }, []);

  // Issue CRUD
  const createIssue = useCallback((data: Omit<Issue, 'id' | 'createdDate' | 'updatedDate' | 'escalationHistory' | 'attachments' | 'responseSLAHours' | 'resolutionSLAHours'>) => {
    const project = projects.find(p => p.id === data.projectId);
    const prefix = project ? project.key : 'INB';
    
    // Find highest existing number for this prefix
    const existingNums = issues
      .filter(i => i.id.startsWith(prefix + '-'))
      .map(i => parseInt(i.id.replace(prefix + '-', ''), 10))
      .filter(n => !isNaN(n));
    const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1001;
    const newId = `${prefix}-${nextNum}`;

    const priorityRule = settings.slaRules[data.priority] || { responseHours: 4, resolutionHours: 24 };

    const newIssue: Issue = {
      ...data,
      id: newId,
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
      responseSLAHours: priorityRule.responseHours,
      resolutionSLAHours: priorityRule.resolutionHours,
      escalationHistory: [],
      attachments: [],
      isEscalated: false,
    };

    setIssues(prev => {
      const next = [newIssue, ...prev];
      storage.saveIssues(next);
      return next;
    });

    logActivity({
      issueId: newId,
      projectId: data.projectId,
      userId: currentUser.id,
      action: 'created',
      details: `created ticket ${newId} "${data.title}" (Support Level: ${data.supportLevel}, Priority: ${data.priority})`,
    });

    if (data.assigneeId && data.assigneeId !== currentUser.id) {
      pushNotification({
        title: 'New Ticket Assigned',
        message: `${currentUser.name} assigned ${newId} "${data.title}" to you (Level: ${data.supportLevel}).`,
        type: 'assignment',
        issueId: newId,
      });
    }

    addToast('Issue Created', `${newId} was successfully created.`, 'success');
    return newIssue;
  }, [projects, issues, settings.slaRules, currentUser, logActivity, pushNotification, addToast]);

  const updateIssue = useCallback((id: string, updates: Partial<Issue>) => {
    setIssues(prev => {
      const current = prev.find(i => i.id === id);
      if (!current) return prev;

      const updated: Issue = {
        ...current,
        ...updates,
        updatedDate: new Date().toISOString(),
      };

      // Check if status changed to Resolved/Closed
      if (updates.status && (updates.status === 'Resolved' || updates.status === 'Closed') && !current.resolvedAt) {
        updated.resolvedAt = new Date().toISOString();
      }

      // If priority changed, update SLA rules
      if (updates.priority && updates.priority !== current.priority) {
        const rule = settings.slaRules[updates.priority];
        if (rule) {
          updated.responseSLAHours = rule.responseHours;
          updated.resolutionSLAHours = rule.resolutionHours;
        }
      }

      const next = prev.map(i => i.id === id ? updated : i);
      storage.saveIssues(next);

      // Log activity depending on updates
      if (updates.status && updates.status !== current.status) {
        logActivity({
          issueId: id,
          projectId: updated.projectId,
          userId: currentUser.id,
          action: 'status_changed',
          details: `moved ${id} from ${current.status} to ${updates.status}`,
        });
      }
      if (updates.assigneeId && updates.assigneeId !== current.assigneeId) {
        const assignee = users.find(u => u.id === updates.assigneeId);
        logActivity({
          issueId: id,
          projectId: updated.projectId,
          userId: currentUser.id,
          action: 'assigned',
          details: `assigned ${id} to ${assignee?.name || 'Unassigned'}`,
        });
        if (updates.assigneeId !== currentUser.id) {
          pushNotification({
            title: 'Ticket Reassigned',
            message: `You have been assigned ${id} "${updated.title}".`,
            type: 'assignment',
            issueId: id,
          });
        }
      }
      if (updates.priority && updates.priority !== current.priority) {
        logActivity({
          issueId: id,
          projectId: updated.projectId,
          userId: currentUser.id,
          action: 'priority_changed',
          details: `changed priority of ${id} from ${current.priority} to ${updates.priority}`,
        });
      }

      return next;
    });

    addToast('Issue Updated', `Changes to ${id} have been saved.`, 'info');
  }, [settings.slaRules, currentUser, users, logActivity, pushNotification, addToast]);

  const deleteIssue = useCallback((id: string) => {
    setIssues(prev => {
      const issue = prev.find(i => i.id === id);
      const next = prev.filter(i => i.id !== id);
      storage.saveIssues(next);
      if (issue) {
        logActivity({
          issueId: id,
          projectId: issue.projectId,
          userId: currentUser.id,
          action: 'deleted',
          details: `deleted ticket ${id}`,
        });
      }
      return next;
    });
    addToast('Issue Deleted', `${id} was removed.`, 'warning');
  }, [currentUser, logActivity, addToast]);

  // Escalation Action
  const escalateIssue = useCallback((issueId: string, toLevel: SupportLevel, reason: string, assignedToUserId?: string) => {
    setIssues(prev => {
      const issue = prev.find(i => i.id === issueId);
      if (!issue) return prev;

      const fromLevel = issue.supportLevel;
      const escalationRecord: EscalationRecord = {
        id: 'esc-' + Date.now(),
        timestamp: new Date().toISOString(),
        fromLevel,
        toLevel,
        reason,
        escalatedByUserId: currentUser.id,
        assignedToUserId: assignedToUserId || issue.assigneeId,
      };

      const updated: Issue = {
        ...issue,
        supportLevel: toLevel,
        assigneeId: assignedToUserId !== undefined ? assignedToUserId : issue.assigneeId,
        isEscalated: true,
        updatedDate: new Date().toISOString(),
        escalationHistory: [...(issue.escalationHistory || []), escalationRecord],
      };

      const next = prev.map(i => i.id === issueId ? updated : i);
      storage.saveIssues(next);

      // Auto-create an internal escalation note in comments
      const internalComment: Comment = {
        id: 'comm-' + Date.now(),
        issueId,
        authorId: currentUser.id,
        type: 'internal',
        content: `[Internal Escalation Note] Escalated from ${fromLevel} to ${toLevel}.\nReason: ${reason}${assignedToUserId ? `\nReassigned to: ${users.find(u => u.id === assignedToUserId)?.name || 'Team member'}` : ''}`,
        createdAt: new Date().toISOString(),
      };
      setComments(commPrev => {
        const commNext = [internalComment, ...commPrev];
        storage.saveComments(commNext);
        return commNext;
      });

      // Log Activity
      logActivity({
        issueId,
        projectId: issue.projectId,
        userId: currentUser.id,
        action: 'escalated',
        details: `escalated ${issueId} ${fromLevel} → ${toLevel} (Reason: ${reason})`,
      });

      // Push Notifications
      pushNotification({
        title: 'Ticket Escalated',
        message: `${issueId} has been escalated from ${fromLevel} to ${toLevel}. Reason: ${reason}`,
        type: 'escalation',
        issueId,
      });

      if (assignedToUserId && assignedToUserId !== currentUser.id) {
        pushNotification({
          title: 'Escalated Ticket Assigned',
          message: `You have been assigned ${issueId} (Support Level: ${toLevel}, Priority: ${issue.priority}).`,
          type: 'assignment',
          issueId,
        });
      }

      return next;
    });

    addToast('Ticket Escalated', `Ticket ${issueId} escalated to ${toLevel}.`, 'success');
  }, [currentUser, users, logActivity, pushNotification, addToast]);

  // Comment Actions
  const addComment = useCallback((issueId: string, content: string, type: 'public' | 'internal') => {
    const newComment: Comment = {
      id: 'comm-' + Date.now(),
      issueId,
      authorId: currentUser.id,
      content,
      type,
      createdAt: new Date().toISOString(),
    };

    setComments(prev => {
      const next = [newComment, ...prev];
      storage.saveComments(next);
      return next;
    });

    const issue = issues.find(i => i.id === issueId);
    logActivity({
      issueId,
      projectId: issue?.projectId,
      userId: currentUser.id,
      action: 'commented',
      details: `added a ${type === 'internal' ? 'internal note' : 'public reply'} on ${issueId}`,
    });

    // If first response on an open issue by support agent, record firstRespondedAt
    if (issue && !issue.firstRespondedAt && type === 'public') {
      updateIssue(issueId, { firstRespondedAt: new Date().toISOString() });
    }

    addToast(type === 'internal' ? 'Internal Note Added' : 'Comment Published', '', 'success');
  }, [currentUser, issues, logActivity, updateIssue, addToast]);

  const editComment = useCallback((commentId: string, content: string) => {
    setComments(prev => {
      const next = prev.map(c => c.id === commentId ? { ...c, content, updatedAt: new Date().toISOString() } : c);
      storage.saveComments(next);
      return next;
    });
    addToast('Comment Updated', '', 'info');
  }, [addToast]);

  const deleteComment = useCallback((commentId: string) => {
    setComments(prev => {
      const next = prev.filter(c => c.id !== commentId);
      storage.saveComments(next);
      return next;
    });
    addToast('Comment Deleted', '', 'warning');
  }, [addToast]);

  // Attachments
  const addAttachment = useCallback((issueId: string, file: { filename: string; fileType: string; fileSize: number }) => {
    const newAttachment = {
      id: 'att-' + Date.now(),
      issueId,
      filename: file.filename,
      fileType: file.fileType,
      fileSize: file.fileSize,
      uploadDate: new Date().toISOString(),
    };

    setIssues(prev => {
      const next = prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            attachments: [...(issue.attachments || []), newAttachment],
            updatedDate: new Date().toISOString(),
          };
        }
        return issue;
      });
      storage.saveIssues(next);
      return next;
    });

    logActivity({
      issueId,
      userId: currentUser.id,
      action: 'attachment_added',
      details: `uploaded attachment "${file.filename}" to ${issueId}`,
    });

    addToast('Attachment Added', file.filename, 'success');
  }, [currentUser, logActivity, addToast]);

  const deleteAttachment = useCallback((issueId: string, attachmentId: string) => {
    setIssues(prev => {
      const next = prev.map(issue => {
        if (issue.id === issueId) {
          return {
            ...issue,
            attachments: (issue.attachments || []).filter(a => a.id !== attachmentId),
            updatedDate: new Date().toISOString(),
          };
        }
        return issue;
      });
      storage.saveIssues(next);
      return next;
    });
    addToast('Attachment Removed', '', 'info');
  }, [addToast]);

  // Project Actions
  const createProject = useCallback((data: Omit<Project, 'id' | 'createdDate'>) => {
    const newId = 'proj-' + (projects.length + 1);
    const newProject: Project = {
      ...data,
      id: newId,
      createdDate: new Date().toISOString(),
    };

    setProjects(prev => {
      const next = [...prev, newProject];
      storage.saveProjects(next);
      return next;
    });

    logActivity({
      projectId: newId,
      userId: currentUser.id,
      action: 'project_created',
      details: `created project ${data.name} (${data.key})`,
    });

    addToast('Project Created', `${data.name} created successfully.`, 'success');
    return newProject;
  }, [projects.length, currentUser, logActivity, addToast]);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    setProjects(prev => {
      const next = prev.map(p => p.id === id ? { ...p, ...data } : p);
      storage.saveProjects(next);
      return next;
    });
    addToast('Project Updated', 'Project settings saved.', 'info');
  }, [addToast]);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => {
      const proj = prev.find(p => p.id === id);
      const next = prev.filter(p => p.id !== id);
      storage.saveProjects(next);
      if (proj) {
        logActivity({
          userId: currentUser.id,
          action: 'project_deleted',
          details: `deleted project ${proj.name}`,
        });
      }
      return next;
    });
    addToast('Project Deleted', 'Project removed.', 'warning');
  }, [currentUser, logActivity, addToast]);

  // Sprint Actions
  const createSprint = useCallback((data: Omit<Sprint, 'id'>) => {
    const newSprint: Sprint = {
      ...data,
      id: 'sprint-' + (sprints.length + 1),
    };
    setSprints(prev => {
      const next = [...prev, newSprint];
      storage.saveSprints(next);
      return next;
    });
    addToast('Sprint Created', `${data.name} is ready.`, 'success');
    return newSprint;
  }, [sprints.length, addToast]);

  const updateSprint = useCallback((id: string, data: Partial<Sprint>) => {
    setSprints(prev => {
      const next = prev.map(s => s.id === id ? { ...s, ...data } : s);
      storage.saveSprints(next);
      return next;
    });
    addToast('Sprint Updated', '', 'info');
  }, [addToast]);

  const startSprint = useCallback((id: string) => {
    setSprints(prev => {
      const target = prev.find(s => s.id === id);
      // Mark others as not active if needed or allow active
      const next = prev.map(s => s.id === id ? { ...s, status: 'active' as const } : s);
      storage.saveSprints(next);

      if (target) {
        logActivity({
          projectId: target.projectId,
          userId: currentUser.id,
          action: 'sprint_started',
          details: `started ${target.name}`,
        });
        pushNotification({
          title: 'Sprint Started',
          message: `${target.name} has begun.`,
          type: 'sprint',
        });
      }
      return next;
    });
    addToast('Sprint Started', 'Active sprint initiated.', 'success');
  }, [currentUser, logActivity, pushNotification, addToast]);

  const completeSprint = useCallback((id: string, targetSprintId?: string) => {
    setSprints(prev => {
      const target = prev.find(s => s.id === id);
      const next = prev.map(s => s.id === id ? { ...s, status: 'completed' as const, completedDate: new Date().toISOString() } : s);
      storage.saveSprints(next);

      // Move incomplete issues to backlog or targetSprint
      setIssues(issuesPrev => {
        const issuesNext = issuesPrev.map(issue => {
          if (issue.sprintId === id && issue.status !== 'Resolved' && issue.status !== 'Closed') {
            return {
              ...issue,
              sprintId: targetSprintId || undefined,
            };
          }
          return issue;
        });
        storage.saveIssues(issuesNext);
        return issuesNext;
      });

      if (target) {
        logActivity({
          projectId: target.projectId,
          userId: currentUser.id,
          action: 'sprint_completed',
          details: `completed ${target.name}`,
        });
        pushNotification({
          title: 'Sprint Completed',
          message: `${target.name} has been closed.`,
          type: 'sprint',
        });
      }
      return next;
    });
    addToast('Sprint Completed', 'Sprint finalized.', 'success');
  }, [currentUser, logActivity, pushNotification, addToast]);

  const deleteSprint = useCallback((id: string) => {
    setSprints(prev => {
      const next = prev.filter(s => s.id !== id);
      storage.saveSprints(next);
      return next;
    });
    // Unassign issues from this sprint
    setIssues(prev => {
      const next = prev.map(i => i.sprintId === id ? { ...i, sprintId: undefined } : i);
      storage.saveIssues(next);
      return next;
    });
    addToast('Sprint Deleted', '', 'warning');
  }, [addToast]);

  // Epic Actions
  const createEpic = useCallback((data: Omit<Epic, 'id'>) => {
    const newEpic: Epic = {
      ...data,
      id: 'epic-' + (epics.length + 1),
    };
    setEpics(prev => {
      const next = [...prev, newEpic];
      storage.saveEpics(next);
      return next;
    });
    addToast('Epic Created', `${data.name} created.`, 'success');
    return newEpic;
  }, [epics.length, addToast]);

  const updateEpic = useCallback((id: string, data: Partial<Epic>) => {
    setEpics(prev => {
      const next = prev.map(e => e.id === id ? { ...e, ...data } : e);
      storage.saveEpics(next);
      return next;
    });
    addToast('Epic Updated', '', 'info');
  }, [addToast]);

  const deleteEpic = useCallback((id: string) => {
    setEpics(prev => {
      const next = prev.filter(e => e.id !== id);
      storage.saveEpics(next);
      return next;
    });
    addToast('Epic Removed', '', 'warning');
  }, [addToast]);

  // Team Users Actions
  const addUser = useCallback((data: Omit<User, 'id'>) => {
    const newUser: User = {
      ...data,
      id: 'user-' + (users.length + 1) + '-' + Date.now().toString().slice(-4),
      password: data.password || 'password123',
    };
    setUsers(prev => {
      const next = [...prev, newUser];
      storage.saveUsers(next);
      return next;
    });
    addToast('Member Added', `${data.name} added to workspace.`, 'success');
    return newUser;
  }, [users.length, addToast]);

  const updateUser = useCallback((id: string, data: Partial<User>) => {
    setUsers(prev => {
      const next = prev.map(u => u.id === id ? { ...u, ...data } : u);
      storage.saveUsers(next);
      return next;
    });
    addToast('Member Updated', 'Profile details updated.', 'info');
  }, [addToast]);

  const updateUserPassword = useCallback((userId: string, newPassword: string): boolean => {
    const clean = newPassword.trim();
    if (!clean || clean.length < 4) {
      addToast('Invalid Password', 'Password must be at least 4 characters long.', 'error');
      return false;
    }
    setUsers(prev => {
      const next = prev.map(u => u.id === userId ? { ...u, password: clean } : u);
      storage.saveUsers(next);
      return next;
    });
    addToast('Password Saved', 'User password credentials updated successfully.', 'success');
    return true;
  }, [addToast]);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => {
      const next = prev.filter(u => u.id !== id);
      storage.saveUsers(next);
      return next;
    });
    addToast('Member Removed', '', 'warning');
  }, [addToast]);

  const switchUser = useCallback((userId: string) => {
    setCurrentUserId(userId);
    storage.saveCurrentUserId(userId);
    const target = users.find(u => u.id === userId);
    addToast('Switched User', `Now acting as ${target?.name || 'User'} (${target?.role})`, 'info');
  }, [users, addToast]);

  const setCurrentUser = useCallback((user: User) => {
    switchUser(user.id);
  }, [switchUser]);

  // Authentication: Login & Logout
  const login = useCallback((userIdOrEmail: string, passwordInput: string) => {
    const target = users.find(u => 
      u.id === userIdOrEmail || 
      u.email.toLowerCase() === userIdOrEmail.trim().toLowerCase()
    );

    if (!target) {
      return { success: false, error: 'No user account found matching this email or ID.' };
    }

    const expectedPassword = target.password || 'password123';
    if (passwordInput !== expectedPassword) {
      return { success: false, error: 'Incorrect password. Please verify and try again.' };
    }

    // Success
    setCurrentUserId(target.id);
    storage.saveCurrentUserId(target.id);
    storage.saveAuthSession({ isAuthenticated: true, userId: target.id });
    setIsAuthenticated(true);
    addToast('Access Granted', `Welcome to Inbox Ticketing, ${target.name}!`, 'success');
    return { success: true };
  }, [users, addToast]);

  const logout = useCallback(() => {
    storage.clearAuthSession();
    setIsAuthenticated(false);
    addToast('Signed Out', 'You have been logged out of your session.', 'info');
  }, [addToast]);

  // Notifications
  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => {
      const next = prev.map(n => n.id === id ? { ...n, read: true } : n);
      storage.saveNotifications(next);
      return next;
    });
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => {
      const next = prev.map(n => ({ ...n, read: true }));
      storage.saveNotifications(next);
      return next;
    });
    addToast('All Caught Up', 'All notifications marked as read.', 'info');
  }, [addToast]);

  // Settings
  const updateSettings = useCallback((newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...newSettings };
      storage.saveSettings(next);
      return next;
    });
    addToast('Settings Saved', 'Preferences have been persisted.', 'success');
  }, [addToast]);

  const resetAllData = useCallback(() => {
    storage.resetToSeedData();
    setProjects(storage.getProjects());
    setIssues(storage.getIssues());
    setUsers(storage.getUsers());
    setCurrentUserId(storage.getCurrentUserId());
    setSprints(storage.getSprints());
    setEpics(storage.getEpics());
    setComments(storage.getComments());
    setActivity(storage.getActivity());
    setNotifications(storage.getNotifications());
    setSettings(storage.getSettings());
    setIsAuthenticated(false);
    addToast('Data Reset', 'Workspace has been restored to factory seed state.', 'info');
  }, [addToast]);

  // Filters
  const saveFilter = useCallback((name: string, filters: SavedFilter['filters']) => {
    const newFilter: SavedFilter = {
      id: 'filter-' + Date.now(),
      name,
      filters,
    };
    setSavedFilters(prev => {
      const next = [...prev, newFilter];
      storage.saveSavedFilters(next);
      return next;
    });
    addToast('Filter Saved', `Filter "${name}" saved to your list.`, 'success');
  }, [addToast]);

  const deleteFilter = useCallback((id: string) => {
    setSavedFilters(prev => {
      const next = prev.filter(f => f.id !== id);
      storage.saveSavedFilters(next);
      return next;
    });
    addToast('Filter Removed', '', 'info');
  }, [addToast]);

  const value = useMemo(() => ({
    projects,
    issues,
    users,
    currentUser,
    sprints,
    epics,
    comments,
    activity,
    notifications,
    settings,
    savedFilters,
    theme,
    toasts,
    unreadNotificationCount,
    isAuthenticated,
    login,
    logout,
    updateUserPassword,
    toggleTheme,
    setThemeMode,
    addToast,
    removeToast,
    createIssue,
    updateIssue,
    deleteIssue,
    escalateIssue,
    addComment,
    editComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    createProject,
    updateProject,
    deleteProject,
    createSprint,
    updateSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    createEpic,
    updateEpic,
    deleteEpic,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
    setCurrentUser,
    setTheme: setThemeExplicit,
    markNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    resetAllData,
    saveFilter,
    deleteFilter,
  }), [
    projects,
    issues,
    users,
    currentUser,
    sprints,
    epics,
    comments,
    activity,
    notifications,
    settings,
    savedFilters,
    theme,
    toasts,
    unreadNotificationCount,
    isAuthenticated,
    login,
    logout,
    updateUserPassword,
    toggleTheme,
    setThemeMode,
    addToast,
    removeToast,
    createIssue,
    updateIssue,
    deleteIssue,
    escalateIssue,
    addComment,
    editComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    createProject,
    updateProject,
    deleteProject,
    createSprint,
    updateSprint,
    startSprint,
    completeSprint,
    deleteSprint,
    createEpic,
    updateEpic,
    deleteEpic,
    addUser,
    updateUser,
    deleteUser,
    switchUser,
    setCurrentUser,
    setThemeExplicit,
    markNotificationRead,
    markAllNotificationsRead,
    updateSettings,
    resetAllData,
    saveFilter,
    deleteFilter,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
