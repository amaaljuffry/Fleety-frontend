import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';
import { validateVehicle, type ValidationErrors } from '@/schemas/vehicle';

const VehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!id;
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    color: '',
    current_mileage: 0,
  });

  // Fetch vehicle data when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchVehicle = async () => {
        try {
          setInitialLoading(true);
          const response = await apiRequest(`/api/vehicles/${id}`, { method: 'GET' });
          const vehicle = response?.data ? response.data : response;
          
          if (vehicle) {
            setFormData({
              make: vehicle.make || '',
              model: vehicle.model || '',
              year: vehicle.year || new Date().getFullYear(),
              vin: vehicle.vin || '',
              licensePlate: vehicle.license_plate || '',
              color: vehicle.color || '',
              current_mileage: vehicle.current_mileage || 0,
            });
          }
        } catch (error) {
          console.error('Error fetching vehicle:', error);
          toast({
            title: 'Error',
            description: 'Failed to load vehicle data',
            variant: 'destructive',
          });
        } finally {
          setInitialLoading(false);
        }
      };

      fetchVehicle();
    }
  }, [id, isEditing, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'current_mileage' ? parseInt(value) || 0 : value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data with Zod
    const validation = validateVehicle({
      make: formData.make,
      model: formData.model,
      year: formData.year,
      color: formData.color,
      current_mileage: formData.current_mileage,
      vin: formData.vin,
      licensePlate: formData.licensePlate,
    });

    if (!validation.success) {
      setErrors(validation.errors);
      toast({
        title: "Validation Error",
        description: "Please fix the errors below",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const payload = {
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color || undefined,
        current_mileage: formData.current_mileage || 0,
        vin: formData.vin || undefined,
        license_plate: formData.licensePlate || undefined,
      };

      if (isEditing) {
        // Update vehicle
        await apiRequest(`/api/vehicles/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        // Create vehicle
        await apiRequest('/api/vehicles', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      toast({
        title: "Success",
        description: isEditing 
          ? `${formData.year} ${formData.make} ${formData.model} has been updated successfully.`
          : `${formData.year} ${formData.make} ${formData.model} has been added successfully.`,
      });
      
      navigate('/vehicles');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save vehicle';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button variant="outline" onClick={() => navigate('/vehicles')} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Update your vehicle information' : 'Enter the details of your vehicle'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {initialLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-black" />
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input
                    id="make"
                    name="make"
                    placeholder="Toyota"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    className={errors.make ? 'border-red-500' : ''}
                  />
                  {errors.make && <p className="text-sm text-red-500">{errors.make[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    name="model"
                    placeholder="Camry"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    className={errors.model ? 'border-red-500' : ''}
                  />
                  {errors.model && <p className="text-sm text-red-500">{errors.model[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input
                    id="year"
                    name="year"
                    type="number"
                    min="1900"
                    max={new Date().getFullYear() + 1}
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className={errors.year ? 'border-red-500' : ''}
                  />
                  {errors.year && <p className="text-sm text-red-500">{errors.year[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    name="color"
                    placeholder="Blue"
                    value={formData.color}
                    onChange={handleChange}
                    className={errors.color ? 'border-red-500' : ''}
                  />
                  {errors.color && <p className="text-sm text-red-500">{errors.color[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licensePlate">License Plate</Label>
                  <Input
                    id="licensePlate"
                    name="licensePlate"
                    placeholder="ABC-1234"
                    value={formData.licensePlate}
                    onChange={handleChange}
                    className={errors.licensePlate ? 'border-red-500' : ''}
                  />
                  {errors.licensePlate && <p className="text-sm text-red-500">{errors.licensePlate[0]}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="current_mileage">Current Mileage *</Label>
                  <Input
                    id="current_mileage"
                    name="current_mileage"
                    type="number"
                    min="0"
                    placeholder="50000"
                    value={formData.current_mileage}
                    onChange={handleChange}
                    required
                    className={errors.current_mileage ? 'border-red-500' : ''}
                  />
                  {errors.current_mileage && <p className="text-sm text-red-500">{errors.current_mileage[0]}</p>}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="vin">VIN (Vehicle Identification Number)</Label>
                  <Input
                    id="vin"
                    name="vin"
                    placeholder="1HGBH41JXMN109186"
                    value={formData.vin}
                    onChange={handleChange}
                    maxLength={17}
                    className={errors.vin ? 'border-red-500' : ''}
                  />
                  {errors.vin && <p className="text-sm text-red-500">{errors.vin[0]}</p>}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => navigate('/vehicles')} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {isEditing ? 'Update Vehicle' : 'Add Vehicle'}
                    </>
                  )}
                </Button>
              </div>
            </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VehicleForm;
