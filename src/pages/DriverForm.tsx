import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, ChevronLeft } from 'lucide-react';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';

interface Driver {
  id: string;
  name: string;
  email: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  assigned_vehicles: string[];
  is_primary: boolean;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
}

export function DriverForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [driver, setDriver] = useState<Driver>({
    id: '',
    name: '',
    email: '',
    phone: '',
    license_number: '',
    license_expiry: '',
    assigned_vehicles: [],
    is_primary: false,
  });

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch vehicles for assignment
        const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
        const normalizedVehicles = vehiclesList.map((v: Vehicle & { _id?: string }) => ({
          ...v,
          id: v.id || v._id || '',
        }));
        setVehicles(normalizedVehicles);

        // Load existing driver if editing
        if (id) {
          const res = await apiRequest(`/api/drivers/${id}`, { method: 'GET' });
          setDriver(res?.data ? res.data : res);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDriver((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVehicleToggle = (vehicleId: string) => {
    setDriver((prev) => ({
      ...prev,
      assigned_vehicles: prev.assigned_vehicles.includes(vehicleId)
        ? prev.assigned_vehicles.filter((id) => id !== vehicleId)
        : [...prev.assigned_vehicles, vehicleId],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!driver.name || !driver.email) {
      toast({
        title: 'Validation Error',
        description: 'Name and email are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      const payload: Record<string, unknown> = {
        name: driver.name,
        email: driver.email,
        is_primary: driver.is_primary,
        assigned_vehicles: driver.assigned_vehicles,
      };

      // Only add optional fields if they have values
      if (driver.phone) payload.phone = driver.phone;
      if (driver.license_number) payload.license_number = driver.license_number;
      if (driver.license_expiry) payload.license_expiry = driver.license_expiry;

      if (id) {
        // Update existing driver
        await apiRequest(`/api/drivers/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Success',
          description: 'Driver updated successfully',
        });
      } else {
        // Create new driver
        await apiRequest('/api/drivers', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast({
          title: 'Success',
          description: 'Driver created successfully',
        });
      }

      navigate('/drivers');
    } catch (error) {
      console.error('Error submitting driver:', error);
      toast({
        title: 'Error',
        description: 'Failed to save driver',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/drivers')}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          {id ? 'Edit Driver' : 'Add New Driver'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Driver Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
              <CardDescription>Enter driver details and assign vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <Input
                    name="name"
                    value={driver.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={driver.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={driver.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                {/* License Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <Input
                    name="license_number"
                    value={driver.license_number}
                    onChange={handleInputChange}
                    placeholder="DL123456789"
                  />
                </div>

                {/* License Expiry */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Expiry Date
                  </label>
                  <Input
                    name="license_expiry"
                    type="date"
                    value={driver.license_expiry}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Primary Driver */}
                <div className="flex items-center gap-2 pt-2">
                  <Checkbox
                    id="is_primary"
                    checked={driver.is_primary}
                    onCheckedChange={(checked) =>
                      setDriver((prev) => ({ ...prev, is_primary: checked as boolean }))
                    }
                  />
                  <label htmlFor="is_primary" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Mark as primary driver
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/drivers')}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="gap-2">
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Driver'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Assign Vehicles */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Assign Vehicles</CardTitle>
              <CardDescription>Select vehicles for this driver</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {vehicles.length > 0 ? (
                  vehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`vehicle-${vehicle.id}`}
                        checked={driver.assigned_vehicles.includes(vehicle.id)}
                        onCheckedChange={() => handleVehicleToggle(vehicle.id)}
                      />
                      <label
                        htmlFor={`vehicle-${vehicle.id}`}
                        className="text-sm font-medium text-gray-700 cursor-pointer"
                      >
                        {vehicle.year} {vehicle.make} {vehicle.model}
                        {vehicle.license_plate && (
                          <span className="text-xs text-gray-500"> • {vehicle.license_plate}</span>
                        )}
                      </label>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No vehicles available</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
