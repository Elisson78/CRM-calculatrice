import { create } from 'zustand';
import type { Meuble, CategorieMeuble, Entreprise, MeubleSelection } from '@/types/database';

interface CalculatriceState {
  // Données
  entreprise: Entreprise | null;
  categories: CategorieMeuble[];
  meubles: Meuble[];
  
  // Sélections
  selections: Record<string, MeubleSelection>;
  categorieActive: string | null;
  
  // Totaux calculés
  volumeTotal: number;
  poidsTotal: number;
  nombreMeubles: number;
  
  // État du formulaire
  formulaireVisible: boolean;
  isSubmitting: boolean;
  
  // Actions
  setEntreprise: (entreprise: Entreprise | null) => void;
  setCategories: (categories: CategorieMeuble[]) => void;
  setMeubles: (meubles: Meuble[]) => void;
  setCategorieActive: (categorieId: string | null) => void;
  
  // Actions de sélection
  incrementMeuble: (meuble: Meuble, categorieNom: string) => void;
  decrementMeuble: (meubleId: string) => void;
  removeMeuble: (meubleId: string) => void;
  setQuantite: (meubleId: string, quantite: number) => void;
  resetSelections: () => void;
  
  // Actions formulaire
  setFormulaireVisible: (visible: boolean) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  
  // Getters
  getQuantite: (meubleId: string) => number;
  getSelectionsList: () => MeubleSelection[];
}

export const useCalculatriceStore = create<CalculatriceState>((set, get) => ({
  // État initial
  entreprise: null,
  categories: [],
  meubles: [],
  selections: {},
  categorieActive: null,
  volumeTotal: 0,
  poidsTotal: 0,
  nombreMeubles: 0,
  formulaireVisible: false,
  isSubmitting: false,
  
  // Setters de données
  setEntreprise: (entreprise) => set({ entreprise }),
  setCategories: (categories) => set({ categories }),
  setMeubles: (meubles) => set({ meubles }),
  setCategorieActive: (categorieId) => set({ categorieActive: categorieId }),
  
  // Incrémenter la quantité d'un meuble
  incrementMeuble: (meuble, categorieNom) => {
    const { selections } = get();
    const currentSelection = selections[meuble.id];
    
    const newQuantite = currentSelection ? currentSelection.quantite + 1 : 1;
    
    const newSelection: MeubleSelection = {
      meuble_id: meuble.id,
      meuble_nom: meuble.nom,
      meuble_categorie: categorieNom,
      quantite: newQuantite,
      volume_unitaire_m3: meuble.volume_m3,
      poids_unitaire_kg: meuble.poids_kg,
      image_url: meuble.image_url,
    };
    
    const newSelections = {
      ...selections,
      [meuble.id]: newSelection,
    };
    
    // Recalculer les totaux
    const totaux = calculerTotaux(newSelections);
    
    set({
      selections: newSelections,
      ...totaux,
    });
  },
  
  // Décrémenter la quantité d'un meuble
  decrementMeuble: (meubleId) => {
    const { selections } = get();
    const currentSelection = selections[meubleId];
    
    if (!currentSelection || currentSelection.quantite <= 0) return;
    
    let newSelections: Record<string, MeubleSelection>;
    
    if (currentSelection.quantite === 1) {
      // Supprimer la sélection
      const { [meubleId]: _, ...rest } = selections;
      newSelections = rest;
    } else {
      // Décrémenter
      newSelections = {
        ...selections,
        [meubleId]: {
          ...currentSelection,
          quantite: currentSelection.quantite - 1,
        },
      };
    }
    
    // Recalculer les totaux
    const totaux = calculerTotaux(newSelections);
    
    set({
      selections: newSelections,
      ...totaux,
    });
  },
  
  // Supprimer complètement un meuble de la sélection
  removeMeuble: (meubleId) => {
    const { selections } = get();
    
    if (!selections[meubleId]) return;
    
    const { [meubleId]: _, ...newSelections } = selections;
    
    // Recalculer les totaux
    const totaux = calculerTotaux(newSelections);
    
    set({
      selections: newSelections,
      ...totaux,
    });
  },
  
  // Définir une quantité spécifique
  setQuantite: (meubleId, quantite) => {
    const { selections, meubles } = get();
    const meuble = meubles.find(m => m.id === meubleId);
    
    if (!meuble) return;
    
    let newSelections: Record<string, MeubleSelection>;
    
    if (quantite <= 0) {
      const { [meubleId]: _, ...rest } = selections;
      newSelections = rest;
    } else {
      const currentSelection = selections[meubleId];
      newSelections = {
        ...selections,
        [meubleId]: {
          meuble_id: meuble.id,
          meuble_nom: meuble.nom,
          meuble_categorie: currentSelection?.meuble_categorie || '',
          quantite,
          volume_unitaire_m3: meuble.volume_m3,
          poids_unitaire_kg: meuble.poids_kg,
          image_url: meuble.image_url,
        },
      };
    }
    
    const totaux = calculerTotaux(newSelections);
    
    set({
      selections: newSelections,
      ...totaux,
    });
  },
  
  // Réinitialiser toutes les sélections
  resetSelections: () => set({
    selections: {},
    volumeTotal: 0,
    poidsTotal: 0,
    nombreMeubles: 0,
  }),
  
  // Formulaire
  setFormulaireVisible: (visible) => set({ formulaireVisible: visible }),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  
  // Getters
  getQuantite: (meubleId) => {
    const { selections } = get();
    return selections[meubleId]?.quantite || 0;
  },
  
  getSelectionsList: () => {
    const { selections } = get();
    return Object.values(selections).filter(s => s.quantite > 0);
  },
}));

// Fonction utilitaire pour calculer les totaux
function calculerTotaux(selections: Record<string, MeubleSelection>) {
  let volumeTotal = 0;
  let poidsTotal = 0;
  let nombreMeubles = 0;
  
  Object.values(selections).forEach(selection => {
    volumeTotal += selection.quantite * selection.volume_unitaire_m3;
    poidsTotal += selection.quantite * (selection.poids_unitaire_kg || 0);
    nombreMeubles += selection.quantite;
  });
  
  return {
    volumeTotal: Math.round(volumeTotal * 100) / 100,
    poidsTotal: Math.round(poidsTotal * 100) / 100,
    nombreMeubles,
  };
}

