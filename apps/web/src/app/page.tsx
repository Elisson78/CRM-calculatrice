import Link from 'next/link';
import { ArrowRight, Calculator, Building2, Users, BarChart3, Check, CreditCard, Zap, Crown } from 'lucide-react';
import Header from '@/components/navigation/Header';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-600">
      {/* Header */}
      <Header />
      
      {/* Hero */}
      <main className="container mx-auto px-4 py-8 md:py-16 lg:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 px-2">
            Simplifiez vos devis de
            <span className="text-secondary-300 block sm:inline"> déménagement</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 mb-6 md:mb-8 max-w-2xl mx-auto px-4">
            La plateforme SaaS complète pour les entreprises de déménagement. 
            Calculatrice de volume personnalisée, gestion des clients et devis automatiques.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 bg-white text-primary-800 
                         px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg
                         hover:bg-slate-100 transition-colors shadow-lg w-full sm:w-auto"
            >
              Démarrer gratuitement
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
            
            <Link
              href="/calculatrice/calculateur-demenagement"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white 
                         px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg
                         hover:bg-white/20 transition-colors border border-white/30 w-full sm:w-auto"
            >
              <Calculator className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">MooveLabs </span>Calculateur
            </Link>
          </div>
        </div>
        
        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mt-16 md:mt-24 max-w-5xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Calculatrice Personnalisée
            </h3>
            <p className="text-white/70">
              Votre logo, vos couleurs, votre lien unique. 
              Intégrez facilement à votre site.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Gestion des Clients
            </h3>
            <p className="text-white/70">
              Centralisez toutes vos demandes de devis. 
              Suivez vos clients et prospects.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Emails Automatiques
            </h3>
            <p className="text-white/70">
              Confirmation instantanée au client et notification 
              à votre équipe.
            </p>
          </div>
        </div>
        
        {/* Pricing Section */}
        <div className="mt-16 md:mt-24">
          <div className="text-center mb-8 md:mb-12 px-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
              Plans adaptés à votre entreprise
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-2xl mx-auto">
              Choisissez le plan qui correspond à vos besoins. Tous incluent un essai gratuit de 14 jours.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Basic</h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">29</span>
                  <span className="text-white/80">CHF</span>
                  <span className="text-white/60 text-sm">/mois</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Calculatrice de volume</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Jusqu'à 50 devis/mois</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Support par email</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Choisir Basic
              </Link>
            </div>

            {/* Pro Plan - Popular */}
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-400/50 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                Populaire
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Pro</h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">79</span>
                  <span className="text-white/80">CHF</span>
                  <span className="text-white/60 text-sm">/mois</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Tout du plan Basic</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Devis illimités</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Statistiques avancées</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Logo personnalisé</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full bg-purple-600 hover:bg-purple-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Choisir Pro
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Crown className="w-5 h-5 text-amber-300" />
                </div>
                <h3 className="text-xl font-bold text-white">Enterprise</h3>
              </div>
              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-white">199</span>
                  <span className="text-white/80">CHF</span>
                  <span className="text-white/60 text-sm">/mois</span>
                </div>
              </div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Tout du plan Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">API personnalisée</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">Support dédié 24/7</span>
                </li>
              </ul>
              <Link
                href="/pricing"
                className="block w-full bg-amber-600 hover:bg-amber-700 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Choisir Enterprise
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors"
            >
              Voir tous les détails
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 md:gap-12 mt-16 md:mt-24 max-w-3xl mx-auto px-4">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">48+</div>
            <div className="text-white/70 text-sm md:text-base">Meubles catalogués</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">5</div>
            <div className="text-white/70 text-sm md:text-base">Catégories</div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">∞</div>
            <div className="text-white/70 text-sm md:text-base">Devis illimités</div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 md:py-8 border-t border-white/10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/60 text-sm text-center md:text-left">
            © 2025 Moovelabs. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4 md:gap-6 flex-wrap justify-center">
            <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">
              Confidentialité
            </Link>
            <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">
              CGU
            </Link>
            <Link href="/contact" className="text-white/60 hover:text-white text-sm transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}




