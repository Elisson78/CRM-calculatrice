'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCalculatriceStore } from '@/stores/calculatriceStore';
import { formatVolume } from '@/lib/utils';

export function VolumeDisplay() {
  const { volumeTotal, nombreMeubles, entreprise } = useCalculatriceStore();
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  
  return (
    <div className="text-center py-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={volumeTotal}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className="inline-block"
        >
          <h2 
            className="text-xl sm:text-2xl md:text-3xl font-bold break-words"
            style={{ color: primaryColor }}
          >
            VOLUME: {formatVolume(volumeTotal)} M³
          </h2>
        </motion.div>
      </AnimatePresence>
      
      {nombreMeubles > 0 && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-slate-500 mt-1 text-sm"
        >
          {nombreMeubles} {nombreMeubles === 1 ? 'meuble sélectionné' : 'meubles sélectionnés'}
        </motion.p>
      )}
    </div>
  );
}

// Composant pour la barre de résumé en bas
export function VolumeSummaryBar() {
  const { volumeTotal, nombreMeubles, setFormulaireVisible, entreprise } = useCalculatriceStore();
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  
  if (nombreMeubles === 0) return null;
  
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-white">
            <p className="text-base sm:text-lg md:text-xl font-bold break-words">
              VOLUME: {formatVolume(volumeTotal)} M³
            </p>
            <p className="text-xs sm:text-sm opacity-80">
              {nombreMeubles} {nombreMeubles === 1 ? 'meuble' : 'meubles'}
            </p>
          </div>
          
          <button
            onClick={() => setFormulaireVisible(true)}
            className="w-full sm:w-auto bg-white text-slate-800 px-6 py-2.5 sm:py-3 rounded-lg font-semibold
                     hover:bg-slate-100 transition-colors duration-200
                     shadow-lg hover:shadow-xl text-sm sm:text-base"
          >
            Demander un devis
          </button>
        </div>
      </div>
    </motion.div>
  );
}



