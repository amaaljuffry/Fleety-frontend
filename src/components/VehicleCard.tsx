import { Car, Calendar, Gauge } from 'lucide-react';
import { Vehicle, ServiceReminder } from '@/types/vehicle';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ReminderBadge } from '@/components/ReminderBadge';
import { mockServiceReminders } from '@/data/mockData';
import { getActiveReminders } from '@/utils/reminderUtils';
import { useNavigate } from 'react-router-dom';

interface VehicleCardProps {
  vehicle: Vehicle;
}

export const VehicleCard = ({ vehicle }: VehicleCardProps) => {
  const navigate = useNavigate();
  
  const vehicleReminders = mockServiceReminders.filter(r => r.vehicleId === vehicle.id);
  const reminderStatuses = getActiveReminders(vehicleReminders, [vehicle]);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/vehicles/${vehicle.id}`)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </CardTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {vehicle.license_plate && (
                  <Badge variant="secondary">
                    {vehicle.license_plate}
                  </Badge>
                )}
                <ReminderBadge reminderStatuses={reminderStatuses} />
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Gauge className="h-4 w-4" />
          <span className="text-sm">{vehicle.current_mileage.toLocaleString()} miles</span>
        </div>
        {vehicle.color && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: vehicle.color.toLowerCase() }} />
            <span className="text-sm">{vehicle.color}</span>
          </div>
        )}
        {vehicle.vin && (
          <div className="text-xs text-muted-foreground">
            VIN: {vehicle.vin}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <Button 
          className="flex-1" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vehicles/${vehicle.id}`);
          }}
        >
          View Details
        </Button>
        <Button 
          variant="outline" 
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/vehicles/${vehicle.id}/maintenance/new`);
          }}
        >
          Add Service
        </Button>
      </CardFooter>
    </Card>
  );
};
