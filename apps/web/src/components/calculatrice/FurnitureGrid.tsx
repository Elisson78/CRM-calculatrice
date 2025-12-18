'use client';

import { motion } from 'framer-motion';
import { useCalculatriceStore } from '@/stores/calculatriceStore';
import { FurnitureCard } from './FurnitureCard';

export function FurnitureGrid() {
  const { meubles, categories, categorieActive, entreprise } = useCalculatriceStore();
  
  // Trouver la catégorie active
  const categorie = categories.find(c => c.id === categorieActive);
  
  // Filtrer les meubles par catégorie
  const meublesFiltres = categorieActive
    ? meubles.filter(m => m.categorie_id === categorieActive)
    : meubles;
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  
  if (!categorieActive || !categorie) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>Sélectionnez une catégorie pour voir les meubles</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Titre de la catégorie */}
      <div 
        className="text-center py-3 rounded-lg text-white font-semibold text-xl"
        style={{ backgroundColor: primaryColor }}
      >
        {categorie.nom_affichage.toLowerCase()}
      </div>
      
      {/* Grille de meubles */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
      >
        {meublesFiltres.map((meuble, index) => (
          <motion.div
            key={meuble.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <FurnitureCard 
              meuble={meuble} 
              categorieNom={categorie.nom_affichage}
            />
          </motion.div>
        ))}
      </motion.div>
      
      {meublesFiltres.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <p>Aucun meuble dans cette catégorie</p>
        </div>
      )}
    </div>
  );
}









