import React from 'react';

/**
 * PageContainer - Standardized wrapper for all page layouts
 * 
 * Provides consistent padding, spacing, and responsive behavior
 * across all pages in the application.
 * 
 * @example
 * <PageContainer>
 *   <PageHeader title="Dashboard" description="Main dashboard" />
 *   {/* Content */}
 * </PageContainer>
 */
interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div className={`min-h-screen bg-gray-50 p-4 md:p-6 space-y-6 ${className}`}>
      <div className={`mx-auto w-full ${maxWidthClasses[maxWidth]}`}>
        {children}
      </div>
    </div>
  );
};

export default PageContainer;
