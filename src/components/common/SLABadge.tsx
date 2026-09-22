import React from 'react';
import { Issue } from '../../types';
import { calculateSLAInfo } from '../../services/storage';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface Props {
  issue: Issue;
  size?: 'sm' | 'md';
  showDetails?: boolean;
}

export const SLABadge: React.FC<Props> = ({ issue, size = 'md', showDetails = false }) => {
  const sla = calculateSLAInfo(issue);

  const getStyle = () => {
    switch (sla.status) {
      case 'Within SLA':
        return {
          icon: CheckCircle,
          badge: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
          dot: 'bg-emerald-500',
        };
      case 'At Risk':
        return {
          icon: Clock,
          badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
        };
      case 'Breached':
        return {
          icon: AlertTriangle,
          badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800',
          dot: 'bg-rose-500',
        };
    }
  };

  const { icon: Icon, badge } = getStyle();

  return (
    <div className="inline-flex items-center gap-1.5" title={`SLA: ${sla.status} (${sla.resolutionText})`}>
      <span
        id={`sla-${issue.id}`}
        className={`inline-flex items-center gap-1 font-medium rounded border select-none ${badge} ${
          size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
        }`}
      >
        <Icon size={size === 'sm' ? 11 : 13} className="shrink-0" />
        <span>{sla.status}</span>
      </span>
      {showDetails && (
        <span className={`text-[11px] font-mono ${sla.isResolutionBreached ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
          {sla.resolutionText}
        </span>
      )}
    </div>
  );
};
