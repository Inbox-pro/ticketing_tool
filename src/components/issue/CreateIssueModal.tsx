import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { IssueType, Priority, SupportLevel, IssueStatus } from '../../types';
import { X, Plus, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
  defaultSprintId?: string;
}

export const CreateIssueModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultProjectId,
  defaultSprintId,
}) => {
  const { projects, users, sprints, epics, currentUser, createIssue } = useApp();
  const navigate = useNavigate();

  const [projectId, setProjectId] = useState(defaultProjectId || projects[0]?.id || 'proj-1');
  const [type, setType] = useState<IssueType>('Task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [supportLevel, setSupportLevel] = useState<SupportLevel>('L1');
  const [status, setStatus] = useState<IssueStatus>('Open');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [reporterId, setReporterId] = useState<string>(currentUser.id);
  const [sprintId, setSprintId] = useState<string>(defaultSprintId || '');
  const [epicId, setEpicId] = useState<string>('');
  const [labelsText, setLabelsText] = useState('');
  const [storyPoints, setStoryPoints] = useState<string>('3');
  const [dueDate, setDueDate] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('4h');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const projectSprints = sprints.filter(s => s.projectId === projectId);
  const projectEpics = epics.filter(e => e.projectId === projectId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const labels = labelsText
      .split(',')
      .map(l => l.trim().toLowerCase())
      .filter(Boolean);

    const created = createIssue({
      title: title.trim(),
      description: description.trim(),
      type,
      status,
      priority,
      supportLevel,
      assigneeId: assigneeId || undefined,
      reporterId: reporterId || currentUser.id,
      projectId,
      sprintId: sprintId || undefined,
      epicId: epicId || undefined,
      labels,
      dueDate: dueDate || undefined,
      estimatedTime: estimatedTime || undefined,
      remainingTime: estimatedTime || undefined,
      storyPoints: storyPoints ? parseInt(storyPoints, 10) : undefined,
    });

    setIsSubmitting(false);
    onClose();
    // Reset fields
    setTitle('');
    setDescription('');
    setLabelsText('');
    navigate(`/issues/${created.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
                <Plus size={18} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Create New Issue
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Log a bug, feature task, or support ticket with SLA and support routing
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

          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Project & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Project <span className="text-rose-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={e => {
                    setProjectId(e.target.value);
                    setSprintId('');
                    setEpicId('');
                  }}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.key})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Issue Type <span className="text-rose-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as IssueType)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="Task">Task (Work item)</option>
                  <option value="Bug">Bug (Defect)</option>
                  <option value="Story">Story (Feature)</option>
                  <option value="Epic">Epic (Initiative)</option>
                  <option value="Sub-task">Sub-task (Detailed unit)</option>
                </select>
              </div>
            </div>

            {/* Summary */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Summary / Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Payment API returns 500 when completing checkout"
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Support Level & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Support Level <span className="text-rose-500">*</span>
                </label>
                <select
                  value={supportLevel}
                  onChange={e => setSupportLevel(e.target.value as SupportLevel)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="L1">L1 - First Level Support</option>
                  <option value="L2">L2 - Technical Support</option>
                  <option value="L3">L3 - Expert / Engineering Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Priority <span className="text-rose-500">*</span>
                </label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as Priority)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                  required
                >
                  <option value="Highest">Highest (P0 - Blocker)</option>
                  <option value="High">High (P1 - Urgent)</option>
                  <option value="Medium">Medium (P2 - Normal)</option>
                  <option value="Low">Low (P3 - Minor)</option>
                  <option value="Lowest">Lowest (P4 - Trivial)</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe customer impact, steps to reproduce, technical logs or expected behavior..."
                className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Assignee & Reporter */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={e => setAssigneeId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} — {u.role} ({u.supportLevels.join('/')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Reporter
                </label>
                <select
                  value={reporterId}
                  onChange={e => setReporterId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sprint & Epic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Sprint
                </label>
                <select
                  value={sprintId}
                  onChange={e => setSprintId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">Backlog (No Sprint)</option>
                  {projectSprints.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Epic
                </label>
                <select
                  value={epicId}
                  onChange={e => setEpicId(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="">None</option>
                  {projectEpics.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labels, Points, Time, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Labels (comma separated)
                </label>
                <input
                  type="text"
                  value={labelsText}
                  onChange={e => setLabelsText(e.target.value)}
                  placeholder="payment, api, critical"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Story Points
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={storyPoints}
                  onChange={e => setStoryPoints(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Est. Time
                </label>
                <input
                  type="text"
                  value={estimatedTime}
                  onChange={e => setEstimatedTime(e.target.value)}
                  placeholder="e.g. 4h"
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Due Date & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
                  Initial Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as IssueStatus)}
                  className="w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="In Review">In Review</option>
                  <option value="Testing">Testing</option>
                  <option value="Blocked">Blocked</option>
                </select>
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
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition shadow-xs disabled:opacity-50"
            >
              <Plus size={14} />
              <span>Create Issue</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
