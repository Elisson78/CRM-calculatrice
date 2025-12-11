'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Package, Minus, Plus } from 'lucide-react';
import { useCalculatriceStore } from '@/stores/calculatriceStore';

export function SelectedItemsList() {
  const { 
    selections, 
    decrementMeuble, 
    incrementMeuble, 
    removeMeuble,
    meubles,
    nombreMeubles,
    volumeTotal,
    entreprise
  } = useCalculatriceStore();
  
  const selectionsList = Object.values(selections).filter(s => s.quantite > 0);
  
  // Fonction pour incrémenter
  const handleIncrement = (meubleId: string) => {
    const meuble = meubles.find(m => m.id === meubleId);
    const selection = selections[meubleId];
    if (meuble && selection) {
      incrementMeuble(meuble, selection.meuble_categorie);
    }
  };
  
  // Grouper par catégorie
  const groupedSelections = selectionsList.reduce((acc, item) => {
    const cat = item.meuble_categorie || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {} as Record<string, typeof selectionsList>);
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  const accentColor = entreprise?.couleur_accent || '#dc2626';
  
  if (selectionsList.length === 0) {
    return null;
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden"
    >
      {/* Header */}
      <div 
        className="px-4 sm:px-6 py-3 sm:py-4 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <Package className="w-5 h-5 flex-shrink-0" />
          <h3 className="font-semibold text-base sm:text-lg">Vos sélections</h3>
        </div>
        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
          <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full whitespace-nowrap">
            {nombreMeubles} meuble{nombreMeubles > 1 ? 's' : ''}
          </span>
          <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full font-bold whitespace-nowrap">
            {volumeTotal.toFixed(2)} m³
          </span>
        </div>
      </div>
      
      {/* Liste des items */}
      <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {Object.entries(groupedSelections).map(([categorie, items]) => (
            <div key={categorie}>
              {/* Catégorie header */}
              <div className="bg-slate-50 px-4 sm:px-6 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {categorie}
              </div>
              
              {/* Items de la catégorie */}
              {items.map((item) => (
                <motion.div
                  key={item.meuble_id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 group"
                >
                  {/* Info du meuble */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 w-full sm:w-auto">
                    {/* Image ou icône */}
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.meuble_nom}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
                      )}
                    </div>
                    
                    {/* Nom et volume */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate text-sm sm:text-base">
                        {item.meuble_nom}
                      </p>
                      <p className="text-xs sm:text-sm text-slate-500">
                        {(item.quantite * item.volume_unitaire_m3).toFixed(2)} m³
                        <span className="text-slate-400 ml-1 hidden sm:inline">
                          ({item.volume_unitaire_m3} m³/unité)
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  {/* Contrôles de quantité */}
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end sm:justify-start">
                    {/* Boutons + / - */}
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg">
                      <button
                        onClick={() => decrementMeuble(item.meuble_id)}
                        className="p-2 hover:bg-slate-200 rounded-l-lg transition-colors"
                        aria-label="Diminuer"
                      >
                        <Minus className="w-4 h-4 text-slate-600" />
                      </button>
                      
                      <span 
                        className="w-10 text-center font-bold text-lg"
                        style={{ color: primaryColor }}
                      >
                        {item.quantite}
                      </span>
                      
                      <button
                        onClick={() => handleIncrement(item.meuble_id)}
                        className="p-2 hover:bg-slate-200 rounded-r-lg transition-colors"
                        aria-label="Augmenter"
                      >
                        <Plus className="w-4 h-4 text-slate-600" />
                      </button>
                    </div>
                    
                    {/* Bouton supprimer */}
                    <button
                      onClick={() => removeMeuble(item.meuble_id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 
                               rounded-lg transition-all"
                      aria-label="Supprimer"
                      title="Supprimer de la liste"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Footer avec total */}
      <div className="bg-slate-50 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <span className="text-sm sm:text-base text-slate-600">Volume total estimé</span>
          <span 
            className="text-xl sm:text-2xl font-bold"
            style={{ color: primaryColor }}
          >
            {volumeTotal.toFixed(2)} m³
          </span>
        </div>
      </div>
    </motion.div>
  );
}

