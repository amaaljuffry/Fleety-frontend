import React, { useState, useCallback } from "react"
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
} from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { apiRequest } from "@/api/client"
import { useToast } from "@/hooks/use-toast"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  ArrowUpDown,
  Wrench,
} from "lucide-react"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type MaintenanceRecord = {
  id: string
  _id?: string
  vehicleId: string
  service_type?: string
  description: string
  cost: number
  completedDate: string
  notes?: string
}

export type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  currentMileage?: number
}

export type MaintenanceWithVehicle = MaintenanceRecord & {
  vehicleName: string
}

interface MaintenanceTableProps {
  data: MaintenanceWithVehicle[]
  vehicles: Vehicle[]
  currency: string
  onViewRecord?: (record: MaintenanceWithVehicle) => void
  onEditRecord?: (record: MaintenanceWithVehicle) => void
  onDeleteRecord?: (record: MaintenanceWithVehicle) => void
  onAddMaintenance?: () => void
  onRefresh?: () => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return "—"
  }
}

const formatServiceType = (serviceType?: string): string => {
  if (!serviceType) return "Service"
  return serviceType
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    CHF: "CHF",
    CNY: "¥",
    SEK: "kr",
    NZD: "NZ$",
  }
  return symbols[currencyCode] || currencyCode
}

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

interface ColumnHandlers {
  onViewRecord?: (record: MaintenanceWithVehicle) => void
  onEditRecord?: (record: MaintenanceWithVehicle) => void
  onDeleteRecord?: (record: MaintenanceWithVehicle) => void
  onRefresh?: () => void
  onDeleteStart?: (recordId: string) => void
  onDeleteEnd?: () => void
  deleting?: string | null
  toast?: (options: { title: string; description: string; variant?: 'default' | 'destructive' }) => void
}

