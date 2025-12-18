'use client';

import { cn } from '@/lib/utils';
import { useCalculatriceStore } from '@/stores/calculatriceStore';

export function CategoryTabs() {
  const { categories, categorieActive, setCategorieActive, entreprise } = useCalculatriceStore();
  
  // Couleurs personnalisées de l'entreprise
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  const secondaryColor = entreprise?.couleur_secondaire || '#2563eb';
  
  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 md:gap-0">
        {categories.map((categorie) => {
          const isActive = categorieActive === categorie.id;
          
          return (
            <button
              key={categorie.id}
              onClick={() => setCategorieActive(categorie.id)}
              className={cn(
                'flex-1 min-w-[120px] px-4 py-3 md:px-6 md:py-4',
                'font-semibold text-white uppercase tracking-wide text-sm md:text-base',
                'transition-all duration-200',
                'first:rounded-tl-lg last:rounded-tr-lg',
                isActive ? 'shadow-inner' : 'hover:opacity-90'
              )}
              style={{
                backgroundColor: isActive ? primaryColor : secondaryColor,
              }}
            >
              {categorie.nom_affichage}
            </button>
          );
        })}
      </div>
    </div>
  );
}









