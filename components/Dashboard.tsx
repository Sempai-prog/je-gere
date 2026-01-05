
import React from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, AlertTriangle, TrendingUp, Activity, Thermometer, Play, Zap, Lock } from 'lucide-react';
import { OperationalEvent, EventType, Shift, UserRole } from '../types';

interface DashboardProps {
  events: OperationalEvent[];
  currentShift: Shift | null;
  onToggleService: () => void;
  userRole: UserRole; // <-- NOUVEAU PROP
}

export const Dashboard: React.FC<DashboardProps> = ({ events, currentShift, onToggleService, userRole }) => {
  const isServiceActive = currentShift?.status === 'active';
  
  // Filtrage contextuel
  const relevantEvents = isServiceActive 
    ? events.filter(e => e.shiftId === currentShift?.id)
    : events;

  const alerts = relevantEvents.filter(e => e.type === EventType.ALERT).length;
  
  // Calcul Métriques
  const moodSignals = relevantEvents.filter(e => e.metadata?.mood !== undefined);
  const avgMood = moodSignals.length > 0 
    ? Math.round(moodSignals.reduce((acc, curr) => acc + (curr.metadata?.mood || 0), 0) / moodSignals.length) 
    : 8;

  const paceData = [
    { time: '18:00', covers: 12 }, { time: '18:30', covers: 25 },
    { time: '19:00', covers: 35 }, { time: '19:30', covers: 55 },
    { time: '20:00', covers: 85 }, { time: '20:30', covers: 92 },
    { time: '21:00', covers: 60 }, { time: '21:30', covers: 45 },
    { time: '22:00', covers: 24 },
  ];

  // LOGIQUE DE PERMISSION (Access Control)
  const canViewFinancials = ['Owner', 'Manager'].includes(userRole);
  const canViewKitchenPressure = ['Chef', 'Manager', 'Owner'].includes(userRole);

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Live Service</h2>
          <div className="flex items-center gap-2">
             <p className="text-slate-500 dark:text-slate-400 font-medium">Operational Dashboard</p>
             <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-500 font-mono uppercase">
               VIEW: {userRole}
             </span>
          </div>
        </div>
        
        {/* Service Toggle (Accessible only to Manager/Owner/Chef) */}
        {['Manager', 'Owner', 'Chef'].includes(userRole) && (
          <button 
            onClick={onToggleService}
            className={`
              relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-sm font-bold border transition-all duration-300 shadow-xl w-full md:w-auto
              ${isServiceActive 
                ? 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/20 active:scale-95' 
                : 'bg-slate-900 dark:bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-slate-600 active:scale-95'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
            {isServiceActive ? <><Activity size={18} className="animate-pulse"/><span>Service Active</span></> : <><Play size={18}/><span>Start Service</span></>}
          </button>
        )}
      </header>

      {!isServiceActive && (
        <div className="bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex items-center justify-center text-slate-500 text-sm mb-4 animate-in fade-in zoom-in duration-500">
          <span>Service is currently closed. Dashboard is in review mode.</span>
        </div>
      )}

      {/* GRID */}
      <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 md:auto-rows-[240px] transition-all duration-700 ${!isServiceActive ? 'opacity-60 grayscale-[0.8] blur-[1px] pointer-events-none' : ''}`}>
        
        {/* WIDGET 1: SERVICE PACE (Financials/Volume) */}
        <div className="md:col-span-2 md:row-span-2 bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-2xl shadow-slate-900/5 flex flex-col justify-between relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards" style={{animationDelay: '100ms'}}>
          
          {canViewFinancials ? (
            <>
              <div className="flex justify-between items-start mb-4 z-10">
                <div>
                  <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Service Pace</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                     <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">216</div>
                     <span className="text-sm font-medium text-slate-500">covers</span>
                  </div>
                </div>
                <div className="p-3 bg-brand-500/10 rounded-2xl text-brand-600 dark:text-brand-400">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="w-full flex-1 min-h-[250px] -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={paceData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorCovers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }} itemStyle={{ color: '#818cf8' }} cursor={{ stroke: '#6366f1', strokeWidth: 2 }} />
                    <Area type="monotone" dataKey="covers" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorCovers)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 dark:bg-slate-900/80 backdrop-blur-sm z-20">
               <div className="p-4 bg-slate-200 dark:bg-slate-800 rounded-full mb-4 shadow-inner"><Lock size={32} className="text-slate-400"/></div>
               <p className="text-slate-500 font-bold text-sm uppercase tracking-wider">Financials Locked</p>
               <p className="text-xs text-slate-400 mt-1">Role: {userRole}</p>
            </div>
          )}
        </div>

        {/* WIDGET 2: TEAM MOOD (Visible to all) */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards" style={{animationDelay: '200ms'}}>
           <div className="flex justify-between items-start">
             <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Morale</h3>
             <Users size={20} className="text-slate-400" />
           </div>
           <div className="flex items-end gap-3 mt-4 md:mt-0">
             <span className={`text-5xl font-bold tracking-tighter ${avgMood < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>{avgMood}</span>
             <span className="text-slate-400 mb-2 font-medium">/ 10</span>
           </div>
           <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full mt-4 overflow-hidden shadow-inner">
             <div className={`h-full rounded-full transition-all duration-1000 ${avgMood < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${avgMood * 10}%` }}></div>
           </div>
        </div>

        {/* WIDGET 3: ALERTS (Filtered) */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards" style={{animationDelay: '300ms'}}>
           <div className="flex justify-between items-start">
             <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">Alerts</h3>
             <div className={`p-2 rounded-xl ${alerts > 0 ? 'bg-amber-500/20 text-amber-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                <AlertTriangle size={20} />
             </div>
           </div>
           <div className="mt-4 md:mt-0">
             <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">{alerts}</div>
             <p className="text-xs text-slate-500 font-medium mt-1">Active items</p>
           </div>
           <div className="flex flex-col gap-2 mt-3">
             {relevantEvents.filter(e => e.type === EventType.ALERT).slice(0, 2).map((alert, i) => (
               <div key={i} className="text-[10px] font-medium truncate px-3 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg border border-amber-500/20 flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></div>
                 {alert.content}
               </div>
             ))}
             {alerts === 0 && <div className="text-[10px] font-medium px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20 flex items-center gap-2"><Zap size={10} /> No alerts</div>}
           </div>
        </div>
      </div>

      {/* WIDGET 4: KITCHEN PRESSURE (Role Dependent) */}
      {canViewKitchenPressure && (
        <div className={`bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] flex items-center gap-6 transition-all duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards ${!isServiceActive ? 'opacity-60 grayscale-[0.5]' : ''}`} style={{animationDelay: '400ms'}}>
          <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-500">
            <Thermometer size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between mb-3">
              <span className="font-bold text-slate-900 dark:text-white">Kitchen Pressure</span>
              <span className="text-sm font-medium text-slate-500">Live Load</span>
            </div>
            <div className="flex gap-1.5 h-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-md transition-all duration-500 ${i < 8 ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-slate-200 dark:bg-slate-800'}`} style={{transform: i < 8 ? `scaleY(${1 + i * 0.05})` : 'scaleY(1)'}} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