export const createColumns = (currency: string, handlers: ColumnHandlers = {}): ColumnDef<MaintenanceWithVehicle>[] => [
  // Select Column
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

  // Vehicle Column (Sortable, Searchable)
  {
    accessorKey: "vehicleName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Vehicle
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.getValue("vehicleName")}
      </span>
    ),
  },

  // Service Type Column
  {
    accessorKey: "service_type",
    header: "Service Type",
    cell: ({ row }) => {
      const serviceType = row.getValue("service_type") as string | undefined
      return (
        <span className="text-gray-700">
          {formatServiceType(serviceType)}
        </span>
      )
    },
  },

  // Description Column
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const description = row.getValue("description") as string
      return (
        <div className="max-w-xs">
          <p className="text-gray-700 truncate" title={description}>
            {description}
          </p>
        </div>
      )
    },
  },

  // Completed Date Column (Sortable)
  {
    accessorKey: "completedDate",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Completed Date
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-gray-700">
        {formatDate(row.getValue("completedDate"))}
      </span>
    ),
  },

  // Cost Column (Sortable)
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const cost = row.getValue("cost") as number
      return (
        <span className="font-semibold text-gray-900">
          {getCurrencySymbol(currency)} {cost.toFixed(2)}
        </span>
      )
    },
  },

  // Notes Column
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => {
      const notes = row.getValue("notes") as string | undefined
      if (!notes) return <span className="text-gray-400">—</span>
      return (
        <div className="max-w-xs">
          <p className="text-sm text-gray-600 truncate" title={notes}>
            {notes}
          </p>
        </div>
      )
    },
  },

  // Actions Column
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const record = row.original
      const { onViewRecord: view, onEditRecord: edit, onDeleteRecord: del, onRefresh: refresh, deleting, toast } = handlers

      const handleViewRecord = () => {
        console.log("View record:", record)
        view?.(record)
      }

      const handleEditRecord = () => {
        console.log("Edit record:", record)
        edit?.(record)
      }

      const handleDeleteRecord = async () => {
        console.log("Delete record:", record)
        
        const recordId = record._id || record.id
        if (!recordId) {
          toast?.({
            title: 'Error',
            description: 'Cannot delete: Missing record ID',
            variant: 'destructive',
          })
          return
        }

        // Show confirmation
        if (!window.confirm(`Delete this ${formatServiceType(record.service_type)} record? This cannot be undone.`)) {
          return
        }

        try {
          // Make API call to delete maintenance record
          await apiRequest(`/api/maintenance/${recordId}`, {
            method: 'DELETE',
          })

          toast?.({
            title: 'Success',
            description: 'Maintenance record deleted successfully',
          })

          // Call the callbacks and refresh
          del?.(record)
          refresh?.()
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete maintenance record'
          console.error('Error deleting maintenance record:', error)
          toast?.({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          })
        }
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0" disabled={deleting === (record._id || record.id)}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleViewRecord}>
              View Record
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditRecord}>
              Edit Record
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteRecord}
              className="text-red-600"
              disabled={deleting === (record._id || record.id)}
            >
              {deleting === (record._id || record.id) ? 'Deleting...' : 'Delete Record'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleRecords: MaintenanceWithVehicle[] = [
  {
    id: "maintenance-001",
    vehicleId: "vehicle-001",
    vehicleName: "2023 Toyota Camry",
    service_type: "oil_change",
    description: "Regular oil and filter change with inspection",
    cost: 45.99,
    completedDate: "2025-11-20",
    notes: "Oil level was good, filter was full",
  },
  {
    id: "maintenance-002",
    vehicleId: "vehicle-002",
    vehicleName: "2022 Ford Transit",
    service_type: "tire_rotation",
    description: "Tire rotation and balance",
    cost: 89.99,
    completedDate: "2025-11-15",
    notes: "Tires are in good condition",
  },
  {
    id: "maintenance-003",
    vehicleId: "vehicle-003",
    vehicleName: "2021 Volvo FH16",
    service_type: "brake_inspection",
    description: "Full brake system inspection and pad replacement",
    cost: 250.0,
    completedDate: "2025-11-10",
    notes: "Front and rear pads replaced, system working perfectly",
  },
  {
    id: "maintenance-004",
    vehicleId: "vehicle-004",
    vehicleName: "2023 Honda Civic",
    service_type: "battery_check",
    description: "Battery voltage and load testing",
    cost: 0.0,
    completedDate: "2025-11-05",
    notes: "Battery in excellent condition",
  },
  {
    id: "maintenance-005",
    vehicleId: "vehicle-005",
    vehicleName: "2022 Mercedes Sprinter",
    service_type: "air_filter_replacement",
    description: "Engine air filter and cabin air filter replacement",
    cost: 65.5,
    completedDate: "2025-10-28",
    notes: "Both filters were moderately clogged",
  },
]

// ============================================================================
// MAINTENANCE TABLE COMPONENT
// ============================================================================

export function MaintenanceTable({
  data,
  vehicles,
  currency,
  onViewRecord,
  onEditRecord,
  onDeleteRecord,
  onAddMaintenance,
  onRefresh,
}: MaintenanceTableProps) {
  const { toast } = useToast()
  
  // State Management
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [vehicleFilter, setVehicleFilter] = useState("all")
  const [dateFromFilter, setDateFromFilter] = useState("")
  const [dateToFilter, setDateToFilter] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  // Custom filter function with global search
  const globalFilterFn = useCallback<FilterFn<MaintenanceWithVehicle>>(
    (row, columnId) => {
      if (!globalFilter) return true
      const searchValue = globalFilter.toLowerCase()
      return (
        row
          .getValue<string>("vehicleName")
          .toLowerCase()
          .includes(searchValue) ||
        row
          .getValue<string>("service_type")
          ?.toLowerCase()
          .includes(searchValue) ||
        row
          .getValue<string>("description")
          .toLowerCase()
          .includes(searchValue) ||
        row
          .getValue<string>("notes")
          ?.toLowerCase()
          .includes(searchValue)
      )
    },
    [globalFilter]
  )

  // Apply all filters
  let filteredData = data
  if (vehicleFilter !== "all") {
    filteredData = filteredData.filter((r) => r.vehicleId === vehicleFilter)
  }
  if (dateFromFilter) {
    const fromTime = new Date(dateFromFilter).getTime()
    filteredData = filteredData.filter(
      (r) => new Date(r.completedDate).getTime() >= fromTime
    )
  }
  if (dateToFilter) {
    const toTime = new Date(dateToFilter).getTime()
    filteredData = filteredData.filter(
      (r) => new Date(r.completedDate).getTime() <= toTime
    )
  }

  // Table Instance
  const table = useReactTable({
    data: filteredData,
    columns: createColumns(currency, {
      onViewRecord,
      onEditRecord,
      onDeleteRecord,
      onRefresh,
      deleting,
      toast,
    }),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    globalFilterFn: globalFilterFn,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  })

  const selectedCount = table.getFilteredSelectedRowModel().rows.length
  const totalCount = table.getFilteredRowModel().rows.length
  const totalCost = filteredData.reduce((sum, r) => sum + r.cost, 0)

  return (
    <div className="w-full space-y-4">
      {/* ===== TOP CONTROLS ===== */}
      <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
        {/* Row 1: Search + Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search vehicle, service, or notes..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {/* Column Visibility Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
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
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                    </DropdownMenuCheckboxItem>
                  ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Maintenance Button */}
            <Button
              onClick={onAddMaintenance}
              size="sm"
              className="h-9 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Maintenance
            </Button>
          </div>
        </div>

        {/* Row 2: Vehicle Filter + Date Range */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Select value={vehicleFilter} onValueChange={setVehicleFilter}>
            <SelectTrigger className="sm:w-48 h-9">
              <SelectValue placeholder="Filter by vehicle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Vehicles</SelectItem>
              {vehicles.map((v) => (
                <SelectItem key={v.id} value={v.id}>
                  {v.year} {v.make} {v.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2 flex-1 sm:flex-initial">
            <Input
              type="date"
              value={dateFromFilter}
              onChange={(e) => setDateFromFilter(e.target.value)}
              className="h-9 text-sm"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateToFilter}
              onChange={(e) => setDateToFilter(e.target.value)}
              className="h-9 text-sm"
              placeholder="To"
            />
          </div>

          {/* Clear Filters */}
          {(globalFilter || vehicleFilter !== "all" || dateFromFilter || dateToFilter) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setGlobalFilter("")
                setVehicleFilter("all")
                setDateFromFilter("")
                setDateToFilter("")
              }}
              className="h-9 text-gray-600 hover:text-gray-900"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* ===== STATS ROW ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-700">Total Cost</p>
          <p className="text-lg font-bold text-blue-900">
            {getCurrencySymbol(currency)} {totalCost.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700">Records</p>
          <p className="text-lg font-bold text-green-900">{totalCount}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
          <p className="text-xs font-medium text-purple-700">Average Cost</p>
          <p className="text-lg font-bold text-purple-900">
            {getCurrencySymbol(currency)} {totalCount > 0 ? (totalCost / totalCount).toFixed(2) : "0.00"}
          </p>
        </div>
      </div>

      {/* ===== SELECTION COUNTER ===== */}
      {selectedCount > 0 && (
        <div className="rounded-md bg-blue-50 px-4 py-2 text-sm text-blue-700 border border-blue-200">
          {selectedCount} of {totalCount} row(s) selected.
        </div>
      )}

      {/* ===== TABLE ===== */}
      <div className="rounded-md border border-gray-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="h-12 px-4 py-3 text-left text-sm font-semibold text-gray-900"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-4 py-3 text-sm text-gray-700"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={createColumns(currency).length}
                  className="h-24 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Wrench className="h-8 w-8 text-gray-300" />
                    <span>No maintenance records found</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ===== PAGINATION ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
  )
}
