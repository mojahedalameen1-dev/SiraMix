import React from 'react';

interface CircularProgressProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine colors based on score
  let strokeColor = 'stroke-red-500';
  let textColor = 'text-red-500 bg-red-500/10';
  let ratingLabel = 'Low';
  let ratingLabelAr = 'ضعيف';

  if (score >= 80) {
    strokeColor = 'stroke-emerald-500';
    textColor = 'text-emerald-500 bg-emerald-500/10';
    ratingLabel = 'Excellent';
    ratingLabelAr = 'ممتاز';
  } else if (score >= 50) {
    strokeColor = 'stroke-amber-500';
    textColor = 'text-amber-500 bg-amber-500/10';
    ratingLabel = 'Good';
    ratingLabelAr = 'جيد';
  }

  // Detect current document direction to decide language fallback if needed
  const isRtl = document.documentElement.dir === 'rtl';

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-background border border-border rounded-xl shadow-sm">
      <div className="relative" style={{ width: size, height: size }}>
        {/* SVG Progress Circle */}
        <svg className="w-full h-full transform -rotate-90">
          {/* Background circle */}
          <circle
            className="stroke-slate-100 dark:stroke-slate-800"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Foreground progress circle */}
          <circle
            className={`transition-all duration-500 ease-out ${strokeColor}`}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-foreground tracking-tight">
            {score}
          </span>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            / 100
          </span>
        </div>
      </div>

      {/* Numerical and Performance Badge */}
      <span className={`mt-3 px-3 py-1 text-xs font-bold rounded-full ${textColor} shadow-sm animate-fade-in`}>
        {isRtl ? ratingLabelAr : ratingLabel}
      </span>
    </div>
  );
};
