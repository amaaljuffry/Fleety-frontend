import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { DriverTable, Driver as DriverTableType } from '@/components/DriverTable';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface DriverResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  assigned_vehicles: string[];
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
}

export function DriversPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [drivers, setDrivers] = useState<DriverTableType[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch drivers from backend
        const driversRes = await apiRequest('/api/drivers', { method: 'GET' });
        const driversList = Array.isArray(driversRes) ? driversRes : (driversRes?.data || []);

        // Fetch vehicles for assignment info
        const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
        const normalizedVehicles = vehiclesList.map((v: Vehicle & { _id?: string }) => ({
          ...v,
          id: v.id || v._id || '',
        }));
        setVehicles(normalizedVehicles);

        // Transform backend drivers to DriverTable format
        const transformedDrivers: DriverTableType[] = driversList.map((driver: DriverResponse) => {
          // Get first assigned vehicle's plate number
          const assignedVehicle = driver.assigned_vehicles?.[0]
            ? normalizedVehicles.find((v) => v.id === driver.assigned_vehicles[0])?.license_plate
            : undefined;

          return {
            id: driver.id,
            name: driver.name,
            phone: driver.phone || '',
            licenseNumber: driver.license_number || '',
            status: 'active' as const,
            assignedVehicle: assignedVehicle || undefined,
          };
        });

        setDrivers(transformedDrivers);
      } catch (error) {
        console.error('Error loading drivers:', error);
        setError('Failed to load drivers');
        toast({
          title: 'Error',
          description: 'Failed to load drivers',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, location]);

  const handleViewDriver = (driver: DriverTableType) => {
    navigate(`/drivers/${driver.id}`);
  };

  const handleEditDriver = (driver: DriverTableType) => {
    navigate(`/drivers/${driver.id}/edit`);
  };

  const handleAssignVehicle = (driver: DriverTableType) => {
    navigate(`/drivers/${driver.id}/assign-vehicle`);
  };

  const handleDeleteDriver = async (driver: DriverTableType) => {
    if (!window.confirm(`Are you sure you want to delete ${driver.name}?`)) {
      return;
    }

    try {
      await apiRequest(`/api/drivers/${driver.id}`, { method: 'DELETE' });
      setDrivers(drivers.filter((d) => d.id !== driver.id));
      toast({
        title: 'Success',
        description: 'Driver deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete driver',
        variant: 'destructive',
      });
    }
  };

  const handleAddDriver = () => {
    navigate('/drivers/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Driver Management</h1>
          <p className="text-gray-600 text-lg">Manage and track all fleet drivers</p>
        </div>

      {/* Error State */}
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
            onClick={() => setError('')}
            className="text-red-600 hover:text-red-700"
          >
            Dismiss
          </Button>
        </div>
      )}

        {/* Driver Table */}
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
      </div>
    </div>
  );
}
