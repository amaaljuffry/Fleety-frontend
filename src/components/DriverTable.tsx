import React, { useState, useMemo, useCallback } from "react"
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

export type Driver = {
  id: string
  name: string
  phone: string
  licenseNumber: string
  status: "active" | "inactive" | "on-duty" | "off-duty"
  assignedVehicle?: string
}

interface DriverTableProps {
  data: Driver[]
  onViewDriver?: (driver: Driver) => void
  onEditDriver?: (driver: Driver) => void
  onAssignVehicle?: (driver: Driver) => void
  onDeleteDriver?: (driver: Driver) => void
  onAddDriver?: () => void
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

const statusStyles: Record<Driver["status"], string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-200",
  inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  "on-duty": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "off-duty": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
}

// ============================================================================
// CUSTOM FILTER FUNCTION
// ============================================================================

const multiSearchFilter: FilterFn<Driver> = (row, columnId, filterValue) => {
  if (!filterValue) return true

  const searchValue = filterValue.toLowerCase()
  return (
    row.getValue<string>("name").toLowerCase().includes(searchValue) ||
    row.getValue<string>("phone").toLowerCase().includes(searchValue) ||
    row.getValue<string>("licenseNumber").toLowerCase().includes(searchValue)
  )
}

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export const columns: ColumnDef<Driver>[] = [
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

  // Name Column (Sortable, Searchable)
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">
        {row.getValue("name")}
      </span>
    ),
  },

  // Phone Column (Searchable)
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="text-gray-700">{row.getValue("phone")}</span>
    ),
  },

  // License Number Column (Sortable)
  {
    accessorKey: "licenseNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-8 p-0"
      >
        License Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-gray-700">
        {row.getValue("licenseNumber")}
      </span>
    ),
  },

  // Status Column (Badge)
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Driver["status"]
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

  // Assigned Vehicle Column
  {
    accessorKey: "assignedVehicle",
    header: "Assigned Vehicle",
    cell: ({ row }) => {
      const vehicle = row.getValue("assignedVehicle") as string | undefined
      return (
        <span className={vehicle ? "text-gray-900 font-medium" : "text-gray-400"}>
          {vehicle || "—"}
        </span>
      )
    },
  },

  // Actions Column
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const driver = row.original

      const handleViewDriver = () => {
        console.log("View driver:", driver)
      }

      const handleEditDriver = () => {
        console.log("Edit driver:", driver)
      }

      const handleAssignVehicle = () => {
        console.log("Assign vehicle to driver:", driver)
      }

      const handleDeleteDriver = () => {
        console.log("Delete driver:", driver)
      }

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
            <DropdownMenuItem onClick={handleViewDriver}>
              View Driver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditDriver}>
              Edit Driver
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleAssignVehicle}>
              Assign Vehicle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteDriver}
              className="text-red-600"
            >
              Delete Driver
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

export const sampleDrivers: Driver[] = [
  {
    id: "driver-001",
    name: "John Smith",
    phone: "+1-555-0101",
    licenseNumber: "DL-2023-001",
    status: "active",
    assignedVehicle: "ABC-1234",
  },
  {
    id: "driver-002",
    name: "Sarah Johnson",
    phone: "+1-555-0102",
    licenseNumber: "DL-2023-002",
    status: "on-duty",
    assignedVehicle: "DEF-5678",
  },
  {
    id: "driver-003",
    name: "Michael Chen",
    phone: "+1-555-0103",
    licenseNumber: "DL-2023-003",
    status: "off-duty",
    assignedVehicle: "GHI-9012",
  },
  {
    id: "driver-004",
    name: "Emma Wilson",
    phone: "+1-555-0104",
    licenseNumber: "DL-2023-004",
    status: "active",
  },
  {
    id: "driver-005",
    name: "Robert Martinez",
    phone: "+1-555-0105",
    licenseNumber: "DL-2023-005",
    status: "inactive",
    assignedVehicle: "JKL-3456",
  },
]

// ============================================================================
// DRIVER TABLE COMPONENT
// ============================================================================

export function DriverTable({
  data,
  onViewDriver,
  onEditDriver,
  onAssignVehicle,
  onDeleteDriver,
  onAddDriver,
}: DriverTableProps) {
  // State Management
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Custom filter function with global search
  const globalFilterFn = useCallback<FilterFn<Driver>>(
    (row, columnId) => {
      if (!globalFilter) return true
      const searchValue = globalFilter.toLowerCase()
      return (
        row.getValue<string>("name").toLowerCase().includes(searchValue) ||
        row.getValue<string>("phone").toLowerCase().includes(searchValue) ||
        row
          .getValue<string>("licenseNumber")
          .toLowerCase()
          .includes(searchValue)
      )
    },
    [globalFilter]
  )

  // Table Instance
  const table = useReactTable({
    data,
    columns,
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
            placeholder="Search by name, phone, or license..."
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

          {/* Add Driver Button */}
          <Button
            onClick={onAddDriver}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Driver
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
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No drivers found.
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
          {table.getPageCount() || 1} ({totalCount} total drivers)
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
