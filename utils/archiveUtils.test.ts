import { describe, it, expect } from 'bun:test';
import { reconstructShifts, ArchiveShift } from './archiveUtils';
import { EventType, OperationalEvent, UserRole } from '../types';

describe('reconstructShifts', () => {
  const baseEvent: OperationalEvent = {
    id: 'ev-1',
    type: EventType.LOG,
    role: 'System',
    content: 'log',
    timestamp: 1000
  };

  it('should return empty array for empty events', () => {
    const shifts = reconstructShifts([]);
    expect(shifts).toEqual([]);
  });

  it('should reconstruct a completed shift', () => {
    const events: OperationalEvent[] = [
      { ...baseEvent, id: '1', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 1000 },
      { ...baseEvent, id: '2', type: EventType.LOG, role: 'Chef', content: 'Cooking', timestamp: 1500 },
      { ...baseEvent, id: '3', type: EventType.SYSTEM, content: 'Shift closed', timestamp: 2000 }
    ];

    const shifts = reconstructShifts(events);
    expect(shifts).toHaveLength(1);
    const shift = shifts[0];
    expect(shift.id).toBe('1');
    expect(shift.startTime).toBe(1000);
    expect(shift.endTime).toBe(2000);
    expect(shift.duration).toBe(1000);
    expect(shift.isActive).toBeUndefined();
    expect(shift.roles.has('Chef')).toBe(true);
    expect(shift.roles.has('System')).toBe(true);
    expect(shift.events).toHaveLength(3);
  });

  it('should reconstruct an active shift', () => {
    const events: OperationalEvent[] = [
      { ...baseEvent, id: '1', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 1000 },
      { ...baseEvent, id: '2', type: EventType.LOG, role: 'Chef', content: 'Cooking', timestamp: 1500 }
    ];

    const shifts = reconstructShifts(events);
    expect(shifts).toHaveLength(1);
    const shift = shifts[0];
    expect(shift.isActive).toBe(true);
    expect(shift.endTime).toBeGreaterThan(1500); // Should be roughly Date.now()
    expect(shift.avgPressure).toBe('Actif');
  });

  it('should handle multiple shifts correctly', () => {
    const events: OperationalEvent[] = [
      // Shift 1
      { ...baseEvent, id: '1', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 1000 },
      { ...baseEvent, id: '2', type: EventType.SYSTEM, content: 'Shift closed', timestamp: 2000 },
      // Shift 2
      { ...baseEvent, id: '3', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 3000 },
      { ...baseEvent, id: '4', type: EventType.SYSTEM, content: 'Shift closed', timestamp: 4000 }
    ];

    const shifts = reconstructShifts(events);
    expect(shifts).toHaveLength(2);
    // Should be reversed (newest first)
    expect(shifts[0].id).toBe('3');
    expect(shifts[1].id).toBe('1');
  });

  it('should calculate average pressure correctly', () => {
    const events: OperationalEvent[] = [
      { ...baseEvent, id: '1', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 1000 },
      { ...baseEvent, id: '2', type: EventType.LOG, metadata: { pressure: 5 }, timestamp: 1200 },
      { ...baseEvent, id: '3', type: EventType.LOG, metadata: { pressure: 7 }, timestamp: 1400 },
      { ...baseEvent, id: '4', type: EventType.SYSTEM, content: 'Shift closed', timestamp: 2000 }
    ];

    const shifts = reconstructShifts(events);
    expect(shifts[0].avgPressure).toBe('6.0'); // (5+7)/2
    expect(shifts[0].pressurePeaks).toEqual([5, 7]);
  });

  it('should ignore events outside of a shift', () => {
      const events: OperationalEvent[] = [
          { ...baseEvent, id: '0', type: EventType.LOG, content: 'Before shift', timestamp: 500 },
          { ...baseEvent, id: '1', type: EventType.SYSTEM, content: 'Shift initialized', timestamp: 1000 },
          { ...baseEvent, id: '2', type: EventType.SYSTEM, content: 'Shift closed', timestamp: 2000 },
          { ...baseEvent, id: '3', type: EventType.LOG, content: 'After shift', timestamp: 2500 }
      ];

      const shifts = reconstructShifts(events);
      expect(shifts).toHaveLength(1);
      expect(shifts[0].events).toHaveLength(2); // Only start and end events inside
      // Wait, 'Before shift' is before start, should be ignored.
      // 'After shift' is after end, should be ignored if not starting new shift.
  });
});
