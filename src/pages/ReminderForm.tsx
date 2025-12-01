import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';

const ReminderForm = () => {
  const { vehicleId: urlVehicleId, reminderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!reminderId;
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Array<{ id: string; make: string; model: string; year: number }>>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(urlVehicleId || '');

  // Fetch vehicles on mount
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(response) ? response : (response?.data || []);
        setVehicles(vehiclesList);
        
        // If vehicleId from URL, use it; otherwise set to first vehicle
        if (urlVehicleId) {
          setSelectedVehicleId(urlVehicleId);
        } else if (vehiclesList.length > 0) {
          setSelectedVehicleId(vehiclesList[0].id);
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
  }, [urlVehicleId, toast]);

  const [formData, setFormData] = useState({
    serviceType: '',
    description: '',
    dueByMileage: '',
    dueByDate: '',
    reminderThresholdMiles: '500',
    reminderThresholdDays: '30',
    isRecurring: false,
    recurringIntervalMiles: '',
    recurringIntervalMonths: '',
    isActive: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate vehicle is selected
    if (!selectedVehicleId) {
      toast({
        title: 'Error',
        description: 'Please select a vehicle first',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      const payload = {
        service_type: formData.serviceType,
        description: formData.description,
        due_by_mileage: formData.dueByMileage ? parseInt(formData.dueByMileage) : null,
        due_by_date: formData.dueByDate || null,
        reminder_threshold_miles: formData.reminderThresholdMiles ? parseInt(formData.reminderThresholdMiles) : 0,
        reminder_threshold_days: formData.reminderThresholdDays ? parseInt(formData.reminderThresholdDays) : 0,
        is_recurring: formData.isRecurring,
        recurring_interval_miles: formData.recurringIntervalMiles ? parseInt(formData.recurringIntervalMiles) : null,
        recurring_interval_months: formData.recurringIntervalMonths ? parseInt(formData.recurringIntervalMonths) : null,
      };

      console.log('Creating reminder for vehicle:', selectedVehicleId);
      console.log('Payload:', payload);

      if (isEditing) {
        // Update reminder
        await apiRequest(`/api/reminders/${reminderId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Create new reminder
        await apiRequest(`/api/reminders/vehicle/${selectedVehicleId}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      toast({
        title: 'Success',
        description: isEditing
          ? 'Service reminder updated successfully.'
          : 'Service reminder created successfully.',
      });

      navigate(`/vehicles/${selectedVehicleId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save reminder';
      console.error('Reminder form error:', error);
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
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <Button variant="outline" onClick={() => navigate(`/reminders`)} className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Reminders
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form Section */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {isEditing ? 'Edit Service Reminder' : 'Create Service Reminder'}
                  </CardTitle>
                  <CardDescription>
                    Set up automatic reminders based on mileage or time intervals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Vehicle Selection */}
                    {!isEditing && (
                      <div className="space-y-2">
                        <Label htmlFor="vehicle">Vehicle *</Label>
                        <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles.map((vehicle) => (
                              <SelectItem key={vehicle.id} value={vehicle.id}>
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {/* Basic Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">Basic Information</h3>
                      
                      <div className="space-y-2">
                        <Label htmlFor="serviceType">Service Type *</Label>
                        <Input
                          id="serviceType"
                          name="serviceType"
                          placeholder="e.g., Oil Change, Tire Rotation"
                          value={formData.serviceType}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Additional details about this service..."
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Due Date Settings */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Due Date Settings</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="dueByMileage">Due by Mileage</Label>
                          <Input
                            id="dueByMileage"
                            name="dueByMileage"
                            type="number"
                            placeholder="e.g., 50000"
                            value={formData.dueByMileage}
                            onChange={handleChange}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="dueByDate">Due by Date</Label>
                          <Input
                            id="dueByDate"
                            name="dueByDate"
                            type="date"
                            value={formData.dueByDate}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Alert Thresholds */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Alert Thresholds</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="reminderThresholdMiles">Alert Miles Before</Label>
                          <Input
                            id="reminderThresholdMiles"
                            name="reminderThresholdMiles"
                            type="number"
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
                            placeholder="30"
                            value={formData.reminderThresholdDays}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Recurring Service */}
                    <div className="border-t pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold">Recurring Service</h3>
                          <p className="text-sm text-muted-foreground">
                            Automatically create next reminder after completion
                          </p>
                        </div>
                        <Switch
                          checked={formData.isRecurring}
                          onCheckedChange={(checked) => 
                            setFormData(prev => ({ ...prev, isRecurring: checked }))
                          }
                        />
                      </div>

                      {formData.isRecurring && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="recurringIntervalMiles">Recurring Miles Interval</Label>
                            <Input
                              id="recurringIntervalMiles"
                              name="recurringIntervalMiles"
                              type="number"
                              placeholder="e.g., 5000"
                              value={formData.recurringIntervalMiles}
                              onChange={handleChange}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="recurringIntervalMonths">Recurring Months Interval</Label>
                            <Input
                              id="recurringIntervalMonths"
                              name="recurringIntervalMonths"
                              type="number"
                              placeholder="e.g., 6"
                              value={formData.recurringIntervalMonths}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Active Status */}
                    <div className="border-t pt-6 flex items-center justify-between">
                      <div>
                        <Label htmlFor="isActive">Active Reminder</Label>
                        <p className="text-sm text-muted-foreground">
                          Inactive reminders won't show alerts
                        </p>
                      </div>
                      <Switch
                        id="isActive"
                        checked={formData.isActive}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, isActive: checked }))
                        }
                      />
                    </div>

                    {/* Form Buttons */}
                    <div className="flex gap-3 pt-6 border-t">
                      <Button type="submit" className="flex-1" disabled={loading}>
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {isEditing ? 'Updating...' : 'Creating...'}
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {isEditing ? 'Update Reminder' : 'Create Reminder'}
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate(`/reminders`)}
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
                  <CardTitle className="text-lg">Quick Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-sm mb-1">Common Services</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Oil Change: 3,000-5,000 miles</li>
                        <li>• Tire Rotation: 5,000-7,000 miles</li>
                        <li>• Air Filter: 15,000-30,000 miles</li>
                        <li>• Inspection: Every 12 months</li>
                      </ul>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="font-medium text-sm mb-1">Tips</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Set both mileage and date for flexibility</li>
                        <li>• Enable recurring for regular services</li>
                        <li>• Adjust thresholds to match your needs</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Selection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                    <p className="font-medium">{formData.serviceType || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due By</p>
                    <p className="font-medium text-sm">
                      {formData.dueByMileage ? `${formData.dueByMileage} miles` : 'Not set'}
                      {formData.dueByDate ? ` / ${formData.dueByDate}` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recurring</p>
                    <p className="font-medium">{formData.isRecurring ? 'Yes' : 'No'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderForm;
