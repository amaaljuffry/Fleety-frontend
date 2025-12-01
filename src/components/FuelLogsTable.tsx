import React, { useState } from 'react';
import { FuelLog } from '@/api/fuel';
import { Trash2, Edit2, Loader2 } from 'lucide-react';

interface FuelLogsTableProps {
  logs: FuelLog[];
  loading: boolean;
  onEdit: (log: FuelLog) => void;
  onDelete: (logId: string) => void;
  deleting?: string;
}

export const FuelLogsTable: React.FC<FuelLogsTableProps> = ({
  logs,
  loading,
  onEdit,
  onDelete,
  deleting
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No fuel logs yet. Create your first entry!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Date</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Liters</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Price/L</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Total Cost</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Odometer</th>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Notes</th>
            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {logs
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((log) => (
              <tr key={log._id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm text-gray-900">
                  {new Date(log.date).toLocaleDateString('en-MY', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {log.liters.toFixed(2)} L
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  RM {log.price_per_liter.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-blue-600">
                  RM {log.total_cost.toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.odometer_reading ? `${log.odometer_reading.toLocaleString()} km` : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 truncate max-w-xs">
                  {log.notes || '-'}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => onEdit(log)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => log._id && onDelete(log._id)}
                      disabled={deleting === log._id}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === log._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};
