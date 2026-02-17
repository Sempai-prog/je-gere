import React, { useMemo } from 'react';
import { AreaChart, Area, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Users, AlertTriangle, TrendingUp, Activity, Thermometer, Play, 
  Zap, Lock, ChefHat, Euro, Armchair, Ban
} from 'lucide-react';
import { OperationalEvent, EventType, Shift, UserRole } from '../types';

interface DashboardProps {
  events: OperationalEvent[];
  currentShift: Shift | null;
  onToggleService: () => void;
  userRole: UserRole;
  isReplayMode?: boolean; // New prop for Time Machine
}

// --- 1. WIDGET WRAPPER (GLASSMORPHISM) ---
const Widget: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  delay?: number;
  title?: string;
  icon?: any;
  color?: string; 
}> = ({ children, className = "", delay = 0, title, icon: Icon, color = "text-slate-500" }) => (
  <div 
    className={`
      bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 
      p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 flex flex-col relative overflow-hidden group
      animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards ${className}
    `}
    style={{ animationDelay: `${delay}ms` }}
  >
    {(title || Icon) && (
      <div className="flex justify-between items-start mb-4 z-10">
        {title && <h3 className={`font-bold text-xs uppercase tracking-widest ${color}`}>{title}</h3>}
        {Icon && <Icon size={20} className={`${color} opacity-80`} />}
      </div>
    )}
    <div className="flex-1 z-10 relative">{children}</div>
    
    {/* Hover Glow Effect */}
    <div className="absolute -inset-full top-0 block bg-gradient-to-r from-transparent to-white/10 dark:to-white/5 -skew-x-12 opacity-0 group-hover:animate-shine pointer-events-none" />
  </div>
);

// --- 2. SPECIFIC WIDGETS ---

