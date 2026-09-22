import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Play, 
  CheckCircle2, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight, 
  Trash2, 
  Calendar, 
  Layers,
  ArrowRight,
  ListOrdered
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TypeBadge } from '../components/common/TypeBadge';
import { Sprint, Issue } from '../types';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const BacklogPage: React.FC = () => {
  const { 
    sprints, 
    issues, 
    projects, 
    users, 
    createSprint, 
    startSprint, 
    completeSprint, 
    deleteSprint, 
    updateIssue 
  } = useApp();
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || 'proj-1');
  const [isCreateSprintOpen, setIsCreateSprintOpen] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStartDate, setNewSprintStartDate] = useState('');
  const [newSprintEndDate, setNewSprintEndDate] = useState('');

  // Complete Sprint Modal
  const [completingSprint, setCompletingSprint] = useState<Sprint | null>(null);
  const [targetSprintForIncomplete, setTargetSprintForIncomplete] = useState<string>('');

  // Delete sprint confirm
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);

  // Create issue modal
  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);
  const [createIssueSprintId, setCreateIssueSprintId] = useState<string | undefined>(undefined);

  const projectSprints = sprints.filter(s => s.projectId === selectedProjectId);
  const activeSprint = projectSprints.find(s => s.status === 'active');
  const plannedSprints = projectSprints.filter(s => s.status === 'future' || s.status === 'planned');
  const completedSprints = projectSprints.filter(s => s.status === 'completed');

  // Issues in backlog (no sprint assigned or not in active/planned sprint)
  const backlogIssues = issues.filter(
    i => i.projectId === selectedProjectId && (!i.sprintId || !projectSprints.some(s => s.id === i.sprintId))
  );

  const handleCreateSprint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSprintName.trim()) return;
    createSprint({
      projectId: selectedProjectId,
      name: newSprintName.trim(),
      goal: newSprintGoal.trim() || undefined,
      startDate: newSprintStartDate || new Date().toISOString().split('T')[0],
      endDate: newSprintEndDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString().split('T')[0],
      status: 'future',
    });
    setNewSprintName('');
    setNewSprintGoal('');
    setIsCreateSprintOpen(false);
  };

  const handleFinishCompleteSprint = () => {
    if (!completingSprint) return;
    completeSprint(completingSprint.id, targetSprintForIncomplete || undefined);
    setCompletingSprint(null);
  };

  // Move issue to sprint helper
  const handleMoveIssueToSprint = (issueId: string, sprintId?: string) => {
    updateIssue(issueId, { sprintId: sprintId || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Backlog &amp; Sprints
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              {projectSprints.length} Sprints
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Plan team iterations, allocate story points, and prioritize user stories for active sprints.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Project Switcher */}
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-3 py-2 font-medium focus:outline-none"
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.key})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateSprintOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Create Sprint</span>
          </button>
        </div>
      </div>

      {/* Sprints Section */}
      <div className="space-y-6">
        {/* Active Sprint Container */}
        {activeSprint ? (
          <div className="rounded-xl border-2 border-blue-500/40 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-5 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100 dark:border-blue-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{activeSprint.name}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                    Active Sprint
                  </span>
                </div>
                {activeSprint.goal && (
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 font-medium italic">
                    Goal: &ldquo;{activeSprint.goal}&rdquo;
                  </p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1.5">
                  <span>{new Date(activeSprint.startDate).toLocaleDateString()} – {new Date(activeSprint.endDate).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>
                    {issues.filter(i => i.sprintId === activeSprint.id).length} issues
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCreateIssueSprintId(activeSprint.id);
                    setIsCreateIssueOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition flex items-center gap-1"
                >
                  <Plus size={13} />
                  <span>Add Issue</span>
                </button>
                <button
                  onClick={() => setCompletingSprint(activeSprint)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
                >
                  <CheckCircle2 size={14} />
                  <span>Complete Sprint</span>
                </button>
              </div>
            </div>

            {/* Sprint Issues List */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 p-2 sm:p-3">
              {issues.filter(i => i.sprintId === activeSprint.id).map(issue => {
                const assignee = users.find(u => u.id === issue.assigneeId);
                return (
                  <div
                    key={issue.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 rounded-lg transition"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <TypeBadge type={issue.type} size="sm" showText={false} />
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                      >
                        {issue.id}
                      </button>
                      <span
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="text-xs font-medium text-zinc-900 dark:text-zinc-100 truncate cursor-pointer hover:text-blue-600"
                      >
                        {issue.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <SupportBadge level={issue.supportLevel} size="sm" showLabel={false} />
                      <PriorityBadge priority={issue.priority} size="sm" showText={false} />
                      <StatusBadge status={issue.status} size="sm" />
                      {issue.storyPoints !== undefined && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-bold">
                          {issue.storyPoints}p
                        </span>
                      )}
                      {assignee && (
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-5 h-5 rounded-full object-cover"
                          title={assignee.name}
                          referrerPolicy="no-referrer"
                        />
                      )}
                      <button
                        onClick={() => handleMoveIssueToSprint(issue.id, undefined)}
                        className="text-[11px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 px-1"
                        title="Move to Backlog"
                      >
                        Backlog ↓
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center bg-white dark:bg-zinc-900">
            <ListOrdered size={24} className="mx-auto text-zinc-400 mb-2" />
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">No Active Sprint</h3>
            <p className="text-xs text-zinc-500 mt-1">Start one of the planned sprints below to initiate active tracking.</p>
          </div>
        )}

        {/* Planned Sprints */}
        {plannedSprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const totalPoints = sprintIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <div key={sprint.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">{sprint.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      Planned
                    </span>
                  </div>
                  {sprint.goal && (
                    <p className="text-xs text-zinc-500 mt-1">Goal: {sprint.goal}</p>
                  )}
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                    <span>{sprint.startDate} to {sprint.endDate}</span>
                    <span>•</span>
                    <span>{sprintIssues.length} issues ({totalPoints} story points)</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setCreateIssueSprintId(sprint.id);
                      setIsCreateIssueOpen(true);
                    }}
                    className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    + Add Issue
                  </button>
                  <button
                    onClick={() => startSprint(sprint.id)}
                    className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
                  >
                    <Play size={12} />
                    <span>Start Sprint</span>
                  </button>
                  <button
                    onClick={() => setDeletingSprintId(sprint.id)}
                    className="p-1 text-zinc-400 hover:text-rose-600"
                    title="Delete Sprint"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Sprint Items */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 p-2">
                {sprintIssues.length === 0 ? (
                  <p className="p-4 text-center text-xs text-zinc-400 italic">
                    Sprint is empty. Drag or add issues from the Backlog below.
                  </p>
                ) : (
                  sprintIssues.map(issue => (
                    <div
                      key={issue.id}
                      className="p-2.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <TypeBadge type={issue.type} size="sm" showText={false} />
                        <button
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {issue.id}
                        </button>
                        <span className="text-xs text-zinc-800 dark:text-zinc-200 truncate">{issue.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <SupportBadge level={issue.supportLevel} size="sm" showLabel={false} />
                        <StatusBadge status={issue.status} size="sm" />
                        <button
                          onClick={() => handleMoveIssueToSprint(issue.id, undefined)}
                          className="text-[11px] text-zinc-400 hover:text-zinc-600 px-1"
                        >
                          Backlog ↓
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Backlog Section */}
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-xs">
          <div className="p-4 bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">
                Backlog
              </h3>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                {backlogIssues.length} issues
              </span>
            </div>
            <button
              onClick={() => {
                setCreateIssueSprintId(undefined);
                setIsCreateIssueOpen(true);
              }}
              className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Create Issue in Backlog</span>
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80 p-2">
            {backlogIssues.length === 0 ? (
              <p className="p-6 text-center text-xs text-zinc-400 italic">
                Backlog is clear. All issues are assigned to sprints.
              </p>
            ) : (
              backlogIssues.map(issue => (
                <div
                  key={issue.id}
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850 rounded"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <TypeBadge type={issue.type} size="sm" showText={false} />
                    <button
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {issue.id}
                    </button>
                    <span className="text-xs text-zinc-800 dark:text-zinc-200 truncate">{issue.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <SupportBadge level={issue.supportLevel} size="sm" showLabel={false} />
                    <PriorityBadge priority={issue.priority} size="sm" showText={false} />
                    <StatusBadge status={issue.status} size="sm" />
                    {projectSprints.length > 0 && (
                      <select
                        onChange={e => handleMoveIssueToSprint(issue.id, e.target.value)}
                        defaultValue=""
                        className="text-[11px] rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 text-zinc-700 dark:text-zinc-300"
                      >
                        <option value="" disabled>Move to sprint...</option>
                        {projectSprints.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Sprint Modal */}
      {isCreateSprintOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create Sprint</h3>
            <p className="text-xs text-zinc-500 mt-1">Define cycle duration and target deliverables for this project.</p>
            <form onSubmit={handleCreateSprint} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Sprint Name *
                </label>
                <input
                  type="text"
                  required
                  value={newSprintName}
                  onChange={e => setNewSprintName(e.target.value)}
                  placeholder="e.g. Sprint 25 - Core Architecture"
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Sprint Goal
                </label>
                <textarea
                  rows={2}
                  value={newSprintGoal}
                  onChange={e => setNewSprintGoal(e.target.value)}
                  placeholder="e.g. Modernize auth tokens and resolve L2 escalation backlog."
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newSprintStartDate}
                    onChange={e => setNewSprintStartDate(e.target.value)}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newSprintEndDate}
                    onChange={e => setNewSprintEndDate(e.target.value)}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateSprintOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Sprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Sprint Modal */}
      {completingSprint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Complete {completingSprint.name}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Select where incomplete tickets should be routed.
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Move Incomplete Issues To:
                </label>
                <select
                  value={targetSprintForIncomplete}
                  onChange={e => setTargetSprintForIncomplete(e.target.value)}
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="">Product Backlog</option>
                  {plannedSprints.map(s => (
                    <option key={s.id} value={s.id}>{s.name} (Planned)</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCompletingSprint(null)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleFinishCompleteSprint}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md"
                >
                  Complete Sprint
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        defaultProjectId={selectedProjectId}
        defaultSprintId={createIssueSprintId}
        onClose={() => setIsCreateIssueOpen(false)}
      />

      <ConfirmModal
        isOpen={!!deletingSprintId}
        title="Delete Sprint"
        message="Are you sure you want to delete this sprint? Contained issues will automatically return to the backlog."
        confirmLabel="Delete Sprint"
        onConfirm={() => {
          if (deletingSprintId) deleteSprint(deletingSprintId);
          setDeletingSprintId(null);
        }}
        onCancel={() => setDeletingSprintId(null)}
      />
    </div>
  );
};
