'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCalculatriceStore } from '@/stores/calculatriceStore';
import { formatVolume } from '@/lib/utils';

// Schéma de validation
const formSchema = z.object({
  nom: z.string().min(2, 'Le nom est requis'),
  email: z.string().email('Email invalide'),
  telephone: z.string().min(10, 'Téléphone invalide'),
  adresse_depart: z.string().min(5, 'Adresse de départ requise'),
  avec_ascenseur_depart: z.boolean(),
  adresse_arrivee: z.string().min(5, "Adresse d'arrivée requise"),
  avec_ascenseur_arrivee: z.boolean(),
  date_demenagement: z.string().optional(),
  observations: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function ContactForm() {
  const { 
    formulaireVisible, 
    setFormulaireVisible, 
    entreprise, 
    getSelectionsList,
    volumeTotal,
    isSubmitting,
    setIsSubmitting,
    resetSelections,
  } = useCalculatriceStore();
  
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      avec_ascenseur_depart: false,
      avec_ascenseur_arrivee: false,
    },
  });
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  const secondaryColor = entreprise?.couleur_secondaire || '#2563eb';
  
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const selections = getSelectionsList();
      
      const payload = {
        entreprise_id: entreprise?.id,
        entreprise_slug: entreprise?.slug,
        ...data,
        volume_total_m3: volumeTotal,
        meubles: selections,
      };
      
      const response = await fetch('/api/devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du devis');
      }
      
      setSubmitSuccess(true);
      
      // Réinitialiser après 3 secondes
      setTimeout(() => {
        setFormulaireVisible(false);
        setSubmitSuccess(false);
        reset();
        resetSelections();
      }, 3000);
      
    } catch (error) {
      console.error('Erreur:', error);
      setSubmitError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    if (!isSubmitting) {
      setFormulaireVisible(false);
      setSubmitError(null);
    }
  };
  
  return (
    <AnimatePresence>
      {formulaireVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div 
              className="sticky top-0 flex items-center justify-between p-4 border-b bg-white z-10"
              style={{ borderBottomColor: primaryColor }}
            >
              <div>
                <h2 className="text-xl font-bold" style={{ color: primaryColor }}>
                  Demande de devis
                </h2>
                <p className="text-sm text-slate-500">
                  Volume estimé: <strong>{formatVolume(volumeTotal)} m³</strong>
                </p>
              </div>
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Contenu */}
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 text-center"
              >
                <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  Demande envoyée !
                </h3>
                <p className="text-slate-600">
                  Vous recevrez un email de confirmation. L'entreprise vous contactera rapidement.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Colonne 1: Informations personnelles */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg" style={{ color: primaryColor }}>
                      Vous concernant
                    </h3>
                    
                    {/* Nom entreprise (readonly) */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nom entreprise
                      </label>
                      <input
                        type="text"
                        value={entreprise?.nom || ''}
                        readOnly
                        className="input bg-slate-100"
                      />
                    </div>
                    
                    {/* Nom */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Nom *
                      </label>
                      <input
                        type="text"
                        {...register('nom')}
                        placeholder="Votre nom"
                        className="input"
                      />
                      {errors.nom && (
                        <p className="text-red-500 text-sm mt-1">{errors.nom.message}</p>
                      )}
                    </div>
                    
                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="votre@email.com"
                        className="input"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                      )}
                    </div>
                    
                    {/* Téléphone */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        {...register('telephone')}
                        placeholder="+41 XX XXX XX XX"
                        className="input"
                      />
                      {errors.telephone && (
                        <p className="text-red-500 text-sm mt-1">{errors.telephone.message}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Colonne 2: Déménagement */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg" style={{ color: primaryColor }}>
                      Votre déménagement
                    </h3>
                    
                    {/* Adresse de départ */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Adresse de départ + CP *
                      </label>
                      <input
                        type="text"
                        {...register('adresse_depart')}
                        placeholder="Adresse de départ + CP"
                        className="input"
                      />
                      {errors.adresse_depart && (
                        <p className="text-red-500 text-sm mt-1">{errors.adresse_depart.message}</p>
                      )}
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            {...register('avec_ascenseur_depart')}
                            className="rounded"
                          />
                          Avec ascenseur départ
                        </label>
                      </div>
                    </div>
                    
                    {/* Adresse d'arrivée */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Adresse d'arrivée + CP *
                      </label>
                      <input
                        type="text"
                        {...register('adresse_arrivee')}
                        placeholder="Adresse d'arrivée + CP"
                        className="input"
                      />
                      {errors.adresse_arrivee && (
                        <p className="text-red-500 text-sm mt-1">{errors.adresse_arrivee.message}</p>
                      )}
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            {...register('avec_ascenseur_arrivee')}
                            className="rounded"
                          />
                          Avec ascenseur arrivée
                        </label>
                      </div>
                    </div>
                    
                    {/* Date de déménagement */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Date de déménagement souhaitée
                      </label>
                      <input
                        type="date"
                        {...register('date_demenagement')}
                        className="input"
                      />
                    </div>
                    
                    {/* Observations */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Observations
                      </label>
                      <textarea
                        {...register('observations')}
                        rows={3}
                        placeholder="Informations supplémentaires..."
                        className="input resize-none"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Message RGPD */}
                <p className="text-sm text-slate-500 mt-6 text-center">
                  {entreprise?.message_formulaire || 
                    "Ces informations ne serviront qu'à l'édition de votre devis et ne seront JAMAIS transmises ou vendu à un tiers."}
                </p>
                
                {/* Erreur */}
                {submitError && (
                  <p className="text-red-500 text-center mt-4">{submitError}</p>
                )}
                
                {/* Bouton submit */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-4 rounded-lg text-white font-semibold
                               transition-all duration-200 hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Envoyer
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}



