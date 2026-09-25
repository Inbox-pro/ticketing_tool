import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  FolderGit2, 
  Plus, 
  Search, 
  Layers, 
  Users, 
  Calendar, 
  ArrowRight, 
  MoreHorizontal, 
  Trash2,
  Edit2
} from 'lucide-react';
import { Project } from '../types';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const ProjectsPage: React.FC = () => {
  const { projects, issues, users, createProject, updateProject, deleteProject } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [category, setCategory] = useState<'Software' | 'Service Desk' | 'Infrastructure' | 'Operations'>('Software');
  const [description, setDescription] = useState('');
  const [leadId, setLeadId] = useState(users[0]?.id || 'usr-1');

  const filteredProjects = projects.filter(p => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.key.toLowerCase().includes(q) || (p.category ? p.category.toLowerCase().includes(q) : false);
  });

  const handleCreateOrUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) return;

    if (editingProject) {
      updateProject(editingProject.id, {
        name: name.trim(),
        key: key.trim().toUpperCase(),
        category,
        description,
        leadId,
      });
      setEditingProject(null);
    } else {
      createProject({
        name: name.trim(),
        key: key.trim().toUpperCase(),
        category,
        description,
        leadId,
        memberIds: [leadId],
        status: 'Active',
      });
    }

    setName('');
    setKey('');
    setDescription('');
    setIsCreateOpen(false);
  };

  const startEdit = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setKey(p.key);
    setCategory((p.category as 'Software' | 'Service Desk' | 'Infrastructure' | 'Operations') || 'Software');
    setDescription(p.description || '');
    setLeadId(p.leadId);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Projects
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold">
              {projects.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Manage GoldMine repositories, service desks, and cross-functional teams.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProject(null);
            setName('');
            setKey('');
            setDescription('');
            setIsCreateOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Create Project</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-2.5 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Filter projects by name or key..."
          className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
        />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.map(project => {
          const lead = users.find(u => u.id === project.leadId);
          const projectIssues = issues.filter(i => i.projectId === project.id);
          const activeCount = projectIssues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;

          return (
            <div
              key={project.id}
              className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-700 transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                    {project.key}
                  </span>
                  <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    {project.category || project.status}
                  </span>
                </div>

                <h3
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="text-sm font-bold text-zinc-900 dark:text-zinc-100 hover:text-blue-600 cursor-pointer transition line-clamp-1"
                >
                  {project.name}
                </h3>

                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    {lead ? (
                      <>
                        <img
                          src={lead.avatar}
                          alt={lead.name}
                          className="w-5 h-5 rounded-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[11px] text-zinc-700 dark:text-zinc-300">{lead.name}</span>
                      </>
                    ) : (
                      <span className="text-[11px] text-zinc-400 italic">No Lead</span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {activeCount} active / {projectIssues.length} total
                  </span>
                </div>

                {/* Fast Action Links */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/board?project=${project.id}`)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Board
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <button
                      onClick={() => navigate(`/backlog?project=${project.id}`)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Backlog
                    </button>
                    <span className="text-zinc-300 dark:text-zinc-700">•</span>
                    <button
                      onClick={() => navigate(`/projects/${project.id}`)}
                      className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Overview
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(project)}
                      className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      title="Edit project"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeletingProjectId(project.id)}
                      className="p-1 text-zinc-400 hover:text-rose-600"
                      title="Delete project"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Project Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {editingProject ? 'Edit Project' : 'Create Project'}
            </h3>
            <form onSubmit={handleCreateOrUpdate} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => {
                    setName(e.target.value);
                    if (!editingProject && !key) {
                      setKey(e.target.value.substring(0, 3).toUpperCase());
                    }
                  }}
                  placeholder="e.g. Mobile Application"
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Project Key *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={key}
                    onChange={e => setKey(e.target.value.toUpperCase())}
                    placeholder="e.g. MOB"
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 uppercase font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  >
                    <option value="Software">Software</option>
                    <option value="Service Desk">Service Desk</option>
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Project Lead
                </label>
                <select
                  value={leadId}
                  onChange={e => setLeadId(e.target.value)}
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Project purpose, SLA guidelines, or scope..."
                  className="w-full text-xs rounded-md border border-zinc-200 dark:border-zinc-700 px-3 py-2 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deletingProjectId}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated sprints and issues will also be removed."
        confirmLabel="Delete Project"
        onConfirm={() => {
          if (deletingProjectId) deleteProject(deletingProjectId);
          setDeletingProjectId(null);
        }}
        onCancel={() => setDeletingProjectId(null)}
      />
    </div>
  );
};
