import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { RemindersTable, Reminder as ReminderType, Vehicle as VehicleType, ReminderWithVehicle } from '@/components/RemindersTable';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface ReminderResponse {
  id: string;
  _id?: string;
  vehicleId: string;
  vehicle_id?: string;
  service_type: string;
  reminder_threshold_miles?: number;
  reminder_threshold_days?: number;
  is_active: boolean;
  isActive?: boolean;
  due_by_mileage?: number;
  due_by_date?: string;
  last_completed_date?: string;
}

interface VehicleResponse {
  id: string;
  _id?: string;
  make: string;
  model: string;
  year: number;
  currentMileage?: number;
  current_mileage?: number;
}

export function RemindersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<ReminderWithVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch vehicles
        const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);

        // Normalize vehicle IDs and mileage
        const normalizedVehicles = vehiclesList.map((v: VehicleResponse & { _id?: string }) => ({
          ...v,
          id: v.id || v._id || '',
          currentMileage: v.currentMileage || v.current_mileage || 0,
        }));

        // Fetch reminders for all vehicles
        let allReminders: ReminderWithVehicle[] = [];
        if (normalizedVehicles && normalizedVehicles.length > 0) {
          for (const vehicle of normalizedVehicles) {
            try {
              const remRes = await apiRequest(`/api/reminders/vehicle/${vehicle.id}`, {
                method: 'GET',
              });
              const remList = Array.isArray(remRes) ? remRes : (remRes?.data || []);
              if (remList && remList.length > 0) {
                // Transform reminders to include vehicle name and mileage
                const transformedReminders = remList.map((rem: ReminderResponse) => ({
                  ...rem,
                  vehicleName: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                  currentMileage: vehicle.currentMileage,
                  vehicleId: vehicle.id,
                }));
                allReminders = [...allReminders, ...transformedReminders];
              }
            } catch (error) {
              console.error(`Error fetching reminders for vehicle ${vehicle.id}:`, error);
            }
          }
        }
        setReminders(allReminders);
      } catch (error) {
        console.error('Error loading reminders:', error);
        setError('Failed to load reminders');
        toast({
          title: 'Error',
          description: 'Failed to load reminders',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [toast, location]);

  const handleViewReminder = (reminder: ReminderWithVehicle) => {
    // TODO: Navigate to reminder details or open modal
    console.log('View reminder:', reminder);
  };

  const handleEditReminder = (reminder: ReminderWithVehicle) => {
    // TODO: Navigate to edit or open modal
    console.log('Edit reminder:', reminder);
  };

  const handleMarkCompleted = async (reminder: ReminderWithVehicle) => {
    try {
      const reminderId = reminder.id || reminder._id;
      const response = await apiRequest(
        `/api/reminders/${reminder.vehicleId}/${reminderId}`,
        {
          method: 'PUT',
          body: JSON.stringify({ last_completed_date: new Date().toISOString() }),
        }
      );

      if (response) {
        setReminders(
          reminders.map((r) =>
            (r.id === reminder.id || r._id === reminder._id)
              ? { ...r, last_completed_date: new Date().toISOString() }
              : r
          )
        );
        toast({
          title: 'Success',
          description: 'Reminder marked as completed',
        });
      }
    } catch (error) {
      console.error('Error updating reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to mark reminder as completed',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteReminder = async (reminder: ReminderWithVehicle) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      const reminderId = reminder.id || reminder._id;
      await apiRequest(
        `/api/reminders/${reminder.vehicleId}/${reminderId}`,
        { method: 'DELETE' }
      );
      setReminders(reminders.filter((r) => r.id !== reminder.id && r._id !== reminder._id));
      toast({
        title: 'Success',
        description: 'Reminder deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete reminder',
        variant: 'destructive',
      });
    }
  };

  const handleAddReminder = () => {
    navigate('/reminders/new');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Reminders</h1>
            <p className="text-gray-600 text-lg mt-1">Manage and track all service reminders</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Service Reminders</h1>
          <p className="text-gray-600 text-lg">Manage and track all service reminders</p>
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

        {/* Reminders Table */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <RemindersTable
            data={reminders}
            onViewReminder={handleViewReminder}
            onEditReminder={handleEditReminder}
            onMarkCompleted={handleMarkCompleted}
            onDeleteReminder={handleDeleteReminder}
            onAddReminder={handleAddReminder}
          />
        </div>
      </div>
    </div>
  );
}
