import React from 'react';
import { GlowingEffect } from './glowing-effect';
import { cn } from '../../utils/cn';

export const GlowingCard = ({ children, className = '', ...props }) => (
  <div 
    className={cn(
      "relative bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl shadow-lg transition-all duration-300",
      className
    )}
    {...props}
  >
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

