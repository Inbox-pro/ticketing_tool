import { UserRole } from '../types';

export type AppPageId = 
  | 'dashboard'
  | 'issues'
  | 'board'
  | 'backlog'
  | 'support'
  | 'reports'
  | 'projects'
  | 'team'
  | 'admin'
  | 'settings'
  | 'profile'
  | 'docs';

export interface PagePermissionDefinition {
  id: AppPageId;
  label: string;
  path: string;
  category: 'Workspace' | 'Support & SLA' | 'Management' | 'General';
  description: string;
  iconName: string;
  defaultRoles: UserRole[];
}

export const ALL_ROLES: UserRole[] = [
  'Admin',
  'Project Manager',
  'Engineer',
  'Technical',
  'Developer',
  'QA',
  'Support Agent',
  'Viewer',
];

export const PAGE_DEFINITIONS: PagePermissionDefinition[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    category: 'Workspace',
    description: 'Executive overview, ticket status metrics, SLA health breakdown, and sprint progress.',
    iconName: 'LayoutDashboard',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA', 'Support Agent', 'Viewer'],
  },
  {
    id: 'issues',
    label: 'Issues & Tickets',
    path: '/issues',
    category: 'Workspace',
    description: 'Ticket repository, multi-facet filtering, ticket creation, triage, and SLA timers.',
    iconName: 'Ticket',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA', 'Support Agent', 'Viewer'],
  },
  {
    id: 'board',
    label: 'Kanban Board',
    path: '/board',
    category: 'Workspace',
    description: 'Agile sprint execution board, drag-and-drop workflow status, WIP limits, and swimlanes.',
    iconName: 'KanbanSquare',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA'],
  },
  {
    id: 'backlog',
    label: 'Backlog & Sprints',
    path: '/backlog',
    category: 'Workspace',
    description: 'Sprint planning workspace, backlog refinement, story point estimations, and sprint ceremonies.',
    iconName: 'ListOrdered',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA'],
  },
  {
    id: 'support',
    label: 'Support Center & Queues',
    path: '/support',
    category: 'Support & SLA',
    description: 'Tiered L1 Helpdesk, L2 Technical, and L3 Engineering escalation queues with live countdowns.',
    iconName: 'ShieldAlert',
    defaultRoles: ['Admin', 'Support Agent', 'Technical', 'Engineer', 'Project Manager'],
  },
  {
    id: 'reports',
    label: 'Reports & Analytics',
    path: '/reports',
    category: 'Management',
    description: 'SLA compliance audits, breach analytics, team throughput velocity, and resolution trends.',
    iconName: 'BarChart3',
    defaultRoles: ['Admin', 'Project Manager', 'QA', 'Engineer'],
  },
  {
    id: 'projects',
    label: 'Projects Directory',
    path: '/projects',
    category: 'Workspace',
    description: 'Portfolio projects list, repository keys, component owners, and member assignments.',
    iconName: 'Layers',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA'],
  },
  {
    id: 'team',
    label: 'Team Directory',
    path: '/team',
    category: 'Management',
    description: 'Staff profiles, active ticket workloads, departmental breakdown, and support tier badges.',
    iconName: 'Users2',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA', 'Support Agent', 'Viewer'],
  },
  {
    id: 'admin',
    label: 'Admin Panel & Governance',
    path: '/admin',
    category: 'Management',
    description: 'User management, password resets, role-to-page permission controls, and database snapshots.',
    iconName: 'Shield',
    defaultRoles: ['Admin'],
  },
  {
    id: 'settings',
    label: 'Settings & SLA Rules',
    path: '/settings',
    category: 'Management',
    description: 'System configurations, SLA threshold policies, notification triggers, and workspace preferences.',
    iconName: 'Settings',
    defaultRoles: ['Admin', 'Project Manager'],
  },
  {
    id: 'profile',
    label: 'Personal Profile',
    path: '/profile',
    category: 'General',
    description: 'Individual account details, notification preferences, timezone configuration, and security.',
    iconName: 'UserCheck',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA', 'Support Agent', 'Viewer'],
  },
  {
    id: 'docs',
    label: 'Documentation & Guides',
    path: '/docs',
    category: 'General',
    description: 'Architecture overview, role access guidelines, SLA escalation runbooks, and API specs.',
    iconName: 'BookOpen',
    defaultRoles: ['Admin', 'Project Manager', 'Engineer', 'Technical', 'Developer', 'QA', 'Support Agent', 'Viewer'],
  },
];

export const DEFAULT_ROLE_PAGE_ACCESS: Record<AppPageId, UserRole[]> = PAGE_DEFINITIONS.reduce(
  (acc, page) => {
    acc[page.id] = [...page.defaultRoles];
    return acc;
  },
  {} as Record<AppPageId, UserRole[]>
);

/**
 * Checks whether a given role is permitted to access a specific page.
 * Admins always retain full system privileges.
 */
export function hasRoleAccessToPage(
  role: string | undefined,
  pageId: AppPageId,
  customAccessMap?: Record<string, string[]>
): boolean {
  if (!role) return false;
  // Super Administrator always has access to all pages
  if (role === 'Admin') return true;

  const accessMap = customAccessMap || DEFAULT_ROLE_PAGE_ACCESS;
  const allowedRoles = accessMap[pageId] || DEFAULT_ROLE_PAGE_ACCESS[pageId] || [];

  return allowedRoles.includes(role);
}

/**
 * Returns the page definition for a given pageId
 */
export function getPageDefinition(pageId: AppPageId): PagePermissionDefinition | undefined {
  return PAGE_DEFINITIONS.find(p => p.id === pageId);
}

/**
 * Returns which roles are permitted to access a page
 */
export function getAllowedRolesForPage(
  pageId: AppPageId,
  customAccessMap?: Record<string, string[]>
): string[] {
  const accessMap = customAccessMap || DEFAULT_ROLE_PAGE_ACCESS;
  return accessMap[pageId] || DEFAULT_ROLE_PAGE_ACCESS[pageId] || [];
}

/**
 * Returns all page IDs allowed for a specific role
 */
export function getAllowedPagesForRole(
  role: string,
  customAccessMap?: Record<string, string[]>
): AppPageId[] {
  if (role === 'Admin') return PAGE_DEFINITIONS.map(p => p.id);
  return PAGE_DEFINITIONS
    .filter(p => hasRoleAccessToPage(role, p.id, customAccessMap))
    .map(p => p.id);
}
