
import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, Send, AlertTriangle, PackageX, Clock, 
  UtensilsCrossed, ChefHat, Users, Star, 
  AlertOctagon, CheckCircle2, Upload, Loader2, StopCircle, Flame, FileText, Radio
} from 'lucide-react';
import { OperationalEvent, EventType, UserRole } from '../types';

interface InputHubProps {
  addEvent: (event: OperationalEvent) => void;
  currentRole: UserRole;
}

// --- PRESET ENGINE (Color-Coded) ---
// Chef = Oxblood (Heat/Blood)
// Service = Tangerine (Energy/Speed)
// Manager = Porcelain (Clarity/Tech)
// Owner = Chartreuse (Money/Growth)

const ROLE_PRESETS: Record<string, Array<{ label: string; icon: any; type: EventType; content: string; color: string; pressure?: number }>> = {
  Chef: [
    { label: 'Rupture (86)', icon: PackageX, type: EventType.ALERT, content: 'CRITICAL: Rupture de stock (86) sur produit clé.', color: 'from-rose-500 to-rose-700 shadow-rose-500/40' },
    { label: 'Retard Bon', icon: Clock, type: EventType.LOG, content: 'DELAY: La cuisine prend du retard.', color: 'from-rose-600 to-rose-800 shadow-rose-600/40' },
    { label: 'Coup de Feu', icon: Flame, type: EventType.SIGNAL, content: 'Cuisine sous pression MAX.', color: 'from-orange-600 to-rose-600 shadow-orange-600/40', pressure: 9 },
    { label: 'Ça déroule', icon: CheckCircle2, type: EventType.SIGNAL, content: 'Service fluide en cuisine.', color: 'from-emerald-500 to-emerald-700 shadow-emerald-500/40', pressure: 4 },
  ],
  Service: [
    { label: 'Client Difficile', icon: AlertOctagon, type: EventType.ALERT, content: 'COMPLAINT: Besoin Manager en salle.', color: 'from-amber-500 to-amber-700 shadow-amber-500/40' },
    { label: 'VIP Installé', icon: Star, type: EventType.LOG, content: 'VIP à table.', color: 'from-amber-400 to-amber-600 shadow-amber-400/40' },
    { label: 'Table Dressée', icon: UtensilsCrossed, type: EventType.LOG, content: 'Table redressée.', color: 'from-amber-300 to-amber-500 shadow-amber-300/40' },
    { label: 'Dans le Jus', icon: Users, type: EventType.SIGNAL, content: 'La salle est débordée.', color: 'from-rose-500 to-amber-600 shadow-rose-500/40', pressure: 8 },
  ],
  Manager: [
    { label: 'Coupe Staff', icon: Users, type: EventType.LOG, content: 'Réduction du personnel (Cut).', color: 'from-indigo-500 to-indigo-700 shadow-indigo-500/40' },
    { label: 'Incident', icon: AlertTriangle, type: EventType.ALERT, content: 'Incident signalé.', color: 'from-rose-600 to-rose-700 shadow-rose-500/40' },
    { label: 'Briefing OK', icon: CheckCircle2, type: EventType.LOG, content: 'Briefing équipe effectué.', color: 'from-indigo-400 to-indigo-600 shadow-indigo-400/40' },
    { label: 'Monitoring', icon: Radio, type: EventType.SIGNAL, content: 'Ronde de contrôle effectuée.', color: 'from-slate-600 to-slate-800 shadow-slate-600/40' },
  ],
  Owner: [
    { label: 'Observation', icon: ChefHat, type: EventType.LOG, content: 'Observation générale.', color: 'from-emerald-500 to-emerald-700 shadow-emerald-500/40' },
    { label: 'Ambiance Top', icon: Star, type: EventType.SIGNAL, content: 'Atmosphère excellente.', color: 'from-emerald-400 to-emerald-600 shadow-emerald-400/40' },
  ]
};

