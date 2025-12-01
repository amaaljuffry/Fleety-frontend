import { apiRequest } from "./client";

export interface FuelLog {
  _id?: string;
  vehicle_id: string;
  
  // Vehicle & Odometer
  odometer_reading: number;
  
  // Fueling Details
  fuel_type: string;
  liters: number;
  price_per_liter?: number;
  total_cost: number;
  fuel_station_name?: string;
  
  // Driver & Operational
  driver_id?: string;
  driver_notes?: string;
  trip_purpose?: string;
  
  // Date & Time
  date: string;
  time?: string;
  
  // Evidence & Documentation
  receipt_url?: string;
  pump_meter_photo_url?: string;
  
  // Notes
  notes?: string;
  
  // Timestamps
  created_at?: string;
  updated_at?: string;
}

export interface FuelStatsResponse {
  total_entries: number;
  total_spent: number;
  average_price_per_liter: number;
  fuel_economy?: number;
  last_entry_date?: string;
}

/**
 * Get all fuel logs for a vehicle
 */
export const getFuelLogs = async (vehicleId: string): Promise<FuelLog[]> => {
  return apiRequest(`/api/vehicles/${vehicleId}/fuel`, {
    method: "GET",
  });
};

/**
 * Get fuel statistics for a vehicle
 */
export const getFuelStats = async (vehicleId: string): Promise<FuelStatsResponse> => {
  return apiRequest(`/api/vehicles/${vehicleId}/fuel/stats`, {
    method: "GET",
  });
};

/**
 * Get a single fuel log by ID
 */
export const getFuelLogById = async (fuelLogId: string): Promise<FuelLog> => {
  return apiRequest(`/api/fuel/${fuelLogId}`, {
    method: "GET",
  });
};

/**
 * Create a new fuel log
 */
export const createFuelLog = async (
  vehicleId: string,
  data: Omit<FuelLog, "_id" | "vehicle_id" | "created_at" | "updated_at">
): Promise<FuelLog> => {
  return apiRequest(`/api/vehicles/${vehicleId}/fuel`, {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Update an existing fuel log
 */
export const updateFuelLog = async (
  fuelLogId: string,
  data: Partial<FuelLog>
): Promise<FuelLog> => {
  return apiRequest(`/api/fuel/${fuelLogId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

/**
 * Delete a fuel log
 */
export const deleteFuelLog = async (fuelLogId: string): Promise<void> => {
  return apiRequest(`/api/fuel/${fuelLogId}`, {
    method: "DELETE",
  });
};
