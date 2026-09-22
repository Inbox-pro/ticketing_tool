import React from 'react';
import { SupportLevel } from '../../types';
import { Shield, Cpu, Flame } from 'lucide-react';

interface Props {
  level: SupportLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const SupportBadge: React.FC<Props> = ({ level, size = 'md', showLabel = true }) => {
  const getStyle = () => {
    switch (level) {
      case 'L1':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800',
          dot: 'bg-sky-500',
          icon: Shield,
          title: 'L1 - First Level Support',
        };
      case 'L2':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          dot: 'bg-amber-500',
          icon: Cpu,
          title: 'L2 - Technical Support',
        };
      case 'L3':
        return {
          bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          dot: 'bg-purple-500',
          icon: Flame,
          title: 'L3 - Expert / Engineering Support',
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1 font-medium',
    md: 'text-xs px-2 py-0.5 gap-1.5 font-semibold',
    lg: 'text-sm px-2.5 py-1 gap-2 font-semibold',
  }[size];

  const iconSizes = {
    sm: 11,
    md: 13,
    lg: 15,
  }[size];

  return (
    <span
      id={`support-badge-${level.toLowerCase()}`}
      title={config.title}
      className={`inline-flex items-center rounded-md border tracking-wide select-none ${config.bg} ${sizeClasses}`}
    >
      <Icon size={iconSizes} className="shrink-0" />
      <span>{level}</span>
      {showLabel && size !== 'sm' && (
        <span className="opacity-75 font-normal text-[10px] uppercase tracking-wider">
          {level === 'L1' ? 'First Level' : level === 'L2' ? 'Technical' : 'Engineering'}
        </span>
      )}
    </span>
  );
};
