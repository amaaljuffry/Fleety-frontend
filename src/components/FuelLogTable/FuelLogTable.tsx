import React, { useState, useCallback, useMemo } from 'react';
import {
  ColumnDef,
  FilterFn,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ExpandedState,
  getExpandedRowModel,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  ArrowUpDown,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Download,
  Filter,
  RotateCcw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FuelLog } from '@/api/fuel';
import { FuelLogTableMobileCard } from './FuelLogTableMobileCard';
import { TripPurposeBadge } from './TripPurposeBadge';
import { DocumentIndicators } from './DocumentIndicators';
import { useWindowSize } from '@/hooks/useWindowSize';

export interface FuelLogWithVehicle extends FuelLog {
  vehicleName: string;
  vehicleYear?: number;
  vehicleMake?: string;
  vehicleModel?: string;
  licensePlate?: string;
  driverName?: string;
}

interface FuelLogTableProps {
  data: FuelLogWithVehicle[];
  vehicles: Array<{ _id: string; year?: number; make: string; model: string; license_plate: string }>;
  drivers: Array<{ _id: string; name: string }>;
  currency: string;
  loading?: boolean;
  onEdit: (log: FuelLogWithVehicle) => void;
  onDelete: (log: FuelLogWithVehicle) => void;
  onViewDocument?: (url: string, type: 'receipt' | 'pump_meter') => void;
}

// Formatting helpers
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

