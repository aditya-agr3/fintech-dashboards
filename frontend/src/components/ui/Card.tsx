'use client';

import { ReactNode, memo } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export const Card = memo(function Card({
  children,
  className = '',
  title,
  subtitle,
  action,
}: CardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            )}
            {subtitle && (
              <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
});

interface CardContentProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const CardContent = memo(function CardContent({
  children,
  className = '',
  noPadding = false,
}: CardContentProps) {
  return (
    <div className={`${noPadding ? '' : 'p-4 sm:p-6'} ${className}`}>
      {children}
    </div>
  );
});
