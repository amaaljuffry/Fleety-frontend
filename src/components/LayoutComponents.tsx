import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Section - Standardized container for grouping related content
// Provides consistent spacing between sections using space-y-4
interface SectionProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`space-y-4 ${noPadding ? '' : 'px-0'} ${className}`}>
      {children}
    </div>
  );
};

// SectionHeader - Standardized header for sections with title and description
// Provides flexible layout for headers with optional actions
interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// CardGrid - Responsive grid for card-based layouts
// Mobile: 1 column, Tablet: 2 columns, Desktop: 3+ columns with consistent gaps
interface CardGridProps {
  children: React.ReactNode;
  cols?: {
    md?: number;
    lg?: number;
  };
  gap?: 'gap-2' | 'gap-3' | 'gap-4' | 'gap-6';
  className?: string;
}

export const CardGrid: React.FC<CardGridProps> = ({
  children,
  cols = { md: 2, lg: 3 },
  gap = 'gap-4',
  className = '',
}) => {
  const colClasses = `grid grid-cols-1 ${cols.md ? `md:grid-cols-${cols.md}` : ''} ${
    cols.lg ? `lg:grid-cols-${cols.lg}` : ''
  } ${gap} ${className}`;

  return <div className={colClasses}>{children}</div>;
};

// FormSection - Container for form elements with consistent spacing
// Groups form fields with space-y-4 for standard field separation
interface FormSectionProps {
  children: React.ReactNode;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({
  children,
  className = '',
}) => {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
};

// FormField - Standardized wrapper for single form fields
// Provides consistent label, input, error, and helper text spacing
interface FormFieldProps {
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required = false,
  error,
  helperText,
  children,
  className = '',
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-600 ml-0.5">*</span>}
        </label>
      )}
      <div>{children}</div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helperText && !error && <p className="text-xs text-gray-500 mt-1">{helperText}</p>}
    </div>
  );
};

// FormRow - Side-by-side form fields with responsive stacking
// Mobile: stacks vertically, Desktop: displays side by side with gap-4
interface FormRowProps {
  children: React.ReactNode;
  cols?: number;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({
  children,
  cols = 2,
  className = '',
}) => {
  const colClass = cols === 2 ? 'md:grid-cols-2' : `md:grid-cols-${cols}`;
  return (
    <div className={`grid grid-cols-1 ${colClass} gap-4 ${className}`}>
      {children}
    </div>
  );
};

// InfoCard - Simplified card for metrics and stats
// Used for displaying single values with icon, title, and optional subtitle
interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  value,
  subtitle,
  className = '',
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {icon && <div className="flex-shrink-0">{icon}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

// ContentCard - Enhanced card with consistent internal spacing
// Used for main content areas within pages with optional header and action
interface ContentCardProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  children,
  action,
  className = '',
}) => {
  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      {(title || description || action) && (
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              {title && <CardTitle className="flex items-center gap-2">{title}</CardTitle>}
              {description && <CardDescription>{description}</CardDescription>}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
};

export default {
  Section,
  SectionHeader,
  CardGrid,
  FormSection,
  FormField,
  FormRow,
  InfoCard,
  ContentCard,
};
