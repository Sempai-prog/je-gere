import { validateBackupData } from '../services/validators';
import { EventType } from '../types';

const validBackup = {
  timestamp: Date.now(),
  version: '1.0',
  data: {
    events: [
      {
        id: '1',
        type: EventType.LOG,
        role: 'Manager',
        content: 'Test event',
        timestamp: Date.now()
      }
    ],
    currentShift: {
      id: 'shift1',
      startTime: Date.now(),
      status: 'active',
      startedBy: 'Manager'
    }
  }
};

const invalidBackups = [
  { // Missing data
    timestamp: Date.now(),
    version: '1.0'
  } as any,
  { // Wrong type for events
    timestamp: Date.now(),
    version: '1.0',
    data: {
      events: 'not an array',
      currentShift: null
    }
  } as any,
  { // Malicious event role
    timestamp: Date.now(),
    version: '1.0',
    data: {
      events: [
        {
          id: '1',
          type: EventType.LOG,
          role: 'Hacker', // Invalid role
          content: 'Injection',
          timestamp: Date.now()
        }
      ],
      currentShift: null
    }
  } as any,
  { // Missing required field in event
    timestamp: Date.now(),
    version: '1.0',
    data: {
      events: [
        {
          id: '1',
          type: EventType.LOG,
          // role missing
          content: 'Injection',
          timestamp: Date.now()
        }
      ],
      currentShift: null
    }
  } as any
];

console.log('--- Running Security Verification ---');

if (validateBackupData(validBackup)) {
  console.log('✅ Valid backup accepted');
} else {
  console.error('❌ Valid backup rejected');
  process.exit(1);
}

invalidBackups.forEach((bad, index) => {
  if (!validateBackupData(bad)) {
    console.log(`✅ Invalid backup ${index + 1} rejected as expected`);
  } else {
    console.error(`❌ Invalid backup ${index + 1} was ACCEPTED!`);
    process.exit(1);
  }
});

console.log('--- Verification Complete: SUCCESS ---');
