import React from 'react';
import { cn } from '../../lib/utils';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  breadcrumb?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function PageHeader({ title, subtitle, action, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn('mb-6', className)}>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1.5 text-sm text-surface-500">
            {breadcrumb.map((crumb, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span aria-hidden="true">/</span>}
                {crumb.href ? (
                  <li>
                    <a href={crumb.href} className="hover:text-surface-900 transition-colors">
                      {crumb.label}
                    </a>
                  </li>
                ) : (
                  <li aria-current={i === breadcrumb.length - 1 ? 'page' : undefined} className="text-surface-700 font-medium">
                    {crumb.label}
                  </li>
                )}
              </React.Fragment>
            ))}
          </ol>
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">{title}</h1>
          {subtitle && <p className="text-surface-500 mt-1 text-sm">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    </div>
  );
}
