import React, { useState } from "react"
import { DriverTable, sampleDrivers, Driver } from "@/components/DriverTable"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2, Users } from "lucide-react"

// ============================================================================
// STATISTICS CARD COMPONENT
// ============================================================================

interface StatCardProps {
  label: string
  value: number
  color: string
  textColor: string
}

function StatCard({ label, value, color, textColor }: StatCardProps) {
  return (
    <div className={`rounded-lg ${color} border border-gray-200 p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
        </div>
        <Users className={`h-8 w-8 ${textColor} opacity-80`} />
      </div>
    </div>
  )
}

// ============================================================================
// DRIVER MANAGEMENT PAGE COMPONENT
// ============================================================================

export function DriverManagementPage() {
  // State Management
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Calculate Statistics
  const stats = {
    total: drivers.length,
    active: drivers.filter((d) => d.status === "active").length,
    onDuty: drivers.filter((d) => d.status === "on-duty").length,
    offDuty: drivers.filter((d) => d.status === "off-duty").length,
    inactive: drivers.filter((d) => d.status === "inactive").length,
  }

  // Action Handlers
  const handleViewDriver = (driver: Driver) => {
    console.log("View driver:", driver)
    // TODO: Implement modal or navigation
  }

  const handleEditDriver = (driver: Driver) => {
    console.log("Edit driver:", driver)
    // TODO: Implement edit modal
  }

  const handleAssignVehicle = (driver: Driver) => {
    console.log("Assign vehicle to driver:", driver)
    // TODO: Implement vehicle assignment modal
  }

  const handleDeleteDriver = (driver: Driver) => {
    console.log("Delete driver:", driver)
    // TODO: Implement delete confirmation
    setDrivers(drivers.filter((d) => d.id !== driver.id))
  }

  const handleAddDriver = () => {
    console.log("Add new driver")
    // TODO: Implement add driver modal
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ===== HEADER ===== */}
      <div className="border-b border-gray-200 bg-white shadow-sm">
         <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-gray-900">
               Management
            </h1>
            <p className="text-gray-600 text-lg">
              Manage and track all fleet drivers
            </p>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ===== STATISTICS CARDS ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Total Drivers"
            value={stats.total}
            color="bg-blue-50"
            textColor="text-blue-700"
          />
          <StatCard
            label="Active"
            value={stats.active}
            color="bg-green-50"
            textColor="text-green-700"
          />
          <StatCard
            label="On Duty"
            value={stats.onDuty}
            color="bg-cyan-50"
            textColor="text-cyan-700"
          />
          <StatCard
            label="Off Duty"
            value={stats.offDuty}
            color="bg-yellow-50"
            textColor="text-yellow-700"
          />
          <StatCard
            label="Inactive"
            value={stats.inactive}
            color="bg-red-50"
            textColor="text-red-700"
          />
        </div>

        {/* ===== ERROR STATE ===== */}
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900">Error</h3>
              <p className="text-red-800 text-sm">{error}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError("")}
              className="text-red-600 hover:text-red-700"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-6 flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
            <span className="text-blue-700 font-medium">
              Loading driver data...
            </span>
          </div>
        )}

        {/* ===== DRIVER TABLE ===== */}
        {!loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <DriverTable
              data={drivers}
              onViewDriver={handleViewDriver}
              onEditDriver={handleEditDriver}
              onAssignVehicle={handleAssignVehicle}
              onDeleteDriver={handleDeleteDriver}
              onAddDriver={handleAddDriver}
            />
          </div>
        )}
      </div>
    </div>
  )
}
