export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  license_plate?: string;
  color?: string;
  current_mileage: number;
  fuel_type?: string;
  imageUrl?: string;
}

export interface MaintenanceRecord {
  id: string;
  vehicleId: string;
  date: string;
  mileage: number;
  type: 'oil_change' | 'tire_rotation' | 'brake_service' | 'inspection' | 'repair' | 'other';
  description: string;
  cost: number;
  serviceProvider?: string;
  notes?: string;
}

export interface ServiceReminder {
  id: string;
  vehicleId: string;
  serviceType: string;
  description: string;
  dueByMileage?: number;
  dueByDate?: string;
  reminderThresholdMiles?: number; // Alert X miles before due
  reminderThresholdDays?: number; // Alert X days before due
  isRecurring?: boolean;
  recurringIntervalMiles?: number;
  recurringIntervalMonths?: number;
  lastCompletedDate?: string;
  lastCompletedMileage?: number;
  isActive: boolean;
}

export interface ReminderStatus {
  reminder: ServiceReminder;
  status: 'overdue' | 'due_soon' | 'upcoming' | 'ok';
  daysUntilDue?: number;
  milesUntilDue?: number;
  message: string;
}
