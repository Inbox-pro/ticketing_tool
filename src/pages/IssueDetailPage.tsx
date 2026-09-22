import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  Paperclip, 
  MessageSquare, 
  Lock, 
  Globe, 
  Clock, 
  Calendar, 
  UploadCloud, 
  Download, 
  FileText, 
  AlertTriangle,
  Send,
  MoreHorizontal,
  History,
  ShieldAlert,
  Sparkles,
  User as UserIcon
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TypeBadge } from '../components/common/TypeBadge';
import { SLABadge } from '../components/common/SLABadge';
import { calculateSLAInfo } from '../services/storage';
import { Priority, IssueStatus, SupportLevel, IssueType } from '../types';
import { EscalateModal } from '../components/issue/EscalateModal';
import { ConfirmModal } from '../components/common/ConfirmModal';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    issues, 
    projects, 
    users, 
    sprints, 
    epics, 
    comments, 
    activity,
    currentUser, 
    updateIssue, 
    deleteIssue, 
    addComment,
    editComment,
    deleteComment,
    addAttachment,
    deleteAttachment,
    addToast
  } = useApp();

  // Find issue
  const issue = issues.find(i => i.id === id);

  // States
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');

  // Comment Box
  const [commentText, setCommentText] = useState('');
  const [commentType, setCommentType] = useState<'public' | 'internal'>('public');
  const [activeTab, setActiveTab] = useState<'comments' | 'internal' | 'history'>('comments');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');

  // New Label input
  const [newLabel, setNewLabel] = useState('');
  const [showAddLabel, setShowAddLabel] = useState(false);

  // Modals
  const [isEscalateOpen, setIsEscalateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Drag & drop file upload state
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  React.useEffect(() => {
    if (issue) {
      setTitleValue(issue.title);
      setDescValue(issue.description);
    }
  }, [issue]);

  if (!issue) {
    return (
      <div className="p-12 text-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
        <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Issue Not Found</h2>
        <p className="text-xs text-zinc-500 mt-1">Ticket {id} does not exist or may have been deleted.</p>
        <button
          onClick={() => navigate('/issues')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          Back to Issues
        </button>
      </div>
    );
  }

  const project = projects.find(p => p.id === issue.projectId);
  const assignee = users.find(u => u.id === issue.assigneeId);
  const reporter = users.find(u => u.id === issue.reporterId);
  const sprint = sprints.find(s => s.id === issue.sprintId);
  const epic = epics.find(e => e.id === issue.epicId);
  const sla = calculateSLAInfo(issue);

  // Issue comments
  const issueComments = comments
    .filter(c => c.issueId === issue.id)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  // Activity events for this issue
  const issueActivity = activity
    .filter(a => a.issueId === issue.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Save Title edit
  const handleSaveTitle = () => {
    if (titleValue.trim() && titleValue !== issue.title) {
      updateIssue(issue.id, { title: titleValue.trim() });
    }
    setIsEditingTitle(false);
  };

  // Save Description edit
  const handleSaveDesc = () => {
    if (descValue !== issue.description) {
      updateIssue(issue.id, { description: descValue });
    }
    setIsEditingDesc(false);
  };

  // Add Comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    addComment(issue.id, commentText.trim(), commentType);
    setCommentText('');
  };

  // Add Label
  const handleAddLabel = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newLabel.trim().toLowerCase();
    if (clean && !issue.labels.includes(clean)) {
      updateIssue(issue.id, { labels: [...issue.labels, clean] });
      setNewLabel('');
      setShowAddLabel(false);
    }
  };

  const handleRemoveLabel = (label: string) => {
    updateIssue(issue.id, { labels: issue.labels.filter(l => l !== label) });
  };

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      addAttachment(issue.id, {
        filename: f.name,
        fileType: f.type || 'application/octet-stream',
        fileSize: f.size,
      });
    }
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const f = e.dataTransfer.files[i];
        addAttachment(issue.id, {
          filename: f.name,
          fileType: f.type || 'application/octet-stream',
          fileSize: f.size,
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs & Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Link to="/issues" className="hover:text-blue-600 flex items-center gap-1">
            <ArrowLeft size={14} />
            <span>Issues</span>
          </Link>
          <span>/</span>
          <Link to={`/projects/${project?.id}`} className="hover:text-blue-600 font-medium">
            {project?.name || 'Project'}
          </Link>
          <span>/</span>
          <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">{issue.id}</span>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Prominent Escalate Button */}
          {issue.supportLevel !== 'L3' && (
            <button
              onClick={() => setIsEscalateOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900 transition shadow-xs"
            >
              <ArrowUpRight size={14} className="stroke-[2.5]" />
              <span>Escalate Ticket</span>
            </button>
          )}

          <button
            onClick={() => setIsDeleteOpen(true)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
            title="Delete Ticket"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main 2-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Core Content, History, Attachments, Comments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and Quick Status Bar */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <TypeBadge type={issue.type} />
              <SupportBadge level={issue.supportLevel} />
              {issue.isEscalated && (
                <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                  Escalated
                </span>
              )}
            </div>

            {/* Editable Title */}
            {isEditingTitle ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={titleValue}
                  onChange={e => setTitleValue(e.target.value)}
                  className="w-full text-base sm:text-lg font-bold rounded-md border border-blue-500 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  autoFocus
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveTitle}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    <Check size={13} /> Save
                  </button>
                  <button
                    onClick={() => {
                      setTitleValue(issue.title);
                      setIsEditingTitle(false);
                    }}
                    className="px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="group flex items-start justify-between gap-3">
                <h1 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-snug">
                  {issue.title}
                </h1>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-blue-600 p-1 transition shrink-0"
                  title="Edit title"
                >
                  <Edit3 size={14} />
                </button>
              </div>
            )}

            {/* Inline Quick Status & Priority change */}
            <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-4 flex-wrap text-xs">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Status:</span>
                <select
                  value={issue.status}
                  onChange={e => updateIssue(issue.id, { status: e.target.value as IssueStatus })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
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

              <div className="flex items-center gap-2">
                <span className="text-zinc-400 font-medium">Priority:</span>
                <select
                  value={issue.priority}
                  onChange={e => updateIssue(issue.id, { priority: e.target.value as Priority })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2.5 py-1 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none"
                >
                  <option value="Highest">Highest (P0)</option>
                  <option value="High">High (P1)</option>
                  <option value="Medium">Medium (P2)</option>
                  <option value="Low">Low (P3)</option>
                  <option value="Lowest">Lowest (P4)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Description Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Description
              </h2>
              {!isEditingDesc && (
                <button
                  onClick={() => setIsEditingDesc(true)}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                >
                  <Edit3 size={12} />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={descValue}
                  onChange={e => setDescValue(e.target.value)}
                  className="w-full text-xs rounded-md border border-blue-500 bg-zinc-50 dark:bg-zinc-800 p-3 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSaveDesc}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold"
                  >
                    <Check size={13} /> Save Description
                  </button>
                  <button
                    onClick={() => {
                      setDescValue(issue.description);
                      setIsEditingDesc(false);
                    }}
                    className="px-3.5 py-1.5 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {issue.description || <span className="italic text-zinc-400">No description provided for this issue.</span>}
              </div>
            )}
          </div>

          {/* Escalation History Timeline (Crucial L1/L2/L3 feature) */}
          {issue.escalationHistory && issue.escalationHistory.length > 0 && (
            <div className="p-5 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert size={18} className="text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                    Escalation History ({issue.escalationHistory.length})
                  </h2>
                  <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">
                    Audit log of all support tier handoffs and technical escalation reasons
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {issue.escalationHistory.map((rec, index) => {
                  const escalatedBy = users.find(u => u.id === rec.escalatedByUserId);
                  const assignedTo = users.find(u => u.id === rec.assignedToUserId);

                  return (
                    <div
                      key={rec.id || index}
                      className="p-3.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-amber-200/70 dark:border-amber-900/50 text-xs space-y-1.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <SupportBadge level={rec.fromLevel} size="sm" />
                          <span className="text-zinc-400 font-bold">→</span>
                          <SupportBadge level={rec.toLevel} size="sm" />
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                            by {escalatedBy?.name || 'Support Agent'}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {new Date(rec.timestamp).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-zinc-700 dark:text-zinc-300 font-medium bg-amber-50/60 dark:bg-amber-950/40 p-2 rounded border border-amber-100 dark:border-amber-900/40">
                        &ldquo;{rec.reason}&rdquo;
                      </p>

                      {assignedTo && (
                        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-0.5">
                          <span>Reassigned to:</span>
                          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{assignedTo.name}</span>
                          <span className="text-[10px] text-zinc-400">({assignedTo.role})</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Attachments Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Paperclip size={16} className="text-zinc-400" />
                <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                  Attachments ({(issue.attachments || []).length})
                </h2>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
              >
                <UploadCloud size={13} />
                <span>Upload File</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Drag and drop zone */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setIsDraggingFile(true);
              }}
              onDragLeave={() => setIsDraggingFile(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition ${
                isDraggingFile
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/40'
              }`}
            >
              <UploadCloud size={24} className="mx-auto text-zinc-400 mb-2" />
              <p className="text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                Drag and drop files here, or <span className="text-blue-600 underline">browse</span>
              </p>
              <p className="text-[10px] text-zinc-400 mt-1">
                Attach logs, error screenshots, HAR files, or specification documents
              </p>
            </div>

            {/* List of Attachments */}
            {issue.attachments && issue.attachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {issue.attachments.map(att => (
                  <div
                    key={att.id}
                    className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-850 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{att.filename}</p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {Math.round(att.fileSize / 1024)} KB • {new Date(att.uploadDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => addToast('Downloading simulated attachment', att.filename, 'info')}
                        className="p-1 text-zinc-400 hover:text-blue-600 rounded"
                        title="Download attachment"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={() => deleteAttachment(issue.id, att.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 rounded"
                        title="Remove attachment"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Activity / Comments & Internal Notes Section */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            {/* Tabs */}
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <div className="flex items-center gap-4 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`pb-2 transition flex items-center gap-1.5 ${
                    activeTab === 'comments'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Globe size={14} />
                  <span>All Comments ({issueComments.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('internal')}
                  className={`pb-2 transition flex items-center gap-1.5 ${
                    activeTab === 'internal'
                      ? 'text-amber-600 border-b-2 border-amber-600'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <Lock size={14} />
                  <span>Internal Support Notes ({issueComments.filter(c => c.type === 'internal').length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`pb-2 transition flex items-center gap-1.5 ${
                    activeTab === 'history'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                  }`}
                >
                  <History size={14} />
                  <span>Audit History ({issueActivity.length})</span>
                </button>
              </div>
            </div>

            {/* Tab: Comments & Internal Notes View */}
            {activeTab !== 'history' && (
              <div className="space-y-4">
                {/* New Comment Input Box */}
                <form onSubmit={handleAddComment} className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="commentType"
                          checked={commentType === 'public'}
                          onChange={() => setCommentType('public')}
                          className="text-blue-600"
                        />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1">
                          <Globe size={12} className="text-blue-500" /> Public Reply
                        </span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="commentType"
                          checked={commentType === 'internal'}
                          onChange={() => setCommentType('internal')}
                          className="text-amber-600"
                        />
                        <span className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                          <Lock size={12} className="text-amber-500" /> Internal Support Note (Private)
                        </span>
                      </label>
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={
                      commentType === 'internal'
                        ? 'Add an internal note visible only to support agents and engineers...'
                        : 'Write a public response to the reporter...'
                    }
                    className={`w-full text-xs rounded-lg border p-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none ${
                      commentType === 'internal'
                        ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                    }`}
                  />

                  <div className="flex items-center justify-between">
                    <p className="text-[11px] text-zinc-400">
                      {commentType === 'internal' ? '🔒 Internal notes will not be emailed to the client.' : '🌐 Public replies notify the reporter.'}
                    </p>
                    <button
                      type="submit"
                      disabled={!commentText.trim()}
                      className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-xs transition disabled:opacity-50 ${
                        commentType === 'internal'
                          ? 'bg-amber-600 hover:bg-amber-700'
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <Send size={12} />
                      <span>{commentType === 'internal' ? 'Save Internal Note' : 'Send Reply'}</span>
                    </button>
                  </div>
                </form>

                {/* Comment Feed */}
                <div className="space-y-3">
                  {issueComments
                    .filter(c => activeTab === 'internal' ? c.type === 'internal' : true)
                    .map(c => {
                      const author = users.find(u => u.id === c.authorId);
                      const isInternal = c.type === 'internal';

                      return (
                        <div
                          key={c.id}
                          className={`p-4 rounded-xl border text-xs space-y-2 transition ${
                            isInternal
                              ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60'
                              : 'bg-white dark:bg-zinc-850/50 border-zinc-200 dark:border-zinc-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <img
                                src={author?.avatar || ''}
                                alt={author?.name || 'User'}
                                className="w-6 h-6 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                                {author?.name || 'Agent'}
                              </span>
                              {isInternal ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950 px-1.5 py-0.2 rounded border border-amber-300 dark:border-amber-800">
                                  <Lock size={10} /> Internal Note
                                </span>
                              ) : (
                                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-medium">
                                  Public Reply
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-zinc-400 font-mono">
                                {new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                              </span>
                              {c.authorId === currentUser.id && (
                                <button
                                  onClick={() => deleteComment(c.id)}
                                  className="text-zinc-400 hover:text-rose-500 p-0.5"
                                  title="Delete comment"
                                >
                                  <Trash2 size={12} />
                                </button>
                              )}
                            </div>
                          </div>

                          <div className="text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap pl-8">
                            {c.content}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Tab: Full Audit History */}
            {activeTab === 'history' && (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {issueActivity.map(event => {
                  const actor = users.find(u => u.id === event.userId);
                  return (
                    <div key={event.id} className="flex items-start gap-2.5 text-xs py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <img
                        src={actor?.avatar || ''}
                        alt={actor?.name || 'User'}
                        className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5"
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <p className="text-zinc-800 dark:text-zinc-200">
                          <span className="font-semibold text-zinc-900 dark:text-zinc-100">{actor?.name || 'System'}</span>{' '}
                          {event.details}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono mt-0.5 block">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar Column (1 Col): SLA Tracker & Issue Metadata */}
        <div className="space-y-5">
          {/* SLA Tracking Live Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                Service Level Agreement
              </span>
              <SLABadge issue={issue} size="sm" />
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex items-center justify-between text-zinc-500 mb-1">
                  <span>Resolution SLA ({issue.resolutionSLAHours}h window):</span>
                  <span className="font-mono font-bold text-zinc-900 dark:text-zinc-100">
                    {sla.resolutionText}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      sla.status === 'Breached'
                        ? 'bg-rose-500 w-full'
                        : sla.status === 'At Risk'
                        ? 'bg-amber-500 w-3/4'
                        : 'bg-emerald-500 w-1/3'
                    }`}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800 space-y-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">First Response:</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                    {issue.firstRespondedAt
                      ? new Date(issue.firstRespondedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Pending response'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Target Window:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-300">
                    {issue.responseSLAHours}h First Response / {issue.resolutionSLAHours}h Resolution
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Details / Metadata Panel */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs space-y-4">
            <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
              Issue Properties
            </h2>

            <div className="space-y-3.5 text-xs">
              {/* Support Level */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Support Tier:</span>
                <div className="flex items-center gap-1.5">
                  <SupportBadge level={issue.supportLevel} size="sm" />
                  {issue.supportLevel !== 'L3' && (
                    <button
                      onClick={() => setIsEscalateOpen(true)}
                      className="text-[11px] font-semibold text-amber-600 hover:underline"
                    >
                      Escalate
                    </button>
                  )}
                </div>
              </div>

              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Assignee:</span>
                <select
                  value={issue.assigneeId || ''}
                  onChange={e => updateIssue(issue.id, { assigneeId: e.target.value || undefined })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none max-w-[170px]"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.supportLevels.join('/')})
                    </option>
                  ))}
                </select>
              </div>

              {/* Reporter */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Reporter:</span>
                <span className="font-medium text-zinc-800 dark:text-zinc-200">
                  {reporter?.name || 'Unknown'}
                </span>
              </div>

              {/* Project */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Project:</span>
                <Link to={`/projects/${project?.id}`} className="font-medium text-blue-600 hover:underline">
                  {project?.name || 'Project'} ({project?.key})
                </Link>
              </div>

              {/* Sprint */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Sprint:</span>
                <select
                  value={issue.sprintId || ''}
                  onChange={e => updateIssue(issue.id, { sprintId: e.target.value || undefined })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none max-w-[170px]"
                >
                  <option value="">Backlog</option>
                  {sprints
                    .filter(s => s.projectId === issue.projectId)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.status})
                      </option>
                    ))}
                </select>
              </div>

              {/* Epic */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Epic:</span>
                <select
                  value={issue.epicId || ''}
                  onChange={e => updateIssue(issue.id, { epicId: e.target.value || undefined })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none max-w-[170px]"
                >
                  <option value="">None</option>
                  {epics
                    .filter(e => e.projectId === issue.projectId)
                    .map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Story Points */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Story Points:</span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={issue.storyPoints || ''}
                  onChange={e => updateIssue(issue.id, { storyPoints: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                  className="w-16 rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none text-right"
                  placeholder="0"
                />
              </div>

              {/* Estimated & Remaining Time */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Time Tracking:</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {issue.remainingTime || issue.estimatedTime || 'None'} est.
                </span>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Due Date:</span>
                <input
                  type="date"
                  value={issue.dueDate || ''}
                  onChange={e => updateIssue(issue.id, { dueDate: e.target.value || undefined })}
                  className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
                />
              </div>

              {/* Labels */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-zinc-500">Labels:</span>
                  <button
                    onClick={() => setShowAddLabel(prev => !prev)}
                    className="text-[11px] font-semibold text-blue-600 hover:underline"
                  >
                    + Add
                  </button>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {issue.labels.map(l => (
                    <span
                      key={l}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono"
                    >
                      <span>#{l}</span>
                      <button
                        onClick={() => handleRemoveLabel(l)}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>

                {showAddLabel && (
                  <form onSubmit={handleAddLabel} className="mt-2 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newLabel}
                      onChange={e => setNewLabel(e.target.value)}
                      placeholder="label-name"
                      className="flex-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-2 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-semibold"
                    >
                      Add
                    </button>
                  </form>
                )}
              </div>

              {/* Dates Audit */}
              <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[10px] text-zinc-400 space-y-1 font-mono">
                <div>Created: {new Date(issue.createdDate).toLocaleString()}</div>
                <div>Updated: {new Date(issue.updatedDate).toLocaleString()}</div>
                {issue.resolvedAt && <div>Resolved: {new Date(issue.resolvedAt).toLocaleString()}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {isEscalateOpen && (
        <EscalateModal
          isOpen={isEscalateOpen}
          issue={issue}
          onClose={() => setIsEscalateOpen(false)}
        />
      )}

      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Delete Issue"
        message={`Are you sure you want to delete ${issue.id}? This will remove all associated comments, internal notes, and attachments.`}
        confirmLabel="Delete Ticket"
        onConfirm={() => {
          deleteIssue(issue.id);
          setIsDeleteOpen(false);
          navigate('/issues');
        }}
        onCancel={() => setIsDeleteOpen(false)}
      />
    </div>
  );
};
