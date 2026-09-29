import React from 'react';
import { Sparkles } from 'lucide-react';

interface AIMatchScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const AIMatchScoreRing: React.FC<AIMatchScoreRingProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  // Determine color theme based on match score
  let ringColor = 'text-emerald-500';
  let bgColor = 'bg-emerald-50';
  let textColor = 'text-emerald-700';

  if (score >= 90) {
    ringColor = 'text-emerald-600';
    bgColor = 'bg-emerald-50';
    textColor = 'text-emerald-700';
  } else if (score >= 80) {
    ringColor = 'text-teal-600';
    bgColor = 'bg-teal-50';
    textColor = 'text-teal-700';
  } else if (score >= 70) {
    ringColor = 'text-amber-600';
    bgColor = 'bg-amber-50';
    textColor = 'text-amber-700';
  } else {
    ringColor = 'text-gray-500';
    bgColor = 'bg-gray-100';
    textColor = 'text-gray-700';
  }

  const radius = size === 'sm' ? 16 : size === 'lg' ? 32 : 24;
  const stroke = size === 'sm' ? 3 : size === 'lg' ? 5 : 4;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const dimension = radius * 2;

  return (
    <div className="flex items-center gap-2">
      <div className="relative inline-flex items-center justify-center">
        <svg height={dimension} width={dimension} className="-rotate-90">
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="currentColor"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            className={`${ringColor} transition-all duration-700 ease-out`}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <span
          className={`absolute text-xs font-bold ${textColor} ${
            size === 'sm' ? 'text-[10px]' : size === 'lg' ? 'text-base' : 'text-xs'
          }`}
        >
          {score}%
        </span>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-emerald-800">
            <Sparkles className="w-3 h-3 text-amber-500 inline" />
            AI Match Score
          </span>
          <span className="text-[11px] text-gray-500">
            {score >= 90 ? 'Highest compatibility' : score >= 80 ? 'Strong match' : 'Suitable option'}
          </span>
        </div>
      )}
    </div>
  );
};
