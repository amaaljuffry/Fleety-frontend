import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ChevronDown, AlertCircle, Loader2 } from 'lucide-react'

interface Vehicle {
  _id: string
  make: string
  model: string
  license_plate: string
  year?: number
  color?: string
}

interface VehicleSelectorProps {
  vehicles: Vehicle[]
  selectedVehicle: Vehicle | null
  onSelectVehicle: (vehicle: Vehicle) => void
  loading?: boolean
  error?: string
}

export const VehicleSelector = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle,
  loading = false,
  error
}: VehicleSelectorProps) => {
  const getDisplayText = () => {
    if (loading) return 'Loading vehicles...'
    if (error) return 'Error loading vehicles'
    if (selectedVehicle) {
      return `${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.license_plate})`
    }
    return 'Select Vehicle'
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Select Vehicle</label>
      <div className="flex items-center gap-2">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            {error}
          </div>
        )}
        {!error && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                disabled={loading || vehicles.length === 0}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {getDisplayText()}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-full min-w-64" align="start">
              {vehicles.length === 0 ? (
                <div className="p-3 text-sm text-gray-600">No vehicles available</div>
              ) : (
                <>
                  <DropdownMenuLabel>Your Vehicles</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    {vehicles.map((vehicle) => (
                      <DropdownMenuItem
                        key={vehicle._id}
                        onClick={() => onSelectVehicle(vehicle)}
                        className="cursor-pointer"
                      >
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {vehicle.year && `${vehicle.year} `}
                            {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-600">
                            {vehicle.license_plate}
                            {vehicle.color && ` • ${vehicle.color}`}
                          </div>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuGroup>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
