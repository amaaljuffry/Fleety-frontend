import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, RefreshCw, Loader2, Car, Zap, Clock, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '@/api/client';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface Vehicle {
  _id?: string;
  id?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate?: string;
  current_mileage?: number;
  user_id?: string;
}

interface VehicleLocation {
  vehicleId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  speed?: number;
  heading?: number;
  address?: string;
  batteryLevel?: number;
  lastUpdated: string;
}

// Dummy location data for vehicles
const DUMMY_VEHICLE_LOCATIONS: Record<string, VehicleLocation> = {
  '1': { vehicleId: '1', latitude: 40.7128, longitude: -74.0060, address: 'New York, NY', timestamp: new Date().toISOString(), speed: 45, heading: 90, batteryLevel: 85, lastUpdated: new Date().toISOString() },
  '2': { vehicleId: '2', latitude: 34.0522, longitude: -118.2437, address: 'Los Angeles, CA', timestamp: new Date().toISOString(), speed: 35, heading: 180, batteryLevel: 92, lastUpdated: new Date().toISOString() },
  '3': { vehicleId: '3', latitude: 41.8781, longitude: -87.6298, address: 'Chicago, IL', timestamp: new Date().toISOString(), speed: 55, heading: 270, batteryLevel: 78, lastUpdated: new Date().toISOString() },
  '4': { vehicleId: '4', latitude: 29.7604, longitude: -95.3698, address: 'Houston, TX', timestamp: new Date().toISOString(), speed: 40, heading: 0, batteryLevel: 88, lastUpdated: new Date().toISOString() },
  '5': { vehicleId: '5', latitude: 33.7490, longitude: -84.3880, address: 'Atlanta, GA', timestamp: new Date().toISOString(), speed: 50, heading: 45, batteryLevel: 81, lastUpdated: new Date().toISOString() },
  '6': { vehicleId: '6', latitude: 47.6062, longitude: -122.3321, address: 'Seattle, WA', timestamp: new Date().toISOString(), speed: 30, heading: 135, batteryLevel: 90, lastUpdated: new Date().toISOString() },
};

// Create custom vehicle marker icon
const createVehicleIcon = (color: string = '#2563eb') => {
  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -10],
    className: 'vehicle-marker'
  });
};

