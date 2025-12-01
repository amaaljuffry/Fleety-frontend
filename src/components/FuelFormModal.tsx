import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { FuelLog } from '@/api/fuel';
import { X, Loader2, Upload, FileText, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year?: number;
  license_plate: string;
}

interface Driver {
  _id: string;
  name: string;
  email?: string;
}

interface FuelFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vehicleId: string, data: Omit<FuelLog, '_id' | 'vehicle_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editingLog?: FuelLog | null;
  loading?: boolean;
  vehicles?: Vehicle[];
  selectedVehicleId?: string;
  drivers?: Driver[];
}

interface FormValues {
  // Vehicle & Odometer
  vehicle_id: string;
  odometer_reading: string;
  
  // Fueling Details
  fuel_type: 'Diesel' | 'Petrol RON95' | 'Petrol RON97' | 'RON92' | 'Other';
  liters: string;
  price_per_liter: string;
  total_cost: string;
  fuel_station_name?: string;
  
  // Driver & Notes
  driver_id?: string;
  driver_notes?: string;
  trip_purpose?: 'Business' | 'Personal' | 'Delivery' | 'Other';
  
  // Date & Time
  date: string;
  time?: string;
  
  // Receipt
  receipt_url?: string;
  pump_meter_photo_url?: string;
}

const FUEL_TYPES = ['Diesel', 'Petrol RON95', 'Petrol RON97', 'RON92', 'Other'];
const TRIP_PURPOSES = ['Business', 'Personal', 'Delivery', 'Other'];

