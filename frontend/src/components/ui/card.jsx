import React from 'react';
import { GlowingEffect } from './glowing-effect';
import { cn } from '../../utils/cn';

export const Card = ({ children, className = '' }) => (
  <div className={cn("relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl shadow-lg transition-all duration-300", className)}>
    <GlowingEffect
      spread={30}
      blur={0}
      proximity={50}
      variant="default"
      borderWidth={1.5}
      inactiveZone={0.2}
      disabled={false}
    />
    <div className="relative z-0">
      {children}
    </div>
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
