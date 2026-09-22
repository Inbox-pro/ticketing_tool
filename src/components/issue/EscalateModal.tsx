import React, { useState, useEffect } from 'react';
import { Issue, SupportLevel } from '../../types';
import { useApp } from '../../context/AppContext';
import { SupportBadge } from '../common/SupportBadge';
import { ArrowUpRight, X, User as UserIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  issue: Issue;
  onClose: () => void;
}

export const EscalateModal: React.FC<Props> = ({ isOpen, issue, onClose }) => {
  const { users, escalateIssue } = useApp();

  const currentLevel = issue.supportLevel;
  const defaultTargetLevel: SupportLevel = currentLevel === 'L1' ? 'L2' : 'L3';

  const [toLevel, setToLevel] = useState<SupportLevel>(defaultTargetLevel);
  const [reason, setReason] = useState('');
  const [assigneeId, setAssigneeId] = useState<string>(issue.assigneeId || '');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      const nextLevel: SupportLevel = issue.supportLevel === 'L1' ? 'L2' : 'L3';
      setToLevel(nextLevel);
      setReason('');
      setAssigneeId(issue.assigneeId || '');
      setError('');
    }
  }, [isOpen, issue]);

  if (!isOpen) return null;

  // Filter available target levels
  const targetLevels: SupportLevel[] = currentLevel === 'L1' ? ['L2', 'L3'] : ['L3'];

  // Filter users matching target support level or engineers
  const eligibleUsers = users.filter(u => u.supportLevels.includes(toLevel) || u.role === 'Admin');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please provide a specific technical or investigative reason for escalation.');
      return;
    }
    escalateIssue(issue.id, toLevel, reason.trim(), assigneeId || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Escalate Ticket {issue.id}
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Route to advanced support tier for deep technical investigation
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-md transition"
            >
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Current Level Display */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Current Level:</span>
              <SupportBadge level={currentLevel} />
            </div>

            {/* Escalate To */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2">
                Escalate To:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {targetLevels.map(lvl => (
                  <label
                    key={lvl}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${
                      toLevel === lvl
                        ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                        : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="toLevel"
                      value={lvl}
                      checked={toLevel === lvl}
                      onChange={() => setToLevel(lvl)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <SupportBadge level={lvl} size="sm" showLabel={false} />
                        <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                          {lvl === 'L2' ? 'Technical Support' : 'Engineering Support'}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                        {lvl === 'L2' ? 'Deep technical diagnostics & logs' : 'Codebase defects & architecture fixes'}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Escalation Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={e => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
                placeholder="e.g. Basic troubleshooting verified authentication service throws 500 error on checkout webhook. Requires technical investigation into payload schema."
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
            </div>

            {/* Reassign To */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1.5">
                Assign to Tier Member (Optional):
              </label>
              <div className="relative">
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Keep current assignee ({users.find(u => u.id === issue.assigneeId)?.name || 'Unassigned'})</option>
                  <optgroup label={`Eligible ${toLevel} Team Members`}>
                    {eligibleUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role} ({u.supportLevels.join(', ')})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="All Workspace Members">
                    {users.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} — {u.role}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-zinc-400">
                  <UserIcon size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition shadow-xs"
            >
              <ArrowUpRight size={14} />
              <span>Escalate Ticket</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
