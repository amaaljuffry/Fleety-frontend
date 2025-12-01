const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const apiRequest = async (
  endpoint: string,
  options: RequestOptions = {}
): Promise<any> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Try to get detailed error message from response
    let errorMessage = `API Error: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.detail) {
        errorMessage = typeof errorData.detail === 'string' 
          ? errorData.detail 
          : JSON.stringify(errorData.detail);
      }
    } catch (e) {
      // Response wasn't JSON, use status text
    }
    
    // Only clear token and redirect for 401 on auth endpoints
    // Don't logout on 401 from other endpoints (like subscription checks)
    if (response.status === 401) {
      const isAuthEndpoint = endpoint.includes('/auth/login') || 
                              endpoint.includes('/auth/register') ||
                              endpoint.includes('/auth/me');
      
      // Only logout if explicitly "Not authenticated" or "Invalid token"
      const shouldLogout = errorMessage.includes('Not authenticated') || 
                           errorMessage.includes('Invalid token') ||
                           errorMessage.includes('Token has expired');
      
      if (shouldLogout && !endpoint.includes('/auth/login')) {
        clearAuthToken();
        window.location.href = "/";
      }
    }
    
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

// Authentication endpoints
export const authAPI = {
  signup: (email: string, password: string, full_name: string) =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, full_name }),
    }),

  login: (email: string, password: string) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  me: () => apiRequest("/api/auth/me"),

  changePassword: (current_password: string, new_password: string) =>
    apiRequest("/api/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({ current_password, new_password }),
    }),
};

// Vehicle endpoints
export const vehicleAPI = {
  getAll: () => apiRequest("/api/vehicles"),

  getById: (id: string) => apiRequest(`/api/vehicles/${id}`),

  create: (data: {
    make: string;
    model: string;
    year: number;
    color?: string;
    vin?: string;
    license_plate?: string;
    current_mileage?: number;
    image_url?: string;
  }) =>
    apiRequest("/api/vehicles", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<any>) =>
    apiRequest(`/api/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/vehicles/${id}`, {
      method: "DELETE",
    }),
};

// Maintenance endpoints
export const maintenanceAPI = {
  getByVehicle: (vehicleId: string) =>
    apiRequest(`/api/maintenance/vehicle/${vehicleId}`),

  getById: (id: string) => apiRequest(`/api/maintenance/${id}`),

  create: (vehicleId: string, data: any) =>
    apiRequest(`/api/maintenance/vehicle/${vehicleId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<any>) =>
    apiRequest(`/api/maintenance/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/maintenance/${id}`, {
      method: "DELETE",
    }),
};

// Reminder endpoints
export const reminderAPI = {
  getByVehicle: (vehicleId: string) =>
    apiRequest(`/api/reminders/vehicle/${vehicleId}`),

  getById: (id: string) => apiRequest(`/api/reminders/${id}`),

  create: (vehicleId: string, data: any) =>
    apiRequest(`/api/reminders/vehicle/${vehicleId}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: Partial<any>) =>
    apiRequest(`/api/reminders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/api/reminders/${id}`, {
      method: "DELETE",
    }),
};
