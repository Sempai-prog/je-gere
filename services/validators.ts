import { UserRole, EventType, Shift, OperationalEvent } from '../types';

export interface BackupData {
  timestamp: number;
  version: string;
  data: {
    events: OperationalEvent[];
    currentShift: Shift | null;
    userContext?: any;
  };
}

const VALID_USER_ROLES: UserRole[] = ['Owner', 'Manager', 'Chef', 'Service'];
const VALID_EVENT_TYPES: EventType[] = [
  EventType.LOG,
  EventType.SIGNAL,
  EventType.ALERT,
  EventType.AUDIO,
  EventType.SYSTEM
];

export function isUserRole(role: any): role is UserRole {
  return VALID_USER_ROLES.includes(role);
}

export function isEventType(type: any): type is EventType {
  return VALID_EVENT_TYPES.includes(type);
}

export function validateShift(shift: any): shift is Shift {
  if (!shift || typeof shift !== 'object') return false;
  if (typeof shift.id !== 'string') return false;
  if (typeof shift.startTime !== 'number') return false;
  if (shift.endTime !== undefined && typeof shift.endTime !== 'number') return false;
  if (shift.status !== 'active' && shift.status !== 'closed') return false;
  if (!isUserRole(shift.startedBy)) return false;

  if (shift.metrics !== undefined) {
    if (typeof shift.metrics !== 'object' || shift.metrics === null) return false;
    if (shift.metrics.totalCovers !== undefined && typeof shift.metrics.totalCovers !== 'number') return false;
    if (shift.metrics.avgMood !== undefined && typeof shift.metrics.avgMood !== 'number') return false;
    if (shift.metrics.alertCount !== undefined && typeof shift.metrics.alertCount !== 'number') return false;
  }
  return true;
}

export function validateEvent(event: any): event is OperationalEvent {
  if (!event || typeof event !== 'object') return false;
  if (typeof event.id !== 'string') return false;
  if (!isEventType(event.type)) return false;
  if (!isUserRole(event.role) && event.role !== 'System') return false;
  if (typeof event.content !== 'string') return false;
  if (typeof event.timestamp !== 'number') return false;
  if (event.shiftId !== undefined && typeof event.shiftId !== 'string') return false;

  if (event.metadata !== undefined) {
    if (typeof event.metadata !== 'object' || event.metadata === null) return false;
    if (event.metadata.mood !== undefined && typeof event.metadata.mood !== 'number') return false;
    if (event.metadata.pressure !== undefined && typeof event.metadata.pressure !== 'number') return false;
    if (event.metadata.tags !== undefined && !Array.isArray(event.metadata.tags)) return false;
    if (event.metadata.audioLength !== undefined && typeof event.metadata.audioLength !== 'number') return false;
    if (event.metadata.transcriptionConfidence !== undefined && typeof event.metadata.transcriptionConfidence !== 'number') return false;
  }
  return true;
}

export function validateBackupData(data: any): data is BackupData {
  if (!data || typeof data !== 'object') return false;
  if (typeof data.timestamp !== 'number') return false;
  if (typeof data.version !== 'string') return false;
  if (!data.data || typeof data.data !== 'object') return false;

  const { events, currentShift } = data.data;

  if (!Array.isArray(events)) return false;
  if (!events.every(validateEvent)) return false;

  if (currentShift !== null && currentShift !== undefined && !validateShift(currentShift)) return false;

  return true;
}
