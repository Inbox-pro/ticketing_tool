import React from 'react';
import { Priority } from '../../types';
import { ChevronsUp, ChevronUp, Equal, ChevronDown, ChevronsDown } from 'lucide-react';

interface Props {
  priority: Priority;
  size?: 'sm' | 'md';
  showText?: boolean;
}

export const PriorityBadge: React.FC<Props> = ({ priority, size = 'md', showText = true }) => {
  const getConfig = () => {
    switch (priority) {
      case 'Highest':
        return {
          icon: ChevronsUp,
          color: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
        };
      case 'High':
        return {
          icon: ChevronUp,
          color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-900',
        };
      case 'Medium':
        return {
          icon: Equal,
          color: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
        };
      case 'Low':
        return {
          icon: ChevronDown,
          color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900',
        };
      case 'Lowest':
        return {
          icon: ChevronsDown,
          color: 'text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800',
        };
    }
  };

  const { icon: Icon, color } = getConfig();

  return (
    <span
      id={`priority-${priority.toLowerCase()}`}
      className={`inline-flex items-center gap-1 rounded border font-medium select-none ${color} ${
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      title={`Priority: ${priority}`}
    >
      <Icon size={size === 'sm' ? 12 : 14} className="shrink-0 stroke-[2.5]" />
      {showText && <span>{priority}</span>}
    </span>
  );
};
