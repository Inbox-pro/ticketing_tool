import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Layers, 
  Ticket, 
  KanbanSquare, 
  ListOrdered, 
  Zap, 
  ShieldAlert, 
  BarChart3, 
  Users2, 
  Settings as SettingsIcon, 
  ChevronDown, 
  ChevronRight,
  FolderGit2,
  AlertTriangle,
  Clock,
  BookOpen,
  Shield,
  LogOut,
  Lock
} from 'lucide-react';
import { SupportBadge } from '../common/SupportBadge';
import { InboxLogo } from '../common/InboxLogo';
import { AppPageId, hasRoleAccessToPage } from '../../services/rbac';

interface Props {
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<Props> = ({ isMobileOpen, onMobileClose }) => {
  const { issues, projects, currentUser, settings, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [supportQueuesOpen, setSupportQueuesOpen] = useState(true);
  const [projectsListOpen, setProjectsListOpen] = useState(true);
  const [filterPermittedOnly, setFilterPermittedOnly] = useState(false);

  const canAccess = (pageId: AppPageId) => {
    return hasRoleAccessToPage(currentUser.role, pageId, settings?.rolePageAccess);
  };

  // Compute live queue counts
  const l1Count = issues.filter(i => i.supportLevel === 'L1' && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const l2Count = issues.filter(i => i.supportLevel === 'L2' && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const l3Count = issues.filter(i => i.supportLevel === 'L3' && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const escalatedCount = issues.filter(i => i.isEscalated && i.status !== 'Resolved' && i.status !== 'Closed').length;
  const myIssuesCount = issues.filter(i => i.assigneeId === currentUser.id && i.status !== 'Resolved' && i.status !== 'Closed').length;

  const getNavLinkClass = (pageId?: AppPageId) => ({ isActive }: { isActive: boolean }) => {
    const allowed = pageId ? canAccess(pageId) : true;
    if (!allowed) {
      return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group opacity-60 hover:opacity-100 ${
        isActive
          ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
          : 'text-zinc-400 dark:text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`;
    }
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition group ${
      isActive
        ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-200'
    }`;
  };

  const content = (
    <div className="h-full flex flex-col justify-between py-4 px-3 overflow-y-auto">
      <div className="space-y-6">
        {/* Brand Header with Official Inbox Infotech Logo */}
        <NavLink to="/" className="block px-2 py-1 group" onClick={onMobileClose}>
          <InboxLogo size="md" showText={true} showSubtitle={true} />
        </NavLink>

        {/* Current Role Badge & Permitted Filter */}
        <div className="px-2 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Role:</span>
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 truncate">
              {currentUser.role}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setFilterPermittedOnly(prev => !prev)}
            className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition ${
              filterPermittedOnly 
                ? 'bg-blue-600 text-white font-semibold' 
                : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
            title="Toggle: Show only pages permitted for your role"
          >
            {filterPermittedOnly ? 'Permitted Only' : 'All Views'}
          </button>
        </div>

        {/* Primary Views */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Workspace</span>
          </div>
          <nav className="space-y-0.5">
            {(!filterPermittedOnly || canAccess('dashboard')) && (
              <NavLink to="/" end className={getNavLinkClass('dashboard')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <LayoutDashboard size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Dashboard</span>
                </div>
                {!canAccess('dashboard') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('issues')) && (
              <NavLink to="/issues" className={getNavLinkClass('issues')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <Ticket size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Issues &amp; Tickets</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!canAccess('issues') && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      <Lock size={10} />
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">
                    {issues.length}
                  </span>
                </div>
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('board')) && (
              <NavLink to="/board" className={getNavLinkClass('board')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <KanbanSquare size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Kanban Board</span>
                </div>
                {!canAccess('board') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('backlog')) && (
              <NavLink to="/backlog" className={getNavLinkClass('backlog')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <ListOrdered size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Backlog &amp; Sprints</span>
                </div>
                {!canAccess('backlog') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('backlog')) && (
              <NavLink to="/epics" className={getNavLinkClass('backlog')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <Zap size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Epics &amp; Roadmap</span>
                </div>
                {!canAccess('backlog') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('projects')) && (
              <NavLink to="/projects" className={getNavLinkClass('projects')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <Layers size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Projects</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {!canAccess('projects') && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      <Lock size={10} />
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">
                    {projects.length}
                  </span>
                </div>
              </NavLink>
            )}
          </nav>
        </div>

        {/* Support Escalation Queues (L1, L2, L3) */}
        {(!filterPermittedOnly || canAccess('support')) && (
          <div>
            <button
              onClick={() => setSupportQueuesOpen(p => !p)}
              className="w-full flex items-center justify-between px-2 pb-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider hover:text-zinc-600 dark:hover:text-zinc-300 transition"
            >
              <div className="flex items-center gap-1.5">
                <span>Support Queues</span>
                {!canAccess('support') && <Lock size={10} className="text-zinc-400" />}
              </div>
              {supportQueuesOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>

            {supportQueuesOpen && (
              <nav className="space-y-0.5 mt-0.5">
                <NavLink to="/support" end className={getNavLinkClass('support')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert size={16} className="text-zinc-400 group-hover:text-blue-600" />
                    <span>Support Center</span>
                  </div>
                  {!canAccess('support') && (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      <Lock size={10} />
                    </span>
                  )}
                </NavLink>

                <NavLink to="/support?level=L1" className={getNavLinkClass('support')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <span>L1 Frontline Queue</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 rounded font-semibold">
                    {l1Count}
                  </span>
                </NavLink>

                <NavLink to="/support?level=L2" className={getNavLinkClass('support')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>L2 Technical Queue</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded font-semibold">
                    {l2Count}
                  </span>
                </NavLink>

                <NavLink to="/support?level=L3" className={getNavLinkClass('support')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <span>L3 Engineering Queue</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded font-semibold">
                    {l3Count}
                  </span>
                </NavLink>

                <NavLink to="/support?filter=escalated" className={getNavLinkClass('support')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle size={15} className="text-amber-500" />
                    <span>Escalated Issues</span>
                  </div>
                  {escalatedCount > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-500 text-white rounded font-semibold">
                      {escalatedCount}
                    </span>
                  )}
                </NavLink>

                <NavLink to="/issues?assignee=me" className={getNavLinkClass('issues')} onClick={onMobileClose}>
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-blue-500" />
                    <span>Assigned to Me</span>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded font-semibold">
                    {myIssuesCount}
                  </span>
                </NavLink>
              </nav>
            )}
          </div>
        )}

        {/* Management & Analytics */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
            Insights &amp; Governance
          </div>
          <nav className="space-y-0.5">
            {(!filterPermittedOnly || canAccess('reports')) && (
              <NavLink to="/reports" className={getNavLinkClass('reports')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <BarChart3 size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Reports &amp; SLA</span>
                </div>
                {!canAccess('reports') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('team')) && (
              <NavLink to="/team" className={getNavLinkClass('team')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <Users2 size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Team &amp; Roles</span>
                </div>
                {!canAccess('team') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('admin')) && (
              <NavLink to="/admin" className={getNavLinkClass('admin')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <Shield size={16} className={canAccess('admin') ? "text-blue-500 group-hover:text-blue-600" : "text-zinc-400"} />
                  <span className={canAccess('admin') ? "font-semibold text-blue-600 dark:text-blue-400" : ""}>
                    Admin Panel
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {!canAccess('admin') ? (
                    <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                      <Lock size={10} />
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded uppercase">
                      Auth
                    </span>
                  )}
                </div>
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('settings')) && (
              <NavLink to="/settings" className={getNavLinkClass('settings')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <SettingsIcon size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span>Settings &amp; SLA Rules</span>
                </div>
                {!canAccess('settings') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}

            {(!filterPermittedOnly || canAccess('docs')) && (
              <NavLink to="/docs" className={getNavLinkClass('docs')} onClick={onMobileClose}>
                <div className="flex items-center gap-2.5">
                  <BookOpen size={16} className="text-zinc-400 group-hover:text-blue-600" />
                  <span className="flex items-center gap-1.5">
                    <span>Documentation</span>
                    <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded">
                      Guide
                    </span>
                  </span>
                </div>
                {!canAccess('docs') && (
                  <span className="flex items-center gap-1 text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                    <Lock size={10} />
                  </span>
                )}
              </NavLink>
            )}
          </nav>
        </div>
      </div>

      {/* Active User Quick Card */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                {currentUser.name}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                  {currentUser.role}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                  {currentUser.supportLevels.join('/')}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 transition"
            title="Sign Out Session"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 z-30">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onMobileClose}
          />
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
