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

export type Reminder = {
  id: string
  _id?: string
  vehicleId: string
  service_type: string
  reminder_threshold_miles?: number
  reminder_threshold_days?: number
  is_active: boolean
  due_by_mileage?: number
  due_by_date?: string
  last_completed_date?: string
}

export type Vehicle = {
  id: string
  make: string
  model: string
  year: number
  currentMileage?: number
}

export type ReminderWithVehicle = Reminder & {
  vehicleName: string
}

type ReminderStatus = "overdue" | "due-soon" | "active"

interface ReminderTableProps {
  data: ReminderWithVehicle[]
  onViewReminder?: (reminder: ReminderWithVehicle) => void
  onEditReminder?: (reminder: ReminderWithVehicle) => void
  onMarkCompleted?: (reminder: ReminderWithVehicle) => void
  onDeleteReminder?: (reminder: ReminderWithVehicle) => void
  onAddReminder?: () => void
}

// ============================================================================
// STYLING HELPERS
// ============================================================================

const statusStyles: Record<ReminderStatus, string> = {
  overdue: "bg-red-100 text-red-800 hover:bg-red-200",
  "due-soon": "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  active: "bg-green-100 text-green-800 hover:bg-green-200",
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getReminderStatus = (reminder: ReminderWithVehicle): ReminderStatus => {
  if (!reminder.is_active) return "active"

  const now = new Date()
  const currentMileage = reminder.currentMileage || 0

  // Check date-based due
  if (reminder.due_by_date) {
    const dueDate = new Date(reminder.due_by_date)
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysUntilDue < 0) return "overdue"
    if (daysUntilDue <= 30) return "due-soon"
  }

  // Check mileage-based due
  if (reminder.due_by_mileage) {
    const milesUntilDue = reminder.due_by_mileage - currentMileage
    if (milesUntilDue < 0) return "overdue"
    if (milesUntilDue <= 500) return "due-soon"
  }

  return "active"
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

// ============================================================================
// COLUMN DEFINITIONS
// ============================================================================

export const columns: ColumnDef<ReminderWithVehicle>[] = [
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
    cell: ({ row }) => (
      <span className="text-gray-700">{row.getValue("service_type")}</span>
    ),
  },

  // Status Column (Badge)
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const reminder = row.original
      const status = getReminderStatus(reminder)
      const displayStatus =
        status === "due-soon" ? "Due Soon" : status.charAt(0).toUpperCase() + status.slice(1)

      return (
        <Badge variant="secondary" className={statusStyles[status]}>
          {displayStatus}
        </Badge>
      )
    },
  },

  // Due Date Column
  {
    accessorKey: "due_by_date",
    header: "Due Date",
    cell: ({ row }) => (
      <span className="text-gray-700">
        {formatDate(row.getValue("due_by_date"))}
      </span>
    ),
  },

  // Due Mileage Column
  {
    accessorKey: "due_by_mileage",
    header: "Due Mileage",
    cell: ({ row }) => {
      const reminder = row.original
      const dueMileage = row.getValue("due_by_mileage") as number | undefined
      const currentMileage = reminder.currentMileage || 0

      if (!dueMileage) return <span className="text-gray-400">—</span>

      const remaining = Math.max(0, dueMileage - currentMileage)
      return (
        <span className="text-gray-700">
          {dueMileage.toLocaleString()} mi ({remaining.toLocaleString()} remaining)
        </span>
      )
    },
  },

  // Last Completed Column
  {
    accessorKey: "last_completed_date",
    header: "Last Completed",
    cell: ({ row }) => (
      <span className="text-gray-700">
        {formatDate(row.getValue("last_completed_date"))}
      </span>
    ),
  },

  // Actions Column
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const reminder = row.original

      const handleViewReminder = () => {
        console.log("View reminder:", reminder)
      }

      const handleEditReminder = () => {
        console.log("Edit reminder:", reminder)
      }

      const handleMarkCompleted = () => {
        console.log("Mark as completed:", reminder)
      }

      const handleDeleteReminder = () => {
        console.log("Delete reminder:", reminder)
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
            <DropdownMenuItem onClick={handleViewReminder}>
              View Reminder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditReminder}>
              Edit Reminder
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleMarkCompleted}>
              Mark as Completed
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleDeleteReminder}
              className="text-red-600"
            >
              Delete Reminder
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

export const sampleReminders: ReminderWithVehicle[] = [
  {
    id: "reminder-001",
    vehicleId: "vehicle-001",
    vehicleName: "2023 Toyota Camry",
    service_type: "Oil Change",
    reminder_threshold_miles: 5000,
    reminder_threshold_days: 180,
    is_active: true,
    due_by_mileage: 45000,
    due_by_date: "2025-12-24",
    last_completed_date: "2025-10-15",
  },
  {
    id: "reminder-002",
    vehicleId: "vehicle-002",
    vehicleName: "2022 Ford Transit",
    service_type: "Tire Rotation",
    reminder_threshold_miles: 10000,
    reminder_threshold_days: 365,
    is_active: true,
    due_by_mileage: 50000,
    due_by_date: "2025-11-30",
    last_completed_date: "2025-09-01",
  },
  {
    id: "reminder-003",
    vehicleId: "vehicle-003",
    vehicleName: "2021 Volvo FH16",
    service_type: "Brake Inspection",
    reminder_threshold_miles: 15000,
    reminder_threshold_days: 365,
    is_active: true,
    due_by_mileage: 35000,
    due_by_date: "2025-10-15",
    last_completed_date: "2025-08-20",
  },
  {
    id: "reminder-004",
    vehicleId: "vehicle-004",
    vehicleName: "2023 Honda Civic",
    service_type: "Battery Check",
    reminder_threshold_miles: 20000,
    reminder_threshold_days: 730,
    is_active: true,
    due_by_mileage: 55000,
    due_by_date: "2026-01-10",
    last_completed_date: "2024-12-01",
  },
  {
    id: "reminder-005",
    vehicleId: "vehicle-005",
    vehicleName: "2022 Mercedes Sprinter",
    service_type: "Air Filter Replacement",
    reminder_threshold_miles: 12000,
    reminder_threshold_days: 365,
    is_active: true,
    due_by_mileage: 42000,
    due_by_date: "2025-12-05",
    last_completed_date: "2025-07-10",
  },
]

// ============================================================================
// REMINDER TABLE COMPONENT
// ============================================================================

export function RemindersTable({
  data,
  onViewReminder,
  onEditReminder,
  onMarkCompleted,
  onDeleteReminder,
  onAddReminder,
}: ReminderTableProps) {
  // State Management
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Custom filter function with global search
  const globalFilterFn = useCallback<FilterFn<ReminderWithVehicle>>(
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
            placeholder="Search by vehicle or service..."
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
                    {column.id.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim()}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Reminder Button */}
          <Button
            onClick={onAddReminder}
            size="sm"
            className="h-9 bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Reminder
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
                  No reminders found.
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
          {table.getPageCount() || 1} ({totalCount} total reminders)
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
