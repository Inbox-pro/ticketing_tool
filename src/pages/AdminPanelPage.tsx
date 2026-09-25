import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, SupportLevel, UserRole } from '../types';
import { 
  Shield, 
  Users, 
  KeyRound, 
  Clock, 
  Activity, 
  Plus, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  AlertTriangle, 
  Save, 
  Download, 
  Upload, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Lock, 
  Building, 
  Layers, 
  UserCheck, 
  ShieldAlert,
  Server,
  ShieldCheck,
  CheckSquare,
  Square,
  Filter,
  Search,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Info
} from 'lucide-react';
import { exportAllDataAsJSON, importDataFromJSON, resetAllDataToSeed } from '../services/storage';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { InboxLogo } from '../components/common/InboxLogo';
import { 
  AppPageId, 
  ALL_ROLES, 
  PAGE_DEFINITIONS, 
  DEFAULT_ROLE_PAGE_ACCESS 
} from '../services/rbac';

export const AdminPanelPage: React.FC = () => {
  const { 
    users, 
    currentUser, 
    addUser, 
    updateUser, 
    deleteUser, 
    updateUserPassword, 
    settings, 
    updateSettings, 
    issues, 
    projects, 
    sprints, 
    activity, 
    addToast 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'sla' | 'audit' | 'system'>('users');

  // Role Permissions (RBAC) state
  const [rolePermissions, setRolePermissions] = useState<Record<AppPageId, UserRole[]>>(() => {
    return (settings.rolePageAccess as Record<AppPageId, UserRole[]>) || { ...DEFAULT_ROLE_PAGE_ACCESS };
  });
  const [selectedRoleForInspector, setSelectedRoleForInspector] = useState<UserRole>('Support Agent');
  const [permissionViewMode, setPermissionViewMode] = useState<'matrix' | 'inspector'>('matrix');
  const [searchPageTerm, setSearchPageTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('Support Agent');

  const handleTogglePermission = (pageId: AppPageId, role: UserRole) => {
    if (role === 'Admin') {
      addToast('Protected Role', 'Administrator role always has access to all pages.', 'info');
      return;
    }
    setRolePermissions(prev => {
      const currentList = prev[pageId] || DEFAULT_ROLE_PAGE_ACCESS[pageId] || [];
      const hasAccess = currentList.includes(role);
      const nextList = hasAccess
        ? currentList.filter(r => r !== role)
        : [...currentList, role];
      return {
        ...prev,
        [pageId]: nextList,
      };
    });
  };

  const handleGrantAllForRole = (role: UserRole) => {
    if (role === 'Admin') return;
    setRolePermissions(prev => {
      const next = { ...prev };
      PAGE_DEFINITIONS.forEach(p => {
        const cur = next[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || [];
        if (!cur.includes(role)) {
          next[p.id] = [...cur, role];
        }
      });
      return next;
    });
    addToast('Permissions Updated', `All pages granted to ${role}. Remember to click Save.`, 'info');
  };

  const handleRevokeAllForRole = (role: UserRole) => {
    if (role === 'Admin') {
      addToast('Protected Role', 'Admin role permissions cannot be revoked.', 'error');
      return;
    }
    setRolePermissions(prev => {
      const next = { ...prev };
      PAGE_DEFINITIONS.forEach(p => {
        const cur = next[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || [];
        next[p.id] = cur.filter(r => r !== role);
      });
      return next;
    });
    addToast('Permissions Updated', `All optional pages revoked from ${role}. Remember to click Save.`, 'info');
  };

  const handleSaveRolePermissions = () => {
    updateSettings({
      rolePageAccess: rolePermissions,
    });
    addToast('Permissions Saved', 'Enterprise Role-Based Access Control matrix successfully updated.', 'success');
  };

  const handleResetRolePermissions = () => {
    setRolePermissions({ ...DEFAULT_ROLE_PAGE_ACCESS });
    updateSettings({
      rolePageAccess: { ...DEFAULT_ROLE_PAGE_ACCESS },
    });
    addToast('Permissions Reset', 'Role permissions restored to default standard.', 'info');
  };

  // Password editing state
  const [editingPasswordUserId, setEditingPasswordUserId] = useState<string | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [showUserPasswords, setShowUserPasswords] = useState<{ [userId: string]: boolean }>({});

  // User edit / add modal state
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole>('Support Agent');
  const [userDept, setUserDept] = useState<string>('Customer Support');
  const [userPassword, setUserPassword] = useState<string>('welcome123');
  const [userSupportLevels, setUserSupportLevels] = useState<SupportLevel[]>(['L1']);

  // SLA state
  const [l1Resp, setL1Resp] = useState<number>(settings.slaSettings?.l1ResponseHours ?? 4);
  const [l1Reso, setL1Reso] = useState<number>(settings.slaSettings?.l1ResolutionHours ?? 24);
  const [l2Resp, setL2Resp] = useState<number>(settings.slaSettings?.l2ResponseHours ?? 2);
  const [l2Reso, setL2Reso] = useState<number>(settings.slaSettings?.l2ResolutionHours ?? 12);
  const [l3Resp, setL3Resp] = useState<number>(settings.slaSettings?.l3ResponseHours ?? 1);
  const [l3Reso, setL3Reso] = useState<number>(settings.slaSettings?.l3ResolutionHours ?? 6);
  const [warningThreshold, setWarningThreshold] = useState<number>(settings.slaSettings?.warningThresholdPercent ?? 75);

  // Confirm delete modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState<boolean>(false);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = (userId: string) => {
    setShowUserPasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleSavePassword = (userId: string) => {
    if (!newPasswordInput.trim() || newPasswordInput.trim().length < 4) {
      addToast('Error', 'Password must be at least 4 characters long.', 'error');
      return;
    }
    const success = updateUserPassword(userId, newPasswordInput.trim());
    if (success) {
      setEditingPasswordUserId(null);
      setNewPasswordInput('');
    }
  };

  const handleOpenAddUser = () => {
    setEditingUser(null);
    setUserName('');
    setUserEmail('');
    setUserRole('Support Agent');
    setUserDept('Customer Support');
    setUserPassword('welcome123');
    setUserSupportLevels(['L1']);
    setIsAddUserModalOpen(true);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setUserName(u.name);
    setUserEmail(u.email);
    setUserRole(u.role);
    setUserDept(u.department);
    setUserPassword(u.password || 'password123');
    setUserSupportLevels([...u.supportLevels]);
    setIsAddUserModalOpen(true);
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !userEmail.trim()) {
      addToast('Validation', 'Name and Email are required.', 'error');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        department: userDept.trim(),
        password: userPassword.trim() || editingUser.password || 'password123',
        supportLevels: userSupportLevels,
      });
      addToast('User Updated', `${userName} profile updated.`, 'success');
    } else {
      addUser({
        name: userName.trim(),
        email: userEmail.trim(),
        role: userRole,
        department: userDept.trim(),
        password: userPassword.trim() || 'welcome123',
        supportLevels: userSupportLevels,
        avatar: `https://images.unsplash.com/photo-${1534528741775 + users.length}?w=150&auto=format&fit=crop&q=80`,
        timezone: 'UTC+05:30 (IST)',
        status: 'Active',
      });
    }

    setIsAddUserModalOpen(false);
  };

  const handleToggleSupportLevel = (lvl: SupportLevel) => {
    setUserSupportLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const handleSaveSLA = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      slaSettings: {
        l1ResponseHours: Number(l1Resp),
        l1ResolutionHours: Number(l1Reso),
        l2ResponseHours: Number(l2Resp),
        l2ResolutionHours: Number(l2Reso),
        l3ResponseHours: Number(l3Resp),
        l3ResolutionHours: Number(l3Reso),
        warningThresholdHours: Math.max(1, Math.round(Number(l1Resp) * (Number(warningThreshold) / 100))),
        warningThresholdPercent: Number(warningThreshold),
      }
    });
    addToast('SLA Rules Saved', 'System-wide SLA escalation policies updated.', 'success');
  };

  const handleExport = () => {
    const jsonStr = exportAllDataAsJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inbox-admin-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Export Successful', 'Database JSON backup downloaded.', 'success');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      const success = importDataFromJSON(content);
      if (success) {
        window.location.reload();
      } else {
        addToast('Import Failed', 'Invalid JSON backup format.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    resetAllDataToSeed();
    window.location.reload();
  };

  // Metrics
  const totalIssues = issues.length;
  const breachedIssues = issues.filter(i => {
    const created = new Date(i.createdDate).getTime();
    const limit = (i.resolutionSLAHours || 24) * 3600 * 1000;
    return !i.resolvedAt && Date.now() - created > limit;
  }).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
            <Shield size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Admin Panel &amp; Governance
              </h1>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white uppercase tracking-wider">
                Root Admin
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Organization credentials, member passwords, SLA rules matrix, and database snapshots for Inbox Infotech Pvt. Ltd.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="text-xs text-zinc-500 dark:text-zinc-400">Acting Admin:</span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-700">
            {currentUser.name}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-px overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'users'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Users size={15} />
          <span>User &amp; Passwords ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('permissions')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <ShieldCheck size={15} />
          <span>Role Page Access (RBAC)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('sla')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'sla'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Clock size={15} />
          <span>SLA Policies &amp; Tiers</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'audit'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Activity size={15} />
          <span>System Audit Log ({activity.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition whitespace-nowrap ${
            activeTab === 'system'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          <Server size={15} />
          <span>Database &amp; Snapshots</span>
        </button>
      </div>

      {/* TAB 1: USERS & PASSWORDS */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                Workspace Accounts &amp; Access Keys
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Manage user accounts, assign support tiers (L1/L2/L3), and reset passwords.
              </p>
            </div>
            <button
              type="button"
              onClick={handleOpenAddUser}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus size={14} />
              <span>Add Team Member</span>
            </button>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-200 dark:border-zinc-800 text-[10px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role &amp; Department</th>
                    <th className="py-3 px-4">Support Tiers</th>
                    <th className="py-3 px-4">Account Password</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {users.map(u => {
                    const isEditingPass = editingPasswordUserId === u.id;
                    const isVisible = !!showUserPasswords[u.id];

                    return (
                      <tr key={u.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 transition">
                        {/* Avatar & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-200 dark:border-zinc-700"
                            />
                            <div>
                              <p className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name}</p>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <span className="font-semibold text-zinc-800 dark:text-zinc-200">{u.role}</span>
                            <p className="text-[11px] text-zinc-400">{u.department}</p>
                          </div>
                        </td>

                        {/* Support Tiers */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1 flex-wrap">
                            {u.supportLevels.map(lvl => (
                              <span
                                key={lvl}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                                  lvl === 'L1'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400'
                                    : lvl === 'L2'
                                    ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400'
                                    : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400'
                                }`}
                              >
                                {lvl}
                              </span>
                            ))}
                          </div>
                        </td>

                        {/* Password Management Column */}
                        <td className="py-3 px-4">
                          {isEditingPass ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={newPasswordInput}
                                onChange={e => setNewPasswordInput(e.target.value)}
                                placeholder="New password"
                                className="w-28 text-xs px-2 py-1 rounded border border-blue-500 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSavePassword(u.id)}
                                className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                                title="Save Password"
                              >
                                <Check size={13} />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasswordUserId(null);
                                  setNewPasswordInput('');
                                }}
                                className="p-1 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-300"
                                title="Cancel"
                              >
                                <X size={13} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                {isVisible ? (u.password || 'password123') : '••••••••'}
                              </span>
                              <button
                                type="button"
                                onClick={() => togglePasswordVisibility(u.id)}
                                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                title={isVisible ? 'Hide Password' : 'Show Password'}
                              >
                                {isVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingPasswordUserId(u.id);
                                  setNewPasswordInput(u.password || 'password123');
                                }}
                                className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] flex items-center gap-0.5 ml-1"
                              >
                                <KeyRound size={11} />
                                <span>Reset</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                                : u.status === 'Away'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Active' ? 'bg-emerald-500' : u.status === 'Away' ? 'bg-amber-500' : 'bg-zinc-400'
                            }`} />
                            {u.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditUser(u)}
                              className="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
                              title="Edit Member"
                            >
                              <Edit2 size={14} />
                            </button>
                            {users.length > 1 && (
                              <button
                                type="button"
                                onClick={() => setUserToDelete(u)}
                                className="p-1.5 rounded-md hover:bg-rose-50 dark:hover:bg-rose-950/50 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 transition"
                                title="Remove Member"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ROLE PAGE ACCESS (RBAC) */}
      {activeTab === 'permissions' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Header & Primary Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" size={18} />
                  <span>Role-Based Page Access Control (RBAC)</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                  Live Enforced
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                Configure which enterprise roles are permitted to access each application view. When a page is revoked for a role, users with that role will see the Access Denied guard and sidebar indicators will reflect restricted access.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleResetRolePermissions}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition"
                title="Restore default enterprise permissions"
              >
                <RefreshCw size={13} />
                <span>Restore Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleSaveRolePermissions}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Save size={14} />
                <span>Save Permissions Matrix</span>
              </button>
            </div>
          </div>

          {/* Controls: Search, Category Filter, and View Mode */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/70 dark:border-zinc-800">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search pages, routes, or categories..."
                  value={searchPageTerm}
                  onChange={e => setSearchPageTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-zinc-900 text-xs">
                {(['All', 'Workspace', 'Support & SLA', 'Management', 'General'] as const).map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition whitespace-nowrap ${
                      selectedCategoryFilter === cat
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1 border border-zinc-200 dark:border-zinc-700 rounded-lg p-0.5 bg-white dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setPermissionViewMode('matrix')}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                    permissionViewMode === 'matrix'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Matrix Grid
                </button>
                <button
                  type="button"
                  onClick={() => setPermissionViewMode('inspector')}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition ${
                    permissionViewMode === 'inspector'
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  Role Inspector
                </button>
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: MATRIX GRID TABLE */}
          {permissionViewMode === 'matrix' && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/75 dark:bg-zinc-900/50">
                      <th className="py-3 px-4 font-semibold text-zinc-700 dark:text-zinc-300 min-w-[220px]">
                        Page / Route Module
                      </th>
                      {ALL_ROLES.map(role => (
                        <th 
                          key={role} 
                          className="py-3 px-2 font-semibold text-zinc-700 dark:text-zinc-300 text-center min-w-[100px]"
                        >
                          <div className="flex flex-col items-center gap-1">
                            <span className="truncate max-w-[95px] text-[11px]">{role}</span>
                            {role === 'Admin' ? (
                              <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 font-mono">
                                ROOT
                              </span>
                            ) : (
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleGrantAllForRole(role)}
                                  className="text-[9px] text-blue-600 dark:text-blue-400 hover:underline"
                                  title={`Grant all pages to ${role}`}
                                >
                                  All
                                </button>
                                <span className="text-zinc-300 dark:text-zinc-700">/</span>
                                <button
                                  type="button"
                                  onClick={() => handleRevokeAllForRole(role)}
                                  className="text-[9px] text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:underline"
                                  title={`Revoke all optional pages from ${role}`}
                                >
                                  None
                                </button>
                              </div>
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                    {PAGE_DEFINITIONS
                      .filter(page => {
                        const matchesCategory = selectedCategoryFilter === 'All' || page.category === selectedCategoryFilter;
                        const matchesSearch = 
                          page.label.toLowerCase().includes(searchPageTerm.toLowerCase()) ||
                          page.path.toLowerCase().includes(searchPageTerm.toLowerCase()) ||
                          page.description.toLowerCase().includes(searchPageTerm.toLowerCase());
                        return matchesCategory && matchesSearch;
                      })
                      .map(page => {
                        const allowedRoles = rolePermissions[page.id] || DEFAULT_ROLE_PAGE_ACCESS[page.id] || [];

                        return (
                          <tr 
                            key={page.id} 
                            className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs">
                                    {page.label}
                                  </span>
                                  <span className="text-[10px] font-mono text-zinc-400">
                                    {page.path}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-medium px-1.5 py-0.2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded">
                                    {page.category}
                                  </span>
                                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-sm">
                                    {page.description}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {ALL_ROLES.map(role => {
                              const isAllowed = role === 'Admin' || allowedRoles.includes(role);
                              const isLockedAdmin = role === 'Admin';

                              return (
                                <td key={role} className="py-3 px-2 text-center">
                                  <button
                                    type="button"
                                    disabled={isLockedAdmin}
                                    onClick={() => handleTogglePermission(page.id, role)}
                                    title={
                                      isLockedAdmin
                                        ? 'Administrator role has mandatory full access.'
                                        : `${isAllowed ? 'Revoke' : 'Grant'} access to ${page.label} for ${role}`
                                    }
                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border transition ${
                                      isLockedAdmin
                                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900 text-blue-600 dark:text-blue-400 cursor-not-allowed'
                                        : isAllowed
                                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50'
                                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 hover:border-zinc-300 dark:hover:border-zinc-700'
                                    }`}
                                  >
                                    {isLockedAdmin ? (
                                      <Lock size={13} />
                                    ) : isAllowed ? (
                                      <Check size={14} className="stroke-[2.5]" />
                                    ) : (
                                      <X size={12} className="opacity-40" />
                                    )}
                                  </button>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: ROLE INSPECTOR */}
          {permissionViewMode === 'inspector' && (
            <div className="space-y-4">
              {/* Role Select Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {ALL_ROLES.map(role => {
                  const isSelected = selectedRoleForInspector === role;
                  const roleMembers = users.filter(u => u.role === role);
                  const allowedPagesCount = PAGE_DEFINITIONS.filter(p => {
                    if (role === 'Admin') return true;
                    const allowed = rolePermissions[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || [];
                    return allowed.includes(role);
                  }).length;

                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRoleForInspector(role)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-850'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-900 dark:text-zinc-100'}`}>
                          {role}
                        </span>
                        {role === 'Admin' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded font-semibold">
                            ROOT
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-zinc-500 dark:text-zinc-400">
                        <span>{roleMembers.length} member{roleMembers.length !== 1 ? 's' : ''}</span>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                          {allowedPagesCount}/{PAGE_DEFINITIONS.length} Pages
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Inspector Detail Card */}
              <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                        Configuring Permissions for: <span className="text-blue-600 dark:text-blue-400">{selectedRoleForInspector}</span>
                      </h3>
                      {selectedRoleForInspector === 'Admin' && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-full">
                          Super Administrator (Full System Bypass)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Toggle specific page access for users holding the {selectedRoleForInspector} role.
                    </p>
                  </div>

                  {selectedRoleForInspector !== 'Admin' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleGrantAllForRole(selectedRoleForInspector)}
                        className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium transition"
                      >
                        Grant All Pages
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeAllForRole(selectedRoleForInspector)}
                        className="px-2.5 py-1 text-xs rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-rose-600 dark:text-rose-400 font-medium transition"
                      >
                        Revoke All Pages
                      </button>
                    </div>
                  )}
                </div>

                {/* Page list for selected role */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAGE_DEFINITIONS
                    .filter(page => {
                      const matchesCategory = selectedCategoryFilter === 'All' || page.category === selectedCategoryFilter;
                      const matchesSearch = 
                        page.label.toLowerCase().includes(searchPageTerm.toLowerCase()) ||
                        page.path.toLowerCase().includes(searchPageTerm.toLowerCase()) ||
                        page.description.toLowerCase().includes(searchPageTerm.toLowerCase());
                      return matchesCategory && matchesSearch;
                    })
                    .map(page => {
                      const isAllowed = selectedRoleForInspector === 'Admin' || 
                        (rolePermissions[page.id] || DEFAULT_ROLE_PAGE_ACCESS[page.id] || []).includes(selectedRoleForInspector);
                      const isLockedAdmin = selectedRoleForInspector === 'Admin';

                      return (
                        <div
                          key={page.id}
                          className={`p-3 rounded-lg border transition flex items-start justify-between gap-3 ${
                            isAllowed
                              ? 'bg-zinc-50/50 dark:bg-zinc-850/50 border-zinc-200 dark:border-zinc-750'
                              : 'bg-zinc-100/40 dark:bg-zinc-900/40 border-zinc-200/60 dark:border-zinc-800/60 opacity-60'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                                {page.label}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-400">
                                {page.path}
                              </span>
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                                {page.category}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                              {page.description}
                            </p>
                          </div>

                          <button
                            type="button"
                            disabled={isLockedAdmin}
                            onClick={() => handleTogglePermission(page.id, selectedRoleForInspector)}
                            className={`shrink-0 w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                              isLockedAdmin
                                ? 'bg-blue-600 cursor-not-allowed'
                                : isAllowed
                                ? 'bg-emerald-600 hover:bg-emerald-500'
                                : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400'
                            }`}
                            title={isLockedAdmin ? 'Admin has permanent access' : isAllowed ? 'Enabled' : 'Disabled'}
                          >
                            <span 
                              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                                isAllowed ? 'translate-x-5' : 'translate-x-0'
                              }`} 
                            />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* SIMULATOR: LIVE ROLE ACCESS CHECKER */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 dark:from-blue-950/20 dark:via-indigo-950/15 dark:to-purple-950/20 border border-blue-200/60 dark:border-blue-900/40 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-600 text-white shadow-xs">
                  <Sliders size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                    Live Role Experience Simulator
                  </h3>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Preview authorized vs. restricted pages for any role in real time.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">Simulate As:</span>
                <select
                  value={simulatedRole}
                  onChange={e => setSimulatedRole(e.target.value as UserRole)}
                  className="text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 px-3 py-1.5 shadow-xs focus:ring-1 focus:ring-blue-500"
                >
                  {ALL_ROLES.map(r => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Allowed pages */}
              <div className="p-3.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={14} />
                    <span>Accessible Pages</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                    {PAGE_DEFINITIONS.filter(p => simulatedRole === 'Admin' || (rolePermissions[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || []).includes(simulatedRole)).length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {PAGE_DEFINITIONS
                    .filter(p => simulatedRole === 'Admin' || (rolePermissions[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || []).includes(simulatedRole))
                    .map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-medium text-emerald-800 dark:text-emerald-300"
                      >
                        <Check size={10} className="stroke-[3]" />
                        <span>{p.label}</span>
                      </span>
                    ))}
                </div>
              </div>

              {/* Denied pages */}
              <div className="p-3.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-rose-200/60 dark:border-rose-900/40">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <Lock size={13} />
                    <span>Restricted Pages (Access Denied Guard)</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold">
                    {PAGE_DEFINITIONS.filter(p => simulatedRole !== 'Admin' && !(rolePermissions[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || []).includes(simulatedRole)).length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {PAGE_DEFINITIONS
                    .filter(p => simulatedRole !== 'Admin' && !(rolePermissions[p.id] || DEFAULT_ROLE_PAGE_ACCESS[p.id] || []).includes(simulatedRole))
                    .map(p => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] font-medium text-rose-800 dark:text-rose-300"
                      >
                        <Lock size={10} />
                        <span>{p.label}</span>
                      </span>
                    ))}
                  {simulatedRole === 'Admin' && (
                    <span className="text-xs text-zinc-400 italic">
                      None. Administrator has full unrestricted access to all pages.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SLA POLICIES */}
      {activeTab === 'sla' && (
        <form onSubmit={handleSaveSLA} className="space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                SLA Tier Policies &amp; Target Thresholds
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Configure maximum allowable response and resolution hours per escalation tier.
              </p>
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Save size={14} />
              <span>Save SLA Matrix</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* L1 Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Level 1 — Helpdesk
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 font-bold">L1</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Intake, basic troubleshooting, user access requests, password resets.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Response Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={l1Resp}
                    onChange={e => setL1Resp(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Resolution Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={l1Reso}
                    onChange={e => setL1Reso(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* L2 Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  Level 2 — Technical
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-50 dark:bg-purple-950 text-purple-600 font-bold">L2</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Log analysis, DB indexing, API error debugging, reproducible bugs.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Response Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={l2Resp}
                    onChange={e => setL2Resp(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Resolution Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={l2Reso}
                    onChange={e => setL2Reso(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>

            {/* L3 Card */}
            <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Level 3 — Engineering
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950 text-rose-600 font-bold">L3</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Core code patches, schema migrations, security hotfixes, root cause.
              </p>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Response Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={l3Resp}
                    onChange={e => setL3Resp(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Resolution Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="200"
                    value={l3Reso}
                    onChange={e => setL3Reso(Number(e.target.value))}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                "At Risk" SLA Warning Threshold: {warningThreshold}%
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Tickets transition from "Within SLA" (Green) to "At Risk" (Amber) when elapsed time exceeds this percentage.
              </p>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={warningThreshold}
              onChange={e => setWarningThreshold(Number(e.target.value))}
              className="w-48 accent-blue-600"
            />
          </div>
        </form>
      )}

      {/* TAB 3: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4 animate-fadeIn">
          <div>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Workspace Activity &amp; Audit Trail
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Immutable chronological record of administrative actions, user logins, and ticket escalations.
            </p>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              <span>Event Stream ({activity.length} Recorded)</span>
              <span className="text-[11px] text-zinc-400">Chronological</span>
            </div>
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-96 overflow-y-auto">
              {activity.slice(0, 30).map(act => {
                const actor = users.find(u => u.id === act.userId);
                return (
                  <div key={act.id} className="p-3.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-850/40 flex items-start justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {actor ? actor.name.slice(0, 2).toUpperCase() : 'SYS'}
                      </div>
                      <div>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {actor?.name || 'System Actor'}{' '}
                          <span className="font-normal text-zinc-600 dark:text-zinc-400">{act.action}</span>
                        </p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{act.details}</p>
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & SNAPSHOTS */}
      {activeTab === 'system' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
              Database Snapshots &amp; Storage Maintenance
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Offline JSON backup portability, schema migration, and factory reset controls.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Tickets</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{totalIssues}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Active Sprints</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{sprints.filter(s => s.status === 'active').length}</p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Breached SLA</span>
              <p className={`text-2xl font-bold mt-1 ${breachedIssues > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {breachedIssues}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Team Accounts</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{users.length}</p>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Backup Export &amp; Import
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Download size={14} />
                <span>Export JSON Database</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition"
              >
                <Upload size={14} />
                <span>Import JSON Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 text-xs font-semibold transition ml-auto"
              >
                <RotateCcw size={14} />
                <span>Reset to Seed Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT USER MODAL */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-500" />
                <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {editingUser ? 'Edit Member Profile' : 'Create New Team Member'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveUserForm} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  placeholder="e.g. Anand Varma"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Work Email
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                  placeholder="anand@inbox.enterprise.io"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Role
                  </label>
                  <select
                    value={userRole}
                    onChange={e => setUserRole(e.target.value as UserRole)}
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 p-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Admin">Admin</option>
                    <option value="Support Agent">Support Agent</option>
                    <option value="Technical">Technical</option>
                    <option value="Engineer">Engineer</option>
                    <option value="QA">QA</option>
                    <option value="Project Manager">Project Manager</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={userDept}
                    onChange={e => setUserDept(e.target.value)}
                    placeholder="Customer Support"
                    className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Account Password
                </label>
                <input
                  type="text"
                  value={userPassword}
                  onChange={e => setUserPassword(e.target.value)}
                  placeholder="Set account password"
                  className="w-full font-mono rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Support Tiers Authorized
                </label>
                <div className="flex items-center gap-2">
                  {(['L1', 'L2', 'L3'] as SupportLevel[]).map(lvl => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleToggleSupportLevel(lvl)}
                      className={`flex-1 py-1.5 rounded-md border text-xs font-semibold font-mono transition ${
                        userSupportLevels.includes(lvl)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingUser ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION */}
      {userToDelete && (
        <ConfirmModal
          isOpen={true}
          title="Remove Member Account"
          message={`Are you sure you want to permanently remove ${userToDelete.name} from Inbox Gold mine?`}
          confirmLabel="Remove User"
          isDestructive={true}
          onConfirm={() => {
            deleteUser(userToDelete.id);
            setUserToDelete(null);
          }}
          onCancel={() => setUserToDelete(null)}
        />
      )}

      {/* RESET CONFIRMATION */}
      {isResetConfirmOpen && (
        <ConfirmModal
          isOpen={true}
          title="Reset Workspace to Factory Seed"
          message="This will overwrite all current issues, custom members, and settings with original seed data. Continue?"
          confirmLabel="Reset Everything"
          isDestructive={true}
          onConfirm={handleResetData}
          onCancel={() => setIsResetConfirmOpen(false)}
        />
      )}
    </div>
  );
};