const formatDateTime = (date: string, time?: string): string => {
  const dateFormatted = formatDate(date);
  const timeFormatted = formatTime(time);
  if (timeFormatted === "—") return dateFormatted;
  return `${dateFormatted} ${timeFormatted}`;
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

const formatCurrency = (amount: number | undefined, currency: string): string => {
  if (amount === undefined || amount === null) return "—";
  return `${getCurrencySymbol(currency)} ${amount.toFixed(2)}`;
};

const formatNumber = (num: number | undefined, decimals = 0): string => {
  if (num === undefined || num === null) return "—";
  return num.toLocaleString('en-MY', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

const truncateText = (text: string | undefined, maxLength = 50): string => {
  if (!text) return "—";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

export const FuelLogTable: React.FC<FuelLogTableProps> = ({
  data,
  vehicles,
  drivers,
  currency,
  loading = false,
  onEdit,
  onDelete,
  onViewDocument,
}) => {
  const { width } = useWindowSize();
  const isMobile = width < 1024;

  // State
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [driverFilter, setDriverFilter] = useState("all");
  const [tripPurposeFilter, setTripPurposeFilter] = useState("all");
  const [dateFromFilter, setDateFromFilter] = useState("");
  const [dateToFilter, setDateToFilter] = useState("");

  // Global filter function
  const globalFilterFn = useCallback<FilterFn<FuelLogWithVehicle>>(
    (row) => {
      if (!globalFilter) return true;
      const searchValue = globalFilter.toLowerCase();
      return (
        row.getValue<string>("vehicleName")?.toLowerCase().includes(searchValue) ||
        row.original.driverName?.toLowerCase().includes(searchValue) ||
        row.original.fuel_station_name?.toLowerCase().includes(searchValue) ||
        row.getValue<string>("driver_notes")?.toLowerCase().includes(searchValue) ||
        row.original.trip_purpose?.toLowerCase().includes(searchValue)
      );
    },
    [globalFilter]
  );

  // Apply all filters
  const filteredData = useMemo(() => {
    let result = data;

    if (vehicleFilter !== "all") {
      result = result.filter((r) => r.vehicle_id === vehicleFilter);
    }

    if (driverFilter !== "all") {
      result = result.filter((r) => r.driver_id === driverFilter);
    }

    if (tripPurposeFilter !== "all") {
      result = result.filter((r) => r.trip_purpose === tripPurposeFilter);
    }

    if (dateFromFilter) {
      const fromTime = new Date(dateFromFilter).getTime();
      result = result.filter((r) => new Date(r.date).getTime() >= fromTime);
    }

    if (dateToFilter) {
      const toTime = new Date(dateToFilter).getTime();
      result = result.filter((r) => new Date(r.date).getTime() <= toTime);
    }

    return result;
  }, [data, vehicleFilter, driverFilter, tripPurposeFilter, dateFromFilter, dateToFilter]);

  // Calculate summary stats
  const stats = useMemo(() => {
    return {
      totalFuel: filteredData.reduce((sum, r) => sum + (r.liters || 0), 0),
      totalCost: filteredData.reduce((sum, r) => sum + (r.total_cost || 0), 0),
      avgPricePerLiter: filteredData.length > 0 
        ? filteredData.reduce((sum, r) => sum + (r.price_per_liter || 0), 0) / filteredData.length
        : 0,
      count: filteredData.length,
    };
  }, [filteredData]);

  // Column definitions
  const columns: ColumnDef<FuelLogWithVehicle>[] = [
    // Expander column for mobile/details
    {
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
            className: "p-1 hover:bg-gray-200 rounded",
          }}
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
      ),
    },

    // Select column
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },

    // Vehicle Column
    {
      accessorKey: "vehicleName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Vehicle
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const log = row.original;
        return (
          <div className="font-semibold text-gray-900">
            <div className="text-sm">{log.vehicleName}</div>
            <div className="text-xs text-gray-500">{log.licensePlate}</div>
          </div>
        );
      },
      enableSorting: true,
    },

    // Date & Time Column
    {
      id: "dateTime",
      accessorFn: (row) => new Date(row.date).getTime(),
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Date & Time
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">
            {formatDate(row.original.date)}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(row.original.time)}
          </div>
        </div>
      ),
      enableSorting: true,
    },

    // Driver Column
    {
      accessorKey: "driverName",
      header: "Driver",
      cell: ({ row }) => {
        const driver = row.original.driverName;
        return <span className="text-sm text-gray-700">{driver || "—"}</span>;
      },
    },

    // Odometer Column
    {
      accessorKey: "odometer_reading",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Odometer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const odometer = row.getValue("odometer_reading") as number | undefined;
        if (!odometer) return <span className="text-gray-400 text-sm">—</span>;
        return (
          <span className="text-sm text-gray-700">
            {formatNumber(odometer, 0)} km
          </span>
        );
      },
      enableSorting: true,
    },

    // Fuel Type Column
    {
      accessorKey: "fuel_type",
      header: "Fuel Type",
      cell: ({ row }) => {
        const fuelType = row.getValue("fuel_type") as string | undefined;
        return (
          <span className="inline-block px-2 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded">
            {fuelType || "—"}
          </span>
        );
      },
    },

    // Quantity Column
    {
      accessorKey: "liters",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Quantity
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const liters = row.getValue("liters") as number;
        return (
          <span className="text-sm text-gray-700">
            {formatNumber(liters, 1)} L
          </span>
        );
      },
      enableSorting: true,
    },

    // Price Per Liter Column
    {
      accessorKey: "price_per_liter",
      header: "Price/L",
      cell: ({ row }) => {
        const price = row.getValue("price_per_liter") as number | undefined;
        return (
          <span className="text-sm text-gray-700">
            {formatCurrency(price, currency)}/L
          </span>
        );
      },
    },

    // Total Cost Column
    {
      accessorKey: "total_cost",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-8 p-0 hover:bg-transparent"
        >
          Total Cost
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const cost = row.getValue("total_cost") as number;
        return (
          <span className="font-semibold text-gray-900 text-sm">
            {formatCurrency(cost, currency)}
          </span>
        );
      },
      enableSorting: true,
    },

    // Fuel Station Column
    {
      accessorKey: "fuel_station_name",
      header: "Fuel Station",
      cell: ({ row }) => {
        const station = row.getValue("fuel_station_name") as string | undefined;
        return (
          <span className="text-sm text-gray-700">
            {truncateText(station, 30)}
          </span>
        );
      },
    },

    // Trip Purpose Column
    {
      accessorKey: "trip_purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const purpose = row.getValue("trip_purpose") as string | undefined;
        return <TripPurposeBadge purpose={purpose} />;
      },
    },

    // Notes Column
    {
      accessorKey: "driver_notes",
      header: "Notes",
      cell: ({ row }) => {
        const notes = row.getValue("driver_notes") as string | undefined;
        if (!notes) return <span className="text-gray-400 text-sm">—</span>;
        return (
          <div className="max-w-xs" title={notes}>
            <p className="text-sm text-gray-600 truncate">
              {truncateText(notes, 40)}
            </p>
          </div>
        );
      },
    },

    // Documents Column
    {
      id: "documents",
      header: "Documents",
      cell: ({ row }) => {
        const log = row.original;
        return (
          <DocumentIndicators
            hasReceipt={!!log.receipt_url}
            hasPumpMeter={!!log.pump_meter_photo_url}
            onViewReceipt={() => log.receipt_url && onViewDocument?.(log.receipt_url, 'receipt')}
            onViewPumpMeter={() => log.pump_meter_photo_url && onViewDocument?.(log.pump_meter_photo_url, 'pump_meter')}
          />
        );
      },
    },

    // Actions Column
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const record = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => {
                  if (record.receipt_url) {
                    window.open(record.receipt_url, '_blank');
                  }
                }}
                disabled={!record.receipt_url}
              >
                <FileText className="mr-2 h-4 w-4" />
                View Receipt
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  if (record.pump_meter_photo_url) {
                    window.open(record.pump_meter_photo_url, '_blank');
                  }
                }}
                disabled={!record.pump_meter_photo_url}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                View Pump Photo
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(record)}>
                Edit Entry
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(record)}
                className="text-red-600"
              >
                Delete Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  // Table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    getExpandedRowModel: getExpandedRowModel(),
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
    },
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  // Mobile view
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Filters for mobile */}
        <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Search</label>
            <Input
              placeholder="Search fuel logs..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Vehicle</label>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.year} {v.make} {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Trip Purpose</label>
            <Select value={tripPurposeFilter} onValueChange={setTripPurposeFilter}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(globalFilter || vehicleFilter !== "all" || tripPurposeFilter !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setVehicleFilter("all");
                setTripPurposeFilter("all");
                setDateFromFilter("");
                setDateToFilter("");
              }}
              className="w-full text-xs h-8"
            >
              <RotateCcw className="mr-2 h-3 w-3" />
              Clear Filters
            </Button>
          )}
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
            <p className="text-xs font-medium text-blue-700">Total Cost</p>
            <p className="text-base font-bold text-blue-900">
              {formatCurrency(stats.totalCost, currency)}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-2">
            <p className="text-xs font-medium text-green-700">Entries</p>
            <p className="text-base font-bold text-green-900">{stats.count}</p>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="space-y-3">
          {filteredData.length > 0 ? (
            filteredData.map((log) => (
              <FuelLogTableMobileCard
                key={log._id}
                log={log}
                currency={currency}
                onEdit={() => onEdit(log)}
                onDelete={() => onDelete(log)}
                onViewDocument={onViewDocument}
              />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">No fuel logs found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop view
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-3 bg-white border border-gray-200 rounded-lg p-4">
        {/* Row 1: Search + Column Visibility */}
        <div className="flex gap-3 items-end justify-between">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search fuel logs..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Columns
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Row 2: Filters */}
        <div className="flex gap-3 flex-wrap items-end">
          <div className="w-48">
            <label className="text-xs font-medium text-gray-600 block mb-1">Vehicle</label>
            <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vehicles</SelectItem>
                {vehicles.map((v) => (
                  <SelectItem key={v._id} value={v._id}>
                    {v.year} {v.make} {v.model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs font-medium text-gray-600 block mb-1">Driver</label>
            <Select value={driverFilter} onValueChange={setDriverFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Drivers</SelectItem>
                {drivers.map((d) => (
                  <SelectItem key={d._id} value={d._id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-48">
            <label className="text-xs font-medium text-gray-600 block mb-1">Trip Purpose</label>
            <Select value={tripPurposeFilter} onValueChange={setTripPurposeFilter}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="Business">Business</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Delivery">Delivery</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex gap-2 items-end">
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">From Date</label>
              <Input
                type="date"
                value={dateFromFilter}
                onChange={(e) => setDateFromFilter(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-medium text-gray-600 block mb-1">To Date</label>
              <Input
                type="date"
                value={dateToFilter}
                onChange={(e) => setDateToFilter(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {(globalFilter || vehicleFilter !== "all" || driverFilter !== "all" || tripPurposeFilter !== "all" || dateFromFilter || dateToFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGlobalFilter("");
                setVehicleFilter("all");
                setDriverFilter("all");
                setTripPurposeFilter("all");
                setDateFromFilter("");
                setDateToFilter("");
              }}
              className="h-9 text-gray-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-700">Total Cost</p>
          <p className="text-lg font-bold text-blue-900">
            {formatCurrency(stats.totalCost, currency)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700">Entries</p>
          <p className="text-lg font-bold text-green-900">{stats.count}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs font-medium text-purple-700">Total Fuel</p>
          <p className="text-lg font-bold text-purple-900">
            {formatNumber(stats.totalFuel, 1)} L
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
          <p className="text-xs font-medium text-orange-700">Avg Price/L</p>
          <p className="text-lg font-bold text-orange-900">
            {formatCurrency(stats.avgPricePerLiter, currency)}
          </p>
        </div>
      </div>

      {/* Selection Counter */}
      {selectedCount > 0 && (
        <div className="rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700 border border-blue-200">
          {selectedCount} of {totalCount} row(s) selected.
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-gray-200">
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 px-4 py-3 text-left text-sm font-semibold text-gray-900 whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-4 py-3 text-sm text-gray-700"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>

                    {/* Expandable row for notes */}
                    {row.getIsExpanded() && (
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableCell colSpan={columns.length} className="px-4 py-3">
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="font-medium text-gray-900 mb-1">Full Notes</p>
                              <p className="text-gray-700 whitespace-pre-wrap">
                                {row.original.driver_notes || "No notes"}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm">No fuel logs found</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex gap-3 items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1} ({totalCount} total records)
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            size="sm"
            variant="outline"
            className="h-9"
          >
            Previous
          </Button>
          <Button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            size="sm"
            variant="outline"
            className="h-9"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
