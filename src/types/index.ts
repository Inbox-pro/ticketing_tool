export type IssueType = 'Task' | 'Bug' | 'Story' | 'Epic' | 'Sub-task';

export type IssueStatus = 
  | 'Open'
  | 'To Do' 
  | 'In Progress' 
  | 'In Review' 
  | 'Testing' 
  | 'Blocked' 
  | 'Resolved' 
  | 'Closed';

export type Priority = 'Lowest' | 'Low' | 'Medium' | 'High' | 'Highest';

export type SupportLevel = 'L1' | 'L2' | 'L3';

export type UserRole = 
  | 'Admin' 
  | 'Project Manager' 
  | 'Developer' 
  | 'QA' 
  | 'Support Agent' 
  | 'Technical' 
  | 'Engineer' 
  | 'Viewer'
  | string;

export type SLAStatus = 'Within SLA' | 'At Risk' | 'Breached';

export interface EscalationRecord {
  id: string;
  timestamp: string;
  fromLevel: SupportLevel;
  toLevel: SupportLevel;
  reason: string;
  escalatedByUserId: string;
  assignedToUserId?: string;
}

export interface Comment {
  id: string;
  issueId: string;
  authorId: string;
  content: string;
  type: 'public' | 'internal';
  createdAt: string;
  updatedAt?: string;
}

export interface Attachment {
  id: string;
  issueId: string;
  filename: string;
  fileType: string;
  fileSize: number; // in bytes
  uploadDate: string;
}

export interface ActivityEvent {
  id: string;
  issueId?: string;
  projectId?: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface Issue {
  id: string; // e.g. "INB-1001"
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  priority: Priority;
  supportLevel: SupportLevel;
  assigneeId?: string;
  reporterId: string;
  projectId: string;
  sprintId?: string;
  epicId?: string;
  labels: string[];
  dueDate?: string;
  createdDate: string;
  updatedDate: string;
  estimatedTime?: string; // e.g. "4h"
  remainingTime?: string; // e.g. "2h"
  storyPoints?: number;
  responseSLAHours: number;
  resolutionSLAHours: number;
  firstRespondedAt?: string;
  resolvedAt?: string;
  isEscalated?: boolean;
  escalationHistory: EscalationRecord[];
  attachments: Attachment[];
}

export interface Project {
  id: string;
  key: string; // e.g. "INB"
  name: string;
  description: string;
  category?: string;
  leadId: string;
  memberIds: string[];
  status: 'Active' | 'Planning' | 'Completed' | 'On Hold';
  createdDate: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department: string;
  supportLevels: SupportLevel[]; // e.g. ['L1'], ['L2'], ['L3'], or ['L1', 'L2']
  avatar: string;
  timezone: string;
  status: 'Active' | 'Away' | 'Offline';
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'future' | 'completed' | 'planned';
  goal?: string;
  completedDate?: string;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  description: string;
  summary?: string;
  color: string;
  status: 'To Do' | 'In Progress' | 'Done';
  dueDate?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'escalation' | 'assignment' | 'comment' | 'status' | 'sprint' | 'system';
  issueId?: string;
  read: boolean;
  createdAt: string;
}

export interface SLAConfig {
  responseHours: number;
  resolutionHours: number;
}

export interface SLASettings {
  l1ResponseHours: number;
  l1ResolutionHours: number;
  l2ResponseHours: number;
  l2ResolutionHours: number;
  l3ResponseHours: number;
  l3ResolutionHours: number;
  warningThresholdHours: number;
  warningThresholdPercent?: number;
}

export interface Settings {
  appName: string;
  tagline: string;
  theme: 'light' | 'dark' | 'system';
  workspaceName?: string;
  notificationsEnabled?: boolean;
  slaSettings?: SLASettings;
  rolePageAccess?: Record<string, string[]>;
  notifications: {
    issueAssigned: boolean;
    commentAdded: boolean;
    statusChanged: boolean;
    mention: boolean;
    sprintStarted: boolean;
    sprintCompleted: boolean;
  };
  preferences: {
    defaultIssueView: 'table' | 'cards';
    defaultProjectId: string;
    dateFormat: string;
    timeFormat: string;
  };
  slaRules: {
    Highest: SLAConfig;
    High: SLAConfig;
    Medium: SLAConfig;
    Low: SLAConfig;
    Lowest: SLAConfig;
  };
}

export interface SavedFilter {
  id: string;
  name: string;
  filters: {
    projectId?: string;
    status?: IssueStatus | 'All';
    priority?: Priority | 'All';
    type?: IssueType | 'All';
    supportLevel?: SupportLevel | 'All';
    assigneeId?: string | 'All' | 'unassigned';
    sprintId?: string | 'All';
    search?: string;
  };
}
