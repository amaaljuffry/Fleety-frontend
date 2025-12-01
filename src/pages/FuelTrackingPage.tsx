import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Loader2, Download, AlertCircle } from 'lucide-react';
import {
  getFuelLogs,
  getFuelStats,
  deleteFuelLog,
  FuelLog,
  FuelStatsResponse
} from '@/api/fuel';
import { apiRequest } from '@/api/client';
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
import { useToast } from '@/hooks/use-toast';
import { FuelLogTable, FuelLogWithVehicle } from '@/components/FuelLogTable';

interface Vehicle {
  _id: string;
  id?: string;
  make: string;
  model: string;
  license_plate: string;
  year?: number;
  color?: string;
  fuel_type?: string;
}

interface Driver {
  _id: string;
  id?: string;
  name: string;
  email?: string;
}

// Helper functions
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "—";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const getCurrencySymbol = (currencyCode: string): string => {
  const symbols: { [key: string]: string } = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    MYR: "RM",
  };
  return symbols[currencyCode] || currencyCode;
};

export const FuelTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // State management
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLogWithVehicle[]>([]);
  const [stats, setStats] = useState<FuelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currency, setCurrency] = useState<string>('MYR');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [logToDelete, setLogToDelete] = useState<FuelLogWithVehicle | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [documentViewerOpen, setDocumentViewerOpen] = useState(false);
  const [documentToView, setDocumentToView] = useState<{ url: string; type: 'receipt' | 'pump_meter' } | null>(null);


  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch user preferences
      try {
        const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
        const data = prefsRes?.data ? prefsRes.data : prefsRes;
        if (data && data.preferences) {
          setCurrency(data.preferences.currency || 'MYR');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }

      // Fetch vehicles
      const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
      const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
      setVehicles(vehiclesList);

      // Fetch drivers
      let driversList: Driver[] = [];
      try {
        const driversRes = await apiRequest('/api/drivers', { method: 'GET' });
        driversList = Array.isArray(driversRes) ? driversRes : (driversRes?.data || []);
        setDrivers(driversList);
      } catch (driverErr) {
        console.error('Error fetching drivers:', driverErr);
      }

      // Fetch fuel logs for all vehicles
      let allLogs: FuelLogWithVehicle[] = [];
      if (vehiclesList && vehiclesList.length > 0) {
        for (const vehicle of vehiclesList) {
          const vehicleId = vehicle._id || vehicle.id;
          if (!vehicleId) {
            console.error('Vehicle has no ID:', vehicle);
            continue;
          }
          try {
            const logsData = await getFuelLogs(vehicleId);
            console.log(`Fuel logs for vehicle ${vehicleId}:`, logsData);
            if (logsData && logsData.length > 0) {
              const logsWithVehicle = logsData.map(log => {
                // Find the driver name from locally fetched driversList
                const driverName = driversList.find(d => d._id === log.driver_id)?.name || undefined;
                
                return {
                  ...log,
                  vehicleName: `${vehicle.year || ''} ${vehicle.make} ${vehicle.model}`.trim(),
                  vehicleYear: vehicle.year,
                  vehicleMake: vehicle.make,
                  vehicleModel: vehicle.model,
                  licensePlate: vehicle.license_plate,
                  driverName,
                  trip_purpose: log.trip_purpose || 'Other',
                };
              });
              allLogs = [...allLogs, ...logsWithVehicle];
            }
          } catch (error) {
            console.error(`Error fetching fuel logs for vehicle ${vehicleId}:`, error);
          }
        }
      }
      console.log('All logs with IDs:', allLogs.map(l => ({ _id: l._id, vehicleName: l.vehicleName })));
      setFuelLogs(allLogs);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fuel tracking data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleEditLog = (log: FuelLogWithVehicle) => {
    console.log('Editing log:', log);
    navigate(`/fuel/${log._id}/edit`);
  };

  const handleDeleteLog = (log: FuelLogWithVehicle) => {
    console.log('Delete requested for log:', {
      _id: log._id,
      vehicle_id: log.vehicle_id,
      vehicleName: log.vehicleName,
      date: log.date
    });
    setLogToDelete(log);
    setDeleteDialogOpen(true);
  };

  const handleViewDocument = (url: string, type: 'receipt' | 'pump_meter') => {
    setDocumentToView({ url, type });
    setDocumentViewerOpen(true);
  };

  const confirmDelete = async () => {
    if (!logToDelete || !logToDelete._id) {
      console.error('Cannot delete: Missing log or ID', logToDelete);
      toast({
        title: 'Error',
        description: 'Invalid fuel entry ID',
        variant: 'destructive',
      });
      return;
    }

    console.log('Attempting to delete fuel log with ID:', logToDelete._id);
    setIsDeleting(true);
    try {
      const result = await deleteFuelLog(logToDelete._id);
      console.log('Delete result:', result);
      
      await fetchData();
      
      toast({
        title: 'Success',
        description: 'Fuel entry deleted successfully',
      });
      setDeleteDialogOpen(false);
      setLogToDelete(null);
    } catch (error: unknown) {
      console.error('Error deleting fuel log:', error);
      const err = error as { message?: string; response?: unknown; status?: number };
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        response: err.response,
        status: err.status
      });
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete fuel entry';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNewForm = () => {
    if (vehicles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add a vehicle first before logging fuel.',
        variant: 'destructive',
      });
      navigate('/vehicles/new');
      return;
    }
    navigate('/fuel/new');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fuel & Energy Tracking</h1>
            <p className="text-sm text-gray-600 mt-1">Monitor consumption and costs for your vehicles</p>
          </div>
          <Button
            onClick={handleOpenNewForm}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Fuel Entry
          </Button>
        </div>

        {/* Main Table Component */}
        <FuelLogTable
          data={fuelLogs}
          vehicles={vehicles}
          drivers={drivers}
          currency={currency}
          loading={loading}
          onEdit={handleEditLog}
          onDelete={handleDeleteLog}
          onViewDocument={handleViewDocument}
        />
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Fuel Entry?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this fuel entry?
                {logToDelete && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                    <div className="text-sm text-gray-900 space-y-1">
                      <p><strong>Vehicle:</strong> {logToDelete.vehicleName}</p>
                      <p><strong>Date:</strong> {formatDate(logToDelete.date)}</p>
                      <p><strong>Amount:</strong> {logToDelete.liters?.toFixed(1)} L</p>
                      <p><strong>Cost:</strong> {getCurrencySymbol(currency)} {logToDelete.total_cost?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
                <p className="mt-3 text-red-600 font-medium">
                  This action cannot be undone.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default FuelTrackingPage;
