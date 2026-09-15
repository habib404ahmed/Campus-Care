import React from 'react';
import { cn } from '../../lib/utils';

interface PageBackgroundProps {
  className?: string;
  children?: React.ReactNode;
}

export function PageBackground({ className, children }: PageBackgroundProps) {
  return (
    <div className={cn('relative min-h-full w-full', className)}>
      {/* Decorative ambient background blobs */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        aria-hidden="true"
      >
        {/* Soft cool indigo glow top right */}
        <div className="absolute -top-32 -right-32 w-[34rem] h-[34rem] rounded-full bg-indigo-200/25 blur-3xl" />
        {/* Soft cyan/blue glow top left */}
        <div className="absolute top-1/4 -left-32 w-[28rem] h-[28rem] rounded-full bg-blue-100/30 blur-3xl" />
        {/* Subtle warm glow bottom right */}
        <div className="absolute bottom-10 right-1/4 w-[24rem] h-[24rem] rounded-full bg-slate-200/35 blur-3xl" />
      </div>
      {children}
    </div>
  );
}
