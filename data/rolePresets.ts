import {
  AlertTriangle, PackageX, Clock,
  UtensilsCrossed, ChefHat, Users, Star,
  AlertOctagon, CheckCircle2, Flame, Radio
} from 'lucide-react';
import { EventType } from '../types';

export interface PresetItem {
  label: string;
  icon: any;
  type: EventType;
  content: string;
  color: string;
  pressure?: number;
}

// Chef = Oxblood (Heat/Blood)
// Service = Tangerine (Energy/Speed)
// Manager = Porcelain (Clarity/Tech)
// Owner = Chartreuse (Money/Growth)

export const ROLE_PRESETS: Record<string, Array<PresetItem>> = {
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

export const MOCK_TRANSCRIPTS: Record<string, string[]> = {
  Chef: ["On est court sur le Bar.", "La mise en place est à la bourre.", "La plonge est en galère."],
  Service: ["La 12 a adoré la suggestion.", "Besoin d'un runner en terrasse !", "Erreur de cuisson, je fais un retour."],
  Manager: ["Briefing équipe terminé.", "Contrôle hygiène inopiné.", "Erreur stock bar."],
  Owner: ["Bonne ambiance ce soir.", "Faut revoir les contrats.", "L'équipe manque de peps."]
};
