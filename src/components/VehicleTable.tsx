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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  MoreHorizontal,
  Plus,
  Search,
  ArrowUpDown,
} from "lucide-react"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type Vehicle = {
  id: string
  plateNumber: string
  model: string
  type: "car" | "van" | "lorry"
  status: "active" | "maintenance" | "inactive"
  lastServiceDate: string
}

interface VehicleTableProps {
  data: Vehicle[]
  onViewVehicle?: (vehicle: Vehicle) => void
  onEditVehicle?: (vehicle: Vehicle) => void
  onAssignDriver?: (vehicle: Vehicle) => void
  onMarkMaintenance?: (vehicle: Vehicle) => void
  onDeleteVehicle?: (vehicle: Vehicle) => void
  onAddVehicle?: () => void
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

const statusStyles: Record<Vehicle["status"], string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-200",
  maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  inactive: "bg-red-100 text-red-800 hover:bg-red-200",
}

const typeStyles: Record<Vehicle["type"], string> = {
  car: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  van: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  lorry: "bg-orange-100 text-orange-800 hover:bg-orange-200",
}

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

interface ColumnCallbacks {
  onViewVehicle?: (vehicle: Vehicle) => void
  onEditVehicle?: (vehicle: Vehicle) => void
  onAssignDriver?: (vehicle: Vehicle) => void
  onMarkMaintenance?: (vehicle: Vehicle) => void
  onDeleteVehicle?: (vehicle: Vehicle) => void
}

export const createColumns = (callbacks: ColumnCallbacks): ColumnDef<Vehicle>[] => [
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

  // Plate Number Column (Sortable, Searchable)
  {
    accessorKey: "plateNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Plate Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.getValue("plateNumber")}
      </span>
    ),
  },

  // Model Column (Text)
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.getValue("model")}</span>
    ),
  },

  // Type Column (Sortable, Badge)
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as Vehicle["type"]
      const displayType = type.charAt(0).toUpperCase() + type.slice(1)

      return (
        <Badge variant="secondary" className={typeStyles[type]}>
          {displayType}
        </Badge>
      )
    },
  },

  // Status Column (Badge)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Vehicle["status"]
      const displayStatus =
        status.charAt(0).toUpperCase() +
        status.slice(1).replace("-", " ")

      return (
        <Badge variant="secondary" className={statusStyles[status]}>
          {displayStatus}
        </Badge>
      )
    },
  },

  // Last Service Date Column
  {
    accessorKey: "lastServiceDate",
    header: "Last Service Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastServiceDate") as string)
      return (
        <span className="text-gray-700">
          {date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          })}
        </span>
      )
    },
  },

  // Actions Column
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const vehicle = row.original

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
            <DropdownMenuItem onClick={() => callbacks.onViewVehicle?.(vehicle)}>
              View Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => callbacks.onEditVehicle?.(vehicle)}>
              Edit Vehicle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callbacks.onAssignDriver?.(vehicle)}>
              Assign Driver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => callbacks.onMarkMaintenance?.(vehicle)}>
              Mark as Maintenance
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => callbacks.onDeleteVehicle?.(vehicle)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              Delete Vehicle
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Keep for backward compatibility
export const columns = createColumns({})

// ============================================================================
// SAMPLE DATA
// ============================================================================

export const sampleVehicles: Vehicle[] = [
  {
    id: "vehicle-001",
    plateNumber: "ABC-1234",
    model: "Toyota Camry 2023",
    type: "car",
    status: "active",
    lastServiceDate: "2025-11-10",
  },
  {
    id: "vehicle-002",
    plateNumber: "DEF-5678",
    model: "Ford Transit 2022",
    type: "van",
    status: "active",
    lastServiceDate: "2025-10-20",
  },
  {
    id: "vehicle-003",
    plateNumber: "GHI-9012",
    model: "Volvo FH16 2021",
    type: "lorry",
    status: "maintenance",
    lastServiceDate: "2025-09-15",
  },
  {
    id: "vehicle-004",
    plateNumber: "JKL-3456",
    model: "Honda Civic 2023",
    type: "car",
    status: "inactive",
    lastServiceDate: "2025-08-05",
  },
  {
    id: "vehicle-005",
    plateNumber: "MNO-7890",
    model: "Mercedes Sprinter 2022",
    type: "van",
    status: "active",
    lastServiceDate: "2025-11-15",
  },
]

// ============================================================================
// VEHICLE TABLE COMPONENT
// ============================================================================

export function VehicleTable({
  data,
  onViewVehicle,
  onEditVehicle,
  onAssignDriver,
  onMarkMaintenance,
  onDeleteVehicle,
  onAddVehicle,
}: VehicleTableProps) {
  // State Management
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Custom filter function with global search
  const globalFilterFn = useCallback<FilterFn<Vehicle>>(
    (row, columnId) => {
      if (!globalFilter) return true
      const searchValue = globalFilter.toLowerCase()
      return (
        row
          .getValue<string>("plateNumber")
          .toLowerCase()
          .includes(searchValue) ||
        row.getValue<string>("model").toLowerCase().includes(searchValue)
      )
    },
    [globalFilter]
  )

  // Create columns with callbacks
  const tableColumns = React.useMemo(
    () => createColumns({
      onViewVehicle,
      onEditVehicle,
      onAssignDriver,
      onMarkMaintenance,
      onDeleteVehicle,
    }),
    [onViewVehicle, onEditVehicle, onAssignDriver, onMarkMaintenance, onDeleteVehicle]
  )

  // Table Instance
  const table = useReactTable({
    data,
    columns: tableColumns,
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

  return (
    <div className="w-full space-y-4">
      {/* ===== TOP CONTROLS ===== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by plate or model..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 h-9"
          />
        </div>

        {/* Column Visibility & Add Button */}
        <div className="flex gap-2">
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
                    {column.id.replace(/([A-Z])/g, " $1").trim()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Vehicle Button */}
          <Button
            onClick={onAddVehicle}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Vehicle
          </Button>
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
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer"
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Don't trigger row click if clicking on checkbox or dropdown
                    const target = e.target as HTMLElement
                    if (target.closest('button') || target.closest('[role="checkbox"]') || target.closest('[role="menuitem"]')) {
                      return
                    }
                    onViewVehicle?.(row.original)
                  }}
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
                  colSpan={tableColumns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No vehicles found.
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
          {table.getPageCount() || 1} ({totalCount} total vehicles)
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
