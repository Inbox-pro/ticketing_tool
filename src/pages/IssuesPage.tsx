import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Bookmark, 
  ArrowUpRight, 
  Trash2, 
  MoreVertical,
  SlidersHorizontal,
  RotateCcw,
  CheckSquare,
  LayoutList,
  LayoutGrid
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TypeBadge } from '../components/common/TypeBadge';
import { SLABadge } from '../components/common/SLABadge';
import { calculateSLAInfo } from '../services/storage';
import { SupportLevel, Priority, IssueStatus, IssueType, Issue } from '../types';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { EscalateModal } from '../components/issue/EscalateModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const IssuesPage: React.FC = () => {
  const { 
    issues, 
    projects, 
    users, 
    currentUser, 
    savedFilters, 
    saveFilter, 
    deleteFilter,
    updateIssue,
    deleteIssue,
    addToast
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [selectedSupportLevel, setSelectedSupportLevel] = useState<string>(searchParams.get('supportLevel') || 'ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get('status') || 'ALL');
  const [selectedPriority, setSelectedPriority] = useState<string>(searchParams.get('priority') || 'ALL');
  const [selectedAssignee, setSelectedAssignee] = useState<string>(searchParams.get('assignee') || 'ALL');
  const [selectedProject, setSelectedProject] = useState<string>(searchParams.get('project') || 'ALL');
  const [selectedType, setSelectedType] = useState<string>(searchParams.get('type') || 'ALL');
  const [selectedSLA, setSelectedSLA] = useState<string>(searchParams.get('sla') || 'ALL');
  const [sortBy, setSortBy] = useState<'created_desc' | 'created_asc' | 'priority' | 'sla' | 'status'>('created_desc');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [escalatingIssue, setEscalatingIssue] = useState<Issue | null>(null);
  const [deletingIssueId, setDeletingIssueId] = useState<string | null>(null);
  const [isSaveFilterOpen, setIsSaveFilterOpen] = useState(false);
  const [newFilterName, setNewFilterName] = useState('');

  // Handle URL sync on initial mount
  React.useEffect(() => {
    const assigneeParam = searchParams.get('assignee');
    if (assigneeParam === 'me') {
      setSelectedAssignee(currentUser.id);
    }
    const levelParam = searchParams.get('supportLevel');
    if (levelParam) {
      setSelectedSupportLevel(levelParam);
    }
  }, [searchParams, currentUser.id]);

  // Filtering Logic
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = issue.id.toLowerCase().includes(q);
        const titleMatch = issue.title.toLowerCase().includes(q);
        const labelMatch = issue.labels.some(l => l.toLowerCase().includes(q));
        if (!idMatch && !titleMatch && !labelMatch) return false;
      }

      // Support Level
      if (selectedSupportLevel !== 'ALL' && issue.supportLevel !== selectedSupportLevel) {
        return false;
      }

      // Status
      if (selectedStatus !== 'ALL' && issue.status !== selectedStatus) {
        return false;
      }

      // Priority
      if (selectedPriority !== 'ALL' && issue.priority !== selectedPriority) {
        return false;
      }

      // Project
      if (selectedProject !== 'ALL' && issue.projectId !== selectedProject) {
        return false;
      }

      // Type
      if (selectedType !== 'ALL' && issue.type !== selectedType) {
        return false;
      }

      // Assignee
      if (selectedAssignee === 'UNASSIGNED') {
        if (issue.assigneeId) return false;
      } else if (selectedAssignee !== 'ALL') {
        if (issue.assigneeId !== selectedAssignee) return false;
      }

      // SLA Status
      if (selectedSLA !== 'ALL') {
        const sla = calculateSLAInfo(issue);
        if (sla.status !== selectedSLA) return false;
      }

      return true;
    });
  }, [
    issues,
    searchQuery,
    selectedSupportLevel,
    selectedStatus,
    selectedPriority,
    selectedAssignee,
    selectedProject,
    selectedType,
    selectedSLA,
  ]);

  // Sorting
  const sortedIssues = useMemo(() => {
    const list = [...filteredIssues];
    const priorityWeight: Record<Priority, number> = {
      Highest: 5,
      High: 4,
      Medium: 3,
      Low: 2,
      Lowest: 1,
    };

    switch (sortBy) {
      case 'created_desc':
        return list.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime());
      case 'created_asc':
        return list.sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
      case 'priority':
        return list.sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
      case 'sla':
        return list.sort((a, b) => {
          const aSla = calculateSLAInfo(a).resolutionRemainingMs;
          const bSla = calculateSLAInfo(b).resolutionRemainingMs;
          return aSla - bSla;
        });
      case 'status':
        return list.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return list;
    }
  }, [filteredIssues, sortBy]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSupportLevel('ALL');
    setSelectedStatus('ALL');
    setSelectedPriority('ALL');
    setSelectedAssignee('ALL');
    setSelectedProject('ALL');
    setSelectedType('ALL');
    setSelectedSLA('ALL');
    setSortBy('created_desc');
  };

  const handleSaveFilter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFilterName.trim()) return;
    saveFilter(newFilterName.trim(), {
      supportLevel: selectedSupportLevel !== 'ALL' ? (selectedSupportLevel as SupportLevel) : undefined,
      status: selectedStatus !== 'ALL' ? (selectedStatus as IssueStatus) : undefined,
      priority: selectedPriority !== 'ALL' ? (selectedPriority as Priority) : undefined,
      projectId: selectedProject !== 'ALL' ? selectedProject : undefined,
      assigneeId: selectedAssignee !== 'ALL' ? selectedAssignee : undefined,
      type: selectedType !== 'ALL' ? (selectedType as IssueType) : undefined,
    });
    setNewFilterName('');
    setIsSaveFilterOpen(false);
  };

  const applySavedFilter = (sf: typeof savedFilters[0]) => {
    if (sf.filters.supportLevel) setSelectedSupportLevel(sf.filters.supportLevel);
    else setSelectedSupportLevel('ALL');

    if (sf.filters.status) setSelectedStatus(sf.filters.status);
    else setSelectedStatus('ALL');

    if (sf.filters.priority) setSelectedPriority(sf.filters.priority);
    else setSelectedPriority('ALL');

    if (sf.filters.projectId) setSelectedProject(sf.filters.projectId);
    else setSelectedProject('ALL');

    if (sf.filters.assigneeId) setSelectedAssignee(sf.filters.assigneeId);
    else setSelectedAssignee('ALL');

    if (sf.filters.type) setSelectedType(sf.filters.type);
    else setSelectedType('ALL');

    addToast('Filter Applied', `Switched to preset "${sf.name}"`, 'info');
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Issues &amp; Tickets
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              {sortedIssues.length} of {issues.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Browse, filter, assign, and escalate issues across all projects and support tiers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center border border-zinc-200 dark:border-zinc-800 rounded-lg p-0.5 bg-zinc-100 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md ${viewMode === 'table' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-xs' : 'text-zinc-500'}`}
              title="Table View"
            >
              <LayoutList size={15} />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-md ${viewMode === 'cards' ? 'bg-white dark:bg-zinc-800 text-blue-600 shadow-xs' : 'text-zinc-500'}`}
              title="Cards View"
            >
              <LayoutGrid size={15} />
            </button>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-3">
        {/* Search and Saved Presets */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by ID, title, or label..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Saved Filters & Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              Presets:
            </span>
            {savedFilters.map(sf => (
              <button
                key={sf.id}
                onClick={() => applySavedFilter(sf)}
                className="px-2.5 py-1 rounded-md text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-zinc-700 dark:text-zinc-300 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0 flex items-center gap-1"
              >
                <Bookmark size={11} className="text-zinc-400" />
                <span>{sf.name}</span>
              </button>
            ))}

            <button
              onClick={() => setIsSaveFilterOpen(true)}
              className="px-2 py-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium shrink-0"
            >
              + Save current
            </button>

            <button
              onClick={resetAllFilters}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 rounded shrink-0 ml-auto"
              title="Reset all filters"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Multi-Filter Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Support Level */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Support Level
            </label>
            <select
              value={selectedSupportLevel}
              onChange={e => setSelectedSupportLevel(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Levels</option>
              <option value="L1">L1 - Frontline</option>
              <option value="L2">L2 - Technical</option>
              <option value="L3">L3 - Engineering</option>
            </select>
          </div>

          {/* Status */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Testing">Testing</option>
              <option value="Blocked">Blocked</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Priority
            </label>
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Priorities</option>
              <option value="Highest">Highest (P0)</option>
              <option value="High">High (P1)</option>
              <option value="Medium">Medium (P2)</option>
              <option value="Low">Low (P3)</option>
              <option value="Lowest">Lowest (P4)</option>
            </select>
          </div>

          {/* Assignee */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Assignee
            </label>
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Assignees</option>
              <option value={currentUser.id}>Assigned to Me</option>
              <option value="UNASSIGNED">Unassigned</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Project */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Project
            </label>
            <select
              value={selectedProject}
              onChange={e => setSelectedProject(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All Projects</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.key})
                </option>
              ))}
            </select>
          </div>

          {/* SLA Status */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              SLA Status
            </label>
            <select
              value={selectedSLA}
              onChange={e => setSelectedSLA(e.target.value)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="ALL">All SLA</option>
              <option value="Within SLA">Within SLA</option>
              <option value="At Risk">At Risk</option>
              <option value="Breached">Breached</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 px-2 py-1.5 focus:outline-none"
            >
              <option value="created_desc">Newest First</option>
              <option value="created_asc">Oldest First</option>
              <option value="priority">Priority (P0 → P4)</option>
              <option value="sla">SLA Deadline</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Issues Listing */}
      {sortedIssues.length === 0 ? (
        <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800">
          <p className="text-base font-semibold text-zinc-800 dark:text-zinc-200">No issues found matching filters</p>
          <p className="text-xs text-zinc-500 mt-1">Try broadening your criteria or reset the filters.</p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Key &amp; Type</th>
                  <th className="py-3 px-4">Summary</th>
                  <th className="py-3 px-4">Support Tier</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Assignee</th>
                  <th className="py-3 px-4">SLA Window</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {sortedIssues.map(issue => {
                  const assignee = users.find(u => u.id === issue.assigneeId);
                  const project = projects.find(p => p.id === issue.projectId);

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-zinc-50/70 dark:hover:bg-zinc-850/40 transition group"
                    >
                      {/* Key & Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <TypeBadge type={issue.type} size="sm" showText={false} />
                          <button
                            onClick={() => navigate(`/issues/${issue.id}`)}
                            className="font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {issue.id}
                          </button>
                        </div>
                      </td>

                      {/* Summary */}
                      <td className="py-3 px-4 min-w-[240px] max-w-[380px]">
                        <button
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400 text-left line-clamp-1 leading-snug"
                        >
                          {issue.title}
                        </button>
                        {issue.labels.length > 0 && (
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {issue.labels.slice(0, 3).map(label => (
                              <span
                                key={label}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                              >
                                #{label}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Support Tier */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SupportBadge level={issue.supportLevel} size="sm" />
                      </td>

                      {/* Priority */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <PriorityBadge priority={issue.priority} size="sm" />
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <StatusBadge status={issue.status} size="sm" />
                      </td>

                      {/* Assignee */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <img
                              src={assignee.avatar}
                              alt={assignee.name}
                              className="w-5 h-5 rounded-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            <span className="text-zinc-800 dark:text-zinc-200">{assignee.name}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Unassigned</span>
                        )}
                      </td>

                      {/* SLA Window */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SLABadge issue={issue} size="sm" showDetails={true} />
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {issue.supportLevel !== 'L3' && (
                            <button
                              onClick={() => setEscalatingIssue(issue)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
                              title="Escalate ticket"
                            >
                              <ArrowUpRight size={12} />
                              <span className="hidden xl:inline">Escalate</span>
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/issues/${issue.id}`)}
                            className="px-2 py-1 rounded text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setDeletingIssueId(issue.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 transition"
                            title="Delete issue"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedIssues.map(issue => {
            const assignee = users.find(u => u.id === issue.assigneeId);
            return (
              <div
                key={issue.id}
                className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-blue-400 dark:hover:border-blue-700 transition shadow-xs flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <TypeBadge type={issue.type} size="sm" showText={false} />
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {issue.id}
                      </button>
                    </div>
                    <SupportBadge level={issue.supportLevel} size="sm" />
                  </div>

                  <h3
                    onClick={() => navigate(`/issues/${issue.id}`)}
                    className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-2.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2"
                  >
                    {issue.title}
                  </h3>

                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                    {issue.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                    <StatusBadge status={issue.status} size="sm" />
                    <PriorityBadge priority={issue.priority} size="sm" />
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      {assignee ? (
                        <>
                          <img
                            src={assignee.avatar}
                            alt={assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{assignee.name}</span>
                        </>
                      ) : (
                        <span className="text-[11px] text-zinc-400 italic">Unassigned</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {issue.supportLevel !== 'L3' && (
                        <button
                          onClick={() => setEscalatingIssue(issue)}
                          className="p-1 rounded text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                          title="Escalate"
                        >
                          <ArrowUpRight size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingIssueId(issue.id)}
                        className="p-1 rounded text-zinc-400 hover:text-rose-500"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-zinc-50 dark:border-zinc-800/40">
                    <SLABadge issue={issue} size="sm" showDetails={true} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Filter Modal */}
      {isSaveFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Save Current Filter Preset</h3>
            <p className="text-xs text-zinc-500 mt-1">Name this combination of filters for 1-click access anytime.</p>
            <form onSubmit={handleSaveFilter} className="mt-4 space-y-3">
              <input
                type="text"
                required
                value={newFilterName}
                onChange={e => setNewFilterName(e.target.value)}
                placeholder="e.g. Critical L2 Backend Issues"
                className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSaveFilterOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Save Preset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modals */}
      <CreateIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {escalatingIssue && (
        <EscalateModal
          isOpen={!!escalatingIssue}
          issue={escalatingIssue}
          onClose={() => setEscalatingIssue(null)}
        />
      )}
      <ConfirmModal
        isOpen={!!deletingIssueId}
        title="Delete Issue"
        message={`Are you sure you want to permanently delete ticket ${deletingIssueId}? This action cannot be undone.`}
        confirmLabel="Delete Ticket"
        onConfirm={() => {
          if (deletingIssueId) deleteIssue(deletingIssueId);
          setDeletingIssueId(null);
        }}
        onCancel={() => setDeletingIssueId(null)}
      />
    </div>
  );
};
