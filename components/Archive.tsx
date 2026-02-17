
import React, { useMemo, useState } from 'react';
import { Clock, AlertTriangle, Activity, History, Filter, PlayCircle } from 'lucide-react';
import { OperationalEvent, Shift, EventType, UserRole } from '../types';

interface ArchiveProps {
  events: OperationalEvent[];
  userRole: UserRole;
  onReplay: (shiftId: string) => void;
}

// Helper for duration formatting
const formatDuration = (ms: number) => {
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
};

export const ArchiveView: React.FC<ArchiveProps> = ({ events, userRole, onReplay }) => {
  const [filterRole, setFilterRole] = useState<UserRole | 'All'>(
    ['Owner', 'Manager'].includes(userRole) ? 'All' : userRole
  );
  
  // 1. INTELLIGENT SHIFT RECONSTRUCTION
  // Aggregates raw events into logical Shift objects based on SYSTEM triggers.
  const shiftsData = useMemo(() => {
    const shifts: any[] = [];
    let currentShift: any = null;

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
          roles: new Set()
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
  }, [events]);

  const filteredShifts = useMemo(() => {
    if (filterRole === 'All') return shiftsData;
    return shiftsData.filter(shift => shift.roles.has(filterRole));
  }, [shiftsData, filterRole]);

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col pb-10">
       <header className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Archives</h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
              <History size={16} /> Historique des Services ({filteredShifts.length})
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
             <div className="px-3 text-xs font-bold text-slate-400 flex items-center gap-2">
               <Filter size={12} /> FILTRER
             </div>
             {(['All', 'Chef', 'Service', 'Manager'] as const).map(role => (
               <button
                 key={role}
                 onClick={() => setFilterRole(role as any)}
                 className={`
                   px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                   ${filterRole === role 
                     ? 'bg-indigo-500 text-white shadow-md' 
                     : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}
                 `}
               >
                 {role === 'All' ? 'Tout' : role}
               </button>
             ))}
          </div>
       </header>

       <div className="grid grid-cols-1 gap-6 overflow-y-auto pr-2 pb-20">
          {filteredShifts.length === 0 && (
             <div className="text-center py-20 text-slate-500 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800">
               <Activity size={48} className="mx-auto mb-4 opacity-20"/>
               <p>Aucun service archivé pour <span className="font-bold">{filterRole}</span>.</p>
               <p className="text-xs mt-2">Essayez d'ajuster le filtre ou terminez plus de services.</p>
             </div>
          )}

          {filteredShifts.map((shift, idx) => (
            <div 
              key={shift.id} 
              className={`
                group relative bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 animate-in slide-in-from-bottom-4 fill-mode-forwards
                ${shift.isActive ? 'border-emerald-500/50 shadow-emerald-500/10' : ''}
              `}
              style={{ animationDelay: `${idx * 100}ms` }}
            >
               {shift.isActive && (
                 <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-3xl uppercase tracking-wider flex items-center gap-1">
                   <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"/> En Direct
                 </div>
               )}

               <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  
                  {/* DATE & TIME */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
                       <span className="text-xs font-bold uppercase">{new Date(shift.startTime).toLocaleDateString('fr-FR', { month: 'short' })}</span>
                       <span className="text-2xl font-bold text-slate-900 dark:text-white">{new Date(shift.startTime).getDate()}</span>
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                         Service du {new Date(shift.startTime).toLocaleDateString('fr-FR', { weekday: 'long' })}
                       </h3>
                       <div className="flex items-center gap-3 text-sm text-slate-500 mt-1">
                         <span className="flex items-center gap-1"><Clock size={14}/> {new Date(shift.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {shift.isActive ? '...' : new Date(shift.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                         <span className="w-1 h-1 bg-slate-400 rounded-full"/>
                         <span>{formatDuration(shift.duration)}</span>
                       </div>
                    </div>
                  </div>

                  {/* METRICS GRID (LOCAL STATS) */}
                  <div className="flex-1 w-full md:w-auto grid grid-cols-3 gap-2">
                     <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Alertes</span>
                        <div className={`text-xl font-bold flex items-center gap-1 ${shift.alerts > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {shift.alerts > 0 && <AlertTriangle size={14}/>} {shift.alerts}
                        </div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Pression Moy.</span>
                        <div className="text-xl font-bold text-brand-500">{shift.avgPressure}</div>
                     </div>
                     <div className="bg-slate-50 dark:bg-slate-950/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center">
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Événements</span>
                        <div className="text-xl font-bold text-slate-700 dark:text-slate-300">{shift.events.length}</div>
                     </div>
                  </div>

                  {/* ACTION */}
                  <button 
                    onClick={() => onReplay(shift.id)}
                    className="hidden md:flex w-12 h-12 rounded-full border border-slate-200 dark:border-slate-700 items-center justify-center text-slate-400 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 hover:scale-110 active:scale-95 transition-all shadow-lg shadow-indigo-500/0 hover:shadow-indigo-500/30"
                    title="Entrer en Mode Replay"
                  >
                    <PlayCircle size={24} />
                  </button>
               </div>

               {/* ROLES INVOLVED TAGS */}
               <div className="mt-4 flex gap-2">
                 {Array.from(shift.roles as Set<string>).map((role) => (
                   <span key={role} className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md ${role === filterRole ? 'bg-indigo-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                     {role}
                   </span>
                 ))}
               </div>
            </div>
          ))}
       </div>
    </div>
  );
};
