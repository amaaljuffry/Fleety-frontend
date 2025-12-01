import React from 'react';
import { FuelStatsResponse } from '@/api/fuel';
import { Loader2 } from 'lucide-react';

interface FuelStatsProps {
  stats: FuelStatsResponse | null;
  loading: boolean;
}

export const FuelStats: React.FC<FuelStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Total Entries',
      value: stats.total_entries,
      unit: '',
      color: 'bg-blue-50 text-blue-700'
    },
    {
      label: 'Total Spent',
      value: `RM ${stats.total_spent.toFixed(2)}`,
      unit: '',
      color: 'bg-green-50 text-green-700'
    },
    {
      label: 'Average Price',
      value: `RM ${stats.average_price_per_liter.toFixed(2)}`,
      unit: '/L',
      color: 'bg-purple-50 text-purple-700'
    },
    ...(stats.fuel_economy ? [{
      label: 'Fuel Economy',
      value: stats.fuel_economy.toFixed(2),
      unit: 'km/L',
      color: 'bg-orange-50 text-orange-700'
    }] : [])
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className={`${stat.color} rounded-lg p-6 border border-opacity-20`}
        >
          <p className="text-sm font-medium opacity-80 mb-2">{stat.label}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{stat.value}</p>
            {stat.unit && <p className="text-sm opacity-70">{stat.unit}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
