import React from 'react';
import { Logo } from './Logo';

interface BrandLoaderProps {
  label: string;
  compact?: boolean;
}

export const BrandLoader: React.FC<BrandLoaderProps> = ({ label, compact = false }) => (
  <div className="flex flex-col items-center gap-4">
    <div className={`relative grid place-items-center ${compact ? 'h-16 w-16' : 'h-20 w-20'}`}>
      <span className="brand-loader-orbit absolute inset-0 rounded-[1.65rem] border-2 border-[#67c7a5]/25 border-t-[#ff6b4a]" />
      <div className="brand-logo-motion rounded-2xl bg-white p-1.5 shadow-xl dark:bg-[#172720]">
        <Logo showText={false} size={compact ? 'sm' : 'md'} />
      </div>
    </div>
    <span className="text-sm font-black text-muted-foreground">{label}</span>
  </div>
);
