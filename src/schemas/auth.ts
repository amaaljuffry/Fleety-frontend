import { z } from 'zod';

export const signupSchema = z
  .object({
    full_name: z
      .string()
      .min(1, 'Full name is required')
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must not exceed 100 characters'),
    
    email: z
      .string()
      .min(1, 'Email is required')
      .email('Please enter a valid email address'),
    
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must be at least 6 characters')
      .min(1, 'Password must contain at least one character'),
    
    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

export type SignupFormData = z.infer<typeof signupSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;

export type ValidationErrors<T> = {
  [K in keyof T]?: string[];
};

/**
 * Validates signup form data
 */
export const validateSignup = (data: unknown) => {
  try {
    const validated = signupSchema.parse(data);
    return {
      success: true,
      data: validated,
      errors: {} as ValidationErrors<SignupFormData>,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors<SignupFormData> = {};
      error.errors.forEach((err) => {
        const key = err.path[0] as keyof SignupFormData;
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
      errors: { email: ['Unknown validation error'] } as ValidationErrors<SignupFormData>,
    };
  }
};

/**
 * Validates login form data
 */
export const validateLogin = (data: unknown) => {
  try {
    const validated = loginSchema.parse(data);
    return {
      success: true,
      data: validated,
      errors: {} as ValidationErrors<LoginFormData>,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationErrors<LoginFormData> = {};
      error.errors.forEach((err) => {
        const key = err.path[0] as keyof LoginFormData;
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
      errors: { email: ['Unknown validation error'] } as ValidationErrors<LoginFormData>,
    };
  }
};
