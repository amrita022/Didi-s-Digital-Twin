import React from 'react';
import { ResponsiveContainer } from 'recharts';

export const ChartContainer = ({ config, children, className = '' }) => {
  // Check if className includes aspect-square (for pie charts)
  const isPieChart = className?.includes('aspect-square');
  const defaultClass = isPieChart ? '' : 'h-80';
  
  return (
    <div
      className={`w-full ${defaultClass} ${className}`}
      style={{
        '--chart-1': '#10b981',
        '--chart-2': '#f43f5e',
        '--chart-3': '#f97316',
        '--chart-4': '#eab308',
        '--chart-5': '#8b5cf6',
        '--color-income': '#10b981',
        '--color-expenses': '#f43f5e',
        '--color-desktop': '#10b981',
        '--color-mobile': '#f43f5e',
        '--color-chrome': '#10b981',
        '--color-safari': '#f43f5e',
        '--color-firefox': '#f97316',
        '--color-edge': '#eab308',
        '--color-other': '#8b5cf6',
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export const ChartTooltip = ({ content: Content, cursor = false, ...props }) => {
  return <Content {...props} />;
};

export const ChartTooltipContent = ({
  hideLabel = false,
  indicator = 'line',
  ...props
}) => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-white shadow-lg text-sm">
      {/* Tooltip content will be rendered by Recharts */}
    </div>
  );
};
