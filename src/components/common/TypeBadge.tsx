import React from 'react';
import { IssueType } from '../../types';
import { Bug, CheckSquare, Bookmark, Zap, GitCommit } from 'lucide-react';

interface Props {
  type: IssueType;
  showText?: boolean;
  size?: 'sm' | 'md';
}

export const TypeBadge: React.FC<Props> = ({ type, showText = true, size = 'md' }) => {
  const getConfig = () => {
    switch (type) {
      case 'Bug':
        return { icon: Bug, color: 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' };
      case 'Story':
        return { icon: Bookmark, color: 'text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900' };
      case 'Task':
        return { icon: CheckSquare, color: 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900' };
      case 'Epic':
        return { icon: Zap, color: 'text-purple-500 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-900' };
      case 'Sub-task':
        return { icon: GitCommit, color: 'text-cyan-500 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-900' };
    }
  };

  const { icon: Icon, color } = getConfig();
  const iconSize = size === 'sm' ? 12 : 14;

  return (
    <span
      id={`type-${type.toLowerCase().replace(/\s+/g, '-')}`}
      className={`inline-flex items-center gap-1.5 rounded font-medium select-none border ${color} ${
        size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
      title={`Type: ${type}`}
    >
      <Icon size={iconSize} className="shrink-0" />
      {showText && <span>{type}</span>}
    </span>
  );
};
