import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit, Bell, AlertCircle, CheckCircle, Loader2, Fuel, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReminderCard } from '@/components/ReminderCard';
import { DocumentUpload } from '@/components/DocumentUploadEnhanced';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getActiveReminders } from '@/utils/reminderUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/api/client';
import { formatCurrency } from '@/utils/currencyFormatter';
import { formatDistance } from '@/utils/distanceFormatter';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [reminders, setReminders] = useState<any[]>([]);
  const [fuelLogs, setFuelLogs] = useState<any[]>([]);
  const [fuelStats, setFuelStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>('USD');
  const [distanceUnit, setDistanceUnit] = useState<string>('miles');

  // DEBUG: Log when component renders
  console.log('🚗 VehicleDetails COMPONENT RENDERED');
  console.log('🚗 VehicleDetails - Vehicle ID from URL:', id);
  console.log('🚗 VehicleDetails - Loading state:', loading);
  console.log('🚗 VehicleDetails - Error state:', error);
  console.log('🚗 VehicleDetails - Vehicle state:', vehicle);

  useEffect(() => {
    const fetchData = async () => {
      console.log('🚗 VehicleDetails - fetchData called');
      console.log('🚗 VehicleDetails - Vehicle ID:', id);
      
      if (!id) {
        console.error('❌ No vehicle ID provided');
        setError('No vehicle ID provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);

        // Fetch currency preference
        try {
          const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
          const data = prefsRes?.data ? prefsRes.data : prefsRes;
          if (data && data.preferences) {
            setCurrency(data.preferences.currency || 'USD');
            setDistanceUnit(data.preferences.distance_unit || 'miles');
          }
        } catch (error) {
          console.error('Error fetching preferences:', error);
        }

        console.log('✅ Fetching vehicle details for ID:', id);
        
        // Fetch vehicle details
        const vehicleData = await apiRequest(`/api/vehicles/${id}`);
        console.log('✅ Vehicle data received:', vehicleData);
        
        if (!vehicleData) {
          throw new Error('No vehicle data received from API');
        }
        
        // Transform API response to frontend format
        const transformedVehicle = {
          id: vehicleData.id,
          make: vehicleData.make,
          model: vehicleData.model,
          year: vehicleData.year,
          color: vehicleData.color,
          vin: vehicleData.vin,
          license_plate: vehicleData.license_plate,
          current_mileage: vehicleData.current_mileage,
          fuel_type: vehicleData.fuel_type,
          imageUrl: vehicleData.image_url,
        };
        console.log('✅ Transformed vehicle:', transformedVehicle);
        setVehicle(transformedVehicle);

        // Fetch maintenance records
        try {
          const maintenanceData = await apiRequest(`/api/maintenance/vehicle/${id}`);
          const transformedRecords = (maintenanceData || []).map((r: any) => ({
            id: r.id,
            vehicleId: r.vehicle_id,
            date: r.date,
            mileage: r.mileage,
            type: r.service_type,
            description: r.description,
            cost: r.cost,
            serviceProvider: r.service_provider,
            notes: r.notes,
          }));
          setRecords(transformedRecords);
        } catch (err) {
          // No maintenance records yet, that's okay
          setRecords([]);
        }

        // Fetch reminders
        try {
          const remindersData = await apiRequest(`/api/reminders/vehicle/${id}`);
          console.log('Raw reminders API response:', remindersData);
          
          // Use reminders data directly - it should already be an array
          const remindersArray = Array.isArray(remindersData) ? remindersData : [];
          console.log('Reminders array length:', remindersArray.length);
          
          // Transform with minimal mapping to preserve data structure
          const transformedReminders = remindersArray.map((r) => {
            const reminder = {
              id: r.id,
              vehicleId: r.vehicle_id,
              serviceType: r.service_type,
              description: r.description,
              dueByMileage: r.due_by_mileage,
              dueByDate: r.due_by_date,
              reminderThresholdMiles: r.reminder_threshold_miles || 0,
              reminderThresholdDays: r.reminder_threshold_days || 0,
              isRecurring: r.is_recurring || false,
              recurringIntervalMiles: r.recurring_interval_miles,
              recurringIntervalMonths: r.recurring_interval_months,
              lastCompletedDate: r.last_completed_date,
              lastCompletedMileage: r.last_completed_mileage,
              isActive: r.is_active,
            };
            return reminder;
          });
          
          console.log('Transformed reminders:', transformedReminders);
          setReminders(transformedReminders);
        } catch (err) {
          console.error('Error fetching reminders:', err);
          setReminders([]);
        }

        // Fetch fuel logs
        try {
          const fuelData = await apiRequest(`/api/vehicles/${id}/fuel`, { method: 'GET' });
          const logs = Array.isArray(fuelData) ? fuelData : (fuelData?.data || []);
          setFuelLogs(logs);
        } catch (err) {
          console.error('Error fetching fuel logs:', err);
          setFuelLogs([]);
        }

        // Fetch fuel stats
        try {
          const statsData = await apiRequest(`/api/vehicles/${id}/fuel/stats?days=30`, { method: 'GET' });
          const stats = statsData?.data ? statsData.data : statsData;
          setFuelStats(stats);
        } catch (err) {
          console.error('Error fetching fuel stats:', err);
          setFuelStats(null);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch vehicle details';
        console.error('❌ Vehicle details fetch error:', err);
        console.error('❌ Error type:', typeof err);
        console.error('❌ Error message:', errorMessage);
        setError(errorMessage);
      } finally {
        console.log('✅ Fetch complete, setting loading to false');
        setLoading(false);
      }
    };

    if (id) {
      console.log('🚗 VehicleDetails - Starting fetchData with ID:', id);
      fetchData();
    } else {
      console.error('❌ No ID provided, cannot fetch vehicle');
      setError('No vehicle ID provided');
      setLoading(false);
    }
  }, [id]);
  
  const reminderStatuses = vehicle ? getActiveReminders(reminders, [vehicle]) : [];
  const activeReminderCount = reminderStatuses.length;
  
  console.log('VehicleDetails - reminders state:', reminders);
  console.log('VehicleDetails - vehicle:', vehicle);
  console.log('VehicleDetails - vehicle.id:', vehicle?.id);
  console.log('VehicleDetails - reminders[0].vehicleId:', reminders[0]?.vehicleId);
  console.log('VehicleDetails - vehicle ID match:', reminders[0]?.vehicleId === vehicle?.id);
  console.log('VehicleDetails - reminderStatuses:', reminderStatuses);
  console.log('VehicleDetails - activeReminderCount:', activeReminderCount);

  if (loading) {
    console.log('🔄 Rendering loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading vehicle details...</p>
          <p className="text-xs text-muted-foreground mt-2">Vehicle ID: {id}</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    console.log('❌ Rendering error state');
    console.log('❌ Error:', error);
    console.log('❌ Vehicle:', vehicle);
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">Vehicle not found</h2>
          <p className="text-muted-foreground mb-2">{error || 'Unable to load vehicle details'}</p>
          <p className="text-sm text-muted-foreground mb-6">
            Vehicle ID: {id}
          </p>
          <p className="text-xs text-muted-foreground mb-6">
            Check the browser console for more details.
          </p>
          <Button onClick={() => navigate('/vehicles')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicles
          </Button>
        </div>
      </div>
    );
  }

  console.log('✅ Rendering vehicle details page');
  console.log('✅ Vehicle:', vehicle);
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl mb-2">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </CardTitle>
                  <CardDescription>Vehicle Information</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/vehicles/${id}/edit`)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Year</p>
                  <p className="font-medium">{vehicle.year}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Make</p>
                  <p className="font-medium">{vehicle.make}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Model</p>
                  <p className="font-medium">{vehicle.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Color</p>
                  <p className="font-medium">{vehicle.color || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">License Plate</p>
                  <Badge variant="secondary">{vehicle.license_plate || 'N/A'}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Mileage</p>
                  <p className="font-medium">{formatDistance(vehicle.current_mileage, distanceUnit)}</p>
                </div>
                {vehicle.vin && (
                  <div className="col-span-2">
                    <p className="text-sm text-muted-foreground mb-1">VIN</p>
                    <p className="font-mono text-sm">{vehicle.vin}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Services</p>
                <p className="text-3xl font-bold">{records.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Spent</p>
                <p className="text-3xl font-bold">
                  {formatCurrency(records.reduce((sum, r) => sum + r.cost, 0), currency)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Service</p>
                <p className="font-medium">
                  {records.length > 0
                    ? new Date(records[0].date).toLocaleDateString()
                    : 'No services yet'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="maintenance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-3xl">
            <TabsTrigger value="maintenance">Maintenance History</TabsTrigger>
            <TabsTrigger value="fuel">Fuel Tracking</TabsTrigger>
            <TabsTrigger value="reminders" className="relative">
              Service Reminders
              {activeReminderCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeReminderCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="h-4 w-4 mr-1" />
              Documents
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Maintenance History</CardTitle>
                    <CardDescription>Complete service record for this vehicle</CardDescription>
                  </div>
                  <Button onClick={() => navigate(`/maintenance/vehicle/${id}`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service Record
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {records.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <p className="font-medium">No maintenance records yet</p>
                    <p className="text-sm">Add your first service record to start tracking</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {records.map((record: any) => (
                      <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <h4 className="font-medium capitalize">{record.type?.replace(/_/g, ' ') || 'Service'}</h4>
                          <p className="text-sm text-gray-500">{record.description}</p>
                          <div className="flex gap-4 mt-1 text-xs text-gray-400">
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                            {record.mileage && <span>{record.mileage.toLocaleString()} {distanceUnit}</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(record.cost || 0, currency)}</p>
                          {record.serviceProvider && (
                            <p className="text-xs text-gray-500">{record.serviceProvider}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fuel">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Fuel className="h-5 w-5" />
                      Fuel Economy
                    </CardTitle>
                    <CardDescription>Track fuel consumption and costs</CardDescription>
                  </div>
                  <Button onClick={() => navigate(`/vehicles/${id}/fuel`)}>
                    <Fuel className="h-4 w-4 mr-2" />
                    View Full Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {fuelLogs.length > 0 ? (
                  <div className="space-y-6">
                    {/* Stats Cards */}
                    {fuelStats && (
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <p className="text-sm font-medium text-green-700">Avg MPG</p>
                          <p className="text-2xl font-bold text-green-900 mt-1">
                            {fuelStats.average_mpg?.toFixed(2) || 'N/A'}
                          </p>
                          <p className="text-xs text-green-600 mt-1">{distanceUnit === 'km' ? 'L/100km' : 'MPG'}</p>
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                          <p className="text-sm font-medium text-orange-700">Total Cost</p>
                          <p className="text-2xl font-bold text-orange-900 mt-1">
                            {formatCurrency(fuelStats.total_cost || 0, currency)}
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <p className="text-sm font-medium text-blue-700">Total Fuel</p>
                          <p className="text-2xl font-bold text-blue-900 mt-1">
                            {fuelStats.total_fuel?.toFixed(2) || '0'}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">{distanceUnit === 'km' ? 'Liters' : 'Gallons'}</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <p className="text-sm font-medium text-purple-700">Distance</p>
                          <p className="text-2xl font-bold text-purple-900 mt-1">
                            {fuelStats.total_distance?.toFixed(0) || '0'}
                          </p>
                          <p className="text-xs text-purple-600 mt-1">{distanceUnit === 'km' ? 'Kilometers' : 'Miles'}</p>
                        </div>
                      </div>
                    )}

                    {/* Recent Fill-ups Table */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Fill-ups</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Date</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Mileage</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Fuel ({distanceUnit === 'km' ? 'L' : 'gal'})</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Cost</th>
                              <th className="px-4 py-2 text-left font-medium text-gray-600">Type</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {fuelLogs.slice(0, 5).map((log) => (
                              <tr key={log.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-900">
                                  {new Date(log.date).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-2 text-gray-900">{log.mileage.toLocaleString()} {distanceUnit === 'km' ? 'km' : 'mi'}</td>
                                <td className="px-4 py-2 text-gray-900">{log.fuel_amount.toFixed(2)}</td>
                                <td className="px-4 py-2 font-medium text-gray-900">
                                  {formatCurrency(log.total_price, currency)}
                                </td>
                                <td className="px-4 py-2">
                                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                                    {log.fuel_type}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      {fuelLogs.length > 5 && (
                        <p className="text-xs text-gray-500 mt-2">
                          Showing 5 of {fuelLogs.length} fill-ups
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/vehicles/${id}/fuel/new`)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Log Fill-up
                      </Button>
                      <Button onClick={() => navigate(`/vehicles/${id}/fuel`)}>
                        View Full Fuel Tracking
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Fuel className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-600 mb-4">No fuel logs yet. Start tracking your fuel consumption.</p>
                    <div className="flex gap-2 justify-center">
                      <Button
                        onClick={() => navigate(`/vehicles/${id}/fuel/new`)}
                        className="gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Log First Fill-up
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/vehicles/${id}/fuel`)}
                      >
                        View Fuel Dashboard
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reminders">
            <div className="space-y-4">
              {/* Alert Banner */}
              {reminders.length > 0 && (
                <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
                  <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-900 dark:text-blue-200">Automated Maintenance Alerts Active</AlertTitle>
                  <AlertDescription className="text-blue-800 dark:text-blue-300 text-sm">
                    You have {reminders.length} reminder{reminders.length !== 1 ? 's' : ''} configured for this vehicle. You'll receive alerts when maintenance is due.
                  </AlertDescription>
                </Alert>
              )}

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5" />
                        Service Reminders
                      </CardTitle>
                      <CardDescription>Automated alerts for upcoming maintenance</CardDescription>
                    </div>
                    <Button onClick={() => navigate(`/reminders/vehicle/${id}`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Reminder
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {reminders.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-border rounded-lg">
                      <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-muted-foreground font-medium">No service reminders set</p>
                      <p className="text-sm text-muted-foreground mt-1">Create automated reminders to stay on top of your vehicle's maintenance schedule</p>
                      <Button className="mt-4 bg-black hover:bg-gray-800" onClick={() => navigate(`/reminders/vehicle/${id}`)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Reminder
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-3">
                        {reminders.map((reminder) => (
                          <div key={reminder.id} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg capitalize">
                                  {reminder.serviceType?.replace(/_/g, ' ')}
                                </h3>
                                {reminder.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{reminder.description}</p>
                                )}
                                <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                  {reminder.dueByDate && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">Due:</span>
                                      <span className="font-medium">
                                        {new Date(reminder.dueByDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  {reminder.dueByMileage && (
                                    <div className="flex items-center gap-1">
                                      <span className="text-muted-foreground">Mileage:</span>
                                      <span className="font-medium">
                                        {formatDistance(reminder.dueByMileage, distanceUnit)}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Bell className="h-5 w-5 text-blue-600 mt-1" />
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Add Another Reminder */}
                      <div className="pt-4 border-t">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(`/reminders/vehicle/${id}`)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Another Reminder
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Vehicle Documents
                    </CardTitle>
                    <CardDescription>
                      Insurance, registration, inspection certificates, and service receipts
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DocumentUpload vehicleId={id!} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VehicleDetails;
