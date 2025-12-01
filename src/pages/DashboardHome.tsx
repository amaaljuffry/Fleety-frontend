import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Car,
  AlertCircle,
  TrendingUp,
  Clock,
  Plus,
  ChevronRight,
  Loader2,
  MapPin,
  Wrench,
  Fuel,
  AlertTriangle,
  CheckCircle,
  Calendar,
  MoreVertical,
  Zap,
  Droplet,
  Gauge,
  Bell,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currencyFormatter';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  license_plate?: string;
  current_mileage: number;
  fuel_type?: string;
}

interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  address: string;
}

interface Maintenance {
  id: string;
  vehicle_id: string;
  service_type: string;
  description: string;
  cost: number;
  date: string;
}

interface Reminder {
  id: string;
  vehicleId: string;
  service_type: string;
  isActive: boolean;
  dueByDate?: string;
  dueByMileage?: number;
}

// Dummy location data for vehicles
const DUMMY_VEHICLE_LOCATIONS: Record<string, VehicleLocation> = {
  '1': { vehicleId: '1', latitude: 40.7128, longitude: -74.0060, address: 'New York, NY' },
  '2': { vehicleId: '2', latitude: 34.0522, longitude: -118.2437, address: 'Los Angeles, CA' },
  '3': { vehicleId: '3', latitude: 41.8781, longitude: -87.6298, address: 'Chicago, IL' },
  '4': { vehicleId: '4', latitude: 29.7604, longitude: -95.3698, address: 'Houston, TX' },
  '5': { vehicleId: '5', latitude: 33.7490, longitude: -84.3880, address: 'Atlanta, GA' },
  '6': { vehicleId: '6', latitude: 47.6062, longitude: -122.3321, address: 'Seattle, WA' },
};

// Mini map component for vehicle location preview
const MiniMapPreview = ({ location }: { location: VehicleLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView(
      [location.latitude, location.longitude],
      12
    );

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(mapInstanceRef.current);

    L.marker([location.latitude, location.longitude], {
      icon: L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
      }),
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location]);

  return <div ref={mapRef} style={{ width: '100%', height: '200px', borderRadius: '8px' }} />;
};

