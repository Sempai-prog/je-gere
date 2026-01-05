
import React, { useState } from 'react';
import { ChevronRight, Loader2, ShieldCheck, UserPlus, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface LandingPageProps {
  onLogin: (role: UserRole, name: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'welcome' | 'login' | 'request'>('welcome');
  const [role, setRole] = useState<UserRole>('Manager');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulation délai réseau pour l'effet "Processing"
    setTimeout(() => {
      onLogin(role, name || 'Utilisateur');
    }, 1500);
  };

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setRequestSent(true);
      setTimeout(() => {
        setMode('login'); // Retour au login après succès
        setRequestSent(false);
      }, 2000);
    }, 1500);
  };

  return (
    <div className="relative z-10 w-full max-w-md px-6 flex flex-col items-center text-center animate-in fade-in zoom-in duration-700">
      
      {/* LOGO & BRAND */}
      <div className="mb-12 space-y-4">
        <div className="w-20 h-20 bg-white text-slate-950 rounded-3xl flex items-center justify-center text-4xl font-bold shadow-2xl shadow-indigo-500/20 mx-auto rotate-3 hover:rotate-0 transition-transform duration-500">
          J
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Je gère.</h1>
          <p className="text-slate-400 text-sm uppercase tracking-[0.2em] mt-2 font-medium">Intelligence Opérationnelle</p>
        </div>
        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed border-t border-slate-800 pt-4 mt-4">
          Le système nerveux de votre restaurant. <br/>
          <span className="text-slate-300">Réalité. Décision. Vitesse.</span>
        </p>
      </div>

      {/* DYNAMIC FORMS */}
      <div className="w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl transition-all duration-500">
        
        {/* MODE: WELCOME */}
        {mode === 'welcome' && (
          <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setMode('login')}
              className="w-full py-4 bg-white text-slate-950 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Connexion</span>
              <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform"/>
            </button>
            <button 
              onClick={() => setMode('request')}
              className="w-full py-4 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition-all border border-slate-700"
            >
              Demander un accès
            </button>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 animate-in slide-in-from-right-4 duration-500">
            <div className="text-left mb-6">
              <h3 className="text-white font-bold text-lg">Identification</h3>
              <p className="text-slate-500 text-xs">Accès sécurisé au Shift en cours.</p>
            </div>

            <div className="space-y-3">
              <div className="relative group">
                <UserPlus size={16} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
                <input 
                  type="text" 
                  placeholder="Votre Nom"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="relative group">
                <Lock size={16} className="absolute left-4 top-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors"/>
                <select 
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 pl-11 pr-4 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all appearance-none cursor-pointer"
                >
                  <option value="Manager">Manager</option>
                  <option value="Chef">Chef de Cuisine</option>
                  <option value="Service">Service / Salle</option>
                  <option value="Owner">Propriétaire</option>
                </select>
                <div className="absolute right-4 top-4 pointer-events-none text-slate-500">▼</div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-600/20 mt-2 flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin"/> : 'Entrer dans le système'}
            </button>
            
            <button 
              type="button" 
              onClick={() => setMode('welcome')} 
              className="text-xs text-slate-500 hover:text-white mt-4"
            >
              ← Retour
            </button>
          </form>
        )}

        {/* MODE: REQUEST ACCESS */}
        {mode === 'request' && (
          <form onSubmit={handleRequest} className="space-y-4 animate-in slide-in-from-right-4 duration-500">
             {requestSent ? (
               <div className="py-8 flex flex-col items-center text-emerald-400 animate-in zoom-in duration-300">
                 <ShieldCheck size={48} className="mb-4"/>
                 <h3 className="font-bold text-white">Demande Envoyée</h3>
                 <p className="text-slate-500 text-xs mt-2">Un Manager validera votre accès.</p>
               </div>
             ) : (
               <>
                <div className="text-left mb-6">
                  <h3 className="text-white font-bold text-lg">Nouvel Accès</h3>
                  <p className="text-slate-500 text-xs">Création de profil temporaire.</p>
                </div>
                
                <input 
                  type="text" 
                  placeholder="Nom Complet"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  required
                />
                
                <input 
                  type="email" 
                  placeholder="Email Professionnel"
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl py-3.5 px-4 focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
                  required
                />

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 mt-2 flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={20} className="animate-spin"/> : 'Envoyer la demande'}
                </button>
                
                <button 
                  type="button" 
                  onClick={() => setMode('welcome')} 
                  className="text-xs text-slate-500 hover:text-white mt-4"
                >
                  ← Annuler
                </button>
               </>
             )}
          </form>
        )}
      </div>
      
      <div className="mt-12 text-[10px] text-slate-600 font-mono">
        JE GERE v0.1.2 • SECURE CONNECTION • LATENCY: 12ms
      </div>
    </div>
  );
};
