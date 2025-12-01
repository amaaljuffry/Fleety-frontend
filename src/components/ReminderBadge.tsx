import { ReminderStatus } from '@/types/vehicle';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Clock } from 'lucide-react';

interface ReminderBadgeProps {
  reminderStatuses: ReminderStatus[];
}

export const ReminderBadge = ({ reminderStatuses }: ReminderBadgeProps) => {
  const overdueCount = reminderStatuses.filter(rs => rs.status === 'overdue').length;
  const dueSoonCount = reminderStatuses.filter(rs => rs.status === 'due_soon').length;

  if (overdueCount === 0 && dueSoonCount === 0) {
    return null;
  }

  return (
    <div className="flex gap-2">
      {overdueCount > 0 && (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          {overdueCount} Overdue
        </Badge>
      )}
      {dueSoonCount > 0 && (
        <Badge className="gap-1 bg-warning text-warning-foreground">
          <Clock className="h-3 w-3" />
          {dueSoonCount} Due Soon
        </Badge>
      )}
    </div>
  );
};
