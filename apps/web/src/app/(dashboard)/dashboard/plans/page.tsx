'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Loader2, CreditCard, Zap, Crown, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { STRIPE_PLANS } from '@/lib/stripe';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Entreprise {
  id: string;
  nom: string;
  email: string;
  slug: string;
  plan: 'basic' | 'pro' | 'enterprise';
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  stripe_subscription_id?: string | null;
  plan_active?: boolean;
}

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

export default function PlansPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      setUser(data.user);
      
      if (data.entreprise) {
        const entResponse = await fetch(`/api/entreprise/${data.entreprise.id}`);
        if (entResponse.ok) {
          const entData = await entResponse.json();
          setEntreprise(entData.entreprise);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      router.push('/login');
    }
  };

  const handleSelectPlan = async (planId: 'basic' | 'pro' | 'enterprise') => {
    try {
      setLoading(planId);
      
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planId }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Erro do servidor:', data);
        
        // Se o servidor sugerir usar o portal, redirecionar automaticamente
        if (data.redirectToPortal || data.usePortal) {
          console.log('Redirecionando para o portal de faturação...');
          await handleOpenPortal();
          return;
        }
        
        throw new Error(data.error || data.details || 'Erro na resposta do servidor');
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL de checkout não recebida');
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la création du checkout';
      alert(errorMessage);
    } finally {
      setLoading(null);
    }
  };

  const handleOpenPortal = async () => {
    try {
      setLoadingPortal(true);
      const response = await fetch('/api/stripe/create-portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('URL do portal não recebida');
      }
    } catch (error) {
      console.error('Erreur portal:', error);
      alert('Erreur lors de l\'ouverture du portail de facturation');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; text: string; border: string; button: string; badge: string }> = {
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        button: 'bg-blue-600 hover:bg-blue-700',
        badge: 'bg-blue-100 text-blue-800',
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        button: 'bg-purple-600 hover:bg-purple-700',
        badge: 'bg-purple-100 text-purple-800',
      },
      gold: {
        bg: 'bg-amber-50',
        text: 'text-amber-600',
        border: 'border-amber-200',
        button: 'bg-amber-600 hover:bg-amber-700',
        badge: 'bg-amber-100 text-amber-800',
      },
    };
    return colors[color] || colors.blue;
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!user || !entreprise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        role: user.role || 'entreprise',
        nom: user.nom,
        entreprise: {
          nom: entreprise.nom,
          slug: entreprise.slug || '',
        },
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux paramètres
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            Plans et facturation
          </h1>
          <p className="text-slate-600">
            Gérez votre abonnement et choisissez le plan qui correspond à vos besoins
          </p>
        </div>

        {/* Plan actuel */}
        {entreprise.subscription_status === 'active' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Plan actuel</h2>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    entreprise.plan === 'pro' ? 'bg-purple-100 text-purple-700' :
                    entreprise.plan === 'enterprise' ? 'bg-amber-100 text-amber-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {entreprise.plan}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-slate-600">Actif</span>
                  </div>
                </div>
                {entreprise.subscription_expires_at && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="w-4 h-4" />
                    <span>Renouvellement: {formatDate(entreprise.subscription_expires_at)}</span>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleOpenPortal}
                disabled={loadingPortal}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
              >
                {loadingPortal ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Gérer l'abonnement
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Plans disponibles */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">
            {entreprise.subscription_status === 'active' ? 'Changer de plan' : 'Choisir un plan'}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const colors = getColorClasses(plan.color);
              const isLoading = loading === plan.id;
              const isCurrentPlan = entreprise.plan === plan.id;

              return (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-xl border-2 ${
                    plan.popular
                      ? `${colors.border} shadow-lg`
                      : 'border-slate-200'
                  } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''} p-6 flex flex-col`}
                >
                  {plan.popular && (
                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 ${colors.bg} ${colors.text} px-4 py-1 rounded-full text-sm font-semibold`}>
                      Populaire
                    </div>
                  )}

                  {isCurrentPlan && (
                    <div className="absolute -top-3 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      Plan actuel
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-slate-900">{plan.price}</span>
                      <span className="text-slate-600 text-sm">CHF/mois</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSelectPlan(plan.id as 'basic' | 'pro' | 'enterprise')}
                    disabled={isLoading || isCurrentPlan}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isCurrentPlan 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : isLoading 
                          ? `${colors.button} opacity-50 cursor-not-allowed text-white`
                          : `${colors.button} text-white`
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement...
                      </>
                    ) : isCurrentPlan ? (
                      'Plan actuel'
                    ) : (
                      `Choisir ${plan.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Informations */}
        <div className="bg-slate-50 rounded-xl p-6">
          <h3 className="font-semibold text-slate-800 mb-3">Informations importantes</h3>
          <ul className="space-y-2 text-sm text-slate-600">
            <li>• Annulation possible à tout moment</li>
            <li>• Les changements de plan prennent effet immédiatement</li>
            <li>• Support client disponible pour tous les plans</li>
            <li>• Facturation sécurisée via Stripe</li>
          </ul>
        </div>
      </div>
    </DashboardLayout>
  );
}