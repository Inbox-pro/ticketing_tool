import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';
import { 
  Ticket, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  ArrowUpRight, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Flame,
  Cpu,
  Shield,
  Activity
} from 'lucide-react';
import { SupportBadge } from '../components/common/SupportBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { StatusBadge } from '../components/common/StatusBadge';
import { SLABadge } from '../components/common/SLABadge';
import { calculateSLAInfo } from '../services/storage';
import { CreateIssueModal } from '../components/issue/CreateIssueModal';
import { EscalateModal } from '../components/issue/EscalateModal';
import { Issue } from '../types';

export const Dashboard: React.FC = () => {
  const { issues, projects, users, activity, currentUser } = useApp();
  const navigate = useNavigate();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedIssueForEscalation, setSelectedIssueForEscalation] = useState<Issue | null>(null);

  // Key Metrics
  const totalIssues = issues.length;
  const openIssues = issues.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;
  const resolvedIssues = issues.filter(i => i.status === 'Resolved' || i.status === 'Closed').length;
  const escalatedIssues = issues.filter(i => i.isEscalated && i.status !== 'Resolved' && i.status !== 'Closed').length;
  
  // SLA metrics
  const slaStatuses = issues.map(i => calculateSLAInfo(i).status);
  const withinSLACount = slaStatuses.filter(s => s === 'Within SLA').length;
  const atRiskCount = slaStatuses.filter(s => s === 'At Risk').length;
  const breachedCount = slaStatuses.filter(s => s === 'Breached').length;
  const slaComplianceRate = totalIssues > 0 ? Math.round(((totalIssues - breachedCount) / totalIssues) * 100) : 100;

  // Support Tier Metrics
  const l1Count = issues.filter(i => i.supportLevel === 'L1').length;
  const l2Count = issues.filter(i => i.supportLevel === 'L2').length;
  const l3Count = issues.filter(i => i.supportLevel === 'L3').length;

  // Chart Data: Status Breakdown
  const statusCounts: Record<string, number> = {};
  issues.forEach(i => {
    statusCounts[i.status] = (statusCounts[i.status] || 0) + 1;
  });
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const STATUS_COLORS = ['#3b82f6', '#6366f1', '#f59e0b', '#06b6d4', '#10b981', '#64748b', '#f43f5e', '#8b5cf6'];

  // Chart Data: Priority Breakdown
  const priorityOrder = ['Highest', 'High', 'Medium', 'Low', 'Lowest'];
  const priorityData = priorityOrder.map(priority => ({
    priority,
    count: issues.filter(i => i.priority === priority).length,
  }));

  // Support Tier vs SLA Breakdown
  const tierSLAData = [
    {
      tier: 'L1 Frontline',
      Within: issues.filter(i => i.supportLevel === 'L1' && calculateSLAInfo(i).status === 'Within SLA').length,
      AtRisk: issues.filter(i => i.supportLevel === 'L1' && calculateSLAInfo(i).status === 'At Risk').length,
      Breached: issues.filter(i => i.supportLevel === 'L1' && calculateSLAInfo(i).status === 'Breached').length,
    },
    {
      tier: 'L2 Technical',
      Within: issues.filter(i => i.supportLevel === 'L2' && calculateSLAInfo(i).status === 'Within SLA').length,
      AtRisk: issues.filter(i => i.supportLevel === 'L2' && calculateSLAInfo(i).status === 'At Risk').length,
      Breached: issues.filter(i => i.supportLevel === 'L2' && calculateSLAInfo(i).status === 'Breached').length,
    },
    {
      tier: 'L3 Engineering',
      Within: issues.filter(i => i.supportLevel === 'L3' && calculateSLAInfo(i).status === 'Within SLA').length,
      AtRisk: issues.filter(i => i.supportLevel === 'L3' && calculateSLAInfo(i).status === 'At Risk').length,
      Breached: issues.filter(i => i.supportLevel === 'L3' && calculateSLAInfo(i).status === 'Breached').length,
    },
  ];

  // Tickets needing immediate attention (At Risk, Breached, or High Priority Open)
  const urgentTickets = issues
    .filter(i => i.status !== 'Resolved' && i.status !== 'Closed')
    .sort((a, b) => {
      const slaA = calculateSLAInfo(a);
      const slaB = calculateSLAInfo(b);
      return slaA.resolutionRemainingMs - slaB.resolutionRemainingMs;
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Executive Operations Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time project delivery, support queue velocity, and SLA compliance monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => navigate('/support')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
          >
            <ShieldAlert size={14} className="text-amber-500" />
            <span>Support Queues</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <Plus size={15} className="stroke-[2.5]" />
            <span>Create Issue</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Open Tickets */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Open Tickets</span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
              <Ticket size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{openIssues}</span>
            <span className="text-xs text-zinc-400">/ {totalIssues} total</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-blue-600 dark:text-blue-400">{resolvedIssues} resolved</span>
            <span>across {projects.length} projects</span>
          </div>
        </div>

        {/* SLA Compliance */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">SLA Compliance</span>
            <div className={`p-2 rounded-lg ${
              slaComplianceRate >= 90 
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
            }`}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{slaComplianceRate}%</span>
            <span className="text-xs text-emerald-600 font-medium">{withinSLACount} within target</span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="text-amber-600 font-medium">{atRiskCount} at risk</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-rose-600 font-medium">{breachedCount} breached</span>
          </div>
        </div>

        {/* Support Escalations */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Escalations</span>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{escalatedIssues}</span>
            <span className="text-xs text-amber-600 font-medium">routed to L2/L3</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            Escalation workflow active
          </div>
        </div>

        {/* Support Tier Distribution */}
        <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Support Tiers</span>
            <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs font-semibold text-sky-600 dark:text-sky-400 font-mono">L1:{l1Count}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono">L2:{l2Count}</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 font-mono">L3:{l3Count}</span>
          </div>
          <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
            {users.length} active engineers &amp; agents
          </div>
        </div>
      </div>

      {/* Support Tiers Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* L1 Card */}
        <div 
          onClick={() => navigate('/support?level=L1')}
          className="p-4 rounded-xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200/80 dark:border-sky-900/60 hover:border-sky-400 dark:hover:border-sky-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300">
                <Shield size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-sky-900 dark:text-sky-200">L1 Frontline Support</h3>
                <p className="text-[11px] text-sky-700/80 dark:text-sky-400/80">Basic triage &amp; initial troubleshooting</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-sky-600 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
            <span className="text-zinc-600 dark:text-zinc-400">Total volume:</span>
            <span className="font-bold text-sky-700 dark:text-sky-300">{l1Count} tickets</span>
          </div>
        </div>

        {/* L2 Card */}
        <div 
          onClick={() => navigate('/support?level=L2')}
          className="p-4 rounded-xl bg-amber-50/40 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/60 hover:border-amber-400 dark:hover:border-amber-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300">
                <Cpu size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-amber-900 dark:text-amber-200">L2 Technical Support</h3>
                <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Log investigation &amp; configuration fixes</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-amber-600 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
            <span className="text-zinc-600 dark:text-zinc-400">Technical queue:</span>
            <span className="font-bold text-amber-700 dark:text-amber-300">{l2Count} tickets</span>
          </div>
        </div>

        {/* L3 Card */}
        <div 
          onClick={() => navigate('/support?level=L3')}
          className="p-4 rounded-xl bg-purple-50/40 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-900/60 hover:border-purple-400 dark:hover:border-purple-700 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300">
                <Flame size={16} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-purple-900 dark:text-purple-200">L3 Engineering Support</h3>
                <p className="text-[11px] text-purple-700/80 dark:text-purple-400/80">Codebase defects &amp; deep infrastructure</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-purple-600 group-hover:translate-x-0.5 transition" />
          </div>
          <div className="mt-3 flex items-baseline justify-between text-xs font-mono">
            <span className="text-zinc-600 dark:text-zinc-400">Engineering queue:</span>
            <span className="font-bold text-purple-700 dark:text-purple-300">{l3Count} tickets</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Tier SLA Health Chart */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Support Tier SLA Health
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Compliance distribution across L1, L2, and L3 queues
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierSLAData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="tier" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="Within" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="AtRisk" fill="#f59e0b" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Breached" fill="#f43f5e" stackId="a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Within SLA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-zinc-600 dark:text-zinc-400">At Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Breached</span>
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Tickets by Priority
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                P0 (Blocker) through P4 distribution
              </p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="priority" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    borderColor: '#27272a', 
                    borderRadius: '8px', 
                    color: '#fff',
                    fontSize: '12px' 
                  }} 
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Total active priorities mapped to strict hourly response SLA windows
          </div>
        </div>
      </div>

      {/* Two Column Layout: Urgent SLA Queue vs Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Urgent Attention Queue (2 Cols) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Urgent Priority &amp; SLA Attention
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Tickets requiring immediate response or escalation to avoid SLA breaches
              </p>
            </div>
            <button
              onClick={() => navigate('/issues')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
            >
              <span>View all issues</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
            {urgentTickets.map(issue => {
              const assignee = users.find(u => u.id === issue.assigneeId);
              return (
                <div
                  key={issue.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-zinc-50 dark:hover:bg-zinc-850/50 px-2 rounded-lg transition"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => navigate(`/issues/${issue.id}`)}
                        className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {issue.id}
                      </button>
                      <SupportBadge level={issue.supportLevel} size="sm" />
                      <PriorityBadge priority={issue.priority} size="sm" />
                      <StatusBadge status={issue.status} size="sm" />
                    </div>
                    <p
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 mt-1.5 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 line-clamp-1"
                    >
                      {issue.title}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-zinc-500 dark:text-zinc-400">
                      <span>Assignee: {assignee?.name || 'Unassigned'}</span>
                      <span>•</span>
                      <SLABadge issue={issue} size="sm" showDetails={true} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {issue.supportLevel !== 'L3' && (
                      <button
                        onClick={() => setSelectedIssueForEscalation(issue)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 transition"
                      >
                        <ArrowUpRight size={12} />
                        <span>Escalate</span>
                      </button>
                    )}
                    <button
                      onClick={() => navigate(`/issues/${issue.id}`)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition"
                    >
                      Open
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Activity Stream (1 Col) */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-zinc-500" />
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Workspace Activity
              </h3>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">Live Audit</span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {activity.slice(0, 7).map(item => {
              const actor = users.find(u => u.id === item.userId);
              return (
                <div key={item.id} className="flex items-start gap-2.5 text-xs">
                  <img
                    src={actor?.avatar || ''}
                    alt={actor?.name || 'User'}
                    className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 dark:text-zinc-200 leading-snug">
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {actor?.name || 'User'}
                      </span>{' '}
                      {item.details}
                    </p>
                    <span className="text-[10px] text-zinc-400 mt-0.5 block font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      <CreateIssueModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
      {selectedIssueForEscalation && (
        <EscalateModal
          isOpen={!!selectedIssueForEscalation}
          issue={selectedIssueForEscalation}
          onClose={() => setSelectedIssueForEscalation(null)}
        />
      )}
    </div>
  );
};
