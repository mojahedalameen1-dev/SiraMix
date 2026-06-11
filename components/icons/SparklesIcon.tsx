import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="currentColor"
    className={className}
  >
    <path d="M11.6667 0L13.8443 8.15572L22 10.3333L13.8443 12.5109L11.6667 20.6667L9.48905 12.5109L1.33333 10.3333L9.48905 8.15572L11.6667 0Z"/>
    <path d="M20.6667 15.3333L19.3333 19.3333L15.3333 20.6667L19.3333 22L20.6667 26L22 22L26 20.6667L22 19.3333L20.6667 15.3333Z" />
    <path d="M5.33333 18.6667L4 21.3333L1.33333 22.6667L4 24L5.33333 26.6667L6.66667 24L9.33333 22.6667L6.66667 21.3333L5.33333 18.6667Z" />
  </svg>
);