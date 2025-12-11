'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useCalculatriceStore } from '@/stores/calculatriceStore';
import {
  CalculatriceHeader,
  CategoryTabs,
  VolumeDisplay,
  FurnitureGrid,
  VolumeSummaryBar,
  ContactForm,
  SelectedItemsList,
} from '@/components/calculatrice';
import type { Entreprise, CategorieMeuble, Meuble } from '@/types/database';

interface CalculatriceData {
  entreprise: Entreprise;
  categories: CategorieMeuble[];
  meubles: Meuble[];
}

export default function CalculatricePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const {
    setEntreprise,
    setCategories,
    setMeubles,
    setCategorieActive,
    categories,
    entreprise,
  } = useCalculatriceStore();
  
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/calculatrice/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Entreprise non trouvée');
          }
          throw new Error('Erreur lors du chargement');
        }
        
        const data: CalculatriceData = await response.json();
        
        setEntreprise(data.entreprise);
        setCategories(data.categories);
        setMeubles(data.meubles);
        
        // Sélectionner la première catégorie par défaut
        if (data.categories.length > 0) {
          setCategorieActive(data.categories[0].id);
        }
        
      } catch (err) {
        console.error('Erreur:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [slug, setEntreprise, setCategories, setMeubles, setCategorieActive]);
  
  // Appliquer les couleurs personnalisées
  useEffect(() => {
    if (entreprise) {
      document.documentElement.style.setProperty('--entreprise-primary', entreprise.couleur_primaire);
      document.documentElement.style.setProperty('--entreprise-secondary', entreprise.couleur_secondaire);
      document.documentElement.style.setProperty('--entreprise-accent', entreprise.couleur_accent);
    }
  }, [entreprise]);
  
  // État de chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-slate-600">Chargement de la calculatrice...</p>
        </div>
      </div>
    );
  }
  
  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h1>
          <p className="text-slate-600">{error}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <CalculatriceHeader />
      
      {/* Contenu principal */}
      <main className="container mx-auto px-4 py-8">
        {/* Titre */}
        <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-800 mb-8">
          {entreprise?.titre_calculatrice || 'Simulateur de volume pour déménagement'}
        </h2>
        
        {/* Onglets des catégories */}
        <CategoryTabs />
        
        {/* Affichage du volume */}
        <VolumeDisplay />
        
        {/* Grille des meubles */}
        <FurnitureGrid />
        
        {/* Liste des sélections */}
        <SelectedItemsList />
      </main>
      
      {/* Barre de résumé en bas */}
      <AnimatePresence>
        <VolumeSummaryBar />
      </AnimatePresence>
      
      {/* Modal du formulaire */}
      <ContactForm />
    </div>
  );
}

