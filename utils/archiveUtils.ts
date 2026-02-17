import { EventType, OperationalEvent, UserRole } from '../types';

export interface ArchiveShift {
  id: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  startEvent: OperationalEvent;
  events: OperationalEvent[];
  alerts: number;
  pressurePeaks: number[];
  roles: Set<UserRole | 'System'>;
  avgPressure: string;
  isActive?: boolean;
}

export function reconstructShifts(events: OperationalEvent[]): ArchiveShift[] {
  const shifts: ArchiveShift[] = [];
  let currentShift: ArchiveShift | null = null;

  // Sort chronologically for processing
  const sortedEvents = [...events].sort((a, b) => a.timestamp - b.timestamp);

  sortedEvents.forEach(ev => {
    // Detect Shift Start
    if (ev.type === EventType.SYSTEM && ev.content.includes('initialized')) {
      currentShift = {
        id: ev.shiftId || ev.id,
        startTime: ev.timestamp,
        startEvent: ev,
        events: [],
        alerts: 0,
        pressurePeaks: [] as number[],
        roles: new Set(),
        avgPressure: 'N/A'
      };
    }

    // Accumulate data if inside a shift
    if (currentShift) {
      currentShift.events.push(ev);
      currentShift.roles.add(ev.role);

      if (ev.type === EventType.ALERT) currentShift.alerts++;
      if (ev.metadata?.pressure) currentShift.pressurePeaks.push(ev.metadata.pressure);

      // Detect Shift End
      if (ev.type === EventType.SYSTEM && ev.content.includes('closed')) {
        currentShift.endTime = ev.timestamp;
        currentShift.duration = ev.timestamp - currentShift.startTime;
        // Calculate Final Stats
        currentShift.avgPressure = currentShift.pressurePeaks.length
          ? (currentShift.pressurePeaks.reduce((a:number, b:number) => a + b, 0) / currentShift.pressurePeaks.length).toFixed(1)
          : 'N/A';

        shifts.push(currentShift);
        currentShift = null; // Reset
      }
    }
  });

  // Handle Active Shift (Started but not closed)
  if (currentShift) {
    currentShift.endTime = Date.now();
    currentShift.duration = Date.now() - currentShift.startTime;
    currentShift.isActive = true;
    // Snapshot current stats
    currentShift.avgPressure = currentShift.pressurePeaks.length
      ? (currentShift.pressurePeaks.reduce((a:number, b:number) => a + b, 0) / currentShift.pressurePeaks.length).toFixed(1)
      : 'Actif';
    shifts.push(currentShift);
  }

  return shifts.reverse(); // Newest first
}
