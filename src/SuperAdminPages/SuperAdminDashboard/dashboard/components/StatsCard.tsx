import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: number;
  trendLabel?: string;
}

export const StatsCard = ({
  title,
  value,
  icon,
  trend = 0,
  trendLabel = 'from last month',
}: StatsCardProps) => {
  const isPositive = trend >= 0;
  
  return (
    <div className="bg-white rounded-lg shadow p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
          {icon}
        </div>
      </div>
      {trend !== 0 && (
        <p className={`mt-2 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
          <span>{isPositive ? '↑' : '↓'} {Math.abs(trend)}% </span>
          <span className="text-gray-500">{trendLabel}</span>
        </p>
      )}
    </div>
  );
};
