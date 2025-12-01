import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, Loader2, Upload, FileText, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/api/client';
import { createFuelLog, updateFuelLog, FuelLog } from '@/api/fuel';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year?: number;
  license_plate: string;
}

interface Driver {
  id: string;
  name: string;
  email?: string;
}

interface FormValues {
  vehicle_id: string;
  odometer_reading: string;
  fuel_type: 'Diesel' | 'Petrol RON95' | 'Petrol RON97' | 'RON92' | 'Other';
  liters: string;
  price_per_liter: string;
  total_cost: string;
  fuel_station_name?: string;
  driver_id?: string | undefined;
  driver_notes?: string;
  trip_purpose?: 'Business' | 'Personal' | 'Delivery' | 'Other';
  date: string;
  time?: string;
  receipt_url?: string;
  pump_meter_photo_url?: string;
}

const FUEL_TYPES = ['Diesel', 'Petrol RON95', 'Petrol RON97', 'RON92', 'Other'];
const TRIP_PURPOSES = ['Business', 'Personal', 'Delivery', 'Other'];

export const AddFuelLogPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { vehicleId: paramVehicleId, fuelLogId } = useParams();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingLog, setEditingLog] = useState<FuelLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = React.useState<string>('');
  const [pumpMeterFile, setPumpMeterFile] = React.useState<File | null>(null);
  const [pumpMeterPreview, setPumpMeterPreview] = React.useState<string>('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [pumpMeterDragging, setPumpMeterDragging] = React.useState(false);
  const [error, setError] = React.useState('');

  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      fuel_type: 'Petrol RON95',
      trip_purpose: 'Business',
    }
  });

  const liters = watch('liters');
  const pricePerLiter = watch('price_per_liter');

  // Auto-calculate total cost when liters or price_per_liter changes
  useEffect(() => {
    if (liters && pricePerLiter) {
      const litVal = parseFloat(liters as string);
      const priceVal = parseFloat(pricePerLiter as string);
      if (!isNaN(litVal) && !isNaN(priceVal) && litVal > 0 && priceVal > 0) {
        const calculatedTotal = (litVal * priceVal).toFixed(2);
        const currentTotal = watch('total_cost');
        // Auto-update if total_cost is empty
        if (!currentTotal || currentTotal === '') {
          reset((formValues) => ({ ...formValues, total_cost: calculatedTotal }), { keepValues: true });
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liters, pricePerLiter]);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        console.log('AddFuelLogPage: Loading data...');
        
        // Fetch vehicles
        const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
        console.log('AddFuelLogPage: Raw vehicles response:', vehiclesRes);
        
        const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
        console.log('AddFuelLogPage: Vehicles list extracted:', vehiclesList);
        
        // Normalize vehicle data - ensure id field exists
        const normalizedVehicles = vehiclesList.map((v: Record<string, unknown>) => {
          console.log('AddFuelLogPage: Raw vehicle object:', JSON.stringify(v, null, 2));
          const vehicleId = (v.id as string) || (v._id as string);
          console.log('AddFuelLogPage: Extracted vehicle ID:', vehicleId);
          const normalized = {
            ...v,
            id: vehicleId,
          } as Vehicle;
          console.log('AddFuelLogPage: Normalized vehicle:', normalized);
          return normalized;
        });
        
        setVehicles(normalizedVehicles);
        console.log('AddFuelLogPage: Vehicles loaded, count:', normalizedVehicles.length);
        console.log('AddFuelLogPage: First vehicle id after normalization:', normalizedVehicles[0]?.id);
        console.log('AddFuelLogPage: First vehicle full object:', normalizedVehicles[0]);

        // Fetch drivers if available
        try {
          const driversRes = await apiRequest('/api/drivers', { method: 'GET' });
          const driversList = Array.isArray(driversRes) ? driversRes : (driversRes?.data || []);
          setDrivers(driversList);
        } catch (driverErr) {
          console.log('AddFuelLogPage: Drivers endpoint not available, continuing without drivers');
        }

        // If editing, fetch the fuel log
        if (fuelLogId && paramVehicleId) {
          const logRes = await apiRequest(`/api/vehicles/${paramVehicleId}/fuel/${fuelLogId}`, { method: 'GET' });
          if (logRes) {
            setEditingLog(logRes);
          }
        }

        console.log('AddFuelLogPage: Data loaded successfully');
        setLoading(false);
      } catch (err) {
        console.error('AddFuelLogPage: Error loading data:', err);
        toast({
          title: 'Error',
          description: 'Failed to load vehicles or fuel log',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    loadData();
  }, [fuelLogId, paramVehicleId, toast]);

  // Initialize form - ONLY after vehicles are loaded
  useEffect(() => {
    if (editingLog) {
      reset({
        vehicle_id: editingLog.vehicle_id,
        odometer_reading: editingLog.odometer_reading?.toString() || '',
        fuel_type: (editingLog.fuel_type || 'Petrol RON95') as 'Diesel' | 'Petrol RON95' | 'Petrol RON97' | 'RON92' | 'Other',
        liters: editingLog.liters.toString(),
        price_per_liter: editingLog.price_per_liter?.toString() || '',
        total_cost: editingLog.total_cost.toString(),
        fuel_station_name: editingLog.fuel_station_name || '',
        driver_id: editingLog.driver_id || undefined,
        driver_notes: editingLog.driver_notes || '',
        trip_purpose: (editingLog.trip_purpose || 'Business') as 'Business' | 'Personal' | 'Delivery' | 'Other',
        date: editingLog.date.split('T')[0],
        time: editingLog.time || '',
        receipt_url: editingLog.receipt_url || '',
        pump_meter_photo_url: editingLog.pump_meter_photo_url || '',
      });
      setReceiptPreview(editingLog.receipt_url || '');
      setPumpMeterPreview(editingLog.pump_meter_photo_url || '');
    } else if (vehicles.length > 0) {
      // Only initialize form if vehicles are loaded
      const defaultVehicleId = paramVehicleId || vehicles[0]?.id || '';
      console.log('AddFuelLogPage: vehicles array:', vehicles);
      console.log('AddFuelLogPage: vehicles[0]:', vehicles[0]);
      console.log('AddFuelLogPage: vehicles[0].id:', vehicles[0]?.id);
      console.log('AddFuelLogPage: Initializing form with vehicle_id:', defaultVehicleId);
      reset({
        vehicle_id: defaultVehicleId,
        odometer_reading: '',
        fuel_type: 'Petrol RON95',
        liters: '',
        price_per_liter: '',
        total_cost: '',
        fuel_station_name: '',
        driver_id: undefined,
        driver_notes: '',
        trip_purpose: 'Business',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
      });
      setReceiptFile(null);
      setReceiptPreview('');
      setPumpMeterFile(null);
      setPumpMeterPreview('');
    }
    setError('');
  }, [editingLog, paramVehicleId, vehicles, reset]);

  const validateFile = (file: File, isImage = true) => {
    const maxSize = 10 * 1024 * 1024;
    const allowedTypes = isImage 
      ? ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
      : ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return `Only ${isImage ? 'images (JPEG, PNG, GIF, WebP) and PDF' : 'images (JPEG, PNG, GIF, WebP)'} files are allowed`;
    }
    if (file.size > maxSize) return 'File size must be less than 10MB';
    return null;
  };

  const handleFileSelect = (file: File, isReceipt = true) => {
    const validationError = validateFile(file, isReceipt);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (isReceipt) {
      setReceiptFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPumpMeterFile(file);
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => setPumpMeterPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent, isPumpMeter = false) => {
    e.preventDefault();
    if (isPumpMeter) setPumpMeterDragging(true);
    else setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, isPumpMeter = false) => {
    e.preventDefault();
    if (isPumpMeter) setPumpMeterDragging(false);
    else setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent, isPumpMeter = false) => {
    e.preventDefault();
    if (isPumpMeter) setPumpMeterDragging(false);
    else setIsDragging(false);
    if (e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0], !isPumpMeter);
    }
  };

  const handleRemoveReceipt = () => {
    setReceiptFile(null);
    setReceiptPreview('');
  };

  const handleRemovePumpMeter = () => {
    setPumpMeterFile(null);
    setPumpMeterPreview('');
  };

  const onSubmitForm = async (data: FormValues) => {
    if (!data.vehicle_id) {
      setError('Please select a vehicle');
      return;
    }
    if (!receiptFile && !receiptPreview) {
      setError('Receipt is required.');
      return;
    }
    if (!data.odometer_reading) {
      setError('Odometer reading is required');
      return;
    }
    if (!data.liters) {
      setError('Fuel quantity is required');
      return;
    }
    if (!data.total_cost) {
      setError('Total cost is required');
      return;
    }

    setSubmitting(true);
    try {
      const liters = parseFloat(data.liters);
      const pricePerLiter = parseFloat(data.price_per_liter || '0');
      const totalCost = parseFloat(data.total_cost);

      if (liters <= 0 || totalCost <= 0) {
        setError('Fuel quantity and total cost must be greater than 0');
        setSubmitting(false);
        return;
      }

      const receipt_url = receiptPreview || undefined;
      const pump_meter_photo_url = pumpMeterPreview || undefined;

      const fuelData = {
        date: data.date,
        liters,
        price_per_liter: pricePerLiter,
        total_cost: totalCost,
        odometer_reading: parseInt(data.odometer_reading),
        fuel_type: data.fuel_type,
        fuel_station_name: data.fuel_station_name || undefined,
        driver_id: data.driver_id || undefined,
        driver_notes: data.driver_notes || undefined,
        trip_purpose: data.trip_purpose || undefined,
        time: data.time || undefined,
        receipt_url,
        pump_meter_photo_url,
      };

      if (editingLog) {
        await updateFuelLog(editingLog._id!, fuelData);
        toast({
          title: 'Success',
          description: 'Fuel log updated successfully',
        });
      } else {
        await createFuelLog(data.vehicle_id, fuelData);
        toast({
          title: 'Success',
          description: 'Fuel log created successfully',
        });
      }

      navigate(`/fuel`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fuel log');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-sm">Loading fuel log form...</p>
        </div>
      </div>
    );
  }

  if (vehicles.length === 0 && !editingLog) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/fuel')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Add Fuel Log</h1>
              <p className="text-sm text-gray-500">Record a new fuel entry</p>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">No vehicles available</p>
              <p className="text-sm text-yellow-700 mt-1">You need to add a vehicle first before logging fuel.</p>
              <Button
                onClick={() => navigate('/vehicles/new')}
                className="mt-4 bg-yellow-600 hover:bg-yellow-700"
              >
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/fuel')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'}
            </h1>
            <p className="text-sm text-gray-500">
              {editingLog ? 'Update fuel entry details' : 'Record a new fuel entry'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Fueling Details</TabsTrigger>
              <TabsTrigger value="uploads">Documents</TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFO */}
            <TabsContent value="basic" className="space-y-6">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle *</label>
                <Controller
                  name="vehicle_id"
                  control={control}
                  rules={{ required: 'Please select a vehicle' }}
                  render={({ field }) => {
                    console.log('Vehicle Select render - field.value:', field.value, 'type:', typeof field.value);
                    return (
                      <Select 
                        onValueChange={(newValue) => {
                          console.log('Vehicle selection changed to:', newValue);
                          field.onChange(newValue);
                        }} 
                        value={field.value || ''}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a vehicle" />
                        </SelectTrigger>
                      <SelectContent>
                        {vehicles.length > 0 && vehicles.map(v => {
                          console.log('Rendering SelectItem for vehicle:', v.id, v.make, v.model);
                          return (
                            <SelectItem key={v.id} value={v.id}>
                              {v.year} {v.make} {v.model} ({v.license_plate})
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                      </Select>
                    );
                  }}
                />
                {errors.vehicle_id && <p className="text-xs text-red-600 mt-1">{errors.vehicle_id.message}</p>}
              </div>

              {/* Odometer Reading */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Odometer Reading (km) *</label>
                <input
                  type="number"
                  min="0"
                  {...register('odometer_reading', { required: 'Odometer reading is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45230"
                />
                {errors.odometer_reading && <p className="text-xs text-red-600 mt-1">{errors.odometer_reading.message}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fueling Date *</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time (optional)</label>
                  <input
                    type="time"
                    {...register('time')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Driver Selection */}
              {drivers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Driver (optional)</label>
                  <Controller
                    name="driver_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value || undefined}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map(d => (
                            <SelectItem key={d.id} value={d.id}>
                              {d.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              )}

              {/* Trip Purpose */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Purpose (optional)</label>
                <Controller
                  name="trip_purpose"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'Business'}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select purpose" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIP_PURPOSES.map(purpose => (
                          <SelectItem key={purpose} value={purpose}>{purpose}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </TabsContent>

            {/* TAB 2: FUELING DETAILS */}
            <TabsContent value="details" className="space-y-6">
              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                <Controller
                  name="fuel_type"
                  control={control}
                  rules={{ required: 'Fuel type is required' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value || 'Petrol RON95'}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.fuel_type && <p className="text-xs text-red-600 mt-1">{errors.fuel_type.message}</p>}
              </div>

              {/* Liters & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Quantity (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('liters', { required: 'Fuel quantity is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50.5"
                  />
                  {errors.liters && <p className="text-xs text-red-600 mt-1">{errors.liters.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="flex items-center gap-1">
                      Price per Liter (RM) *
                      <span className="text-xs text-gray-400 font-normal" title="Current official fuel prices available from data.gov.my">
                        ℹ️
                      </span>
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price_per_liter', { required: 'Price per liter is required' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3.45"
                  />
                  {errors.price_per_liter && <p className="text-xs text-red-600 mt-1">{errors.price_per_liter.message}</p>}
                  <p className="text-xs text-gray-500 mt-1">Auto-calculates total when entered</p>
                </div>
              </div>

              {/* Total Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="flex items-center gap-1">
                    Total Cost (RM) *
                    {liters && pricePerLiter && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        Auto: RM {(parseFloat(liters as string) * parseFloat(pricePerLiter as string)).toFixed(2)}
                      </span>
                    )}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('total_cost', { required: 'Total cost is required' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Auto-calculated from Quantity × Price/L"
                />
                {errors.total_cost && <p className="text-xs text-red-600 mt-1">{errors.total_cost.message}</p>}
                <p className="text-xs text-gray-500 mt-1">Automatically calculated but can be manually adjusted</p>
              </div>

              {/* Fuel Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Station Name (optional)</label>
                <input
                  type="text"
                  {...register('fuel_station_name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shell, Petronas"
                />
              </div>

              {/* Driver Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Driver Notes (optional)</label>
                <textarea
                  {...register('driver_notes')}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder='e.g., "Long-distance trip", "Fuel refill before servicing"'
                />
              </div>
            </TabsContent>

            {/* TAB 3: UPLOADS */}
            <TabsContent value="uploads" className="space-y-8">
              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt * <span className="text-xs text-gray-500">(Image or PDF, max 10MB)</span></label>
                {!receiptPreview ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, false)}
                    onDragLeave={(e) => handleDragLeave(e, false)}
                    onDrop={(e) => handleDrop(e, false)}
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input type="file" accept="image/*,.pdf" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0], true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drop receipt here or click to upload</p>
                      <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP, PDF (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-gray-300 rounded-lg p-6">
                    <button type="button" onClick={handleRemoveReceipt} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"><Trash2 className="h-4 w-4" /></button>
                    {receiptFile?.type.startsWith('image/') || receiptPreview.startsWith('data:image/') ? (
                      <div className="flex flex-col items-center">
                        <img src={receiptPreview} alt="Receipt preview" className="max-h-48 rounded-lg object-contain mb-3" />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span className="font-medium">{receiptFile?.name || 'Existing receipt'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg"><FileText className="h-8 w-8 text-red-600" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{receiptFile?.name || 'Receipt.pdf'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pump Meter Photo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pump Meter Photo (optional) <span className="text-xs text-gray-500 ml-1">For audit verification</span></label>
                {!pumpMeterPreview ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, true)}
                    onDragLeave={(e) => handleDragLeave(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                    className={`relative border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${pumpMeterDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input type="file" accept="image/*" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0], false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drop pump meter photo here or click to upload</p>
                      <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-gray-300 rounded-lg p-6">
                    <button type="button" onClick={handleRemovePumpMeter} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"><Trash2 className="h-4 w-4" /></button>
                    <div className="flex flex-col items-center">
                      <img src={pumpMeterPreview} alt="Pump meter preview" className="max-h-48 rounded-lg object-contain mb-3" />
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="h-4 w-4" />
                        <span className="font-medium">{pumpMeterFile?.name || 'Pump meter photo'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/fuel')}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingLog ? 'Update Fuel Log' : 'Add Fuel Log'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
