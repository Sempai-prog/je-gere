
export type UserRole = 'Owner' | 'Manager' | 'Chef' | 'Service';

export enum EventType {
  LOG = 'Log', // Text observation
  SIGNAL = 'Signal', // Quick metric (mood, pressure)
  ALERT = 'Alert', // Critical issue
  AUDIO = 'Audio', // Transcribed voice note
  SYSTEM = 'System' // Shift lifecycle events
}

export enum Sentiment {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  CRITICAL = 'critical'
}

export interface Shift {
  id: string;
  startTime: number;
  endTime?: number;
  status: 'active' | 'closed';
  startedBy: UserRole;
  metrics?: {
    totalCovers?: number;
    avgMood?: number;
    alertCount?: number;
  };
}

export interface OperationalEvent {
  id: string;
  type: EventType;
  role: UserRole | 'System';
  content: string;
  timestamp: number;
  shiftId?: string; // Link event to specific shift
  metadata?: {
    mood?: number; // 1-10
    pressure?: number; // 1-10
    tags?: string[];
    audioLength?: number;
    transcriptionConfidence?: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isStreaming?: boolean;
}

// --- PHASE 2: IDENTITY MODELS ---

export interface UserStats {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number; // +15% or -5%
  status: 'good' | 'warning' | 'neutral';
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  email: string;
  joinedAt: number;
  stats: UserStats[];
}

export type ViewState = 'dashboard' | 'timeline' | 'inputs' | 'assistant' | 'profile' | 'archive' | 'settings';
