import { ReminderStatus, Vehicle } from '@/types/vehicle';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Calendar, Gauge, Clock, Edit, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReminderCardProps {
  reminderStatus: ReminderStatus;
  vehicle: Vehicle;
  compact?: boolean;
}

export const ReminderCard = ({ reminderStatus, vehicle, compact = false }: ReminderCardProps) => {
  const navigate = useNavigate();
  const { reminder, status, message } = reminderStatus;

  const statusConfig = {
    overdue: {
      icon: AlertCircle,
      badgeVariant: 'destructive' as const,
      iconColor: 'text-destructive',
      label: 'Overdue',
    },
    due_soon: {
      icon: Clock,
      badgeVariant: 'default' as const,
      iconColor: 'text-warning',
      label: 'Due Soon',
    },
    upcoming: {
      icon: Calendar,
      badgeVariant: 'secondary' as const,
      iconColor: 'text-info',
      label: 'Upcoming',
    },
    ok: {
      icon: CheckCircle,
      badgeVariant: 'outline' as const,
      iconColor: 'text-success',
      label: 'On Track',
    },
  };

  const config = statusConfig[status];
  const StatusIcon = config.icon;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 flex-1">
          <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{reminder.serviceType}</p>
            <p className="text-xs text-muted-foreground truncate">{message}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/vehicles/${vehicle.id}/reminders/${reminder.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${status === 'overdue' ? 'bg-destructive/10' : status === 'due_soon' ? 'bg-warning/10' : 'bg-info/10'}`}>
              <StatusIcon className={`h-5 w-5 ${config.iconColor}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{reminder.serviceType}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          <Badge variant={config.badgeVariant}>{config.label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm">{reminder.description}</p>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="h-4 w-4" />
          <span>{message}</span>
        </div>

        <div className="flex gap-2 pt-2">
          {reminder.dueByMileage && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Gauge className="h-3 w-3" />
              <span>Due: {reminder.dueByMileage.toLocaleString()} mi</span>
            </div>
          )}
          {reminder.dueByDate && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Due: {new Date(reminder.dueByDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => navigate(`/vehicles/${vehicle.id}/maintenance/new?reminderComplete=${reminder.id}`)}
          >
            Mark Complete
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/vehicles/${vehicle.id}/reminders/${reminder.id}/edit`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
