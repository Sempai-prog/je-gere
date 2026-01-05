
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, HardDrive, Download, Trash2, 
  Smartphone, User, CreditCard, Activity, Check, AlertTriangle, Fingerprint
} from 'lucide-react';
import { useUser } from '../context/UserContext';
import { UserRole } from '../types';

interface SettingsProps {
  onExport: () => void;
  onFactoryReset: () => void;
}

// --- SUB-COMPONENT: HOLD BUTTON (Dead Man's Switch) ---
const DangerButton: React.FC<{ onTrigger: () => void }> = ({ onTrigger }) => {
  const [holding, setHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<any>(null);

  const startCounter = () => {
    setHolding(true);
    let p = 0;
    intervalRef.current = setInterval(() => {
      p += 2; // Speed of fill (approx 1.5s - 2s)
      setProgress(p);
      if (p >= 100) {
        clearInterval(intervalRef.current);
        onTrigger();
      }
    }, 20);
  };

  const stopCounter = () => {
    setHolding(false);
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
      className="relative w-full h-14 bg-rose-500/10 border border-rose-500/30 rounded-xl overflow-hidden group select-none active:scale-95 transition-transform"
    >
      {/* Background Fill Animation */}
      <div 
        className="absolute inset-0 bg-rose-600 transition-all ease-linear"
        style={{ width: `${progress}%` }}
      />
      
      <div className="absolute inset-0 flex items-center justify-center gap-3 text-rose-500 group-hover:text-rose-400 font-bold z-10 mix-blend-screen">
        <Trash2 size={18} />
        <span>{progress > 0 ? (progress >= 100 ? 'RÉINITIALISATION...' : 'MAINTENIR POUR R.A.Z') : 'RÉINITIALISATION USINE'}</span>
      </div>
    </button>
  );
};

export const SettingsView: React.FC<SettingsProps> = ({ onExport, onFactoryReset }) => {
  const { user, login } = useUser(); // Using login to update user details hack
  const [name, setName] = useState(user.name);
  const [storageSize, setStorageSize] = useState('0 KB');

  // Calculate LocalStorage Size
  useEffect(() => {
    let total = 0;
    for (let x in localStorage) {
      if (localStorage.hasOwnProperty(x)) {
        total += (localStorage[x].length * 2);
      }
    }
    setStorageSize((total / 1024).toFixed(2) + " KB");
  }, []);

  const handleNameSave = () => {
    login(user.role, name); // Updates context
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col pb-20 animate-in slide-in-from-bottom-8 duration-500">
      
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Salle des Machines</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
           <Activity size={16} /> Configuration Système
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto px-1">
        
        {/* CARD 1: IDENTITY */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-500">
              <Fingerprint size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Identité</h3>
              <p className="text-xs text-slate-500">Nom d'affichage local</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">Nom d'affichage</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <button 
                  onClick={handleNameSave}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-500/20"
                >
                  <Check size={20} />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
               <ShieldAlert size={14} />
               <span>Changement de rôle nécessite reconnexion.</span>
            </div>
          </div>
        </div>

        {/* CARD 2: DATA SOVEREIGNTY */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
              <HardDrive size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Souveraineté des Données</h3>
              <p className="text-xs text-slate-500">Stockage Local : {storageSize}</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Vos données ne quittent jamais cet appareil. Vous possédez la timeline opérationnelle. Exportez le dataset JSON complet pour sauvegarde ou analyse.
            </p>
            <button 
              onClick={onExport}
              className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-slate-700"
            >
              <Download size={18} />
              Exporter Système Complet (JSON)
            </button>
          </div>
        </div>

        {/* CARD 3: DEVICE INFO */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-slate-500/10 rounded-xl text-slate-500">
              <Smartphone size={24} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Contexte Appareil</h3>
              <p className="text-xs text-slate-500">Info Session</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs font-bold text-slate-500">Plateforme</span>
              <span className="text-xs font-mono text-slate-900 dark:text-white">{navigator.platform}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="text-xs font-bold text-slate-500">User Agent</span>
              <span className="text-[10px] font-mono text-slate-900 dark:text-white truncate w-32">{navigator.userAgent}</span>
            </div>
          </div>
        </div>

        {/* CARD 4: DANGER ZONE */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-rose-500/20 p-6 rounded-[2rem] shadow-xl shadow-rose-900/5">
           <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-rose-600 dark:text-rose-400">Zone de Danger</h3>
              <p className="text-xs text-rose-500/70">Actions Irréversibles</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 leading-relaxed font-medium bg-rose-500/5 p-3 rounded-lg border border-rose-500/10">
              Attention : La réinitialisation usine effacera tous les événements, services et réglages de ce navigateur. Cette action est irréversible.
            </p>
            <DangerButton onTrigger={onFactoryReset} />
          </div>
        </div>

      </div>
    </div>
  );
};
