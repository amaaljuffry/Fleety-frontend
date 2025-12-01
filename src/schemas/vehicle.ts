import { z } from 'zod';

export const vehicleSchema = z.object({
  make: z
    .string()
    .min(1, 'Make is required')
    .min(2, 'Make must be at least 2 characters')
    .max(50, 'Make must not exceed 50 characters'),
  
  model: z
    .string()
    .min(1, 'Model is required')
    .min(2, 'Model must be at least 2 characters')
    .max(50, 'Model must not exceed 50 characters'),
  
  year: z
    .number()
    .int('Year must be a whole number')
    .min(1900, 'Year must be at least 1900')
    .max(new Date().getFullYear() + 1, `Year cannot exceed ${new Date().getFullYear() + 1}`),
  
  color: z
    .string()
    .max(50, 'Color must not exceed 50 characters')
    .optional()
    .or(z.literal('')),
  
  vin: z
    .string()
    .max(17, 'VIN must not exceed 17 characters')
    .optional()
    .or(z.literal('')),
  
  licensePlate: z
    .string()
    .max(20, 'License plate must not exceed 20 characters')
    .optional()
    .or(z.literal('')),
  
  current_mileage: z
    .number()
    .int('Mileage must be a whole number')
    .min(0, 'Mileage cannot be negative')
    .max(999999999, 'Mileage is too high'),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

// Validation errors type
export type ValidationErrors = {
  [K in keyof VehicleFormData]?: string[];
};

/**
 * Validates vehicle form data
 * @param data - The form data to validate
 * @returns Validation result with success flag and errors
 */
export const validateVehicle = (data: unknown) => {
  try {
    const validated = vehicleSchema.parse(data);
    return {
      success: true,
      data: validated,
      errors: {} as ValidationErrors,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors = {};
      error.errors.forEach((err) => {
        const key = err.path[0] as keyof VehicleFormData;
        if (!errors[key]) {
          errors[key] = [];
        }
        errors[key]!.push(err.message);
      });
      return {
        success: false,
        data: null,
        errors,
      };
    }
    return {
      success: false,
      data: null,
      errors: { make: ['Unknown validation error'] } as ValidationErrors,
    };
  }
};
