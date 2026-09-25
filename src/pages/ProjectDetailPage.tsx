import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  FolderGit2, 
  Plus, 
  Kanban, 
  ListOrdered, 
  Layers, 
  Users, 
  Sparkles,
  Calendar,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { TypeBadge } from '../components/common/TypeBadge';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SLABadge } from '../components/common/SLABadge';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, issues, epics, sprints, users, createEpic } = useApp();

  const project = projects.find(p => p.id === id);
  const [isCreateEpicOpen, setIsCreateEpicOpen] = useState(false);
  const [newEpicName, setNewEpicName] = useState('');
  const [newEpicColor, setNewEpicColor] = useState('#3b82f6');
  const [newEpicSummary, setNewEpicSummary] = useState('');

  const [isCreateIssueOpen, setIsCreateIssueOpen] = useState(false);

  if (!project) {
    return (
      <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-200">Project Not Found</h2>
        <button
          onClick={() => navigate('/projects')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Back to Projects
        </button>
      </div>
    );
  }

  const projectIssues = issues.filter(i => i.projectId === project.id);
  const projectEpics = epics.filter(e => e.projectId === project.id);
  const projectSprints = sprints.filter(s => s.projectId === project.id);
  const lead = users.find(u => u.id === project.leadId);

  const openCount = projectIssues.filter(i => i.status === 'Open' || i.status === 'To Do').length;
  const inProgressCount = projectIssues.filter(i => i.status === 'In Progress' || i.status === 'In Review' || i.status === 'Testing').length;
  const doneCount = projectIssues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;

  const handleCreateEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEpicName.trim()) return;
    createEpic({
      projectId: project.id,
      name: newEpicName.trim(),
      description: newEpicSummary.trim() || newEpicName.trim(),
      summary: newEpicSummary.trim() || undefined,
      color: newEpicColor,
      status: 'To Do',
    });
    setNewEpicName('');
    setNewEpicSummary('');
    setIsCreateEpicOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link to="/projects" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Projects</span>
          </Link>
          <span>/</span>
          <span className="font-bold text-zinc-900 dark:text-zinc-100">{project.name}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/board?project=${project.id}`)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <Kanban size={13} />
            <span>Open Board</span>
          </button>
          <button
            onClick={() => navigate(`/backlog?project=${project.id}`)}
            className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <ListOrdered size={13} />
            <span>Backlog</span>
          </button>
          <button
            onClick={() => setIsCreateIssueOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus size={14} className="stroke-[2.5]" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* Project Overview Card */}
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                {project.key}
              </span>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{project.name}</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {project.category || project.status}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl leading-relaxed">
              {project.description || 'GoldMine project repository and tracking workspace.'}
            </p>
          </div>

          {lead && (
            <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 flex items-center gap-3 shrink-0">
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-10 h-10 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Project Lead</span>
                <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{lead.name}</p>
                <p className="text-[11px] text-zinc-500">{lead.role}</p>
              </div>
            </div>
          )}
        </div>

        {/* Progress Metrics Bar */}
        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-zinc-500 font-medium">Issue Completion Progress:</span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">
              {doneCount} of {projectIssues.length} completed ({projectIssues.length > 0 ? Math.round((doneCount / projectIssues.length) * 100) : 0}%)
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex overflow-hidden">
            <div
              style={{ width: `${projectIssues.length ? (doneCount / projectIssues.length) * 100 : 0}%` }}
              className="bg-emerald-500 h-full"
              title="Resolved / Done"
            />
            <div
              style={{ width: `${projectIssues.length ? (inProgressCount / projectIssues.length) * 100 : 0}%` }}
              className="bg-blue-500 h-full"
              title="In Progress"
            />
            <div
              style={{ width: `${projectIssues.length ? (openCount / projectIssues.length) * 100 : 0}%` }}
              className="bg-zinc-300 dark:bg-zinc-600 h-full"
              title="To Do / Open"
            />
          </div>
          <div className="flex items-center gap-4 text-[11px] text-zinc-500 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Resolved ({doneCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>In Flight ({inProgressCount})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
              <span>To Do ({openCount})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Epics Section */}
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-purple-500" />
            <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
              Project Epics ({projectEpics.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCreateEpicOpen(true)}
            className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
          >
            <Plus size={13} />
            <span>Add Epic</span>
          </button>
        </div>

        {projectEpics.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">No epics created yet for this project.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {projectEpics.map(epic => {
              const epicIssues = projectIssues.filter(i => i.epicId === epic.id);
              return (
                <div
                  key={epic.id}
                  className="p-3.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-850/50 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: epic.color }}
                    />
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                      {epic.name}
                    </h3>
                  </div>
                  {epic.summary && (
                    <p className="text-[11px] text-zinc-500 line-clamp-2">{epic.summary}</p>
                  )}
                  <div className="text-[10px] font-mono text-zinc-400">
                    {epicIssues.length} assigned issues
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Project Issues Table */}
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider">
            All Project Issues ({projectIssues.length})
          </h2>
          <button
            onClick={() => navigate(`/issues?project=${project.id}`)}
            className="text-xs font-medium text-blue-600 hover:underline flex items-center gap-1"
          >
            <span>View in full issues filter</span>
            <ChevronRight size={13} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 uppercase">
              <tr>
                <th className="py-2.5 px-3">Key</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Tier</th>
                <th className="py-2.5 px-3">Priority</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">SLA Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {projectIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-850/50 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400">
                    <Link to={`/issues/${issue.id}`}>{issue.id}</Link>
                  </td>
                  <td className="py-2.5 px-3 font-medium text-zinc-900 dark:text-zinc-100 max-w-xs truncate">
                    <Link to={`/issues/${issue.id}`}>{issue.title}</Link>
                  </td>
                  <td className="py-2.5 px-3">
                    <SupportBadge level={issue.supportLevel} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <PriorityBadge priority={issue.priority} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge status={issue.status} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">
                    <SLABadge issue={issue} size="sm" showDetails={true} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Epic Modal */}
      {isCreateEpicOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">Create Epic</h3>
            <form onSubmit={handleCreateEpic} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Epic Name *
                </label>
                <input
                  type="text"
                  required
                  value={newEpicName}
                  onChange={e => setNewEpicName(e.target.value)}
                  placeholder="e.g. Authentication & RBAC"
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Tag Color
                </label>
                <input
                  type="color"
                  value={newEpicColor}
                  onChange={e => setNewEpicColor(e.target.value)}
                  className="w-full h-8 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Summary / Scope
                </label>
                <textarea
                  rows={2}
                  value={newEpicSummary}
                  onChange={e => setNewEpicSummary(e.target.value)}
                  placeholder="Epic business objective..."
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateEpicOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  Create Epic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Issue Modal */}
      <CreateIssueModal
        isOpen={isCreateIssueOpen}
        defaultProjectId={project.id}
        onClose={() => setIsCreateIssueOpen(false)}
      />
    </div>
  );
};
