import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { MaintenanceRecord } from '@/types/vehicle';
import { apiRequest } from '@/api/client';
import { useEffect } from 'react';
import { getDistanceUnitLabel } from '@/utils/distanceFormatter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const MaintenanceForm = () => {
  const { vehicleId: paramVehicleId, recordId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const isEditing = !!recordId;
  const [loading, setLoading] = useState(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [distanceUnit, setDistanceUnit] = useState<string>('miles');
  const [vehicleId, setVehicleId] = useState(paramVehicleId || '');
  const [vehicles, setVehicles] = useState<any[]>([]);

  // Log for debugging
  useEffect(() => {
    console.log('MaintenanceForm mounted');
    console.log('URL vehicleId:', vehicleId);
    console.log('URL params:', { vehicleId: paramVehicleId, recordId });
  }, [vehicleId, paramVehicleId, recordId]);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    type: 'oil_change' as MaintenanceRecord['type'],
    description: '',
    cost: 0,
    serviceProvider: '',
    notes: '',
    // Reminder fields
    createReminder: false,
    reminderDueMileage: 0,
    reminderDueDate: '',
    reminderThresholdMiles: 500,
    reminderThresholdDays: 30,
    isRecurring: false,
    recurringIntervalMiles: 5000,
    recurringIntervalMonths: 3,
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
        const data = prefsRes?.data ? prefsRes.data : prefsRes;
        if (data && data.preferences) {
          setCurrency(data.preferences.currency || 'USD');
          setDistanceUnit(data.preferences.distance_unit || 'miles');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
        // Default values
        setCurrency('USD');
        setDistanceUnit('miles');
      }
    };
    fetchPreferences();
  }, [location]);

  // Fetch vehicles if no vehicleId provided (for /maintenance/new route)
  useEffect(() => {
    if (!vehicleId) {
      const fetchVehicles = async () => {
        try {
          const response = await apiRequest('/api/vehicles', { method: 'GET' });
          const vehiclesData = response?.data ? response.data : response;
          if (Array.isArray(vehiclesData)) {
            setVehicles(vehiclesData);
            // If only one vehicle, auto-select it
            if (vehiclesData.length === 1) {
              setVehicleId(vehiclesData[0].id || vehiclesData[0]._id);
            }
          }
        } catch (error) {
          console.error('Error fetching vehicles:', error);
          toast({
            title: 'Error',
            description: 'Failed to load vehicles',
            variant: 'destructive',
          });
        }
      };
      fetchVehicles();
    }
  }, [paramVehicleId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        date: formData.date,
        mileage: formData.mileage,
        service_type: formData.type,
        description: formData.description,
        cost: formData.cost,
        service_provider: formData.serviceProvider,
        notes: formData.notes,
      };

      console.log('Submitting maintenance record:');
      console.log('Vehicle ID:', vehicleId);
      console.log('Payload:', payload);
      console.log('Endpoint:', isEditing ? `/api/maintenance/${recordId}` : `/api/maintenance/vehicle/${vehicleId}`);

      if (isEditing) {
        // Update maintenance record
        await apiRequest(`/api/maintenance/${recordId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Create new maintenance record
        await apiRequest(`/api/maintenance/vehicle/${vehicleId}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        // Create reminder if enabled
        if (formData.createReminder) {
          try {
            // Use the vehicleId (already set either from params or user selection)
            const reminderVehicleId = vehicleId;
            
            if (!reminderVehicleId) {
              throw new Error('Vehicle ID is not available for reminder creation');
            }

            const reminderPayload = {
              service_type: formData.type,
              description: formData.description,
              due_by_mileage: formData.reminderDueMileage || null,
              due_by_date: formData.reminderDueDate || null,
              reminder_threshold_miles: formData.reminderThresholdMiles,
              reminder_threshold_days: formData.reminderThresholdDays,
              is_recurring: formData.isRecurring,
              recurring_interval_miles: formData.isRecurring ? formData.recurringIntervalMiles : null,
              recurring_interval_months: formData.isRecurring ? formData.recurringIntervalMonths : null,
            };

            console.log('Creating reminder with payload:', reminderPayload);
            console.log('Reminder Vehicle ID:', reminderVehicleId);

            const reminderUrl = `/api/reminders/vehicle/${reminderVehicleId}`;
            console.log('Reminder URL:', reminderUrl);

            await apiRequest(reminderUrl, {
              method: 'POST',
              body: JSON.stringify(reminderPayload),
            });

            console.log('Reminder created successfully');
          } catch (reminderError) {
            console.error('Failed to create reminder:', reminderError);
            // Don't fail the whole operation, just log
            toast({
              title: 'Warning',
              description: 'Maintenance record created, but reminder could not be created',
              variant: 'destructive',
            });
          }
        }
      }

      toast({
        title: 'Success',
        description: isEditing 
          ? 'Service record updated successfully.'
          : 'Service record added successfully.',
      });

      // For new records, navigate to dashboard to refresh spending data
      // For edits, go back to vehicle details
      if (isEditing) {
        navigate(`/vehicles/${vehicleId}`);
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save maintenance record';
      console.error('Maintenance form error:', error);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'mileage' || name === 'cost' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Vehicle Selection Dialog - shown when no vehicleId and multiple vehicles available */}
      <Dialog open={!vehicleId && vehicles.length > 1} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Select Vehicle</DialogTitle>
            <DialogDescription>
              Choose a vehicle to add a maintenance record
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id || vehicle._id}
                  onClick={() => {
                    setVehicleId(vehicle.id || vehicle._id);
                  }}
                  className="w-full p-4 border rounded-lg hover:bg-accent hover:border-primary transition-all text-left"
                >
                  <p className="font-semibold">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  {vehicle.currentMileage && (
                    <p className="text-sm text-muted-foreground">
                      {vehicle.currentMileage.toLocaleString()} {getDistanceUnitLabel(distanceUnit)}
                    </p>
                  )}
                </button>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/vehicles/new')}
              className="w-full"
            >
              Add New Vehicle
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => navigate(`/vehicles/${vehicleId}`)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Vehicle
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {isEditing ? 'Edit Service Record' : 'Add Service Record'}
                  </CardTitle>
                  <CardDescription>
                    {isEditing ? 'Update the maintenance record details' : 'Enter the details of the service performed'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Date & Mileage */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Service Details</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="date">Service Date *</Label>
                          <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mileage">Mileage ({getDistanceUnitLabel(distanceUnit)}) *</Label>
                          <Input
                            id="mileage"
                            name="mileage"
                            type="number"
                            min="0"
                            placeholder="50000"
                            value={formData.mileage}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Service Type & Description */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Service Information</h3>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="type">Service Type *</Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as MaintenanceRecord['type'] }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select service type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oil_change">Oil Change</SelectItem>
                              <SelectItem value="tire_rotation">Tire Rotation</SelectItem>
                              <SelectItem value="brake_service">Brake Service</SelectItem>
                              <SelectItem value="inspection">Inspection</SelectItem>
                              <SelectItem value="repair">Repair</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="description">Description *</Label>
                          <Input
                            id="description"
                            name="description"
                            placeholder="e.g., Regular oil change with synthetic oil"
                            value={formData.description}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost & Provider */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Cost & Provider</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="cost">Cost ({currency}) *</Label>
                          <Input
                            id="cost"
                            name="cost"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="75.00"
                            value={formData.cost}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="serviceProvider">Service Provider</Label>
                          <Input
                            id="serviceProvider"
                            name="serviceProvider"
                            placeholder="e.g., Joe's Auto Shop"
                            value={formData.serviceProvider}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Additional Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes</Label>
                        <Textarea
                          id="notes"
                          name="notes"
                          placeholder="Any additional information about this service..."
                          value={formData.notes}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                    </div>

                    {/* Reminder Section */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Create Service Reminder</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically create a reminder for the next service
                          </p>
                        </div>
                        <Switch
                          checked={formData.createReminder}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, createReminder: checked }))
                          }
                        />
                      </div>

                      {formData.createReminder && (
                        <div className="space-y-4 ml-2 p-4 bg-muted rounded-lg">
                          {/* Reminder Due Settings */}
                          <div>
                            <h4 className="font-medium text-sm mb-3">When to Remind</h4>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="reminderDueMileage">Due Mileage ({getDistanceUnitLabel(distanceUnit)})</Label>
                                <Input
                                  id="reminderDueMileage"
                                  name="reminderDueMileage"
                                  type="number"
                                  min="0"
                                  placeholder={distanceUnit === 'km' ? '80000' : '50000'}
                                  value={formData.reminderDueMileage}
                                  onChange={handleChange}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="reminderDueDate">Due Date</Label>
                                <Input
                                  id="reminderDueDate"
                                  name="reminderDueDate"
                                  type="date"
                                  value={formData.reminderDueDate}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Threshold Settings */}
                          <div className="border-t pt-4">
                            <h4 className="font-medium text-sm mb-3">Alert Thresholds</h4>
                            <p className="text-xs text-muted-foreground mb-3">Get notified before the service is due</p>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="reminderThresholdMiles">Alert Miles Before ({getDistanceUnitLabel(distanceUnit)})</Label>
                                <Input
                                  id="reminderThresholdMiles"
                                  name="reminderThresholdMiles"
                                  type="number"
                                  min="0"
                                  placeholder="500"
                                  value={formData.reminderThresholdMiles}
                                  onChange={handleChange}
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="reminderThresholdDays">Alert Days Before</Label>
                                <Input
                                  id="reminderThresholdDays"
                                  name="reminderThresholdDays"
                                  type="number"
                                  min="0"
                                  placeholder="30"
                                  value={formData.reminderThresholdDays}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Recurring Settings */}
                          <div className="border-t pt-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-sm">Recurring Reminder</h4>
                                <p className="text-xs text-muted-foreground">Automatically create next reminder after completion</p>
                              </div>
                              <Switch
                                checked={formData.isRecurring}
                                onCheckedChange={(checked) => 
                                  setFormData(prev => ({ ...prev, isRecurring: checked }))
                                }
                              />
                            </div>

                            {formData.isRecurring && (
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div className="space-y-2">
                                  <Label htmlFor="recurringIntervalMiles">Every ({getDistanceUnitLabel(distanceUnit)})</Label>
                                  <Input
                                    id="recurringIntervalMiles"
                                    name="recurringIntervalMiles"
                                    type="number"
                                    min="1"
                                    placeholder={distanceUnit === 'km' ? '5000' : '3000'}
                                    value={formData.recurringIntervalMiles}
                                    onChange={handleChange}
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="recurringIntervalMonths">Every (Months)</Label>
                                  <Input
                                    id="recurringIntervalMonths"
                                    name="recurringIntervalMonths"
                                    type="number"
                                    min="1"
                                    placeholder="3"
                                    value={formData.recurringIntervalMonths}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isEditing ? 'Updating...' : 'Adding...'}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update Record' : 'Add Record'}
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(`/vehicles/${vehicleId}`)}
                        disabled={loading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Quick Reference */}
            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Service Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">Common Services</p>
                    <ul className="text-sm text-muted-foreground space-y-1 mt-2">
                      <li>• Oil Change</li>
                      <li>• Tire Rotation</li>
                      <li>• Brake Service</li>
                      <li>• Inspection</li>
                      <li>• Repairs</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium text-sm">{formData.date || 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium text-sm">{formData.type || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cost</p>
                    <p className="font-medium text-sm">{formData.cost ? `${currency} ${formData.cost.toFixed(2)}` : 'Not set'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Mileage</p>
                    <p className="font-medium text-sm">{formData.mileage ? `${formData.mileage.toLocaleString()} ${getDistanceUnitLabel(distanceUnit)}` : 'Not set'}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>✓ Always record exact mileage</li>
                    <li>✓ Keep receipts for reference</li>
                    <li>✓ Add service provider details</li>
                    <li>✓ Note any issues found</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceForm;
