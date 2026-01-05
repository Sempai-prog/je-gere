
import React, { useState, useEffect } from 'react';
import { Clock, Radio, FileText, AlertTriangle, Mic, Zap, CheckCircle2 } from 'lucide-react';
import { OperationalEvent, EventType } from '../types';

interface EventTimelineProps {
  events: OperationalEvent[];
}

export const EventTimeline: React.FC<EventTimelineProps> = ({ events }) => {
  // Force re-render every minute to update relative times
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const getRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return 'Just now';
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const getIcon = (type: EventType) => {
    switch (type) {
      case EventType.ALERT: return <AlertTriangle size={18} className="text-rose-500" />;
      case EventType.SIGNAL: return <Radio size={18} className="text-brand-500" />;
      case EventType.AUDIO: return <Mic size={18} className="text-indigo-500" />;
      case EventType.SYSTEM: return <Zap size={18} className="text-amber-500" />;
      case EventType.LOG: return <FileText size={18} className="text-emerald-500" />;
      default: return <FileText size={18} className="text-slate-400" />;
    }
  };

  const getCardStyle = (type: EventType) => {
    const base = "backdrop-blur-md border shadow-lg transition-all duration-300 hover:scale-[1.01]";
    
    switch (type) {
      case EventType.ALERT: 
        return `${base} bg-rose-500/10 border-rose-500/30 hover:shadow-rose-500/20`;
      case EventType.SYSTEM: 
        return `${base} bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40`;
      case EventType.AUDIO:
        return `${base} bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40`;
      default: 
        return `${base} bg-white/40 dark:bg-slate-900/40 border-white/40 dark:border-slate-700/50 hover:border-slate-400/50`;
    }
  };

  return (
    <div className="h-full flex flex-col pb-6">
       <header className="mb-6 animate-in fade-in slide-in-from-top-4 duration-700 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Timeline</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">Reality Feed • {events.length} Events</p>
          </div>
          <div className="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
            LIVE SYNC
          </div>
       </header>

       <div className="flex-1 overflow-y-auto pr-2 relative space-y-6 pb-20">
          {/* Continuous Timeline Line */}
          <div className="absolute left-[27px] top-4 bottom-0 w-[2px] bg-gradient-to-b from-slate-200 via-slate-300 to-transparent dark:from-slate-800 dark:via-slate-700 dark:to-transparent z-0" />

          {events.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 opacity-50 animate-in fade-in duration-1000">
              <Clock size={48} className="text-slate-300 mb-4" />
              <p className="text-slate-500">Waiting for shift activity...</p>
            </div>
          )}

          {[...events].reverse().map((event, idx) => (
            <div 
              key={event.id} 
              className="relative z-10 flex gap-4 group animate-in slide-in-from-bottom-8 fade-in fill-mode-forwards"
              style={{ animationDuration: '500ms', animationDelay: `${idx * 50}ms` }}
            >
               {/* Time Anchor */}
               <div className="w-14 flex-shrink-0 flex flex-col items-center pt-1">
                  <div className="text-[10px] font-bold text-slate-400 mb-1 opacity-70 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {getRelativeTime(event.timestamp)}
                  </div>
                  <div className={`
                    w-4 h-4 rounded-full border-[3px] shadow-sm z-10 transition-all duration-300
                    ${event.type === EventType.ALERT ? 'bg-rose-500 border-white dark:border-slate-900 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-600 group-hover:border-indigo-500 group-hover:scale-110'}
                  `}></div>
               </div>

               {/* Glass Card */}
               <div className={`flex-1 p-5 rounded-2xl ${getCardStyle(event.type)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`
                        text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border
                        ${event.role === 'System' ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-transparent'}
                      `}>
                        {event.role}
                      </span>
                      {event.type === EventType.AUDIO && (
                        <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Mic size={10} /> Voice
                        </span>
                      )}
                    </div>
                    <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                      {getIcon(event.type)}
                    </div>
                  </div>
                  
                  <p className="text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-medium">
                    {event.content}
                  </p>

                  {/* Metadata Tags */}
                  {(event.metadata?.mood || event.metadata?.pressure || event.metadata?.tags) && (
                    <div className="mt-3 flex flex-wrap gap-2 pt-3 border-t border-slate-200/20 dark:border-slate-700/20">
                       {event.metadata.mood && (
                         <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
                           Mood: {event.metadata.mood}/10
                         </span>
                       )}
                       {event.metadata.pressure && (
                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${event.metadata.pressure > 7 ? 'bg-rose-500/10 text-rose-500 border-rose-500/10' : 'bg-brand-500/10 text-brand-600 border-brand-500/10'}`}>
                           Pressure: {event.metadata.pressure}/10
                         </span>
                       )}
                       {event.metadata.tags?.map(tag => (
                         <span key={tag} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                           #{tag}
                         </span>
                       ))}
                    </div>
                  )}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};