export function DashboardHome() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, VehicleLocation>>({});
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSpending, setTotalSpending] = useState(0);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [currency, setCurrency] = useState<string>('USD');
  const [alertsOpen, setAlertsOpen] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch user preferences to get currency
        try {
          const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
          const data = prefsRes?.data ? prefsRes.data : prefsRes;
          if (data && data.preferences) {
            setCurrency(data.preferences.currency || 'USD');
          }
        } catch (error) {
          console.error('Error fetching preferences:', error);
        }

        // Fetch vehicles - API returns the array directly
        const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
        const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
        
        // Normalize vehicle IDs (_id to id)
        const normalizedVehicles = vehiclesList.map((v: Vehicle & { _id?: string }) => ({
          ...v,
          id: v.id || v._id || '',
        }));
        
        console.log('Vehicles fetched:', normalizedVehicles);
        console.log('First vehicle:', normalizedVehicles[0]);
        setVehicles(normalizedVehicles);

        // Load dummy vehicle locations or fetch from API
        const locationsMap: Record<string, VehicleLocation> = {};
        normalizedVehicles.forEach((vehicle, index) => {
          // Use dummy location data, or generate random location based on vehicle ID
          const vehicleId = vehicle.id || String(index + 1);
          if (DUMMY_VEHICLE_LOCATIONS[vehicleId]) {
            locationsMap[vehicleId] = DUMMY_VEHICLE_LOCATIONS[vehicleId];
          } else {
            // Fallback to a random location from dummy data
            const locations = Object.values(DUMMY_VEHICLE_LOCATIONS);
            locationsMap[vehicleId] = locations[index % locations.length];
          }
        });
        setVehicleLocations(locationsMap);

        // Fetch all maintenance records for all vehicles
        let allMaintenance: Maintenance[] = [];
        console.log('Starting to fetch maintenance for', vehiclesList.length, 'vehicles');
        
        if (vehiclesList && vehiclesList.length > 0) {
          for (const vehicle of vehiclesList) {
            const vehicleId = vehicle.id || vehicle._id;
            if (!vehicleId) {
              console.warn('Vehicle missing ID:', vehicle);
              continue;
            }
            try {
              console.log(`Fetching maintenance for vehicle ${vehicleId}...`);
              const mainRes = await apiRequest(`/api/maintenance/vehicle/${vehicleId}`, {
                method: 'GET',
              });
              
              console.log(`Response for vehicle ${vehicleId}:`, mainRes);
              const mainList = Array.isArray(mainRes) ? mainRes : (mainRes?.data || []);
              console.log(`Parsed maintenance list for vehicle ${vehicleId}:`, mainList);
              
              if (mainList && mainList.length > 0) {
                allMaintenance = [...allMaintenance, ...mainList];
                console.log(`Added ${mainList.length} records. Total now: ${allMaintenance.length}`);
              }
            } catch (error) {
              console.error(`Error fetching maintenance for vehicle ${vehicleId}:`, error);
            }
          }
        }
        
        console.log('Final allMaintenance array:', allMaintenance);
        setMaintenance(allMaintenance);

        // Calculate spending
        const total = allMaintenance.reduce((sum, record) => {
          const cost = record.cost || 0;
          console.log(`Adding cost for record ${record.id}:`, cost);
          return sum + cost;
        }, 0);
        setTotalSpending(total);
        console.log('Dashboard: Total spending calculated:', total, 'from', allMaintenance.length, 'records');

        // Calculate monthly spending (this month)
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        console.log(`Current date: Month=${currentMonth}, Year=${currentYear}`);
        
        const monthly = allMaintenance
          .filter((record) => {
            const recordDate = new Date(record.date);
            const recordMonth = recordDate.getMonth();
            const recordYear = recordDate.getFullYear();
            const isThisMonth = recordMonth === currentMonth && recordYear === currentYear;
            console.log(`Record ${record.id} (${record.date}): ${recordMonth}/${recordYear} - Match: ${isThisMonth}`);
            return isThisMonth;
          })
          .reduce((sum, record) => sum + (record.cost || 0), 0);
        setMonthlySpending(monthly);
        console.log('Dashboard: Monthly spending calculated:', monthly);

        // Fetch reminders for all vehicles
        let allReminders: Reminder[] = [];
        if (vehiclesList && vehiclesList.length > 0) {
          for (const vehicle of vehiclesList) {
            if (!vehicle.id) {
              console.warn('Vehicle missing ID:', vehicle);
              continue;
            }
            try {
              const remRes = await apiRequest(`/api/reminders/vehicle/${vehicle.id}`, {
                method: 'GET',
              });
              const remList = Array.isArray(remRes) ? remRes : (remRes?.data || []);
              if (remList && remList.length > 0) {
                allReminders = [...allReminders, ...remList];
              }
            } catch (error) {
              console.error(`Error fetching reminders for vehicle ${vehicle.id}:`, error);
            }
          }
        }
        setReminders(allReminders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast, location]);

  // Calculate metrics
  const activeReminders = reminders.filter((r) => r.isActive).length;
  const recentMaintenance = maintenance.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Mock upcoming maintenance (next 7 days)
  const now = new Date();
  const upcoming7Days = reminders.filter((r) => {
    if (!r.dueByDate) return false;
    const dueDate = new Date(r.dueByDate);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  // Mock fuel efficiency (average across vehicles)
  const avgFuelEfficiency = vehicles.length > 0 ? (18 + Math.random() * 8).toFixed(1) : '0';

  // Helper to format service type (e.g., oil_change -> Oil Change)
  const formatServiceType = (serviceType?: string): string => {
    if (!serviceType) return 'Service';
    return serviceType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Mock data for charts
  const maintenanceByVehicle = vehicles.slice(0, 5).map((v) => {
    const vehicleMaintenance = maintenance.filter((m) => m.vehicle_id === v.id);
    const totalCost = vehicleMaintenance.reduce((sum, m) => sum + m.cost, 0);
    return {
      name: `${v.year} ${v.make} ${v.model}`.substring(0, 15),
      cost: totalCost,
    };
  });

  const fuelConsumptionData = [
    { month: 'Jan', consumption: 250 },
    { month: 'Feb', consumption: 280 },
    { month: 'Mar', consumption: 320 },
    { month: 'Apr', consumption: 300 },
    { month: 'May', consumption: 350 },
    { month: 'Jun', consumption: 330 },
  ];

  const serviceTypeDistribution = (() => {
    const distribution: Record<string, number> = {};
    maintenance.forEach((m) => {
      const type = m.service_type || 'Other';
      // Format the service type for display
      const formattedType = formatServiceType(type);
      distribution[formattedType] = (distribution[formattedType] || 0) + 1;
    });
    return Object.entries(distribution)
      .map(([name, value]) => ({ name, value }))
      .slice(0, 5);
  })();

  const CHART_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Alerts and notifications
  const alerts = [
    { id: 1, type: 'urgent', title: 'Oil Change Overdue', vehicle: 'Tesla Model 3', icon: AlertTriangle },
    { id: 2, type: 'warning', title: 'Tire Inspection Due', vehicle: 'Ford F-150', icon: AlertCircle },
    { id: 3, type: 'info', title: 'Maintenance Completed', vehicle: 'Toyota Camry', icon: CheckCircle },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-black" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 space-y-6">
      {/* Debug Info - Remove in Production
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800">
          <p className="font-bold mb-2">🔍 Dashboard Debug Info:</p>
          <p>Vehicles: {vehicles.length}</p>
          <p>Maintenance Records: {maintenance.length}</p>
          <p>Total Spending: {formatCurrency(totalSpending, currency)}</p>
          <p>Monthly Spending: {formatCurrency(monthlySpending, currency)}</p>
          <p>Check browser console for detailed logs</p>
        </div>
      )} */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fleet Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome to your fleet management system</p>
        </div>
        <div className="relative">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setAlertsOpen(!alertsOpen)}
            className="relative gap-2"
          >
            <AlertCircle className="h-5 w-5" />
            <span className="text-base">{activeReminders}</span>
            {activeReminders > 0 && (
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-600 rounded-full animate-pulse" />
            )}
          </Button>

          {/* Alerts Dropdown */}
          {alertsOpen && (
            <div className="absolute top-12 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Active Alerts</h3>
              </div>
              {alerts.map((alert) => {
                const Icon = alert.icon;
                return (
                  <div
                    key={alert.id}
                    className={`p-4 border-b border-gray-100 last:border-0 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      alert.type === 'urgent' ? 'bg-red-50' : alert.type === 'warning' ? 'bg-yellow-50' : 'bg-blue-50'
                    }`}
                  >
                    <Icon
                      className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                        alert.type === 'urgent'
                          ? 'text-red-600'
                          : alert.type === 'warning'
                          ? 'text-yellow-600'
                          : 'text-blue-600'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">{alert.title}</p>
                      <p className="text-xs text-gray-600 mt-0.5">{alert.vehicle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Vehicles */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Vehicles</CardTitle>
              <Car className="h-5 w-5 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{vehicles.length}</div>
            <p className="text-xs text-gray-500 mt-2">
              {vehicles.length === 1 ? 'Active vehicle' : `Active vehicles`}
            </p>
          </CardContent>
        </Card>

        {/* Total Spending */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spending</CardTitle>
              <TrendingUp className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(totalSpending, currency)}</div>
            <p className="text-xs text-gray-500 mt-2">{maintenance.length} records</p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{formatCurrency(monthlySpending, currency)}</div>
            <p className="text-xs text-gray-500 mt-2">Current month</p>
          </CardContent>
        </Card>

        {/* Active Reminders */}
        <Card className={`hover:shadow-md transition-shadow ${activeReminders > 0 ? 'border-red-200' : ''}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Active Reminders</CardTitle>
              <AlertCircle className={`h-5 w-5 ${activeReminders > 0 ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${activeReminders > 0 ? 'text-red-600' : 'text-gray-900'}`}>
              {activeReminders}
            </div>
            <p className="text-xs text-gray-500 mt-2">Pending services</p>
          </CardContent>
        </Card>

        {/* Upcoming Maintenance */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Upcoming (7 Days)</CardTitle>
              <Calendar className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{upcoming7Days}</div>
            <p className="text-xs text-gray-500 mt-2">Due for service</p>
          </CardContent>
        </Card>

        {/* Average Fuel Efficiency */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Fuel Efficiency</CardTitle>
              <Droplet className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{avgFuelEfficiency}</div>
            <p className="text-xs text-gray-500 mt-2">MPG average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts and Maintenance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Maintenance */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5 text-blue-600" />
                    Recent Maintenance
                  </CardTitle>
                  <CardDescription>Last 5 service records</CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/maintenance')}
                  className="gap-1"
                >
                  View All
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentMaintenance.slice(0, 5).length > 0 ? (
                <div className="space-y-3">
                  {recentMaintenance.slice(0, 5).map((record, idx) => {
                    const vehicle = vehicles.find((v) => v.id === record.vehicle_id);
                    return (
                      <div
                        key={record.id}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
                        onClick={() => navigate(`/maintenance`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            {vehicle && (
                              <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                                {vehicle.year} {vehicle.make} {vehicle.model}
                              </p>
                            )}
                            <p className="text-xs text-gray-600 mt-1">{formatServiceType(record.service_type)}</p>
                          </div>
                          <Badge
                            variant={idx === 0 ? 'default' : 'secondary'}
                            className="text-xs ml-2"
                          >
                            {new Date(record.date).toLocaleDateString()}
                          </Badge>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between items-center">
                          <p className="text-xs text-gray-500">{record.description?.substring(0, 30)}...</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {formatCurrency(record.cost, currency)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">No maintenance records yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/maintenance')}
                    className="mt-3 gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Record
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Maintenance by Vehicle */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-5 w-5 text-green-600" />
                  Spending by Vehicle
                </CardTitle>
                <CardDescription>Maintenance costs</CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceByVehicle.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={maintenanceByVehicle}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number, currency)}
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="cost" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <p>No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Service Type Distribution */}
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Service Type Distribution
                </CardTitle>
                <CardDescription>By count</CardDescription>
              </CardHeader>
              <CardContent>
                {serviceTypeDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={serviceTypeDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {serviceTypeDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[250px] flex items-center justify-center text-gray-400">
                    <p>No data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fuel Consumption Trend */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Fuel className="h-5 w-5 text-red-600" />
                Fuel Consumption Trend
              </CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={fuelConsumptionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => `${value} gallons`}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="consumption"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Consumption (Gal)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle Locations - Coming Soon */}
          {vehicles.length > 0 && Object.keys(vehicleLocations).length > 0 && (
            <Card className="relative hover:shadow-md transition-shadow">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Badge className="mb-2">Coming Soon</Badge>
                  <p className="text-sm font-semibold text-gray-700">Live Tracking</p>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Vehicle Locations
                </CardTitle>
                <CardDescription>Real-time tracking</CardDescription>
              </CardHeader>
              <CardContent>
                {vehicles[0] && vehicleLocations[vehicles[0].id] && (
                  <div className="space-y-3 opacity-40">
                    <MiniMapPreview location={vehicleLocations[vehicles[0].id]} />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">
                        {vehicles[0].year} {vehicles[0].make} {vehicles[0].model}
                      </p>
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <MapPin className="h-3 w-3" />
                        <p className="text-xs">{vehicleLocations[vehicles[0].id].address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                onClick={() => navigate('/vehicles/new')}
                className="w-full gap-2 justify-start"
              >
                <Plus className="h-4 w-4" />
                Add Vehicle
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/maintenance')}
                className="w-full gap-2 justify-start"
              >
                <Wrench className="h-4 w-4" />
                Log Maintenance
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/reminders')}
                className="w-full gap-2 justify-start"
              >
                <Bell className="h-4 w-4" />
                Manage Reminders
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/reports')}
                className="w-full gap-2 justify-start"
              >
                <TrendingUp className="h-4 w-4" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          {/* Vehicle Overview */}
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Your Vehicles
              </CardTitle>
              <CardDescription>{vehicles.length} total</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {vehicles.length > 0 ? (
                <>
                  {vehicles.slice(0, 4).map((vehicle) => (
                    <button
                      key={vehicle.id}
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                    >
                      <p className="font-semibold text-sm text-gray-900 group-hover:text-blue-700">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{vehicle.license_plate || 'N/A'}</p>
                      <p className="text-xs text-gray-500">{vehicle.current_mileage} mi</p>
                    </button>
                  ))}
                  {vehicles.length > 4 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/vehicles')}
                      className="w-full text-xs"
                    >
                      View All {vehicles.length} Vehicles
                    </Button>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">No vehicles yet</p>
              )}
            </CardContent>
          </Card>

          {/* Active Alerts */}
          <Card className={`hover:shadow-md transition-shadow ${activeReminders > 0 ? 'border-red-200 bg-red-50' : ''}`}>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className={`h-5 w-5 ${activeReminders > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                Active Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {alerts.length > 0 ? (
                alerts.map((alert) => {
                  const Icon = alert.icon;
                  return (
                    <div
                      key={alert.id}
                      className={`p-2 rounded-lg flex gap-2 items-start text-xs ${
                        alert.type === 'urgent'
                          ? 'bg-red-100'
                          : alert.type === 'warning'
                          ? 'bg-yellow-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                          alert.type === 'urgent'
                            ? 'text-red-600'
                            : alert.type === 'warning'
                            ? 'text-yellow-600'
                            : 'text-blue-600'
                        }`}
                      />
                      <div>
                        <p className="font-medium text-gray-900">{alert.title}</p>
                        <p className="text-gray-600">{alert.vehicle}</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">All systems operational</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
