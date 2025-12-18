'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, CreditCard, Zap, Building2, Crown } from 'lucide-react';
import { STRIPE_PLANS } from '@/lib/stripe';

const plans = [
  {
    id: 'basic',
    name: STRIPE_PLANS.basic.name,
    price: STRIPE_PLANS.basic.price,
    icon: CreditCard,
    color: 'blue',
    features: STRIPE_PLANS.basic.features,
  },
  {
    id: 'pro',
    name: STRIPE_PLANS.pro.name,
    price: STRIPE_PLANS.pro.price,
    icon: Zap,
    color: 'purple',
    features: STRIPE_PLANS.pro.features,
    popular: true,
  },
  {
    id: 'enterprise',
    name: STRIPE_PLANS.enterprise.name,
    price: STRIPE_PLANS.enterprise.price,
    icon: Crown,
    color: 'gold',
    features: STRIPE_PLANS.enterprise.features,
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verificar se está autenticado
    fetch('/api/auth/me')
      .then(res => res.ok)
      .then(ok => setIsAuthenticated(ok));
  }, []);

  const handleSelectPlan = async (planId: 'basic' | 'pro' | 'enterprise') => {
    if (!isAuthenticated) {
      router.push(`/register?plan=${planId}&redirect=pricing`);
      return;
    }

    try {
      setLoading(planId);
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Erreur lors de la création du checkout');
    } finally {
      setLoading(null);
    }
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; button: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
      },
      gold: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        button: 'bg-amber-600 hover:bg-amber-700',
      },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="font-bold text-slate-800">Moovelabs</span>
            </div>
            {!isAuthenticated && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/login')}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800"
                >
                  Connexion
                </button>
                <button
                  onClick={() => router.push('/register')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Inscription
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 sm:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            Choisissez votre plan
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Plans flexibles adaptés à votre entreprise de déménagement
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const colors = getColorClasses(plan.color);
            const isLoading = loading === plan.id;

            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 ${
                  plan.popular
                    ? `${colors.border} shadow-xl scale-105`
                    : 'border-slate-200 shadow-lg'
                } p-8 flex flex-col`}
              >
                {plan.popular && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 ${colors.bg} ${colors.text} px-4 py-1 rounded-full text-sm font-semibold`}>
                    Populaire
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">CHF</span>
                    <span className="text-slate-500 text-sm">/mois</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan.id as 'basic' | 'pro' | 'enterprise')}
                  disabled={isLoading}
                  className={`w-full ${colors.button} text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Chargement...
                    </>
                  ) : (
                    <>
                      Choisir {plan.name}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* FAQ ou informações adicionais */}
        <div className="mt-16 text-center">
          <p className="text-slate-600 mb-4">
            Tous les plans incluent un essai gratuit de 14 jours
          </p>
          <p className="text-sm text-slate-500">
            Annulation possible à tout moment • Pas de frais cachés
          </p>
        </div>
      </main>
    </div>
  );
}






