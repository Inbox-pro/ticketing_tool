import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Shield, 
  Cpu, 
  Flame, 
  ArrowUpRight, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Search, 
  Plus, 
  ArrowRight,
  Filter,
  UserCheck
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { TypeBadge } from '../components/common/TypeBadge';
import { SLABadge } from '../components/common/SLABadge';
import { calculateSLAInfo } from '../services/storage';
import { SupportLevel, Issue } from '../types';
import { EscalateModal } from '../components/issue/EscalateModal';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';

export const SupportCenterPage: React.FC = () => {
  const { issues, users, projects, currentUser } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialTab = searchParams.get('level') || (searchParams.get('filter') === 'escalated' ? 'escalated' : 'ALL');
  const [activeQueue, setActiveQueue] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyBreachedOrRisk, setOnlyBreachedOrRisk] = useState(false);

  // Modals
  const [escalatingIssue, setEscalatingIssue] = useState<Issue | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Sync tab with URL search parameter if changed
  React.useEffect(() => {
    const lvl = searchParams.get('level');
    const filter = searchParams.get('filter');
    if (lvl) setActiveQueue(lvl);
    else if (filter === 'escalated') setActiveQueue('escalated');
  }, [searchParams]);

  // Queues counts
  const l1Tickets = issues.filter(i => i.supportLevel === 'L1');
  const l2Tickets = issues.filter(i => i.supportLevel === 'L2');
  const l3Tickets = issues.filter(i => i.supportLevel === 'L3');
  const escalatedTickets = issues.filter(i => i.isEscalated);

  // Filtered queue issues
  const currentQueueIssues = useMemo(() => {
    return issues.filter(issue => {
      // Queue match
      if (activeQueue === 'L1' && issue.supportLevel !== 'L1') return false;
      if (activeQueue === 'L2' && issue.supportLevel !== 'L2') return false;
      if (activeQueue === 'L3' && issue.supportLevel !== 'L3') return false;
      if (activeQueue === 'escalated' && !issue.isEscalated) return false;

      // Breached or At Risk filter toggle
      if (onlyBreachedOrRisk) {
        const sla = calculateSLAInfo(issue);
        if (sla.status === 'Within SLA') return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = issue.id.toLowerCase().includes(q);
        const titleMatch = issue.title.toLowerCase().includes(q);
        if (!idMatch && !titleMatch) return false;
      }

      return true;
    });
  }, [issues, activeQueue, onlyBreachedOrRisk, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Support Escalation Center
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
              L1 / L2 / L3 Multi-Tier
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Dispatch, route, and resolve technical escalations with SLA countdown monitoring.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
        >
          <Plus size={15} className="stroke-[2.5]" />
          <span>Log Support Ticket</span>
        </button>
      </div>

      {/* Tier Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* All Support */}
        <div
          onClick={() => {
            setActiveQueue('ALL');
            setSearchParams({});
          }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeQueue === 'ALL'
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-1 ring-blue-500'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">All Support Tickets</span>
            <ShieldAlert size={16} className="text-blue-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{issues.length}</span>
            <span className="text-xs text-zinc-400">active items</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Cross-tier unified queue</p>
        </div>

        {/* L1 Queue Card */}
        <div
          onClick={() => {
            setActiveQueue('L1');
            setSearchParams({ level: 'L1' });
          }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeQueue === 'L1'
              ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 ring-1 ring-sky-500'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">L1 Frontline Queue</span>
            <Shield size={16} className="text-sky-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-sky-900 dark:text-sky-100">{l1Tickets.length}</span>
            <span className="text-xs text-sky-600 font-medium">tickets</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Triage &amp; basic troubleshooting</p>
        </div>

        {/* L2 Queue Card */}
        <div
          onClick={() => {
            setActiveQueue('L2');
            setSearchParams({ level: 'L2' });
          }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeQueue === 'L2'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 ring-1 ring-amber-500'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">L2 Technical Queue</span>
            <Cpu size={16} className="text-amber-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-900 dark:text-amber-100">{l2Tickets.length}</span>
            <span className="text-xs text-amber-600 font-medium">investigating</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Configuration &amp; deep log audits</p>
        </div>

        {/* L3 Queue Card */}
        <div
          onClick={() => {
            setActiveQueue('L3');
            setSearchParams({ level: 'L3' });
          }}
          className={`p-4 rounded-xl border transition cursor-pointer ${
            activeQueue === 'L3'
              ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/40 ring-1 ring-purple-500'
              : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">L3 Engineering Queue</span>
            <Flame size={16} className="text-purple-500" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-900 dark:text-purple-100">{l3Tickets.length}</span>
            <span className="text-xs text-purple-600 font-medium">escalated</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Defects &amp; code modifications</p>
        </div>
      </div>

      {/* Queue Filter Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveQueue('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeQueue === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            All Tickets ({issues.length})
          </button>
          <button
            onClick={() => setActiveQueue('L1')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeQueue === 'L1'
                ? 'bg-sky-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <Shield size={13} />
            <span>L1 Queue ({l1Tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveQueue('L2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeQueue === 'L2'
                ? 'bg-amber-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <Cpu size={13} />
            <span>L2 Queue ({l2Tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveQueue('L3')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeQueue === 'L3'
                ? 'bg-purple-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <Flame size={13} />
            <span>L3 Queue ({l3Tickets.length})</span>
          </button>
          <button
            onClick={() => setActiveQueue('escalated')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeQueue === 'escalated'
                ? 'bg-rose-600 text-white'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
            }`}
          >
            <ArrowUpRight size={13} />
            <span>Escalated ({escalatedTickets.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyBreachedOrRisk}
              onChange={e => setOnlyBreachedOrRisk(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500"
            />
            <span className="font-medium text-rose-600 dark:text-rose-400">At Risk or Breached Only</span>
          </label>

          <div className="relative w-48 sm:w-56">
            <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search queue..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Queue Issues Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-200 dark:border-zinc-800 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ticket</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4">Tier</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">SLA Countdown</th>
                <th className="py-3 px-4 text-right">Escalation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {currentQueueIssues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-400">
                    No tickets in this queue matching current criteria.
                  </td>
                </tr>
              ) : (
                currentQueueIssues.map(issue => {
                  const assignee = users.find(u => u.id === issue.assigneeId);
                  const isEscalatable = issue.supportLevel !== 'L3';

                  return (
                    <tr
                      key={issue.id}
                      className="hover:bg-zinc-50/80 dark:hover:bg-zinc-850/50 transition"
                    >
                      {/* Ticket Key */}
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
                      <td className="py-3 px-4 min-w-[200px] max-w-[320px]">
                        <button
                          onClick={() => navigate(`/issues/${issue.id}`)}
                          className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 text-left line-clamp-1"
                        >
                          {issue.title}
                        </button>
                        {issue.escalationHistory && issue.escalationHistory.length > 0 && (
                          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">
                            Escalated {issue.escalationHistory.length}x (Last: {issue.escalationHistory[issue.escalationHistory.length - 1].fromLevel} → {issue.escalationHistory[issue.escalationHistory.length - 1].toLevel})
                          </span>
                        )}
                      </td>

                      {/* Tier */}
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

                      {/* SLA Countdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <SLABadge issue={issue} size="sm" showDetails={true} />
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isEscalatable ? (
                            <button
                              onClick={() => setEscalatingIssue(issue)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 hover:bg-amber-200 transition"
                            >
                              <ArrowUpRight size={13} className="stroke-[2.5]" />
                              <span>Escalate</span>
                            </button>
                          ) : (
                            <span className="text-[11px] text-zinc-400 font-mono">Max Tier (L3)</span>
                          )}
                          <button
                            onClick={() => navigate(`/issues/${issue.id}`)}
                            className="px-2.5 py-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded"
                          >
                            Open
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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
