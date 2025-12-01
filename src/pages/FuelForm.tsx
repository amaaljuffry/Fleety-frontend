import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, Loader2, Plus, AlertCircle } from 'lucide-react';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { getCurrencySymbol } from '@/utils/currencyFormatter';
import { getDistanceUnitLabel } from '@/utils/distanceFormatter';

interface FuelLog {
  id: string;
  mileage: number;
  fuel_amount: number;
  price_per_unit: number;
  total_price: number;
  fuel_type: string;
  date: string;
  notes?: string;
}

interface Vehicle {
  id: string;
  _id?: string;
  make: string;
  model: string;
  year: number;
  currentMileage?: number;
}

export function FuelForm() {
  const { vehicleId: paramVehicleId, fuelLogId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [vehicleId, setVehicleId] = useState(paramVehicleId || '');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [fuelLog, setFuelLog] = useState<FuelLog>({
    id: '',
    mileage: 0,
    fuel_amount: 0,
    price_per_unit: 0,
    total_price: 0,
    fuel_type: 'RON95',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [loading, setLoading] = useState(!!fuelLogId);
  const [submitting, setSubmitting] = useState(false);
  const [currency, setCurrency] = useState<string>('USD');
  const [distanceUnit, setDistanceUnit] = useState<string>('miles');

  useEffect(() => {
    if (fuelLogId) {
      loadFuelLog();
    }
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fuelLogId]);

  // Fetch vehicles if no vehicleId provided (for /fuel/new route)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramVehicleId, toast]);

  const loadFuelLog = async () => {
    try {
      const res = await apiRequest(`/api/fuel/${fuelLogId}`, { method: 'GET' });
      const data = res?.data ? res.data : res;
      setFuelLog({
        ...data,
        date: new Date(data.date).toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error loading fuel log:', error);
      toast({
        title: 'Error',
        description: 'Failed to load fuel log',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await apiRequest('/api/settings/preferences', { method: 'GET' });
      const data = res?.data ? res.data : res;
      
      if (data && data.preferences) {
        const prefs = data.preferences;
        setCurrency(prefs.currency ?? 'USD');
        setDistanceUnit(prefs.distance_unit ?? 'miles');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      // Use defaults if settings fetch fails
      setCurrency('USD');
      setDistanceUnit('miles');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    const numericFields = ['mileage', 'fuel_amount', 'price_per_unit', 'total_price'];
    const newValue = numericFields.includes(name) ? parseFloat(value) || 0 : value;
    
    setFuelLog((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Auto-calculate total price
    if ((name === 'fuel_amount' || name === 'price_per_unit') && typeof newValue === 'number' && newValue > 0) {
      const amount = name === 'fuel_amount' ? newValue : (typeof fuelLog.fuel_amount === 'number' ? fuelLog.fuel_amount : 0);
      const price = name === 'price_per_unit' ? newValue : (typeof fuelLog.price_per_unit === 'number' ? fuelLog.price_per_unit : 0);
      if (amount > 0 && price > 0) {
        setFuelLog((prev) => ({
          ...prev,
          total_price: parseFloat((amount * price).toFixed(2)),
        }));
      }
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    if (name === 'vehicleId') {
      setVehicleId(value);
    } else {
      setFuelLog((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fuelLog.fuel_type || !fuelLog.total_price) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        total_price: fuelLog.total_price,
        fuel_type: fuelLog.fuel_type,
        date: new Date(fuelLog.date).toISOString(),
      };

      // Only include optional fields if they have values
      if (fuelLog.mileage > 0) payload.mileage = fuelLog.mileage;
      if (fuelLog.fuel_amount > 0) payload.fuel_amount = fuelLog.fuel_amount;
      if (fuelLog.price_per_unit > 0) payload.price_per_unit = fuelLog.price_per_unit;
      if (fuelLog.notes) payload.notes = fuelLog.notes;

      if (fuelLogId) {
        // Update existing fuel log
        await apiRequest(`/api/fuel/${fuelLogId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Success',
          description: 'Fuel log updated successfully',
        });
      } else {
        // Create new fuel log
        await apiRequest(`/api/fuel/vehicle/${vehicleId}`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Success',
          description: 'Fuel log created successfully',
        });
      }

      navigate(`/vehicles/${vehicleId}/fuel`);
    } catch (error) {
      console.error('Error submitting fuel log:', error);
      toast({
        title: 'Error',
        description: 'Failed to save fuel log',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Empty state: no vehicles
  if (!vehicleId && vehicles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/fuel')}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex gap-3 mb-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900">No Vehicles Found</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    You need to create a vehicle first before logging fuel.
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/vehicles/new')}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                Add New Vehicle
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}/fuel` : '/fuel')}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {fuelLogId ? 'Edit Fuel Log' : 'Log New Fill-up'}
          </h1>
        </div>

        {/* Main Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel Fill-up Details</CardTitle>
            <CardDescription>
              {fuelLogId
                ? 'Update the fuel log entry'
                : 'Record a new fuel fill-up for your vehicle'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Vehicle Selection - Always First & Required */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Vehicle <span className="text-red-600">*</span>
                </label>
                <Select value={vehicleId} onValueChange={(value) => handleSelectChange('vehicleId', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id || vehicle._id} value={vehicle.id || vehicle._id}>
                        <span className="font-medium">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </span>
                        {vehicle.currentMileage && (
                          <span className="text-gray-500 ml-2">
                            ({vehicle.currentMileage.toLocaleString()} {getDistanceUnitLabel(distanceUnit)})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {vehicles.length > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/vehicles/new')}
                    className="mt-2 h-auto p-0 text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add New Vehicle
                  </Button>
                )}
              </div>

              {/* Date & Fuel Type - Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Date <span className="text-red-600">*</span>
                  </label>
                  <Input
                    type="date"
                    name="date"
                    value={fuelLog.date}
                    onChange={handleInputChange}
                    required
                    className="focus-visible:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">When you filled up</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Fuel Type <span className="text-red-600">*</span>
                  </label>
                  <Select
                    value={fuelLog.fuel_type}
                    onValueChange={(value) => handleSelectChange('fuel_type', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select fuel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RON95">RON95</SelectItem>
                      <SelectItem value="RON97">RON97</SelectItem>
                      <SelectItem value="RON100">RON100</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                      <SelectItem value="LPG">LPG</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">Type of fuel used</p>
                </div>
              </div>

              {/* Mileage & Fuel Amount - Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mileage (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      name="mileage"
                      value={fuelLog.mileage || ''}
                      onChange={handleInputChange}
                      placeholder="0"
                      step="1"
                      min="0"
                      className="focus-visible:ring-blue-500"
                    />
                    <span className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600">
                      {getDistanceUnitLabel(distanceUnit)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Current odometer reading</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fuel Amount (Optional)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      name="fuel_amount"
                      value={fuelLog.fuel_amount || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="focus-visible:ring-blue-500"
                    />
                    <span className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600">
                      L
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Liters of fuel</p>
                </div>
              </div>

              {/* Price Per Unit & Total Price - Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Per Unit (Optional)
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-gray-100 rounded-md text-sm text-gray-600">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      name="price_per_unit"
                      value={fuelLog.price_per_unit || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="focus-visible:ring-blue-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Per liter</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Total Price <span className="text-red-600">*</span>
                  </label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 bg-blue-50 border border-blue-200 rounded-md text-sm font-semibold text-blue-600">
                      {getCurrencySymbol(currency)}
                    </span>
                    <Input
                      type="number"
                      name="total_price"
                      value={fuelLog.total_price || ''}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                      className="focus-visible:ring-blue-500 bg-blue-50"
                    />
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    {fuelLog.fuel_amount && fuelLog.price_per_unit
                      ? `Auto-calculated: ${fuelLog.fuel_amount} L × ${getCurrencySymbol(currency)}${fuelLog.price_per_unit}`
                      : 'Auto-calculates when fuel amount and price are entered'}
                  </p>
                </div>
              </div>

              {/* Notes - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <Textarea
                  name="notes"
                  value={fuelLog.notes || ''}
                  onChange={handleInputChange}
                  placeholder="e.g., Location: Gas Station ABC, Quality: Good, Weather: Sunny"
                  className="resize-none focus-visible:ring-blue-500"
                  rows={3}
                />
                <p className="text-xs text-gray-500 mt-1">Add any notes about this fill-up</p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(vehicleId ? `/vehicles/${vehicleId}/fuel` : '/fuel')}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !vehicleId}
                  className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : fuelLogId ? (
                    'Update Fuel Log'
                  ) : (
                    'Save Fuel Log'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Validation Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-900">
            <span className="font-semibold">Required fields:</span> Vehicle, Date, Fuel Type, and Total Price.
            Other fields are optional but help provide better fuel tracking analytics.
          </p>
        </div>
      </div>
    </div>
  );
}