const MOCK_TRANSCRIPTS: Record<string, string[]> = {
  Chef: ["On est court sur le Bar.", "La mise en place est à la bourre.", "La plonge est en galère."],
  Service: ["La 12 a adoré la suggestion.", "Besoin d'un runner en terrasse !", "Erreur de cuisson, je fais un retour."],
  Manager: ["Briefing équipe terminé.", "Contrôle hygiène inopiné.", "Erreur stock bar."],
  Owner: ["Bonne ambiance ce soir.", "Faut revoir les contrats.", "L'équipe manque de peps."]
};

export const InputHub: React.FC<InputHubProps> = ({ addEvent, currentRole }) => {
  const [inputText, setInputText] = useState('');
  const [pressure, setPressure] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isProcessingDoc, setIsProcessingDoc] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-hide feedback
  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const handleSubmit = (type: EventType, content: string, meta?: any) => {
    const newEvent: OperationalEvent = {
      id: Date.now().toString(),
      type,
      role: currentRole,
      content,
      timestamp: Date.now(),
      metadata: meta
    };
    addEvent(newEvent);
    
    // Tactile Feedback (Vibration + Visual)
    setFeedback(`${type.toUpperCase()} ENVOYÉ`);
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const handlePresetClick = (preset: typeof ROLE_PRESETS['Chef'][0]) => {
    handleSubmit(preset.type, `[QUICK LOG] ${preset.content}`, { 
      tags: ['preset', 'quick-action'],
      pressure: preset.pressure 
    });
  };

  const handleAudioToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      setIsTranscribing(true);
      setTimeout(() => {
        const roleTranscripts = MOCK_TRANSCRIPTS[currentRole] || MOCK_TRANSCRIPTS['Manager'];
        const randomTranscript = roleTranscripts[Math.floor(Math.random() * roleTranscripts.length)];
        handleSubmit(EventType.AUDIO, `🎤 Transcription : "${randomTranscript}"`, { 
          audioLength: Math.floor(Math.random() * 10) + 2, transcriptionConfidence: 0.95 
        });
        setIsTranscribing(false);
      }, 2000);
    } else {
      setIsRecording(true);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setIsProcessingDoc(true);
    try {
      // Mock processing for UI feeling
      setTimeout(() => {
        handleSubmit(EventType.LOG, `📄 Analysé : ${file.name}`, { tags: ['document'] });
        setIsProcessingDoc(false);
      }, 1500);
    } catch (error) { setIsProcessingDoc(false); }
  };

  const currentPresets = ROLE_PRESETS[currentRole] || ROLE_PRESETS['Manager'];

  return (
    <div className="h-full flex flex-col max-w-3xl mx-auto pb-6">
       
       {/* FLOATING FEEDBACK TOAST */}
       {feedback && (
         <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-md text-emerald-400 px-6 py-3 rounded-full shadow-2xl animate-in fade-in zoom-in duration-200 font-bold text-sm flex items-center gap-3 border border-emerald-500/20">
           <div className="bg-emerald-500 rounded-full p-1"><CheckCircle2 size={14} className="text-slate-900" /></div>
           {feedback}
         </div>
       )}

       <header className="mb-6 text-center animate-in fade-in slide-in-from-top-4 duration-700">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Saisie Express</h2>
          <div className="flex items-center justify-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium text-sm">Canal Actif :</span>
            <span className="font-bold text-indigo-500 uppercase bg-indigo-500/10 px-3 py-0.5 rounded-full text-xs tracking-wider border border-indigo-500/20">{currentRole}</span>
          </div>
       </header>

       <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-10">
          
          {/* 1. PRESETS GRID (Tactile Cards) */}
          <div className="grid grid-cols-2 gap-4">
            {currentPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => handlePresetClick(preset)}
                className={`
                  bg-gradient-to-br ${preset.color} text-white p-6 rounded-[2rem] shadow-xl transform transition-all duration-150
                  active:scale-95 hover:scale-[1.02] hover:brightness-110 flex flex-col items-center justify-center gap-3 h-36 relative overflow-hidden group border border-white/10
                `}
              >
                {/* Shine Effect */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <preset.icon size={36} strokeWidth={1.5} className="drop-shadow-md group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold text-lg leading-none text-center tracking-tight drop-shadow-sm text-slate-950/80">{preset.label}</span>
              </button>
            ))}
          </div>

          {/* 2. SENSORY ZONE (Glassmorphism) */}
          <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 rounded-[2rem] shadow-xl shadow-slate-900/5 transition-all duration-300">
             <div className="flex flex-col md:flex-row gap-6">
                
                {/* Audio Button (Pulsing) */}
                <div className="flex-1">
                   <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                     <Mic size={12} /> Note Vocale
                   </h3>
                   <button
                     onClick={handleAudioToggle}
                     disabled={isTranscribing}
                     className={`
                       w-full h-24 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all duration-200 border-2 relative overflow-hidden active:scale-95 shadow-lg
                       ${isRecording 
                         ? 'bg-rose-500 border-rose-600 text-white animate-pulse shadow-rose-500/30' 
                         : isTranscribing 
                           ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 cursor-wait'
                           : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-500 hover:text-indigo-500'}
                     `}
                   >
                     {isRecording && <div className="absolute inset-0 bg-rose-400/20 animate-ping"></div>}
                     
                     {isTranscribing ? (
                       <><Loader2 size={24} className="animate-spin" /><span className="text-xs font-bold">TRAITEMENT...</span></>
                     ) : isRecording ? (
                       <><StopCircle size={32} /><span className="text-xs font-bold">STOPPER</span></>
                     ) : (
                       <><Mic size={24} /><span className="text-xs font-bold">APPUYER POUR PARLER</span></>
                     )}
                   </button>
                </div>

                {/* Pressure Slider (Custom UI) */}
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Flame size={12} /> Tension
                     </h3>
                     <span className={`text-xl font-black ${pressure > 7 ? 'text-rose-500' : 'text-indigo-500'}`}>{pressure}<span className="text-sm font-medium text-slate-400">/10</span></span>
                   </div>
                   <input 
                     type="range" 
                     min="1" 
                     max="10" 
                     value={pressure} 
                     onChange={(e) => setPressure(parseInt(e.target.value))}
                     className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mb-6 hover:opacity-100 opacity-80 transition-opacity"
                   />
                   <button 
                      onClick={() => handleSubmit(EventType.SIGNAL, `Mise à jour Tension : ${pressure}/10`, { pressure })}
                      className="w-full py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl text-sm font-bold transition-all active:scale-95 border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                   >
                     Logger la Tension
                   </button>
                </div>
             </div>
          </div>

          {/* 3. INPUT BAR (Floating) */}
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-2 rounded-2xl shadow-lg flex items-center gap-2 pr-2 sticky bottom-0">
             <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingDoc}
                className="p-3 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90"
                title="Upload Document"
             >
                {isProcessingDoc ? <Loader2 size={24} className="animate-spin"/> : <Upload size={24} />}
             </button>
             <input 
               type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*,application/pdf" className="hidden"
             />

             <input 
               type="text"
               value={inputText}
               onChange={(e) => setInputText(e.target.value)}
               placeholder={`Entrée pour ${currentRole}...`}
               className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400 h-12 px-2 font-medium"
               onKeyDown={(e) => e.key === 'Enter' && (handleSubmit(EventType.LOG, inputText), setInputText(''))}
             />
             
             <button 
               onClick={() => { handleSubmit(EventType.LOG, inputText); setInputText(''); }}
               disabled={!inputText}
               className="p-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 rounded-xl disabled:opacity-50 disabled:bg-slate-500 shadow-lg shadow-indigo-500/20 active:scale-90 transition-all"
             >
               <Send size={20} />
             </button>
          </div>

       </div>
    </div>
  );
};
