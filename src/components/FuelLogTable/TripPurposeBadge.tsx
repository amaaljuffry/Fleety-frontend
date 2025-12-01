import React from 'react';

interface TripPurposeBadgeProps {
  purpose?: string;
}

const purposeStyles = {
  Business: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
  Personal: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  Delivery: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
  },
  Other: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
};

export const TripPurposeBadge: React.FC<TripPurposeBadgeProps> = ({ purpose = 'Other' }) => {
  const style = purposeStyles[purpose as keyof typeof purposeStyles] || purposeStyles.Other;

  return (
    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${style.bg} ${style.text} ${style.border}`}>
      {purpose || 'Unspecified'}
    </span>
  );
};
