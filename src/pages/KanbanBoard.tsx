import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  MoveRight, 
  MoreHorizontal,
  Layers,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { TypeBadge } from '../components/common/TypeBadge';
import { SLABadge } from '../components/common/SLABadge';
import { IssueStatus, Issue, SupportLevel } from '../types';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { EscalateModal } from '../components/issue/EscalateModal';

const COLUMNS: { id: IssueStatus; title: string; color: string }[] = [
  { id: 'To Do', title: 'To Do', color: 'border-slate-300 dark:border-slate-700' },
  { id: 'In Progress', title: 'In Progress', color: 'border-indigo-400 dark:border-indigo-600' },
  { id: 'In Review', title: 'In Review', color: 'border-amber-400 dark:border-amber-600' },
  { id: 'Testing', title: 'Testing / QA', color: 'border-cyan-400 dark:border-cyan-600' },
  { id: 'Resolved', title: 'Resolved', color: 'border-emerald-400 dark:border-emerald-600' },
  { id: 'Closed', title: 'Closed', color: 'border-zinc-300 dark:border-zinc-700' },
];

export const KanbanBoard: React.FC = () => {
  const { issues, projects, users, sprints, currentUser, updateIssue } = useApp();
  const navigate = useNavigate();

  // Filter state
  const [selectedProjectId, setSelectedProjectId] = useState<string>('ALL');
  const [selectedSprintId, setSelectedSprintId] = useState<string>('ALL');
  const [selectedSupportLevel, setSelectedSupportLevel] = useState<string>('ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createDefaultStatus, setCreateDefaultStatus] = useState<IssueStatus>('To Do');
  const [escalatingIssue, setEscalatingIssue] = useState<Issue | null>(null);

  // Dragging state
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);

  // Filtered Issues
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (selectedProjectId !== 'ALL' && issue.projectId !== selectedProjectId) return false;
      if (selectedSprintId !== 'ALL') {
        if (selectedSprintId === 'BACKLOG' && issue.sprintId) return false;
        if (selectedSprintId !== 'BACKLOG' && issue.sprintId !== selectedSprintId) return false;
      }
      if (selectedSupportLevel !== 'ALL' && issue.supportLevel !== selectedSupportLevel) return false;
      if (selectedAssignee !== 'ALL') {
        if (selectedAssignee === 'ME' && issue.assigneeId !== currentUser.id) return false;
        if (selectedAssignee !== 'ME' && issue.assigneeId !== selectedAssignee) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = issue.id.toLowerCase().includes(q);
        const titleMatch = issue.title.toLowerCase().includes(q);
        if (!idMatch && !titleMatch) return false;
      }
      return true;
    });
  }, [issues, selectedProjectId, selectedSprintId, selectedSupportLevel, selectedAssignee, searchQuery, currentUser.id]);

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedIssueId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (e: React.DragEvent, targetStatus: IssueStatus) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain') || draggedIssueId;
    if (issueId) {
      updateIssue(issueId, { status: targetStatus });
    }
    setDraggedIssueId(null);
  };

  const projectSprints = selectedProjectId !== 'ALL'
    ? sprints.filter(s => s.projectId === selectedProjectId)
    : sprints;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Kanban Board
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              {filteredIssues.length} tickets
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Drag and drop tickets between development and support workflow states.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateDefaultStatus('To Do');
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Create Issue</span>
        </button>
      </div>

      {/* Board Controls / Filters */}
      <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search */}
          <div className="relative w-48 sm:w-60">
            <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter board tickets..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>

          {/* Project */}
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.key})</option>
            ))}
          </select>

          {/* Sprint */}
          <select
            value={selectedSprintId}
            onChange={e => setSelectedSprintId(e.target.value)}
            className="text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Sprints</option>
            <option value="BACKLOG">Backlog Only</option>
            {projectSprints.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.status})</option>
            ))}
          </select>

          {/* Support Level */}
          <select
            value={selectedSupportLevel}
            onChange={e => setSelectedSupportLevel(e.target.value)}
            className="text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Support Tiers</option>
            <option value="L1">L1 - Frontline</option>
            <option value="L2">L2 - Technical</option>
            <option value="L3">L3 - Engineering</option>
          </select>

          {/* Assignee */}
          <select
            value={selectedAssignee}
            onChange={e => setSelectedAssignee(e.target.value)}
            className="text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2.5 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Members</option>
            <option value="ME">Assigned to Me</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setSelectedProjectId('ALL');
            setSelectedSprintId('ALL');
            setSelectedSupportLevel('ALL');
            setSelectedAssignee('ALL');
            setSearchQuery('');
          }}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Reset Filters
        </button>
      </div>

      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start">
        {COLUMNS.map(col => {
          // Issues in this status (or map Open to To Do for display simplicity)
          const colIssues = filteredIssues.filter(i => {
            if (col.id === 'To Do') return i.status === 'To Do' || i.status === 'Open';
            return i.status === col.id;
          });

          const totalPoints = colIssues.reduce((sum, i) => sum + (i.storyPoints || 0), 0);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={e => handleDropOnColumn(e, col.id)}
              className="bg-zinc-100/70 dark:bg-zinc-900/60 rounded-xl p-3 border border-zinc-200/70 dark:border-zinc-800/80 min-h-[550px] flex flex-col justify-between"
            >
              <div>
                {/* Column Header */}
                <div className={`pb-2.5 mb-3 border-b-2 ${col.color} flex items-center justify-between`}>
                  <div className="flex items-center gap-1.5">
                    <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
                      {col.title}
                    </h2>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold">
                      {colIssues.length}
                    </span>
                  </div>
                  {totalPoints > 0 && (
                    <span className="text-[10px] font-mono text-zinc-400" title="Total Story Points">
                      {totalPoints} pts
                    </span>
                  )}
                </div>

                {/* Cards Container */}
                <div className="space-y-2.5">
                  {colIssues.map(issue => {
                    const assignee = users.find(u => u.id === issue.assigneeId);

                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={e => handleDragStart(e, issue.id)}
                        className="p-3 rounded-lg bg-white dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700/80 hover:border-blue-400 dark:hover:border-blue-500 shadow-2xs cursor-grab active:cursor-grabbing transition group"
                      >
                        {/* Key & Tier */}
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <TypeBadge type={issue.type} size="sm" showText={false} />
                            <button
                              onClick={() => navigate(`/issues/${issue.id}`)}
                              className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {issue.id}
                            </button>
                          </div>
                          <SupportBadge level={issue.supportLevel} size="sm" showLabel={false} />
                        </div>

                        {/* Title */}
                        <p
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-2 leading-snug"
                        >
                          {issue.title}
                        </p>

                        {/* SLA Bar */}
                        <div className="mt-2.5">
                          <SLABadge issue={issue} size="sm" showDetails={false} />
                        </div>

                        {/* Footer: Priority, Points, Assignee */}
                        <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-700/60 flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <PriorityBadge priority={issue.priority} size="sm" showText={false} />
                            {issue.storyPoints !== undefined && (
                              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 font-semibold">
                                {issue.storyPoints}p
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            {issue.supportLevel !== 'L3' && (
                              <button
                                onClick={() => setEscalatingIssue(issue)}
                                className="p-1 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 opacity-0 group-hover:opacity-100 transition"
                                title="Escalate ticket"
                              >
                                <ArrowUpRight size={13} />
                              </button>
                            )}

                            {assignee ? (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                title={`Assigned to ${assignee.name}`}
                                className="w-5 h-5 rounded-full object-cover shrink-0"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-5 h-5 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600 flex items-center justify-center text-[9px] text-zinc-400">
                                ?
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Add Button */}
              <button
                onClick={() => {
                  setCreateDefaultStatus(col.id);
                  setIsCreateOpen(true);
                }}
                className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-400 text-xs font-medium flex items-center justify-center gap-1 transition"
              >
                <Plus size={13} />
                <span>Add Card</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      <CreateIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {escalatingIssue && (
        <EscalateModal
          isOpen={!!escalatingIssue}
          issue={escalatingIssue}
          onClose={() => setEscalatingIssue(null)}
        />
      )}
    </div>
  );
};
