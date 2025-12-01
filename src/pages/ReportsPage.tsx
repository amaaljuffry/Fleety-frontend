import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, TrendingUp, Calendar, Search, ArrowUpDown, Filter } from 'lucide-react';
import {
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { apiRequest } from '@/api/client';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/utils/currencyFormatter';

// Helper to format service type (e.g., oil_change -> Oil Change)
const formatServiceType = (serviceType?: string): string => {
  if (!serviceType) return 'Service';
  return serviceType
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface MaintenanceRecord {
  id: string;
  _id?: string;
  vehicle_id: string;
  vehicleId?: string;
  service_type: string;
  cost: number;
  date: string;
  completedDate?: string;
}

interface Vehicle {
  id: string;
  _id?: string;
  make: string;
  model: string;
  year: number;
}

interface SpendingByType {
  name: string;
  value: number;
}

interface SpendingByVehicle {
  name: string;
  value: number;
}

interface MonthlySpending {
  month: string;
  spending: number;
}

export function ReportsPage() {
  const location = useLocation();
  const { toast } = useToast();
  const [maintenance, setMaintenance] = useState<MaintenanceRecord[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [spendingByType, setSpendingByType] = useState<SpendingByType[]>([]);
  const [monthlySpending, setMonthlySpending] = useState<MonthlySpending[]>([]);
  const [spendingByVehicle, setSpendingByVehicle] = useState<SpendingByVehicle[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [avgCost, setAvgCost] = useState(0);
  const [currency, setCurrency] = useState<string>('USD');

  // Filter states
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [searchServiceType, setSearchServiceType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'spending' | 'alphabetical' | 'percentage'>('spending');
  const [selectedServiceType, setSelectedServiceType] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch currency preference
      try {
        const prefsRes = await apiRequest('/api/settings/preferences', { method: 'GET' });
        const data = prefsRes?.data ? prefsRes.data : prefsRes;
        if (data && data.preferences) {
          setCurrency(data.preferences.currency || 'USD');
        }
      } catch (error) {
        console.error('Error fetching preferences:', error);
      }

      // Fetch vehicles
      const vehiclesRes = await apiRequest('/api/vehicles', { method: 'GET' });
      const vehiclesList = Array.isArray(vehiclesRes) ? vehiclesRes : (vehiclesRes?.data || []);
      
      // Normalize vehicle IDs
      const normalizedVehicles = vehiclesList.map((v: Vehicle & { _id?: string }) => ({
        ...v,
        id: v.id || v._id || '',
      }));
      
      setVehicles(normalizedVehicles);

      // Fetch all maintenance records
      let allRecords: MaintenanceRecord[] = [];
      if (normalizedVehicles && normalizedVehicles.length > 0) {
        for (const vehicle of normalizedVehicles) {
          try {
            const mainRes = await apiRequest(`/api/maintenance/vehicle/${vehicle.id}`, {
              method: 'GET',
            });
            const mainList = Array.isArray(mainRes) ? mainRes : (mainRes?.data || []);
            if (mainList && mainList.length > 0) {
              allRecords = [...allRecords, ...mainList];
            }
          } catch (error) {
            console.error(`Error fetching maintenance for vehicle ${vehicle.id}:`, error);
          }
        }
      }
      setMaintenance(allRecords);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered data based on active filters
  const filteredData = useMemo(() => {
    let filtered = [...maintenance];

    // Filter by vehicle
    if (selectedVehicle !== 'all') {
      filtered = filtered.filter((m) => {
        const vehicleId = m.vehicleId || m.vehicle_id;
        return vehicleId === selectedVehicle;
      });
    }

    // Filter by service type
    if (selectedServiceType) {
      filtered = filtered.filter((m) => m.service_type === selectedServiceType);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((m) => new Date(m.completedDate || m.date) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((m) => new Date(m.completedDate || m.date) <= toDate);
    }

    return filtered;
  }, [maintenance, selectedVehicle, selectedServiceType, dateFrom, dateTo]);

  // Recalculate analytics based on filtered data
  const filteredAnalytics = useMemo(() => {
    const total = filteredData.reduce((sum, r) => sum + r.cost, 0);
    const avg = filteredData.length > 0 ? total / filteredData.length : 0;

    // Spending by service type (formatted)
    const byType: { [key: string]: number } = {};
    filteredData.forEach((r) => {
      const formattedType = formatServiceType(r.service_type);
      byType[formattedType] = (byType[formattedType] || 0) + r.cost;
    });

    let typeData = Object.entries(byType)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Apply sort
    if (sortBy === 'alphabetical') {
      typeData = typeData.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'percentage') {
      typeData = typeData.sort((a, b) => (b.value / total) - (a.value / total));
    }

    // Spending by vehicle
    const byVehicle: { [key: string]: number } = {};
    filteredData.forEach((r) => {
      const vehicle = vehicles.find((v) => (v._id || v.id) === (r.vehicleId || r.vehicle_id));
      const vehicleName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
      byVehicle[vehicleName] = (byVehicle[vehicleName] || 0) + r.cost;
    });

    const vehicleData = Object.entries(byVehicle)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Monthly spending
    const byMonth: { [key: string]: number } = {};
    filteredData.forEach((r) => {
      const date = new Date(r.completedDate || r.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      byMonth[monthKey] = (byMonth[monthKey] || 0) + r.cost;
    });

    const monthlyData = Object.entries(byMonth)
      .map(([month, spending]) => ({ month, spending }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12);

    return { total, avg, typeData, vehicleData, monthlyData };
  }, [filteredData, vehicles, sortBy]);

  // Filter table data by search
  const tableData = useMemo(() => {
    let filtered = [...filteredAnalytics.typeData];

    if (searchServiceType) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchServiceType.toLowerCase())
      );
    }

    return filtered;
  }, [filteredAnalytics.typeData, searchServiceType]);

  const resetFilters = () => {
    setSelectedVehicle('all');
    setSearchServiceType('');
    setDateFrom('');
    setDateTo('');
    setSortBy('spending');
    setSelectedServiceType(null);
  };

  const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-600 mt-1">Maintenance spending insights and trends</p>
          </div>
          <Button variant="outline" onClick={resetFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Reset Filters
          </Button>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(filteredAnalytics.total, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {filteredData.length} records
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Average Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(filteredAnalytics.avg, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-2">Per service</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Service Types</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">{filteredAnalytics.typeData.length}</p>
              <p className="text-xs text-gray-500 mt-2">Total unique types</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spending by Service Type - Pie Chart */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Spending by Service Type
              </CardTitle>
              <CardDescription>Distribution of maintenance costs</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.typeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={filteredAnalytics.typeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => {
                        const pct = ((value / filteredAnalytics.total) * 100).toFixed(0);
                        return `${name}: ${pct}%`;
                      }}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      onClick={(e) => setSelectedServiceType(e.name)}
                    >
                      {filteredAnalytics.typeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          style={{ cursor: 'pointer', opacity: selectedServiceType === entry.name ? 1 : 0.8 }}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number, currency), 'Cost']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <p className="font-medium">No data available</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Spending by Vehicle - Bar Chart */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Spending by Vehicle
              </CardTitle>
              <CardDescription>Maintenance costs per vehicle</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.vehicleData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={filteredAnalytics.vehicleData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number, currency), 'Cost']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <p className="font-medium">No data available</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Spending Trend - Line Chart */}
          <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-600" />
                Monthly Spending Trend
              </CardTitle>
              <CardDescription>Maintenance spending over time (Last 12 months)</CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalytics.monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={filteredAnalytics.monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value as number, currency), 'Spending']}
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="spending"
                      stroke="#8b5cf6"
                      dot={{ fill: '#8b5cf6', r: 5 }}
                      activeDot={{ r: 7 }}
                      name="Monthly Spending"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-gray-400">
                  <div className="text-center">
                    <p className="font-medium">No data available</p>
                    <p className="text-sm">Try adjusting your filters</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="border-amber-100 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base">Filters & Controls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Vehicle Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Vehicle</label>
                <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                  <SelectTrigger>
                    <SelectValue placeholder="All vehicles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All vehicles</SelectItem>
                    {vehicles.map((v) => (
                      <SelectItem key={v._id || v.id} value={v._id || v.id}>
                        {v.year} {v.make} {v.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">From Date</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">To Date</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="focus-visible:ring-blue-500"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
                <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spending">Spending (High to Low)</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Search Type</label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search service type..."
                    value={searchServiceType}
                    onChange={(e) => setSearchServiceType(e.target.value)}
                    className="pl-8 focus-visible:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Service Type Breakdown - DataTable */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Service Type Breakdown</span>
              <span className="text-sm font-normal text-gray-500">
                {selectedServiceType && `Filtered: ${selectedServiceType}`}
              </span>
            </CardTitle>
            <CardDescription>Detailed spending analysis by service type</CardDescription>
          </CardHeader>
          <CardContent>
            {tableData.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="font-semibold text-gray-900">Service Type</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">Total Spending</TableHead>
                      <TableHead className="text-right font-semibold text-gray-900">Percentage</TableHead>
                      <TableHead className="text-center font-semibold text-gray-900">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.map((item, index) => {
                      const percentage = ((item.value / filteredAnalytics.total) * 100).toFixed(1);
                      const isSelected = selectedServiceType === item.name;
                      return (
                        <TableRow
                          key={index}
                          className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                            isSelected ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                          }`}
                          onClick={() =>
                            setSelectedServiceType(isSelected ? null : item.name)
                          }
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: COLORS[filteredAnalytics.typeData.indexOf(item) % COLORS.length] }}
                              />
                              <span className="font-medium text-gray-900">{item.name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(item.value, currency)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm text-gray-600 font-medium w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedServiceType(isSelected ? null : item.name);
                              }}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              {isSelected ? 'Clear' : 'Filter'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <p className="font-medium text-gray-900">No service types found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {filteredData.length === 0 ? 'No maintenance records match your filters' : 'Try adjusting your search'}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Empty State */}
        {filteredData.length === 0 && maintenance.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <p className="text-center text-orange-900">
                No maintenance records match your current filters. Try adjusting your selection.
              </p>
            </CardContent>
          </Card>
        )}

        {maintenance.length === 0 && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">
                No maintenance records available yet. Start logging maintenance to see analytics.
              </p>
            </CardContent>
          </Card>
        )}
    </div>
  );
}
