
import React, { useRef } from 'react';
import { 
  Shield, Mail, Calendar, TrendingUp, 
  Award, Zap, Settings, LogOut, CheckCircle2, Download, Upload, Database
} from 'lucide-react';
import { UserRole } from '../types';

interface UserProfileProps {
  name: string;
  role: UserRole;
  onLogout: () => void;
  onRoleChange: (newRole: UserRole) => void;
  onExportData: () => void;
  onImportData: (file: File) => void;
}

export const UserProfileView: React.FC<UserProfileProps> = ({ name, role, onLogout, onRoleChange, onExportData, onImportData }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // MOCK DATA GENERATOR (Simulates backend intelligence per role)
  const getStatsForRole = (r: UserRole) => {
    switch (r) {
      case 'Chef': return [
        { label: 'Plats Envoyés', value: 142, unit: 'today', trend: 12, status: 'good' },
        { label: 'Taux Rupture', value: 2, unit: 'items', trend: -50, status: 'good' },
        { label: 'Temps Moyen', value: 8, unit: 'min', trend: 5, status: 'warning' },
      ];
      case 'Service': return [
        { label: 'Couverts', value: 48, unit: 'pax', trend: 8, status: 'good' },
        { label: 'Ticket Moyen', value: 42, unit: '€', trend: 15, status: 'good' },
        { label: 'Incidents', value: 0, unit: 'alertes', trend: 0, status: 'neutral' },
      ];
      case 'Manager': return [
        { label: 'Labor Cost', value: 28, unit: '%', trend: -2, status: 'good' },
        { label: 'Satisfaction', value: 4.8, unit: '/ 5', trend: 4, status: 'good' },
        { label: 'Conflits', value: 1, unit: 'active', trend: 100, status: 'warning' },
      ];
      case 'Owner': return [
        { label: 'Chiffre Affaires', value: '4.2k', unit: '€', trend: 10, status: 'good' },
        { label: 'Réputation', value: 4.9, unit: 'G.Maps', trend: 1, status: 'good' },
        { label: 'Cash Flow', value: 'OK', unit: 'status', trend: 0, status: 'neutral' },
      ];
      default: return [];
    }
  };

  const stats = getStatsForRole(role);

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col animate-in slide-in-from-bottom-8 duration-500 overflow-y-auto pb-24 px-1 md:px-0">
      
      {/* HEADER IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden mb-6 group">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 relative z-10">
          {/* Avatar Ring */}
          <div className="relative flex-shrink-0">
             <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-2xl shadow-indigo-500/30">
               {name.charAt(0).toUpperCase()}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full border-4 border-white dark:border-slate-900 flex items-center gap-1 shadow-sm whitespace-nowrap">
               <Shield size={12} className="text-emerald-400" />
               {role}
             </div>
          </div>

          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1 truncate">{name}</h1>
            <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1.5 truncate"><Mail size={14}/> {name.toLowerCase().replace(/\s+/g, '.')}@jegere.app</span>
              <span className="hidden md:flex items-center gap-1.5"><Calendar size={14}/> Joined Oct 2025</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
             <button 
               onClick={onLogout}
               className="flex-1 md:flex-none px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 hover:border-rose-200 transition-all font-medium text-sm flex items-center justify-center gap-2"
             >
               <LogOut size={16} />
               <span>Logout</span>
             </button>
             <button className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-lg hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-2">
               <Settings size={16} />
               <span>Edit</span>
             </button>
          </div>
        </div>
      </div>

      {/* KPI BENTO GRID */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-brand-500" />
            Performance
        </h2>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">LIVE</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-5 md:p-6 rounded-2xl hover:border-indigo-500/30 transition-all duration-300 hover:shadow-lg group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-slate-500 text-[10px] md:text-xs uppercase font-bold tracking-wider">{stat.label}</span>
              {(stat.status as string) === 'good' ? <Award size={18} className="text-emerald-500" /> : <Zap size={18} className="text-amber-500" />}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{stat.value}</span>
              <span className="text-sm text-slate-500 font-medium mb-1.5">{stat.unit}</span>
            </div>
            {stat.trend !== undefined && (
              <div className={`text-xs font-bold mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-md ${stat.trend > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.trend > 0 ? '▲' : '▼'} {Math.abs(stat.trend)}%
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROLE SIMULATION ZONE */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white text-sm">Simulation de Rôle</h3>
               <p className="text-xs text-slate-500">Test different operational perspectives.</p>
             </div>
             <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded font-bold uppercase tracking-wider">Dev</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Manager', 'Chef', 'Service', 'Owner'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`
                  py-3 px-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-2 border-2
                  ${role === r 
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-md scale-105' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'}
                `}
              >
                {role === r && <CheckCircle2 size={14} className="text-indigo-500" />}
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* DATA MANAGEMENT ZONE */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white text-sm">Data Management</h3>
               <p className="text-xs text-slate-500">Secure local backup.</p>
             </div>
             <Database size={16} className="text-slate-400" />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button 
              onClick={onExportData}
              className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Download size={14} />
              Backup
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-3 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Upload size={14} />
              Restore
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                   onImportData(file);
                   e.target.value = ''; // Reset
                }
              }}
              className="hidden" 
              accept="application/json"
            />
          </div>
        </div>
      </div>

    </div>
  );
};
