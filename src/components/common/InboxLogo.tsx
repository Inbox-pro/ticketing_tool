import React from 'react';

interface InboxLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
  tagText?: string;
}

export const InboxLogo: React.FC<InboxLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  className = '',
  iconOnly = false,
  tagText = 'Ticketing Tool',
}) => {
  const iconSizes = {
    xs: { width: 22, height: 22 },
    sm: { width: 30, height: 30 },
    md: { width: 38, height: 38 },
    lg: { width: 48, height: 48 },
    xl: { width: 64, height: 64 },
  };

  const textSizes = {
    xs: { title: 'text-xs', sub: 'text-[8px]', tag: 'text-[7px] px-1 py-0.2', underline: 'h-[1.5px]' },
    sm: { title: 'text-sm', sub: 'text-[9px]', tag: 'text-[8px] px-1.5 py-0.5', underline: 'h-[1.5px]' },
    md: { title: 'text-base', sub: 'text-[10px]', tag: 'text-[9px] px-2 py-0.5', underline: 'h-[2px]' },
    lg: { title: 'text-xl', sub: 'text-xs', tag: 'text-[10px] px-2.5 py-0.5', underline: 'h-[2.5px]' },
    xl: { title: 'text-2xl', sub: 'text-sm', tag: 'text-xs px-3 py-1', underline: 'h-[3px]' },
  };

  const { width, height } = iconSizes[size];
  const { title, sub, tag, underline } = textSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Vector Envelope Icon matching Inbox Infotech Pvt. Ltd. */}
      <svg
        width={width}
        height={height}
        viewBox="0 0 120 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 hover:scale-105"
        aria-label="Inbox Infotech Logo Icon"
      >
        {/* Top flap: Triangle pointing up in vibrant green */}
        <path
          d="M 60 12 L 98 46 L 22 46 Z"
          fill="#539E38"
        />

        {/* Paper sheet protruding from envelope */}
        <rect
          x="28"
          y="25"
          width="64"
          height="46"
          rx="2"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="1.5"
        />
        {/* Document lines on the letter */}
        <line x1="36" y1="35" x2="58" y2="35" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="36" y1="43" x2="80" y2="43" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="51" x2="72" y2="51" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

        {/* Envelope base shadow/border */}
        <path
          d="M 20 44 L 100 44 L 100 88 L 20 88 Z"
          fill="#0F766E"
          fillOpacity="0.05"
        />

        {/* Left front flap: Vibrant orange/rust triangle */}
        <path
          d="M 20 44 L 62 70 L 20 88 Z"
          fill="#E05A32"
        />

        {/* Right front flap: Vibrant cerulean blue triangle */}
        <path
          d="M 100 44 L 20 88 L 100 88 Z"
          fill="#0686C8"
        />

        {/* Crisp highlight / dividing edge between flaps */}
        <line
          x1="20"
          y1="88"
          x2="62"
          y2="70"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="20"
          y1="44"
          x2="62"
          y2="70"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>

      {/* Typography: "Inbox" + "Ticketing Tool" Badge + Underline + "Infotech Pvt.Ltd." */}
      {!iconOnly && showText && (
        <div className="flex flex-col justify-center leading-tight">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 ${title} font-sans`}
            >
              Inbox
            </span>
            {tagText && (
              <span
                className={`inline-flex items-center justify-center font-bold text-white bg-blue-600 dark:bg-blue-500 rounded-full uppercase tracking-wider ${tag} leading-none shadow-xs`}
              >
                {tagText}
              </span>
            )}
          </div>

          {/* Underline beneath Inbox and Tag */}
          <div className={`w-full bg-[#E05A32] ${underline} rounded-full my-0.5`} />

          {showSubtitle && (
            <span
              className={`font-semibold tracking-normal text-zinc-600 dark:text-zinc-300 ${sub} whitespace-nowrap`}
            >
              Infotech Pvt.Ltd.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
