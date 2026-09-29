import React from 'react';
import { FreshnessLevel } from '../../types';
import { Clock, CheckCircle2, AlertTriangle, AlertOctagon } from 'lucide-react';

interface FreshnessBadgeProps {
  level: FreshnessLevel;
  score?: number;
  hoursRemaining?: number;
  showDetails?: boolean;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  level,
  score,
  hoursRemaining,
  showDetails = false,
}) => {
  const configs = {
    fresh: {
      label: 'Fresh Produce',
      teluguLabel: 'తాజా నాణ్యత',
      subtext: 'Direct human consumption',
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500 animate-pulse',
      icon: CheckCircle2,
      accentColor: 'text-emerald-600',
    },
    moderate: {
      label: 'Moderate Freshness',
      teluguLabel: 'మధ్యస్థం - త్వరగా వాడాలి',
      subtext: 'Cook within 6-12 hours',
      bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
      icon: AlertTriangle,
      accentColor: 'text-amber-600',
    },
    critical: {
      label: 'Critical / Action Needed',
      teluguLabel: 'అత్యవసరం / మళ్లింపు',
      subtext: 'Immediate use / Animal feed / Compost',
      bgClass: 'bg-rose-50 text-rose-800 border-rose-200',
      dotClass: 'bg-rose-500 animate-ping',
      icon: AlertOctagon,
      accentColor: 'text-rose-600',
    },
  };

  const config = configs[level] || configs.fresh;
  const Icon = config.icon;

  return (
    <div className="inline-flex items-center gap-1.5">
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bgClass}`}
      >
        <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
        {score !== undefined && (
          <span className="opacity-75 font-normal">({score}%)</span>
        )}
      </span>

      {showDetails && hoursRemaining !== undefined && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
          <Clock className="w-3 h-3 text-gray-400" />
          <span>{hoursRemaining}h shelf life</span>
        </span>
      )}
    </div>
  );
};
