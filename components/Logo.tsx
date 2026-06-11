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
  // Sizing mappings
  const sizeClasses = {
    sm: {
      svg: 'h-6',
    },
    md: {
      svg: 'h-8',
    },
    lg: {
      svg: 'h-10',
    },
    xl: {
      svg: 'h-12',
    },
  };

  const selectedSize = sizeClasses[size];

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <div className="flex items-center justify-center rounded-full border border-gray-200/60 bg-white px-4 py-2 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white">
        <img
          src="https://h.top4top.io/p_3811feeoa1.jpeg"
          alt="SiraMix Logo"
          className={`${selectedSize.svg} w-auto object-contain shrink-0 mix-blend-multiply`}
        />
      </div>
    </div>
  );
};
