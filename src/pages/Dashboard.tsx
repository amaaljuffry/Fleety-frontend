import { useState, useEffect } from 'react';
import { Plus, Bell, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleCard } from '@/components/VehicleCard';
import { ReminderCard } from '@/components/ReminderCard';
import { getActiveReminders } from '@/utils/reminderUtils';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';

interface Vehicle {
  _id?: string;
  id?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  current_mileage?: number;
  user_id?: string;
}

const Dashboard = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch vehicles from API
        const vehiclesResponse = await apiRequest('/api/vehicles');
        setVehicles(vehiclesResponse || []);

        // Try to fetch reminders if available
        try {
          const remindersResponse = await apiRequest('/api/reminders');
          setReminders(remindersResponse || []);
        } catch (err) {
          // Reminders might fail if none exist, that's okay
          setReminders([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
        setError(errorMessage);
        console.error('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeReminders = reminders.length > 0 ? getActiveReminders(reminders, vehicles) : [];
  const urgentReminders = activeReminders.filter(
    rs => rs.status === 'overdue' || rs.status === 'due_soon'
  ).slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your vehicles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">My Vehicles</h1>
            <p className="text-muted-foreground">
              Manage your vehicles and track their maintenance history
            </p>
          </div>
          <Button size="lg" onClick={() => navigate('/vehicles/new')}>
            <Plus className="h-5 w-5 mr-2" />
            Add Vehicle
          </Button>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {urgentReminders.length > 0 && (
          <Card className="mb-8 border-warning/50 bg-warning/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-warning" />
                  <CardTitle>Service Reminders</CardTitle>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Navigate to first vehicle with urgent reminder
                    const firstReminder = urgentReminders[0];
                    if (firstReminder) {
                      navigate(`/vehicles/${firstReminder.reminder.vehicleId}`);
                    }
                  }}
                >
                  View All
                </Button>
              </div>
              <CardDescription>
                {urgentReminders.filter(rs => rs.status === 'overdue').length > 0
                  ? 'You have overdue maintenance items'
                  : 'Upcoming maintenance needed soon'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {urgentReminders.map((reminderStatus) => {
                  const vehicle = vehicles.find(v => (v._id || v.id) === reminderStatus.reminder.vehicleId);
                  if (!vehicle) return null;
                  return (
                    <ReminderCard
                      key={reminderStatus.reminder.id}
                      reminderStatus={reminderStatus}
                      vehicle={vehicle}
                      compact
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {vehicles.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border rounded-lg">
            <p className="text-muted-foreground text-lg mb-4">No vehicles added yet</p>
            <Button onClick={() => navigate('/vehicles/new')}>
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Vehicle
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map((vehicle) => {
              const mappedVehicle = {
                id: vehicle.id || vehicle._id || '',
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                color: vehicle.color,
                mileage: vehicle.current_mileage || 0,
                licensePlate: (vehicle as any).license_plate,
                imageUrl: (vehicle as any).image_url
              };
              return (
                <VehicleCard
                  key={vehicle.id || vehicle._id}
                  vehicle={mappedVehicle}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
