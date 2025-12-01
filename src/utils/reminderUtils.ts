import { ServiceReminder, ReminderStatus, Vehicle } from '@/types/vehicle';

export function calculateReminderStatus(
  reminder: ServiceReminder,
  vehicle: Vehicle
): ReminderStatus {
  let status: ReminderStatus['status'] = 'ok';
  let message = '';
  let daysUntilDue: number | undefined;
  let milesUntilDue: number | undefined;

  const today = new Date();
  const currentMileage = vehicle.current_mileage || 0;
  
  // Check mileage-based reminders
  if (reminder.dueByMileage) {
    milesUntilDue = reminder.dueByMileage - currentMileage;
    const thresholdMiles = reminder.reminderThresholdMiles || 500;
    
    if (milesUntilDue <= 0) {
      status = 'overdue';
      message = `Overdue by ${Math.abs(milesUntilDue).toLocaleString()} miles`;
    } else if (milesUntilDue <= thresholdMiles) {
      status = 'due_soon';
      message = `Due in ${milesUntilDue.toLocaleString()} miles`;
    } else {
      status = 'upcoming';
      message = `Due at ${reminder.dueByMileage.toLocaleString()} miles`;
    }
  }
  
  // Check date-based reminders
  if (reminder.dueByDate) {
    const dueDate = new Date(reminder.dueByDate);
    const diffTime = dueDate.getTime() - today.getTime();
    daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const thresholdDays = reminder.reminderThresholdDays || 30;
    
    // Date takes priority if more urgent
    if (daysUntilDue <= 0) {
      if (status !== 'overdue' || !milesUntilDue || milesUntilDue > 0) {
        status = 'overdue';
        message = `Overdue by ${Math.abs(daysUntilDue)} days`;
      }
    } else if (daysUntilDue <= thresholdDays) {
      if (status !== 'overdue') {
        status = 'due_soon';
        const dateMessage = `Due in ${daysUntilDue} days (${dueDate.toLocaleDateString()})`;
        message = milesUntilDue ? `${message} or ${dateMessage}` : dateMessage;
      }
    } else if (!milesUntilDue) {
      message = `Due on ${dueDate.toLocaleDateString()}`;
    }
  }

  return {
    reminder,
    status,
    daysUntilDue,
    milesUntilDue,
    message,
  };
}

export function getActiveReminders(
  reminders: ServiceReminder[],
  vehicles: Vehicle[]
): ReminderStatus[] {
  const activeStatuses: ReminderStatus[] = [];
  
  console.log('getActiveReminders - reminders:', reminders);
  console.log('getActiveReminders - vehicles:', vehicles);

  reminders.forEach((reminder) => {
    console.log('Processing reminder:', reminder);
    
    if (!reminder.isActive) {
      console.log('Reminder is not active, skipping');
      return;
    }

    const vehicle = vehicles.find((v) => v.id === reminder.vehicleId);
    console.log('Looking for vehicle with id:', reminder.vehicleId, 'found:', vehicle);
    
    if (!vehicle) {
      console.log('Vehicle not found for reminder:', reminder.vehicleId);
      return;
    }

    const status = calculateReminderStatus(reminder, vehicle);
    console.log('Calculated status:', status);
    
    // Include all reminders (including 'ok' status)
    activeStatuses.push(status);
  });

  // Sort by urgency: overdue first, then due_soon, then upcoming, then ok
  return activeStatuses.sort((a, b) => {
    const statusOrder = { overdue: 0, due_soon: 1, upcoming: 2, ok: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });
}
