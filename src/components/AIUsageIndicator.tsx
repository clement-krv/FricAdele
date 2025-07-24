import React from 'react';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface UsageStats {
  currentCount: number;
  limit: number;
  remaining: number;
  isNearLimit: boolean;
  percentageUsed: number;
}

interface AIUsageIndicatorProps {
  usageStats: UsageStats | null;
}

const AIUsageIndicator: React.FC<AIUsageIndicatorProps> = ({ usageStats }) => {
  if (!usageStats) return null;

  const { currentCount, limit, remaining, isNearLimit, percentageUsed } = usageStats;

  const getStatusColor = () => {
    if (remaining === 0) return 'text-red-600 bg-red-50 border-red-200';
    if (isNearLimit) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getStatusIcon = () => {
    if (remaining === 0) return <AlertTriangle className="w-4 h-4" />;
    if (isNearLimit) return <Clock className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getProgressBarColor = () => {
    if (remaining === 0) return 'bg-red-500';
    if (isNearLimit) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className={`p-3 rounded-lg border ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className="font-medium text-sm">
            Usage Assistant IA
          </span>
        </div>
        <span className="text-xs font-mono">
          {currentCount}/{limit}
        </span>
      </div>
      
      {/* Barre de progression */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor()}`}
          style={{ width: `${Math.min(percentageUsed, 100)}%` }}
        ></div>
      </div>
      
      <div className="text-xs">
        {remaining > 0 ? (
          <span>
            {remaining} message{remaining > 1 ? 's' : ''} restant{remaining > 1 ? 's' : ''} aujourd'hui
          </span>
        ) : (
          <span>Limite atteinte • Reset à minuit</span>
        )}
      </div>
    </div>
  );
};

export default AIUsageIndicator;
