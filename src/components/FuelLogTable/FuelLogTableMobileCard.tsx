import React from 'react';
import { Edit, Trash2, FileText, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FuelLogWithVehicle } from './FuelLogTable';
import { TripPurposeBadge } from './TripPurposeBadge';
import { DocumentIndicators } from './DocumentIndicators';

interface FuelLogTableMobileCardProps {
  log: FuelLogWithVehicle;
  currency: string;
  onEdit: () => void;
  onDelete: () => void;
  onViewDocument?: (url: string, type: 'receipt' | 'pump_meter') => void;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const formatTime = (timeString?: string): string => {
  if (!timeString) return "—";
  try {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  } catch {
    return "—";
  }
};

const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    MYR: "RM",
  };
  return symbols[currencyCode] || currencyCode;
};

const formatNumber = (num: number | undefined, decimals = 0): string => {
  if (num === undefined || num === null) return "—";
  return num.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

export const FuelLogTableMobileCard: React.FC<FuelLogTableMobileCardProps> = ({
  log,
  currency,
  onEdit,
  onDelete,
  onViewDocument,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const symbol = getCurrencySymbol(currency);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Card Header - Always visible */}
      <div className="p-4 space-y-3">
        {/* Vehicle and Date */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{log.vehicleName}</h3>
            <p className="text-xs text-gray-500">{log.licensePlate}</p>
            <p className="text-xs text-gray-600 mt-1">
              {formatDate(log.date)} {formatTime(log.time)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">
              {symbol} {log.total_cost.toFixed(2)}
            </p>
            <TripPurposeBadge purpose={log.trip_purpose} />
          </div>
        </div>

        {/* Key Info Row */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-500">Quantity</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatNumber(log.liters, 1)} L
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Type</p>
            <p className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded w-fit">
              {log.fuel_type}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Odometer</p>
            <p className="text-sm font-semibold text-gray-900">
              {formatNumber(log.odometer_reading, 0)} km
            </p>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 space-y-3 text-sm">
          {log.fuel_station_name && (
            <div>
              <p className="text-xs font-medium text-gray-600">Fuel Station</p>
              <p className="text-gray-900">{log.fuel_station_name}</p>
            </div>
          )}

          {log.driverName && (
            <div>
              <p className="text-xs font-medium text-gray-600">Driver</p>
              <p className="text-gray-900">{log.driverName}</p>
            </div>
          )}

          {log.price_per_liter && (
            <div>
              <p className="text-xs font-medium text-gray-600">Price per Liter</p>
              <p className="text-gray-900">
                {symbol} {log.price_per_liter.toFixed(2)} /L
              </p>
            </div>
          )}

          {log.driver_notes && (
            <div>
              <p className="text-xs font-medium text-gray-600">Notes</p>
              <p className="text-gray-900 text-xs whitespace-pre-wrap">
                {log.driver_notes}
              </p>
            </div>
          )}

          {(log.receipt_url || log.pump_meter_photo_url) && (
            <div>
              <p className="text-xs font-medium text-gray-600 mb-2">Documents</p>
              <DocumentIndicators
                hasReceipt={!!log.receipt_url}
                hasPumpMeter={!!log.pump_meter_photo_url}
                onViewReceipt={() =>
                  log.receipt_url && onViewDocument?.(log.receipt_url, 'receipt')
                }
                onViewPumpMeter={() =>
                  log.pump_meter_photo_url &&
                  onViewDocument?.(log.pump_meter_photo_url, 'pump_meter')
                }
              />
            </div>
          )}
        </div>
      )}

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex gap-2 justify-between items-center">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
          />
          {isExpanded ? 'Show less' : 'Show more'}
        </button>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={onEdit}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="h-7 text-xs"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
