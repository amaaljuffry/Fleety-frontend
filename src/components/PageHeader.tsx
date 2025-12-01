import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

/**
 * Standardized page header component for consistent UI across all sidebar pages.
 * Provides consistent spacing, typography, and layout.
 *
 * @example
 * <PageHeader
 *   title="Maintenance Records"
 *   description="Track and manage all vehicle maintenance services"
 * />
 *
 * @example
 * <PageHeader
 *   title="Fuel Tracking"
 *   description="Monitor and track fuel consumption"
 * >
 *   <Button>Add New</Button>
 * </PageHeader>
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  children,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="ml-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
