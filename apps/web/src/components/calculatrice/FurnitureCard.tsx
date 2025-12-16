'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { useCalculatriceStore } from '@/stores/calculatriceStore';
import { cn } from '@/lib/utils';
import type { Meuble } from '@/types/database';

interface FurnitureCardProps {
  meuble: Meuble;
  categorieNom: string;
}

export function FurnitureCard({ meuble, categorieNom }: FurnitureCardProps) {
  const { getQuantite, incrementMeuble, decrementMeuble, entreprise } = useCalculatriceStore();
  
  const quantite = getQuantite(meuble.id);
  const hasSelection = quantite > 0;
  
  const accentColor = entreprise?.couleur_accent || '#dc2626';
  const secondaryColor = entreprise?.couleur_secondaire || '#2563eb';
  
  const handleIncrement = () => {
    incrementMeuble(meuble, categorieNom);
  };
  
  const handleDecrement = () => {
    decrementMeuble(meuble.id);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'bg-slate-50 border-2 rounded-lg p-4',
        'flex flex-col items-center gap-3',
        'transition-all duration-200',
        hasSelection 
          ? 'border-blue-400 bg-blue-50 shadow-md' 
          : 'border-slate-200 hover:border-slate-300 hover:bg-white'
      )}
    >
      {/* Nom du meuble */}
      <h3 className="text-sm font-medium text-slate-700 text-center min-h-[40px] flex items-center">
        {meuble.nom}
      </h3>
      
      {/* Image du meuble */}
      <div className="relative w-20 h-20 md:w-24 md:h-24">
        {meuble.image_url ? (
          <Image
            src={meuble.image_url.startsWith('//') ? `https:${meuble.image_url}` : meuble.image_url}
            alt={meuble.nom}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 80px, 96px"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 rounded flex items-center justify-center">
            <span className="text-slate-400 text-xs">Image</span>
          </div>
        )}
      </div>
      
      {/* Compteur */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleDecrement}
          disabled={quantite === 0}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200 font-bold',
            quantite > 0 
              ? 'bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer' 
              : 'bg-slate-100 text-slate-300 cursor-not-allowed'
          )}
          style={quantite > 0 ? { backgroundColor: `${accentColor}20`, color: accentColor } : {}}
        >
          <Minus className="w-4 h-4" />
        </button>
        
        <motion.span
          key={quantite}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className={cn(
            'w-8 text-center font-bold text-lg',
            hasSelection ? 'text-blue-600' : 'text-slate-600'
          )}
          style={hasSelection ? { color: secondaryColor } : {}}
        >
          {quantite}
        </motion.span>
        
        <button
          onClick={handleIncrement}
          className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200 font-bold',
            'bg-blue-100 text-blue-600 hover:bg-blue-200 cursor-pointer'
          )}
          style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
      
      {/* Volume unitaire (optionnel) */}
      <p className="text-xs text-slate-400">
        {meuble.volume_m3.toString().replace('.', ',')} m³
      </p>
    </motion.div>
  );
}






