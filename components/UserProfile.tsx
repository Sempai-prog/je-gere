
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
        { label: 'Plats Envoyés', value: 142, unit: 'ujd', trend: 12, status: 'good' },
        { label: 'Taux Rupture', value: 2, unit: 'items', trend: -50, status: 'good' },
        { label: 'Temps Envoi', value: 8, unit: 'min', trend: 5, status: 'warning' },
      ];
      case 'Service': return [
        { label: 'Couverts', value: 48, unit: 'pax', trend: 8, status: 'good' },
        { label: 'Ticket Moyen', value: 42, unit: '€', trend: 15, status: 'good' },
        { label: 'Incidents', value: 0, unit: 'alertes', trend: 0, status: 'neutral' },
      ];
      case 'Manager': return [
        { label: 'Masse Salariale', value: 28, unit: '%', trend: -2, status: 'good' },
        { label: 'Satisfaction', value: 4.8, unit: '/ 5', trend: 4, status: 'good' },
        { label: 'Conflits', value: 1, unit: 'actif', trend: 100, status: 'warning' },
      ];
      case 'Owner': return [
        { label: 'Chiffre Affaires', value: '4.2k', unit: '€', trend: 10, status: 'good' },
        { label: 'Réputation', value: 4.9, unit: 'G.Maps', trend: 1, status: 'good' },
        { label: 'Trésorerie', value: 'OK', unit: 'status', trend: 0, status: 'neutral' },
      ];
      default: return [];
    }
  };

  const stats = getStatsForRole(role);

  return (
    <div className="w-full max-w-5xl mx-auto pb-32 animate-in slide-in-from-bottom-8 duration-500">
      
      {/* HEADER IDENTITY CARD */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-12 shadow-2xl relative overflow-hidden mb-8 group">
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full pointer-events-none transition-transform duration-700 group-hover:scale-110" />
        
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 relative z-10">
          
          {/* Avatar Ring */}
          <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-500">
             <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-4xl md:text-5xl font-bold text-white shadow-2xl shadow-indigo-500/30 border-4 border-white dark:border-slate-800">
               {name.charAt(0).toUpperCase()}
             </div>
             <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-xs md:text-sm font-bold px-4 py-1.5 rounded-full border-4 border-white dark:border-slate-900 flex items-center gap-2 shadow-sm whitespace-nowrap z-20">
               <Shield size={14} className="text-emerald-400" />
               {role}
             </div>
          </div>

          {/* Text Info */}
          <div className="text-center lg:text-left flex-1 min-w-0 space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight break-words">{name}</h1>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 text-slate-500 font-medium">
              <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs md:text-sm">
                <Mail size={14}/> {name.toLowerCase().replace(/\s+/g, '.')}@jegere.app
              </span>
              <span className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs md:text-sm">
                <Calendar size={14}/> Membre depuis Oct 2025
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto min-w-[200px]">
             <button 
               onClick={onLogout}
               className="flex-1 px-6 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-900/10 hover:text-rose-600 hover:border-rose-200 transition-all font-bold text-sm flex items-center justify-center gap-3 active:scale-95"
             >
               <LogOut size={18} />
               <span>Déconnexion</span>
             </button>
             <button className="flex-1 px-6 py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all flex items-center justify-center gap-3 active:scale-95">
               <Settings size={18} />
               <span>Modifier</span>
             </button>
          </div>
        </div>
      </div>

      {/* KPI BENTO GRID */}
      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-brand-500/10 rounded-lg text-brand-500"><TrendingUp size={20} /></div>
            Performance
        </h2>
        <span className="text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">LIVE SYNC</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 p-6 md:p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-300 hover:shadow-xl group">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">{stat.label}</span>
              {(stat.status as string) === 'good' ? <Award size={20} className="text-emerald-500" /> : <Zap size={20} className="text-amber-500" />}
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tighter">{stat.value}</span>
              <span className="text-sm text-slate-500 font-medium mb-2">{stat.unit}</span>
            </div>
            {stat.trend !== undefined && (
              <div className={`text-xs font-bold mt-4 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg ${stat.trend > 0 ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-500'}`}>
                {stat.trend > 0 ? '▲' : '▼'} {Math.abs(stat.trend)}% vs N-1
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROLE SIMULATION ZONE */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white text-base">Simulation de Rôle</h3>
               <p className="text-xs text-slate-500 mt-1">Tester différentes perspectives.</p>
             </div>
             <span className="text-[10px] bg-indigo-500 text-white px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/20">Mode Dev</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(['Manager', 'Chef', 'Service', 'Owner'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onRoleChange(r)}
                className={`
                  py-4 px-2 rounded-2xl text-xs font-bold transition-all flex flex-col items-center gap-3 border-2
                  ${role === r 
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-xl scale-105' 
                    : 'bg-transparent border-transparent text-slate-500 hover:bg-white/50 dark:hover:bg-slate-700/50'}
                `}
              >
                {role === r ? <CheckCircle2 size={18} className="text-indigo-500" /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-slate-300 dark:border-slate-600"></div>}
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* DATA MANAGEMENT ZONE */}
        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="font-bold text-slate-900 dark:text-white text-base">Gestion des Données</h3>
               <p className="text-xs text-slate-500 mt-1">Sauvegarde locale sécurisée.</p>
             </div>
             <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg text-slate-500">
                <Database size={18} />
             </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onExportData}
              className="flex-1 py-4 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Download size={16} />
              Sauvegarder
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 py-4 px-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400 transition-all font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Upload size={16} />
              Restaurer
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
