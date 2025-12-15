import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`relative bg-gradient-to-l from-neutral-700/40 to-neutral-800 dark:from-neutral-800/40 dark:to-neutral-900 rounded-xl shadow-lg border border-gray-700/50 hover:border-rose-500/30 transition-all duration-300 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 pt-6 pb-4 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h2 className={`text-xl font-bold text-white ${className}`}>
    {children}
  </h2>
);

export const CardDescription = ({ children, className = '' }) => (
  <p className={`text-gray-400 text-sm mt-2 ${className}`}>
    {children}
  </p>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 pb-6 pt-4 border-t border-gray-700/30 ${className}`}>
    {children}
  </div>
);
