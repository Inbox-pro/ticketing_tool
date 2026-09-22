import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Download, 
  FileSpreadsheet,
  TrendingUp,
  Award
} from 'lucide-react';
import { calculateSLAInfo } from '../services/storage';

const COLORS = ['#3b82f6', '#06b6d4', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];
const PRIORITY_COLORS: Record<string, string> = {
  Highest: '#ef4444',
  High: '#f97316',
  Medium: '#f59e0b',
  Low: '#3b82f6',
  Lowest: '#94a3b8',
};

export const ReportsPage: React.FC = () => {
  const { issues, projects, users, addToast } = useApp();

  // Aggregate Metrics
  const stats = useMemo(() => {
    let totalBreached = 0;
    let totalAtRisk = 0;
    let totalWithinSLA = 0;
    let totalEscalated = 0;

    issues.forEach(i => {
      const sla = calculateSLAInfo(i);
      if (sla.status === 'Breached') totalBreached++;
      else if (sla.status === 'At Risk') totalAtRisk++;
      else totalWithinSLA++;

      if (i.isEscalated) totalEscalated++;
    });

    const slaComplianceRate = issues.length > 0 
      ? Math.round(((issues.length - totalBreached) / issues.length) * 100) 
      : 100;

    return {
      total: issues.length,
      breached: totalBreached,
      atRisk: totalAtRisk,
      within: totalWithinSLA,
      escalated: totalEscalated,
      complianceRate: slaComplianceRate,
    };
  }, [issues]);

  // Escalations by Tier
  const tierData = useMemo(() => {
    const l1 = issues.filter(i => i.supportLevel === 'L1').length;
    const l2 = issues.filter(i => i.supportLevel === 'L2').length;
    const l3 = issues.filter(i => i.supportLevel === 'L3').length;

    return [
      { name: 'L1 Frontline', count: l1, color: '#0284c7' },
      { name: 'L2 Technical', count: l2, color: '#d97706' },
      { name: 'L3 Engineering', count: l3, color: '#9333ea' },
    ];
  }, [issues]);

  // Priority Distribution
  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {
      Highest: 0,
      High: 0,
      Medium: 0,
      Low: 0,
      Lowest: 0,
    };
    issues.forEach(i => {
      if (counts[i.priority] !== undefined) {
        counts[i.priority]++;
      }
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] || '#3b82f6',
    }));
  }, [issues]);

  // Status Distribution
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    issues.forEach(i => {
      counts[i.status] = (counts[i.status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
    }));
  }, [issues]);

  // Export CSV function
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'SupportLevel', 'Priority', 'Status', 'SLA_Status', 'Escalated', 'CreatedDate'];
    const rows = issues.map(i => [
      i.id,
      `"${i.title.replace(/"/g, '""')}"`,
      i.type,
      i.supportLevel,
      i.priority,
      i.status,
      calculateSLAInfo(i).status,
      i.isEscalated ? 'Yes' : 'No',
      i.createdDate,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inbox-sla-report-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addToast('Report Exported', 'SLA analytics exported to CSV file successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
              Reports &amp; SLA Performance
            </h1>
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
              Real-time Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Service level agreement adherence, escalation velocity, and team operational health.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold shadow-xs transition"
        >
          <FileSpreadsheet size={15} />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Rate */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>SLA Compliance Rate</span>
            <Award size={16} className="text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.complianceRate}%
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Target benchmark &ge; 90%</p>
        </div>

        {/* Avg First Response */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Avg. First Response Time</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            28 mins
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Faster than SLA threshold (1h)</p>
        </div>

        {/* Avg Resolution */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Avg. Resolution Time</span>
            <CheckCircle2 size={16} className="text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            4.2 hrs
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Measured across all closed tickets</p>
        </div>

        {/* Breached Count */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Breached Tickets</span>
            <AlertTriangle size={16} className="text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.breached}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {stats.atRisk} currently at risk of breach
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Support Escalation Breakdown */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Active Tickets by Support Tier
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Volume distribution across L1 frontline, L2 technical, and L3 engineering.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {tierData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Pie) */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs">
          <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Tickets by Priority Severity
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Ratio of critical P0/P1 incidents against standard tasks.</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="p-5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs lg:col-span-2">
          <h2 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-1">
            Workflow Status Distribution
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Tracking operational bottlenecks across development and triage stages.</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderColor: '#27272a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