const MapComponent = ({ 
  location, 
  vehicle 
}: { 
  location: VehicleLocation | null;
  vehicle: Vehicle | null;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!location || !containerRef.current) return;

    // Initialize map only once
    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current).setView(
        [location.latitude, location.longitude],
        15
      );

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: ' &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    } else {
      // Update view for existing map
      mapRef.current.setView([location.latitude, location.longitude], 15);
    }

    // Add or update marker
    if (markerRef.current) {
      markerRef.current.setLatLng([location.latitude, location.longitude]);
    } else {
      markerRef.current = L.marker(
        [location.latitude, location.longitude],
        { icon: createVehicleIcon('#2563eb') }
      ).addTo(mapRef.current!);

      markerRef.current.bindPopup(`
        <div class="text-sm">
          <p class="font-bold">${vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Vehicle'}</p>
          <p class="text-xs text-gray-600 mt-1">${location.address || 'Location not available'}</p>
        </div>
      `);
    }

    return () => {
      // Cleanup on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [location, vehicle]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};

const LiveTracking = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleLocations, setVehicleLocations] = useState<Record<string, VehicleLocation>>({});
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const navigate = useNavigate();

  // Fetch vehicles and their locations
  const fetchTrackingData = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);

      // Fetch vehicles
      const vehiclesResponse = await apiRequest('/api/vehicles');
      const vehiclesList = Array.isArray(vehiclesResponse) ? vehiclesResponse : (vehiclesResponse?.data || []);
      
      // Normalize vehicle IDs
      const normalizedVehicles = vehiclesList.map((v: Vehicle & { _id?: string }) => ({
        ...v,
        id: v.id || v._id || '',
      }));
      
      setVehicles(normalizedVehicles);

      // Use dummy vehicle locations
      const locationsMap: Record<string, VehicleLocation> = {};
      normalizedVehicles.forEach((vehicle, index) => {
        const vehicleId = vehicle.id || String(index + 1);
        if (DUMMY_VEHICLE_LOCATIONS[vehicleId]) {
          locationsMap[vehicleId] = {
            ...DUMMY_VEHICLE_LOCATIONS[vehicleId],
            timestamp: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
        } else {
          // Fallback to cycling through dummy locations
          const locations = Object.values(DUMMY_VEHICLE_LOCATIONS);
          locationsMap[vehicleId] = {
            ...locations[index % locations.length],
            timestamp: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          };
        }
      });
      
      setVehicleLocations(locationsMap);
      
      // Auto-select first vehicle if none selected
      if (normalizedVehicles?.length > 0 && !selectedVehicle) {
        setSelectedVehicle(normalizedVehicles[0].id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tracking data';
      setError(errorMessage);
      console.error('Live tracking fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTrackingData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setRefreshing(true);
      fetchTrackingData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTrackingData();
  };

  const getVehicleStatus = (vehicleId: string) => {
    const location = vehicleLocations[vehicleId];
    if (!location) return 'offline';
    
    const lastUpdate = new Date(location.timestamp);
    const now = new Date();
    const minutesAgo = (now.getTime() - lastUpdate.getTime()) / (1000 * 60);
    
    if (minutesAgo > 10) return 'offline';
    if (minutesAgo > 2) return 'idle';
    return 'active';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading live tracking data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Live Tracking</h1>
            <p className="text-muted-foreground">
              Real-time location and status of your vehicles
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${autoRefresh ? 'bg-green-500' : 'bg-gray-300'}`} />
              Auto-refresh
            </Button>
            <Button size="lg" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-5 w-5 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Vehicles List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Vehicles</CardTitle>
                <CardDescription>
                  {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vehicles.map((vehicle) => {
                    const vehicleId = vehicle.id || vehicle._id;
                    const location = vehicleLocations[vehicleId!];
                    const status = getVehicleStatus(vehicleId!);
                    
                    return (
                      <Card 
                        key={vehicleId}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedVehicle === vehicleId ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedVehicle(vehicleId!)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative">
                                <Car className="h-8 w-8 text-muted-foreground" />
                                <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(status)}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-foreground">
                                  {vehicle.year} {vehicle.make} {vehicle.model}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                  {vehicle.license_plate || 'No plate'}
                                </p>
                              </div>
                            </div>
                            <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                              {status}
                            </Badge>
                          </div>
                          
                          {location && (
                            <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                <span className="truncate">
                                  {location.address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Last update: {formatLastSeen(location.timestamp)}</span>
                                {location.speed && (
                                  <span>{Math.round(location.speed)} km/h</span>
                                )}
                              </div>
                              {location.batteryLevel && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      location.batteryLevel > 20 ? 'bg-green-500' : 'bg-red-500'
                                    }`}
                                    style={{ width: `${location.batteryLevel}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {!location && (
                            <div className="mt-3 text-sm text-muted-foreground">
                              No location data available
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map View */}
          <div className="lg:col-span-2">
            <Card className="h-full flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vehicle Location Map</CardTitle>
                    <CardDescription>
                      {selectedVehicle ? (
                        (() => {
                          const vehicle = vehicles.find(v => (v.id || v._id) === selectedVehicle);
                          const location = vehicleLocations[selectedVehicle];
                          return location ? (
                            `Last updated ${formatLastSeen(location.timestamp)}`
                          ) : (
                            `${vehicle?.year} ${vehicle?.make} ${vehicle?.model} - No location data`
                          );
                        })()
                      ) : (
                        'Select a vehicle to view location on map'
                      )}
                    </CardDescription>
                  </div>
                  {selectedVehicle && vehicleLocations[selectedVehicle] && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const location = vehicleLocations[selectedVehicle];
                        if (location) {
                          const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
                          window.open(mapsUrl, '_blank');
                        }
                      }}
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-0">
                {selectedVehicle && vehicleLocations[selectedVehicle] ? (
                  <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-200">
                    <MapComponent 
                      location={vehicleLocations[selectedVehicle]}
                      vehicle={vehicles.find(v => (v.id || v._id) === selectedVehicle) || null}
                    />
                  </div>
                ) : (
                  <div className="w-full h-96 rounded-lg bg-muted flex items-center justify-center">
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {selectedVehicle ? 'No location data available' : 'Select a vehicle to view on map'}
                      </p>
                      {selectedVehicle && (
                        <p className="text-sm text-muted-foreground mt-2">
                          This vehicle may be offline or not equipped with tracking
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Tracking Info */}
                {selectedVehicle && vehicleLocations[selectedVehicle] && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 p-4">
                    <Card>
                      <CardContent className="p-3 text-center">
                        <div className="flex items-center justify-center mb-2">
                          {getVehicleStatus(selectedVehicle) === 'active' ? (
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                          ) : getVehicleStatus(selectedVehicle) === 'idle' ? (
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-500" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="font-semibold text-sm capitalize">{getVehicleStatus(selectedVehicle)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Clock className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Last Update</p>
                        <p className="font-semibold text-sm">{formatLastSeen(vehicleLocations[selectedVehicle].timestamp)}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Zap className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Speed</p>
                        <p className="font-semibold text-sm">
                          {vehicleLocations[selectedVehicle].speed 
                            ? `${Math.round(vehicleLocations[selectedVehicle].speed!)} km/h`
                            : 'N/A'
                          }
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-3 text-center">
                        <Compass className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-muted-foreground">Heading</p>
                        <p className="font-semibold text-sm">
                          {vehicleLocations[selectedVehicle].heading 
                            ? `${vehicleLocations[selectedVehicle].heading}°`
                            : 'N/A'
                          }
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;