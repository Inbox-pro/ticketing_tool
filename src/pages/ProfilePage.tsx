import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User as UserIcon, 
  Mail, 
  Shield, 
  Check, 
  Save, 
  Layers, 
  CheckCircle2, 
  Clock, 
  AlertTriangle 
} from 'lucide-react';
import { SupportLevel } from '../types';
import { SupportBadge } from '../components/common/SupportBadge';
import { calculateSLAInfo } from '../services/storage';

export const ProfilePage: React.FC = () => {
  const { currentUser, setCurrentUser, updateUser, issues, addToast } = useApp();

  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [role, setRole] = useState(currentUser.role);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [supportLevels, setSupportLevels] = useState<SupportLevel[]>(currentUser.supportLevels);

  const userIssues = issues.filter(i => i.assigneeId === currentUser.id);
  const resolvedIssues = userIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed');
  const activeIssues = userIssues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed');

  const breachedAssigned = activeIssues.filter(i => calculateSLAInfo(i).status === 'Breached').length;

  const toggleLevel = (lvl: SupportLevel) => {
    if (supportLevels.includes(lvl)) {
      if (supportLevels.length > 1) {
        setSupportLevels(supportLevels.filter(l => l !== lvl));
      }
    } else {
      setSupportLevels([...supportLevels, lvl]);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      role: role.trim(),
      avatar: avatar.trim(),
      supportLevels,
    });
    addToast('Profile Updated', 'Your user credentials and tier competencies were saved.', 'success');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          User Profile
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Manage your personal identity, authorized tier badges, and performance telemetry.
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500 shadow-sm"
            referrerPolicy="no-referrer"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">{currentUser.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                Active Session
              </span>
            </div>
            <p className="text-xs text-zinc-500">{currentUser.role}</p>
            <div className="flex items-center gap-1.5 mt-2">
              {currentUser.supportLevels.map(lvl => (
                <SupportBadge key={lvl} level={lvl} size="sm" />
              ))}
            </div>
          </div>
        </div>

        {/* Assigned Metrics */}
        <div className="flex items-center gap-4 pt-4 sm:pt-0 border-t sm:border-t-0 border-zinc-100 dark:border-zinc-800">
          <div className="text-center px-3">
            <span className="block text-xl font-bold text-zinc-900 dark:text-zinc-100">
              {activeIssues.length}
            </span>
            <span className="text-[11px] text-zinc-400">Open Tickets</span>
          </div>
          <div className="text-center px-3 border-l border-zinc-200 dark:border-zinc-800">
            <span className="block text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {resolvedIssues.length}
            </span>
            <span className="text-[11px] text-zinc-400">Resolved</span>
          </div>
          <div className="text-center px-3 border-l border-zinc-200 dark:border-zinc-800">
            <span className="block text-xl font-bold text-rose-600 dark:text-rose-400">
              {breachedAssigned}
            </span>
            <span className="text-[11px] text-zinc-400">Breached</span>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <h3 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider pb-2 border-b border-zinc-100 dark:border-zinc-800">
          Profile Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Avatar Image URL
            </label>
            <input
              type="url"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Assigned Support Tiers
          </label>
          <div className="flex items-center gap-2">
            {(['L1', 'L2', 'L3'] as SupportLevel[]).map(lvl => {
              const isSelected = supportLevels.includes(lvl);
              return (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => toggleLevel(lvl)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                      : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-zinc-200 dark:border-zinc-700'
                  }`}
                >
                  {isSelected && <Check size={12} />}
                  <span>{lvl} Support Tier</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <Save size={14} />
            <span>Update Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};
