import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  highlightColor?: 'blue' | 'emerald' | 'amber' | 'purple' | 'red';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  highlightColor = 'blue',
}) => {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
      <div className="flex items-center justify-between text-slate-400 text-xs">
        <span className="font-medium">{title}</span>
        <span className={`p-1.5 rounded-lg border ${colorMap[highlightColor]}`}>
          {icon}
        </span>
      </div>
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        {trend && (
          <span
            className={`text-xs font-semibold ${
              trend.isPositive ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>
      {subtitle && <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
};

