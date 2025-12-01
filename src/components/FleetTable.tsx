"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Plus, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

// Type definitions
export type Vehicle = {
  id: string
  plateNumber: string
  model: string
  type: "car" | "van" | "lorry"
  status: "active" | "maintenance" | "inactive"
  lastServiceDate: string
}

// Sample data
const sampleVehicles: Vehicle[] = [
  {
    id: "1",
    plateNumber: "ABC-1234",
    model: "Toyota Camry",
    type: "car",
    status: "active",
    lastServiceDate: "2025-11-10",
  },
  {
    id: "2",
    plateNumber: "DEF-5678",
    model: "Ford Transit",
    type: "van",
    status: "active",
    lastServiceDate: "2025-10-20",
  },
  {
    id: "3",
    plateNumber: "GHI-9012",
    model: "Volvo FH16",
    type: "lorry",
    status: "maintenance",
    lastServiceDate: "2025-09-15",
  },
  {
    id: "4",
    plateNumber: "JKL-3456",
    model: "Honda Civic",
    type: "car",
    status: "inactive",
    lastServiceDate: "2025-08-05",
  },
  {
    id: "5",
    plateNumber: "MNO-7890",
    model: "Mercedes Sprinter",
    type: "van",
    status: "active",
    lastServiceDate: "2025-11-15",
  },
]

// Status badge colors
const statusStyles: Record<Vehicle["status"], string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-200",
  maintenance: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  inactive: "bg-red-100 text-red-800 hover:bg-red-200",
}

// Type badge colors
const typeStyles: Record<Vehicle["type"], string> = {
  car: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  van: "bg-purple-100 text-purple-800 hover:bg-purple-200",
  lorry: "bg-orange-100 text-orange-800 hover:bg-orange-200",
}

export const columns: ColumnDef<Vehicle>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
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
  {
    accessorKey: "plateNumber",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Plate Number
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="font-semibold text-gray-900">{row.getValue("plateNumber")}</span>
    ),
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => <span className="text-gray-700">{row.getValue("model")}</span>,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Type
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as Vehicle["type"]
      return (
        <Badge variant="secondary" className={typeStyles[type]}>
          {type.charAt(0).toUpperCase() + type.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as Vehicle["status"]
      return (
        <Badge variant="secondary" className={statusStyles[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
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
  {
    id: "actions",
    header: "Actions",
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
            <DropdownMenuItem onClick={() => handleViewVehicle(vehicle)}>
              View Vehicle
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditVehicle(vehicle)}>
              Edit Vehicle
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAssignDriver(vehicle)}>
              Assign Driver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleMarkMaintenance(vehicle)}>
              Mark as Maintenance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
]

// Action handlers (can be replaced with actual implementations)
const handleViewVehicle = (vehicle: Vehicle) => {
  console.log("View vehicle:", vehicle)
  // TODO: Implement view modal
}

const handleEditVehicle = (vehicle: Vehicle) => {
  console.log("Edit vehicle:", vehicle)
  // TODO: Implement edit modal
}

const handleAssignDriver = (vehicle: Vehicle) => {
  console.log("Assign driver to vehicle:", vehicle)
  // TODO: Implement driver assignment modal
}

const handleMarkMaintenance = (vehicle: Vehicle) => {
  console.log("Mark vehicle as maintenance:", vehicle)
  // TODO: Implement maintenance status update
}

interface FleetTableProps {
  data?: Vehicle[]
}

export function FleetTable({ data = sampleVehicles }: FleetTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [searchValue, setSearchValue] = React.useState("")

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
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleSearch = (value: string) => {
    setSearchValue(value)
    table.getColumn("plateNumber")?.setFilterValue(value)
  }

  return (
    <div className="w-full space-y-4">
      {/* Controls Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-1 items-center gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search plate number..."
              value={searchValue}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Column Visibility Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Columns <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
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
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Add Vehicle Button */}
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b border-gray-200">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="bg-gray-50 px-4 py-3 text-left">
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-gray-500"
                >
                  No vehicles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
