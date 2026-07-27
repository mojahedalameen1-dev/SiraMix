import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  showText = true,
  size = 'md',
}) => {
  const dimensions = {
    sm: { mark: 'h-8 w-8', text: 'text-base' },
    md: { mark: 'h-10 w-10', text: 'text-xl' },
    lg: { mark: 'h-12 w-12', text: 'text-2xl' },
    xl: { mark: 'h-14 w-14', text: 'text-3xl' },
  }[size];

  return (
    <div className={`inline-flex select-none items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        className={`${dimensions.mark} shrink-0`}
        role="img"
        aria-label="SiraMix"
      >
        <rect width="48" height="48" rx="15" fill="#12231e" />
        <path d="M14 14h14.5a5.5 5.5 0 0 1 0 11H21a5.5 5.5 0 0 0 0 11h13" fill="none" stroke="#f7f4ec" strokeWidth="4.5" strokeLinecap="round" />
        <circle cx="34" cy="14" r="4.5" fill="#ff6b4a" />
        <path d="M34 29v7" stroke="#67c7a5" strokeWidth="4.5" strokeLinecap="round" />
      </svg>
      {showText && (
        <span className={`${dimensions.text} font-black tracking-[-0.04em] text-[#12231e] dark:text-[#f7f4ec]`}>
          Sira<span className="text-[#ff6b4a]">Mix</span>
        </span>
      )}
    </div>
  );
};
