import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, Trash2 } from 'lucide-react';
import { VehicleTable, Vehicle as VehicleTableType } from '@/components/VehicleTable';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  current_mileage: number;
  fuel_type?: string;
  color?: string;
}

export function VehiclesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<VehicleTableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vehicleToDelete, setVehicleToDelete] = useState<VehicleTableType | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch vehicles from backend
        const res = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(res) ? res : (res?.data || []);

        // Transform backend vehicles to VehicleTable format
        const transformedVehicles: VehicleTableType[] = vehiclesList.map((vehicle: VehicleResponse) => {
          return {
            id: vehicle.id,
            plateNumber: vehicle.license_plate || '',
            model: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            type: 'car' as const, // Default to 'car', should come from backend if available
            status: 'active' as const, // Default to 'active', should come from backend if available
            lastServiceDate: new Date().toISOString().split('T')[0], // Default to today, should come from backend
          };
        });

        setVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error loading vehicles:', error);
        setError('Failed to load vehicles');
        toast({
          title: 'Error',
          description: 'Failed to load vehicles',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, location]);

  const handleViewVehicle = (vehicle: VehicleTableType) => {
    navigate(`/vehicles/${vehicle.id}`);
  };

  const handleEditVehicle = (vehicle: VehicleTableType) => {
    navigate(`/vehicles/${vehicle.id}/edit`);
  };

  const handleAssignDriver = (vehicle: VehicleTableType) => {
    navigate(`/vehicles/${vehicle.id}/assign-driver`);
  };

  const handleMarkMaintenance = async (vehicle: VehicleTableType) => {
    try {
      await apiRequest(`/api/vehicles/${vehicle.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'maintenance' }),
      });
      setVehicles(vehicles.map((v) =>
        v.id === vehicle.id ? { ...v, status: 'maintenance' } : v
      ));
      toast({
        title: 'Success',
        description: 'Vehicle marked as maintenance',
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to update vehicle',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteVehicle = async (vehicle: VehicleTableType) => {
    setVehicleToDelete(vehicle);
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;

    try {
      await apiRequest(`/api/vehicles/${vehicleToDelete.id}`, { method: 'DELETE' });
      setVehicles(vehicles.filter((v) => v.id !== vehicleToDelete.id));
      toast({
        title: 'Success',
        description: `${vehicleToDelete.model} deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle',
        variant: 'destructive',
      });
    } finally {
      setVehicleToDelete(null);
    }
  };

  const handleAddVehicle = () => {
    navigate('/vehicles/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
            <p className="text-gray-600 text-lg mt-1">Manage and track all fleet vehicles</p>
          </div>
          <div className="py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">Vehicle Management</h1>
          <p className="text-gray-600 text-lg">Manage and track all fleet vehicles</p>
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

        {/* Vehicle Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <VehicleTable
            data={vehicles}
            onViewVehicle={handleViewVehicle}
            onEditVehicle={handleEditVehicle}
            onAssignDriver={handleAssignDriver}
            onMarkMaintenance={handleMarkMaintenance}
            onDeleteVehicle={handleDeleteVehicle}
            onAddVehicle={handleAddVehicle}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!vehicleToDelete} onOpenChange={() => setVehicleToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Vehicle
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{vehicleToDelete?.model}</strong>?
              <br />
              <span className="text-sm text-gray-500">
                Plate Number: {vehicleToDelete?.plateNumber}
              </span>
              <br />
              <br />
              This action cannot be undone. All maintenance records, reminders, and documents associated with this vehicle will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