// A. SERVICE PACE (Chart) - ADAPTIVE
// Financials = Chartreuse (Money)
// Covers = Porcelain (Blue/Green)
const ServicePaceWidget: React.FC<{ data: any[], showFinancials: boolean }> = ({ data, showFinancials }) => (
  <Widget className="col-span-1 md:col-span-2 md:row-span-2" delay={100}>
    <div className="flex justify-between items-start mb-4 z-10">
      <div>
        <h3 className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
          {showFinancials ? 'Vitesse du CA' : 'Rythme du Service'}
        </h3>
        <div className="flex items-baseline gap-2 mt-1">
           <div className="text-4xl font-bold text-slate-900 dark:text-white tracking-tighter">
             {showFinancials ? '2,840 €' : '216'}
           </div>
           <span className="text-sm font-medium text-slate-500">
             {showFinancials ? 'est. revenu' : 'couverts'}
           </span>
        </div>
      </div>
      <div className={`p-3 rounded-2xl ${showFinancials ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
        <TrendingUp size={24} />
      </div>
    </div>
    <div className="w-full flex-1 min-h-[200px] -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorMain" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={showFinancials ? '#c3f609' : '#00ff99'} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={showFinancials ? '#c3f609' : '#00ff99'} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#033863" opacity={0.2} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'rgba(1, 28, 50, 0.9)', backdropFilter: 'blur(8px)', borderColor: '#033863', borderRadius: '12px', color: '#f8fafc' }} 
            itemStyle={{ color: showFinancials ? '#c3f609' : '#00ff99' }} 
          />
          <Area 
            type="monotone" 
            dataKey={showFinancials ? "revenue" : "covers"} 
            stroke={showFinancials ? '#c3f609' : '#00ff99'} 
            strokeWidth={4} 
            fillOpacity={1} 
            fill="url(#colorMain)" 
            animationDuration={2000} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </Widget>
);

// B. FINANCIAL PULSE (Manager/Owner Only)
const FinancialPulseWidget: React.FC = () => (
  <Widget className="bg-emerald-500/5 border-emerald-500/20" delay={50} title="Finances" icon={Euro} color="text-emerald-500">
     <div className="space-y-4">
       <div>
         <div className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">28%</div>
         <div className="text-xs font-bold text-slate-500 uppercase">Coût Matière</div>
         <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-1.5 overflow-hidden">
           <div className="h-full bg-emerald-500 w-[28%] rounded-full"></div>
         </div>
       </div>
       <div className="pt-4 border-t border-emerald-500/10">
         <div className="flex justify-between items-center mb-1">
           <span className="text-xs text-slate-500 font-bold">Ticket Moyen</span>
           <span className="text-xs font-mono font-bold text-emerald-500">42,50 €</span>
         </div>
         <div className="flex justify-between items-center">
           <span className="text-xs text-slate-500 font-bold">Offerts/Pertes</span>
           <span className="text-xs font-mono font-bold text-rose-500">2,1%</span>
         </div>
       </div>
     </div>
  </Widget>
);

// C. KITCHEN OPTICS (Chef Specific)
// Use Oxblood (Rose) for heat/pressure
const KitchenOpticsWidget: React.FC = () => (
  <Widget className="row-span-2" delay={150} title="Le Passe" icon={ChefHat} color="text-slate-500">
     <div className="space-y-6 h-full flex flex-col">
       
       {/* Pressure Gauge */}
       <div>
         <div className="flex justify-between items-end mb-2">
           <span className="text-4xl font-black text-rose-500">8.2</span>
           <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-1 rounded">CHARGE ÉLEVÉE</span>
         </div>
         <div className="flex gap-1 h-12 items-end">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex-1 bg-rose-500 rounded-sm animate-pulse" style={{ height: `${20 + Math.random() * 80}%`, opacity: 0.4 + (i/10) }} />
            ))}
            {[...Array(4)].map((_, i) => (
              <div key={i+8} className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-sm" style={{ height: '10%' }} />
            ))}
         </div>
       </div>

       {/* 86 List (Stockouts) */}
       <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-3 text-slate-400 font-bold text-[10px] uppercase tracking-wider">
            <Ban size={12} className="text-rose-500"/> Ruptures (86)
          </div>
          <ul className="space-y-2">
            {['Bar de Ligne', 'Huile Truffe', 'Entrecôte 300g'].map((item) => (
              <li key={item} className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
                <span>{item}</span>
                <span className="text-[10px] bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">0 qté</span>
              </li>
            ))}
          </ul>
       </div>
     </div>
  </Widget>
);

// D. FLOOR METRIX (Service Specific)
// Use Porcelain (Indigo) or Tangerine (Amber) for floor status
const FloorMetrixWidget: React.FC = () => (
  <Widget delay={150} title="État de la Salle" icon={Armchair} color="text-indigo-500">
     <div className="grid grid-cols-2 gap-4">
       <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
          <div className="text-2xl font-bold text-indigo-500">45m</div>
          <div className="text-[10px] text-indigo-400 font-bold uppercase">Rotation Moy.</div>
       </div>
       <div className="bg-amber-50 dark:bg-amber-900/10 p-3 rounded-xl border border-amber-100 dark:border-amber-800/30">
          <div className="text-2xl font-bold text-amber-500">3</div>
          <div className="text-[10px] text-amber-500 font-bold uppercase">Tables VIP</div>
       </div>
     </div>
     <div className="mt-4">
        <div className="flex justify-between text-xs font-medium text-slate-500 mb-1">
          <span>Capacité</span>
          <span>85%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
           <div className="h-full bg-slate-800 dark:bg-slate-400 w-[85%] rounded-full"></div>
        </div>
     </div>
  </Widget>
);

// E. UNIVERSAL WIDGETS
const TeamMoodWidget: React.FC<{ mood: number }> = ({ mood }) => (
  <Widget delay={200} title="Ambiance Équipe" icon={Users} color="text-slate-400">
     <div className="flex items-end gap-3">
       <span className={`text-5xl font-bold tracking-tighter ${mood < 5 ? 'text-rose-500' : 'text-emerald-500'}`}>{mood}</span>
       <span className="text-slate-400 mb-2 font-medium">/ 10</span>
     </div>
     <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full mt-4 overflow-hidden">
       <div className={`h-full rounded-full transition-all duration-1000 ${mood < 5 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${mood * 10}%` }}></div>
     </div>
  </Widget>
);

const AlertsWidget: React.FC<{ alerts: any[] }> = ({ alerts }) => (
  <Widget delay={250} title="Alertes en Cours" icon={AlertTriangle} color={alerts.length > 0 ? "text-amber-500" : "text-slate-400"} className="md:col-span-1">
    <div className="space-y-2">
      {alerts.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-slate-400 py-4 opacity-50">
          <Zap size={24} className="mb-2"/>
          <span className="text-xs font-medium">Systèmes Nominaux</span>
        </div>
      ) : (
        alerts.slice(0, 3).map((alert, i) => (
          <div key={i} className="flex gap-3 items-start p-3 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800/30">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse mt-1.5 shrink-0"/>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">
              {alert.content}
            </p>
          </div>
        ))
      )}
    </div>
  </Widget>
);

// --- 3. MAIN DASHBOARD ---

export const Dashboard: React.FC<DashboardProps> = ({ events, currentShift, onToggleService, userRole, isReplayMode = false }) => {
  const isServiceActive = currentShift?.status === 'active';
  
  // Contextual Data Processing
  // In Replay Mode, we want to show all events from the past shift, so we assume 'isServiceActive' logic applies for data filtering purposes
  // even if the shift status is actually 'closed'.
  const relevantEvents = useMemo(() => {
    if (isReplayMode) return events; // Already filtered by parent
    return isServiceActive 
      ? events.filter(e => e.shiftId === currentShift?.id)
      : events;
  }, [isServiceActive, events, currentShift, isReplayMode]);

  const activeAlerts = relevantEvents.filter(e => e.type === EventType.ALERT);
  
  const moodSignals = relevantEvents.filter(e => e.metadata?.mood !== undefined);
  const avgMood = moodSignals.length > 0 
    ? Math.round(moodSignals.reduce((acc, curr) => acc + (curr.metadata?.mood || 0), 0) / moodSignals.length) 
    : 8;

  // Mock Data for Charts
  const chartData = [
    { time: '18:00', covers: 12, revenue: 450 }, { time: '18:30', covers: 25, revenue: 980 },
    { time: '19:00', covers: 35, revenue: 1450 }, { time: '19:30', covers: 55, revenue: 2300 },
    { time: '20:00', covers: 85, revenue: 3800 }, { time: '20:30', covers: 92, revenue: 4100 },
    { time: '21:00', covers: 60, revenue: 2900 }, { time: '21:30', covers: 45, revenue: 1800 },
    { time: '22:00', covers: 24, revenue: 950 },
  ];

  // --- ROLE-BASED LAYOUT RENDERER ---
  const renderLayout = () => {
    // 1. CHEF LAYOUT
    if (userRole === 'Chef') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          <ServicePaceWidget data={chartData} showFinancials={false} />
          <KitchenOpticsWidget />
          <AlertsWidget alerts={activeAlerts} />
          <TeamMoodWidget mood={avgMood} />
        </div>
      );
    }

    // 2. SERVICE LAYOUT
    if (userRole === 'Service') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[200px]">
          <ServicePaceWidget data={chartData} showFinancials={false} />
          <FloorMetrixWidget />
          <TeamMoodWidget mood={avgMood} />
          <AlertsWidget alerts={activeAlerts} />
        </div>
      );
    }

    // 3. MANAGER / OWNER LAYOUT (Default)
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[200px]">
        {/* Row 1 */}
        <FinancialPulseWidget />
        <ServicePaceWidget data={chartData} showFinancials={true} />
        <div className="md:col-span-1 flex flex-col gap-6 h-full">
           <TeamMoodWidget mood={avgMood} />
        </div>

        {/* Row 2 */}
        <Widget delay={300} title="Charge Cuisine" icon={Thermometer} color="text-slate-400">
           <div className="flex gap-1 h-24 items-end mt-4">
             {[...Array(12)].map((_, i) => (
                <div key={i} className={`flex-1 rounded-sm ${i < 9 ? 'bg-indigo-500' : 'bg-slate-200 dark:bg-slate-800'}`} style={{ height: `${20 + Math.random() * 60}%` }} />
             ))}
           </div>
        </Widget>
        <AlertsWidget alerts={activeAlerts} />
        
        {/* Placeholder for future expansion */}
        <div className="md:col-span-2 bg-slate-100/50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest p-6">
           Emplacement Module
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">
            {isReplayMode ? 'Mode Replay' : 'Service en Direct'}
          </h2>
          <div className="flex items-center gap-2">
             <p className="text-slate-500 dark:text-slate-400 font-medium">{isReplayMode ? 'Lecture Historique' : 'Tableau de Bord Opérationnel'}</p>
             <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase border ${isReplayMode ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'}`}>
               MODULE : {userRole}
             </span>
          </div>
        </div>
        
        {/* Start/Stop Button - Hidden in Replay Mode */}
        {['Manager', 'Owner', 'Chef'].includes(userRole) && !isReplayMode && (
          <button 
            onClick={onToggleService}
            className={`
              relative overflow-hidden group flex items-center justify-center gap-3 px-8 py-3 rounded-2xl text-sm font-bold border transition-all duration-300 shadow-xl w-full md:w-auto
              ${isServiceActive 
                ? 'bg-emerald-500 text-slate-900 border-emerald-400 hover:bg-emerald-400 shadow-emerald-500/20 active:scale-95' 
                : 'bg-slate-900 dark:bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-800 hover:border-slate-600 active:scale-95'}
            `}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"/>
            {isServiceActive ? <><Activity size={18} className="animate-pulse"/><span>Service en Cours</span></> : <><Play size={18}/><span>Lancer le Service</span></>}
          </button>
        )}
      </header>

      {/* SERVICE CLOSED / REPLAY BANNER */}
      {!isServiceActive && !isReplayMode && (
        <div className="bg-slate-100/50 dark:bg-slate-800/30 backdrop-blur-md border border-slate-200 dark:border-slate-700/50 p-4 rounded-2xl flex items-center justify-center text-slate-500 text-sm mb-4 animate-in fade-in zoom-in duration-500">
          <Lock size={14} className="mr-2 opacity-50"/>
          <span>Service terminé. Mode revue activé.</span>
        </div>
      )}

      {/* DYNAMIC GRID RENDER */}
      {/* In Replay Mode, we remove opacity and grayscale to allow clear analysis */}
      <div className={`transition-all duration-700 ${!isServiceActive && !isReplayMode ? 'opacity-80 grayscale-[0.3]' : ''}`}>
        {renderLayout()}
      </div>
    </div>
  );
};
