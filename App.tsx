
import React, { useState, useEffect, useMemo } from 'react';
import { LayoutDashboard, ListVideo, Radio, Sparkles, Bell, Sun, Moon, Settings as SettingsIcon, Archive, History, LogOut, SkipBack, Rewind } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { EventTimeline } from './components/TaskBoard';
import { InputHub } from './components/InputHub';
import { Assistant } from './components/Assistant';
import { LandingPage } from './components/LandingPage';
import { ParticlesBackground } from './components/Particles';
import { UserProfileView } from './components/UserProfile';
import { ArchiveView } from './components/Archive';
import { SettingsView } from './components/Settings';
import { Briefing } from './components/Briefing'; // NEW IMPORT
import { OperationalEvent, ViewState, EventType, Shift } from './types';
import { generateInsight } from './services/geminiService';
import { UserProvider, useUser } from './context/UserContext';
import { useStickyState } from './hooks/useStickyState';

// --- MAIN CONTENT COMPONENT ---
const AppContent: React.FC = () => {
  const { user, login, logout, updateRole } = useUser();
  
  // UI State Management
  const [currentView, setCurrentView] = useStickyState<ViewState>('dashboard', 'jg_view');
  const [events, setEvents] = useStickyState<OperationalEvent[]>([], 'jg_events');
  const [currentShift, setCurrentShift] = useStickyState<Shift | null>(null, 'jg_current_shift');
  const [theme, setTheme] = useStickyState<'dark' | 'light'>('dark', 'jg_theme');

  // TIME MACHINE STATE
  const [viewingShiftId, setViewingShiftId] = useState<string | null>(null);

  // BRIEFING STATE (Phase 8)
  const [showBriefing, setShowBriefing] = useState(false);

  const [systemInsight, setSystemInsight] = useState<string>("Initialisation de l'intelligence...");

  // Theme Side Effect
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  // Insight Generation Side Effect
  useEffect(() => {
    if (events.length === 0) return;
    const timer = setTimeout(() => {
      const context = events.slice(-3).map(e => `${e.role}: ${e.content}`).join(' | ');
      generateInsight(context).then(setSystemInsight);
    }, 5000);
    return () => clearTimeout(timer);
  }, [events]);

  // --- GHOST MODE LOGIC (DATA RECONSTRUCTION) ---
  const { activeEvents, activeShift, isReplayMode } = useMemo(() => {
    if (viewingShiftId) {
      // REPLAY MODE: Filter events and simulate a shift object
      const historicalEvents = events.filter(e => e.shiftId === viewingShiftId);
      const ghostShift: Shift = {
        id: viewingShiftId,
        startTime: historicalEvents[0]?.timestamp || 0,
        endTime: historicalEvents[historicalEvents.length - 1]?.timestamp,
        status: 'closed', // It's history, so it's closed
        startedBy: 'System' as any
      };
      return { 
        activeEvents: historicalEvents, 
        activeShift: ghostShift,
        isReplayMode: true 
      };
    } else {
      // LIVE MODE
      return { 
        activeEvents: events, 
        activeShift: currentShift,
        isReplayMode: false 
      };
    }
  }, [viewingShiftId, events, currentShift]);

  const addEvent = (event: OperationalEvent) => {
    const eventWithContext = {
      ...event,
      shiftId: currentShift?.status === 'active' ? currentShift.id : undefined
    };
    setEvents(prev => [...prev, eventWithContext]);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    setCurrentView('dashboard');
    setViewingShiftId(null);
  };

  // --- REPLAY CONTROLLERS ---
  const handleReplay = (shiftId: string) => {
    setViewingShiftId(shiftId);
    setCurrentView('dashboard'); // Jump to dashboard to see stats
  };

  const exitReplay = () => {
    setViewingShiftId(null);
    setCurrentView('archive'); // Go back to list
  };

  // --- DATA BACKUP & EXPORT (SYSTEM LEVEL) ---
  const handleExportData = () => {
    const backupData = {
      timestamp: Date.now(),
      version: '1.0',
      data: {
        events,
        currentShift,
        userContext: user
      }
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jegere_full_dump_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.data && Array.isArray(json.data.events)) {
          if (window.confirm(`Restaurer le backup du ${new Date(json.timestamp).toLocaleDateString('fr-FR')} ? Ceci remplacera les données actuelles.`)) {
            setEvents(json.data.events);
            setCurrentShift(json.data.currentShift || null);
            alert('Système restauré avec succès.');
          }
        } else {
          alert('Format de fichier invalide.');
        }
      } catch (error) {
        console.error('Import failed', error);
        alert('Échec de la lecture du fichier.');
      }
    };
    reader.readAsText(file);
  };

  // --- FACTORY RESET ---
  const handleFactoryReset = () => {
    window.localStorage.clear();
    setEvents([]);
    setCurrentShift(null);
    logout();
    window.location.reload();
  };

  // --- SHIFT LOGIC : THE ORACLE INTERCEPTION ---
  
  // 1. Triggered by Dashboard Button
  const handleToggleService = () => {
    if (currentShift?.status === 'active') {
      // Stopping is simple/immediate
      confirmStopService();
    } else {
      // Starting requires The Oracle Briefing
      setShowBriefing(true);
    }
  };

  // 2. Actual Start Logic (Called by Briefing Component)
  const confirmStartService = () => {
    setShowBriefing(false);
    const now = Date.now();
    const newShift: Shift = {
      id: Date.now().toString(),
      startTime: now,
      status: 'active',
      startedBy: user.role
    };
    setCurrentShift(newShift);

    const startEvent: OperationalEvent = {
      id: now.toString(),
      type: EventType.SYSTEM,
      role: 'System',
      content: `Service Shift #${newShift.id.slice(-4)} initialisé par ${user.role}. Monitoring actif.`,
      timestamp: now,
      shiftId: newShift.id
    };
    setEvents(prev => [...prev, startEvent]);
  };

  // 3. Actual Stop Logic
  const confirmStopService = () => {
    if (!currentShift) return;
    const now = Date.now();
    const closedShift: Shift = { ...currentShift, endTime: now, status: 'closed' };
    setCurrentShift(closedShift); 
    
    const endEvent: OperationalEvent = {
      id: now.toString(),
      type: EventType.SYSTEM,
      role: 'System',
      content: `Service Shift #${closedShift.id.slice(-4)} terminé. Durée : ${Math.round((now - closedShift.startTime)/60000)} min.`,
      timestamp: now,
      shiftId: closedShift.id
    };
    setEvents(prev => [...prev, endEvent]);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': 
        return <Dashboard events={activeEvents} currentShift={activeShift} onToggleService={handleToggleService} userRole={user.role} isReplayMode={isReplayMode} />;
      case 'timeline': 
        return <EventTimeline events={activeEvents} />;
      case 'inputs': 
        return <InputHub addEvent={addEvent} currentRole={user.role} />;
      case 'archive':
        return <ArchiveView events={events} userRole={user.role} onReplay={handleReplay} />;
      case 'assistant': 
        return <Assistant events={activeEvents} currentRole={user.role} currentShift={activeShift} />;
      case 'profile': 
        return (
          <UserProfileView 
            name={user.name} 
            role={user.role} 
            onLogout={handleLogout} 
            onRoleChange={updateRole} 
            onExportData={handleExportData}
            onImportData={handleImportData}
          />
        );
      case 'settings':
        return <SettingsView onExport={handleExportData} onFactoryReset={handleFactoryReset} />;
      default: 
        return <Dashboard events={activeEvents} currentShift={activeShift} onToggleService={handleToggleService} userRole={user.role} isReplayMode={isReplayMode} />;
    }
  };

  // --- RENDER MAIN ---
  if (!user.isAuthenticated) {
    return (
      <div className="h-screen w-full bg-slate-950 flex items-center justify-center overflow-hidden relative font-sans selection:bg-indigo-500/30">
        <ParticlesBackground />
        <LandingPage onLogin={login} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-200 font-sans overflow-hidden transition-colors duration-300 animate-in fade-in duration-700">
      
      {/* THE ORACLE MODAL (Pre-Shift Briefing) */}
      {showBriefing && (
        <Briefing 
          role={user.role} 
          onConfirm={confirmStartService} 
          onCancel={() => setShowBriefing(false)} 
        />
      )}

      {/* Sidebar Navigation */}
      <nav className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 lg:p-6 justify-between transition-all duration-300 z-20 shadow-xl">
        <div className="space-y-10">
          {/* Brand */}
          <div className="flex items-center justify-center lg:justify-start gap-3 lg:px-2">
            <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/10 flex-shrink-0">
              <span className="font-bold text-white dark:text-slate-900 text-xl">J</span>
            </div>
            <div className="hidden lg:block">
              <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight block leading-none">Je gère</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Intelligence</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="space-y-2">
            <NavButton 
              active={currentView === 'dashboard'} 
              onClick={() => setCurrentView('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="Pilotage Live" 
            />
            <NavButton 
              active={currentView === 'timeline'} 
              onClick={() => setCurrentView('timeline')} 
              icon={<ListVideo size={20} />} 
              label="Fil d'Actualité" 
            />
            <NavButton 
              active={currentView === 'inputs'} 
              onClick={() => setCurrentView('inputs')} 
              icon={<Radio size={20} />} 
              label="Saisie Express" 
              disabled={isReplayMode} // Disable Input in Replay
            />
            <div className="pt-4 pb-2">
               <div className="h-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            </div>
            <NavButton 
              active={currentView === 'archive'} 
              onClick={() => setCurrentView('archive')} 
              icon={<div className="relative"><History size={20}/><div className="absolute -bottom-1 -right-1 bg-slate-900 dark:bg-white text-[8px] font-bold px-1 rounded text-white dark:text-slate-900 leading-none">H</div></div>} 
              label="Historique" 
            />
            <NavButton 
              active={currentView === 'assistant'} 
              onClick={() => setCurrentView('assistant')} 
              icon={<Sparkles size={20} />} 
              label="Assistant IA" 
              highlight
            />
          </div>
        </div>

        {/* System Insight, Role & Theme */}
        <div className="space-y-4">
           {/* Insight Box */}
          <div className="hidden lg:block p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-2">
               <div className={`w-2 h-2 rounded-full ${activeShift?.status === 'active' ? 'bg-emerald-500 animate-pulse' : isReplayMode ? 'bg-amber-500' : 'bg-slate-400'}`}></div>
               <p className="text-[10px] uppercase font-bold text-slate-400">
                 {isReplayMode ? 'MODE REPLAY' : activeShift?.status === 'active' ? 'Analyse IA' : 'Système Veille'}
               </p>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">"{systemInsight}"</p>
          </div>

          {/* User Profile Navigation */}
          <div className="relative">
             <button 
               onClick={() => setCurrentView('profile')} 
               className={`w-full flex items-center justify-center lg:justify-start gap-3 p-1 lg:p-2 rounded-xl transition-all border ${currentView === 'profile' ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-md' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'}`}
             >
                <div className="w-9 h-9 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs lg:text-sm shadow-md flex-shrink-0">
                   {user.name.substring(0,1).toUpperCase()}
                </div>
                <div className="hidden lg:block text-left flex-1 truncate">
                   <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.name}</div>
                   <div className="text-xs text-slate-500 flex items-center gap-1">
                     {user.role}
                     <SettingsIcon size={10} />
                   </div>
                </div>
             </button>
             
             {/* SETTINGS / SYSTEM BUTTON */}
             <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end px-2">
               <button 
                 onClick={() => setCurrentView('settings')}
                 className={`p-2 rounded-lg transition-colors ${currentView === 'settings' ? 'text-indigo-500 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                 title="Réglages Système"
               >
                 <SettingsIcon size={16} />
               </button>
             </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* GHOST MODE BANNER (Sticky Overlay) */}
        {isReplayMode && (
          <div className="w-full bg-amber-500 text-slate-900 font-bold text-xs uppercase tracking-widest flex items-center justify-between px-4 py-2 shadow-lg z-50">
             <div className="flex items-center gap-2">
                <Rewind size={16} className="animate-spin-slow" />
                <span>Mode Replay Activé : {new Date(activeShift?.startTime || 0).toLocaleDateString('fr-FR')}</span>
             </div>
             <button onClick={exitReplay} className="bg-slate-900 text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors">
               Retour au Direct
             </button>
          </div>
        )}

        {/* Mobile Header (Updated) */}
        <header className="md:hidden h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 sticky top-0">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center shadow-sm">
                <span className="font-bold text-white dark:text-slate-900 text-sm">J</span>
             </div>
             <div className="flex flex-col justify-center">
                <span className="font-bold text-slate-900 dark:text-white text-sm leading-none">Je gère</span>
                {activeShift?.status === 'active' && (
                  <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    LIVE
                  </span>
                )}
                {isReplayMode && (
                  <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                    <History size={10} />
                    REPLAY
                  </span>
                )}
             </div>
          </div>
          <button onClick={() => setCurrentView('profile')} className="p-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                {user.name.substring(0,1).toUpperCase()}
            </div>
          </button>
        </header>

        {/* Top Bar (Desktop) */}
        <header className="hidden md:flex h-20 border-b border-slate-200 dark:border-slate-800 items-center justify-between px-10 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {currentView === 'dashboard' && (isReplayMode ? 'Analyse Historique' : 'Centre de Contrôle')}
              {currentView === 'timeline' && 'Flux Opérationnel'}
              {currentView === 'inputs' && 'Saisie Express'}
              {currentView === 'archive' && 'Historique Services'}
              {currentView === 'assistant' && 'Assistant IA'}
              {currentView === 'profile' && 'Profil Utilisateur'}
              {currentView === 'settings' && 'Configuration Système'}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-2">
               {new Date().toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })}
               {activeShift?.status === 'active' ? (
                 <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/>
                    Actif
                 </span>
               ) : isReplayMode ? (
                 <span className="flex items-center gap-1.5 bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded text-xs font-bold">
                    <Rewind size={10}/>
                    Replay
                 </span>
               ) : (
                 <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"/>
                    Hors ligne
                 </span>
               )}
            </p>
          </div>
          <div className="flex items-center gap-4">
             <button 
               onClick={toggleTheme}
               className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
             >
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button className="relative p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
               <Bell size={20} />
               {activeEvents.some(e => e.type === EventType.ALERT) && (
                 <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-950"></span>
               )}
             </button>
          </div>
        </header>

        {/* Viewport */}
        <div className="flex-1 overflow-auto p-4 md:p-10 relative scroll-smooth">
           {renderView()}
        </div>

        {/* Mobile Navigation (Bottom) */}
        <nav className="md:hidden h-20 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-4 pb-2 z-20 sticky bottom-0 safe-area-bottom shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
            <MobileNavButton active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard size={24} />} />
            <MobileNavButton active={currentView === 'timeline'} onClick={() => setCurrentView('timeline')} icon={<ListVideo size={24} />} />
            <MobileNavButton active={currentView === 'inputs'} onClick={() => setCurrentView('inputs')} icon={<Radio size={24} />} disabled={isReplayMode} />
            <MobileNavButton active={currentView === 'archive'} onClick={() => setCurrentView('archive')} icon={<History size={24} />} />
            <MobileNavButton active={currentView === 'assistant'} onClick={() => setCurrentView('assistant')} icon={<Sparkles size={24} />} activeColor="text-brand-500" />
            <MobileNavButton active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<SettingsIcon size={24} />} />
        </nav>

      </main>
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label, highlight, disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`
      w-full flex items-center justify-center lg:justify-start gap-4 px-3 lg:px-4 py-3 lg:py-3.5 rounded-2xl transition-all duration-200 group font-medium
      ${active 
        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-slate-900/10' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
      ${highlight && !active ? 'text-indigo-500 hover:text-indigo-600' : ''}
      ${disabled ? 'opacity-30 cursor-not-allowed hover:bg-transparent hover:text-slate-500' : ''}
    `}
  >
    <span className={`${active ? '' : 'group-hover:scale-110'} transition-transform duration-200`}>{icon}</span>
    <span className="hidden lg:block tracking-wide text-sm">{label}</span>
  </button>
);

const MobileNavButton = ({ active, onClick, icon, activeColor = 'text-slate-900 dark:text-white', disabled }: any) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`p-4 rounded-2xl transition-all duration-200 ${active ? `bg-slate-100 dark:bg-slate-800 ${activeColor} scale-110` : 'text-slate-400'} ${disabled ? 'opacity-30' : ''}`}
  >
    {icon}
  </button>
);

const App: React.FC = () => {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
};

export default App;
