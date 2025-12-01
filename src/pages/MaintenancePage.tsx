import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import {
  MaintenanceTable,
  MaintenanceRecord,
  MaintenanceWithVehicle,
  Vehicle,
} from '@/components/MaintenanceTable';

interface MaintenanceResponse {
  _id?: string;
  id?: string;
  vehicleId: string;
  service_type?: string;
  description: string;
  cost: number;
  completedDate: string | Date;
  date?: string | Date;
  notes?: string;
}

interface VehicleResponse {
  _id?: string;
  id: string;
  make: string;
  model: string;
  year: number;
  currentMileage?: number;
  current_mileage?: number;
}

export function MaintenancePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [records, setRecords] = useState<MaintenanceWithVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>('USD');

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user preferences to get currency
      try {
        const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
        const data = prefsRes?.data ? prefsRes.data : prefsRes;
        if (data && data.preferences) {
          setCurrency(data.preferences.currency || 'USD');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }

      // Fetch vehicles
      const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
      const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
      
      // Normalize vehicle data
      const normalizedVehicles = vehiclesList.map((v: VehicleResponse) => ({
        id: v.id || v._id,
        make: v.make,
        model: v.model,
        year: v.year,
        currentMileage: v.currentMileage || v.current_mileage,
      }));
      
      setVehicles(normalizedVehicles);

      // Fetch maintenance records for all vehicles
      let allRecords: MaintenanceWithVehicle[] = [];
      if (normalizedVehicles && normalizedVehicles.length > 0) {
        for (const vehicle of normalizedVehicles) {
          try {
            const mainRes = await apiRequest(`/api/maintenance/vehicle/${vehicle.id}`, {
              method: 'GET',
            });
            const mainList = Array.isArray(mainRes) ? mainRes : (mainRes?.data || []);
            if (mainList && mainList.length > 0) {
              // Transform records to match frontend interface
              const transformedRecords = mainList.map((record: MaintenanceResponse) => ({
                id: record.id || record._id,
                _id: record._id,
                vehicleId: record.vehicleId,
                service_type: record.service_type,
                description: record.description,
                cost: record.cost,
                completedDate: record.completedDate || record.date,
                notes: record.notes,
                vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
              }));
              allRecords = [...allRecords, ...transformedRecords];
            }
          } catch (error) {
            console.error(`Error fetching maintenance for vehicle ${vehicle.id}:`, error);
          }
        }
      }
      setRecords(allRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load maintenance records',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecord = (record: MaintenanceWithVehicle) => {
    console.log('View record:', record);
    // Navigate or open modal
  };

  const handleEditRecord = (record: MaintenanceWithVehicle) => {
    console.log('Edit record:', record);
    navigate(`/maintenance/vehicle/${record.vehicleId}`);
  };

  const handleDeleteRecord = (record: MaintenanceWithVehicle) => {
    console.log('Deleted record:', record);
    // Refresh data after deletion (handled in MaintenanceTable)
    fetchData();
  };

  const handleAddMaintenance = () => {
    if (vehicles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add a vehicle first before logging maintenance.',
        variant: 'destructive',
      });
      navigate('/vehicles/new');
      return;
    }
    navigate('/maintenance/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Records</h1>
          <p className="text-sm text-gray-600 mt-1">Track and manage all vehicle maintenance services</p>
        </div>

        {/* MaintenanceTable Component */}
        <MaintenanceTable
          data={records}
          vehicles={vehicles}
          currency={currency}
          onViewRecord={handleViewRecord}
          onEditRecord={handleEditRecord}
          onDeleteRecord={handleDeleteRecord}
          onAddMaintenance={handleAddMaintenance}
          onRefresh={fetchData}
        />
      </div>
    </div>
  );
}
