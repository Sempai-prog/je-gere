
import React, { useEffect, useState, useRef } from 'react';
import { Target, TrendingUp, AlertTriangle, Play, BrainCircuit, X } from 'lucide-react';
import { generatePreShiftBriefing } from '../services/geminiService';
import { UserRole } from '../types';

interface BriefingProps {
  role: UserRole;
  onConfirm: () => void;
  onCancel: () => void;
}

// --- SUB-COMPONENT: LAUNCH BUTTON (Long Press) ---
const LaunchButton: React.FC<{ onTrigger: () => void }> = ({ onTrigger }) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  const startCounter = () => {
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 2.5; // ~800ms to fill
      setProgress(p);
      if (p >= 100) {
        clearInterval(intervalRef.current);
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        onTrigger();
      }
    }, 20);
  };

  const stopCounter = () => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return (
    <button
      onMouseDown={startCounter}
      onMouseUp={stopCounter}
      onMouseLeave={stopCounter}
      onTouchStart={startCounter}
      onTouchEnd={stopCounter}
      className="relative w-full h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl overflow-hidden group select-none active:scale-95 transition-transform shadow-lg shadow-emerald-500/10 cursor-pointer"
    >
      {/* Background Fill Animation */}
      <div 
        className="absolute inset-0 bg-emerald-500 transition-all ease-linear"
        style={{ width: `${progress}%` }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center gap-3 text-emerald-400 group-hover:text-slate-900 font-bold z-10 mix-blend-screen tracking-widest text-sm uppercase">
        <Play size={20} className={progress > 0 ? 'animate-ping' : ''} />
        <span>{progress > 0 ? (progress >= 100 ? 'LANCEMENT...' : 'MAINTENIR POUR LANCER') : 'LANCER LE SERVICE'}</span>
      </div>
    </button>
  );
};

export const Briefing: React.FC<BriefingProps> = ({ role, onConfirm, onCancel }) => {
  const [points, setPoints] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBriefing = async () => {
      // Artificial delay for "Computation" feel
      setTimeout(async () => {
        const advice = await generatePreShiftBriefing(role);
        setPoints(advice);
        setLoading(false);
      }, 1500);
    };
    fetchBriefing();
  }, [role]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl shadow-black overflow-hidden flex flex-col">
         
         {/* Decoration */}
         <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
         <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

         {/* Header */}
         <div className="flex justify-between items-start mb-8 relative z-10">
           <div>
             <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
               <Target className="text-indigo-500" />
               Briefing
             </h2>
             <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
               <BrainCircuit size={14} className="text-indigo-400" />
               Stratégie Prédictive • {role}
             </p>
           </div>
           <button onClick={onCancel} className="p-2 rounded-full hover:bg-slate-800 text-slate-500 transition-colors">
             <X size={24} />
           </button>
         </div>

         {/* Context Stats (Mocked for Oracle effect) */}
         <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Affluence</div>
              <div className="text-xl font-bold text-white flex justify-center items-center gap-1">
                 <TrendingUp size={16} className="text-emerald-500" /> High
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Risque</div>
              <div className="text-xl font-bold text-white flex justify-center items-center gap-1">
                 <AlertTriangle size={16} className="text-amber-500" /> Moyen
              </div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 text-center">
              <div className="text-xs text-slate-500 uppercase font-bold mb-1">Objectif</div>
              <div className="text-xl font-bold text-indigo-400">Fluide</div>
            </div>
         </div>

         {/* AI Strategy Content */}
         <div className="flex-1 mb-8 min-h-[160px]">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Points de Vigilance</h3>
           
           {loading ? (
             <div className="space-y-4 animate-pulse">
               <div className="h-4 bg-slate-800 rounded w-3/4"></div>
               <div className="h-4 bg-slate-800 rounded w-full"></div>
               <div className="h-4 bg-slate-800 rounded w-5/6"></div>
               <p className="text-xs text-indigo-400 font-mono mt-4">Analyse des shifts précédents...</p>
             </div>
           ) : (
             <ul className="space-y-4">
               {points.map((point, i) => (
                 <li key={i} className="flex gap-4 items-start animate-in slide-in-from-bottom-2 fade-in fill-mode-forwards" style={{ animationDelay: `${i * 150}ms` }}>
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs mt-0.5 border border-indigo-500/30">
                      {i + 1}
                    </div>
                    <p className="text-slate-200 font-medium leading-relaxed">{point.replace(/^- /, '')}</p>
                 </li>
               ))}
             </ul>
           )}
         </div>

         {/* Action */}
         <div className="mt-auto">
           <LaunchButton onTrigger={onConfirm} />
         </div>

      </div>
    </div>
  );
};
