import React, { useState } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { FleetTable, Vehicle } from '@/components/FleetTable'

export const FleetManagementPage: React.FC = () => {
  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([
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
  ])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Calculate statistics
  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    maintenance: vehicles.filter(v => v.status === 'maintenance').length,
    inactive: vehicles.filter(v => v.status === 'inactive').length,
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Fleet Management</h1>
        <p className="text-gray-600">Manage and monitor your company's fleet of vehicles</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Vehicles"
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
          label="In Maintenance"
          value={stats.maintenance}
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

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
          <span className="text-blue-700">Loading fleet data...</span>
        </div>
      )}

      {/* Fleet Table */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <FleetTable data={vehicles} />
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: number | string
  color: string
  textColor: string
}

function StatCard({ label, value, color, textColor }: StatCardProps) {
  return (
    <div className={`${color} rounded-lg p-4 border border-gray-200`}>
      <div className="text-sm font-medium text-gray-600">{label}</div>
      <div className={`text-3xl font-bold ${textColor} mt-2`}>{value}</div>
    </div>
  )
}

export default FleetManagementPage