export const FuelFormModal: React.FC<FuelFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingLog,
  loading = false,
  vehicles = [],
  selectedVehicleId = '',
  drivers = [],
}) => {
  const { register, handleSubmit, reset, control, watch, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      fuel_type: 'Petrol RON95',
      trip_purpose: 'Business',
    }
  });

  const [receiptFile, setReceiptFile] = React.useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = React.useState<string>('');
  const [pumpMeterFile, setPumpMeterFile] = React.useState<File | null>(null);
  const [pumpMeterPreview, setPumpMeterPreview] = React.useState<string>('');
  const [isDragging, setIsDragging] = React.useState(false);
  const [pumpMeterDragging, setPumpMeterDragging] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState('');

  const liters = watch('liters');
  const pricePerLiter = watch('price_per_liter');

  // Auto-calculate total cost
  useEffect(() => {
    if (liters && pricePerLiter) {
      const total = (parseFloat(liters) * parseFloat(pricePerLiter)).toFixed(2);
      // This would be better with setValue from react-hook-form
    }
  }, [liters, pricePerLiter]);

  // Initialize form for Add or Edit
  useEffect(() => {
    if (editingLog) {
      reset({
        vehicle_id: editingLog.vehicle_id,
        odometer_reading: editingLog.odometer_reading?.toString() || '',
        fuel_type: editingLog.fuel_type || 'Petrol RON95',
        liters: editingLog.liters.toString(),
        price_per_liter: editingLog.price_per_liter.toString(),
        total_cost: editingLog.total_cost.toString(),
        fuel_station_name: editingLog.fuel_station_name || '',
        driver_id: editingLog.driver_id || '',
        driver_notes: editingLog.driver_notes || '',
        trip_purpose: editingLog.trip_purpose || 'Business',
        date: editingLog.date.split('T')[0],
        time: editingLog.time || '',
        receipt_url: editingLog.receipt_url || '',
        pump_meter_photo_url: editingLog.pump_meter_photo_url || '',
      });
      setReceiptPreview(editingLog.receipt_url || '');
      setPumpMeterPreview(editingLog.pump_meter_photo_url || '');
    } else {
      reset({
        vehicle_id: selectedVehicleId || vehicles[0]?._id || '',
        odometer_reading: '',
        fuel_type: 'Petrol RON95',
        liters: '',
        price_per_liter: '',
        total_cost: '',
        fuel_station_name: '',
        driver_id: drivers[0]?._id || '',
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
  }, [editingLog, isOpen, reset, selectedVehicleId, vehicles, drivers]);

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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, isReceipt = true) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file, isReceipt);
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
    if (!data.vehicle_id) { setError('Please select a vehicle'); return; }
    if (!receiptFile && !receiptPreview) { setError('Receipt is required.'); return; }
    if (!data.odometer_reading) { setError('Odometer reading is required'); return; }
    if (!data.liters) { setError('Fuel quantity is required'); return; }
    if (!data.total_cost) { setError('Total cost is required'); return; }

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

      await onSubmit(data.vehicle_id, {
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
      });

      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save fuel log');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 my-8">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-lg font-semibold text-gray-900">{editingLog ? 'Edit Fuel Log' : 'Add Fuel Log'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors"><X className="h-5 w-5 text-gray-500" /></button>
        </div>

        <form onSubmit={handleSubmit(onSubmitForm)} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Tabs for organization - wrapped in scrollable container */}
          <div className="max-h-[65vh] overflow-y-auto">
            <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="details">Fueling Details</TabsTrigger>
              <TabsTrigger value="uploads">Documents</TabsTrigger>
            </TabsList>

            {/* TAB 1: BASIC INFORMATION */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              {/* Vehicle Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
                <Controller
                  name="vehicle_id"
                  control={control}
                  rules={{ required: 'Please select a vehicle' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.length > 0 ? vehicles.map(v => (
                          <SelectItem key={v._id} value={v._id}>
                            {v.year} {v.make} {v.model} ({v.license_plate})
                          </SelectItem>
                        )) : (
                          <SelectItem value="no-vehicles" disabled>No vehicles available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.vehicle_id && <p className="text-xs text-red-600 mt-1">{errors.vehicle_id.message}</p>}
              </div>

              {/* Odometer Reading */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Odometer Reading (km) *</label>
                <input
                  type="number"
                  min="0"
                  {...register('odometer_reading', { required: 'Odometer reading is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45230"
                />
                {errors.odometer_reading && <p className="text-xs text-red-600 mt-1">{errors.odometer_reading.message}</p>}
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fueling Date *</label>
                  <input
                    type="date"
                    {...register('date', { required: 'Date is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.date && <p className="text-xs text-red-600 mt-1">{errors.date.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time (optional)</label>
                  <input
                    type="time"
                    {...register('time')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Driver Selection */}
              {drivers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver (optional)</label>
                  <Controller
                    name="driver_id"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value ?? ''}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select driver" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Driver</SelectItem>
                          {drivers.map(d => (
                            <SelectItem key={d._id} value={d._id}>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip Purpose (optional)</label>
                <Controller
                  name="trip_purpose"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? 'Business'}>
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
            <TabsContent value="details" className="space-y-4 mt-4">
              {/* Fuel Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                <Controller
                  name="fuel_type"
                  control={control}
                  rules={{ required: 'Fuel type is required' }}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value ?? undefined}>
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Quantity (L) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('liters', { required: 'Fuel quantity is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 50.5"
                  />
                  {errors.liters && <p className="text-xs text-red-600 mt-1">{errors.liters.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price/L (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register('price_per_liter')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 3.45"
                  />
                </div>
              </div>

              {/* Total Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Cost (RM) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('total_cost', { required: 'Total cost is required' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 174.22"
                />
                {errors.total_cost && <p className="text-xs text-red-600 mt-1">{errors.total_cost.message}</p>}
              </div>

              {/* Fuel Station */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Station Name (optional)</label>
                <input
                  type="text"
                  {...register('fuel_station_name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Shell, Petronas"
                />
              </div>

              {/* Driver Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Driver Notes (optional)</label>
                <textarea
                  {...register('driver_notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder='e.g., "Long-distance trip", "Fuel refill before servicing"'
                />
              </div>
            </TabsContent>

            {/* TAB 3: UPLOADS */}
            <TabsContent value="uploads" className="space-y-6 mt-4">
              {/* Receipt Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt * <span className="text-xs text-gray-500">(Image or PDF, max 10MB)</span></label>
                {!receiptPreview ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, false)}
                    onDragLeave={(e) => handleDragLeave(e, false)}
                    onDrop={(e) => handleDrop(e, false)}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input type="file" accept="image/*,.pdf" onChange={(e) => handleFileInputChange(e, true)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drop receipt here or click to upload</p>
                      <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP, PDF (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-gray-300 rounded-lg p-4">
                    <button type="button" onClick={handleRemoveReceipt} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"><Trash2 className="h-4 w-4" /></button>
                    {receiptFile?.type.startsWith('image/') || receiptPreview.startsWith('data:image/') ? (
                      <div className="flex flex-col items-center">
                        <img src={receiptPreview} alt="Receipt preview" className="max-h-40 rounded-lg object-contain mb-2" />
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <ImageIcon className="h-4 w-4" />
                          <span className="font-medium">{receiptFile?.name || 'Existing receipt'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 p-3 bg-red-100 rounded-lg"><FileText className="h-8 w-8 text-red-600" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{receiptFile?.name || 'Receipt.pdf'}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Pump Meter Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pump Meter Photo (optional) <span className="text-xs text-gray-500 ml-1">For audit verification</span></label>
                {!pumpMeterPreview ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, true)}
                    onDragLeave={(e) => handleDragLeave(e, true)}
                    onDrop={(e) => handleDrop(e, true)}
                    className={`relative border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer ${pumpMeterDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
                  >
                    <input type="file" accept="image/*" onChange={(e) => handleFileInputChange(e, false)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <div className="flex flex-col items-center justify-center text-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm font-medium text-gray-700 mb-1">Drop pump meter photo here or click to upload</p>
                      <p className="text-xs text-gray-500">Supports: JPG, PNG, GIF, WebP (max 10MB)</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative border-2 border-gray-300 rounded-lg p-4">
                    <button type="button" onClick={handleRemovePumpMeter} className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"><Trash2 className="h-4 w-4" /></button>
                    <div className="flex flex-col items-center">
                      <img src={pumpMeterPreview} alt="Pump meter preview" className="max-h-40 rounded-lg object-contain mb-2" />
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
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors" disabled={submitting}>Cancel</button>
            <button type="submit" disabled={submitting || loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingLog ? 'Update Fuel Log' : 'Add Fuel Log'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
