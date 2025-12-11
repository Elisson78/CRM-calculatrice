'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Package, 
  Users, 
  TrendingUp,
  Loader2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  DollarSign
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface StripeStats {
  totalCustomers: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  totalProducts: number;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string;
  active: boolean;
  prices: {
    id: string;
    unit_amount: number;
    currency: string;
    recurring: {
      interval: string;
    } | null;
  }[];
}

export default function StripeAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StripeStats | null>(null);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      
      if (data.user.role !== 'admin') {
        router.push('/dashboard');
        return;
      }
      
      setUser(data.user);
      await fetchStripeData();
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchStripeData = async () => {
    try {
      setError(null);
      const [statsRes, productsRes] = await Promise.all([
        fetch('/api/admin/stripe/stats'),
        fetch('/api/admin/stripe/products'),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        setProducts(productsData.products);
      }

      if (!statsRes.ok || !productsRes.ok) {
        setError('Erro ao carregar dados do Stripe');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erro de conexão com o Stripe');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-CH', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout 
      user={{ role: user.role, nom: user.nom }}
      onLogout={handleLogout}
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-800">
            Administration Stripe
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchStripeData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <a
              href="https://dashboard.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Dashboard Stripe
            </a>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.totalCustomers || 0}
                </p>
                <p className="text-sm text-slate-500">Customers</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.activeSubscriptions || 0}
                </p>
                <p className="text-sm text-slate-500">Assinaturas Ativas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {stats?.monthlyRevenue ? formatCurrency(stats.monthlyRevenue, 'chf') : 'CHF 0.00'}
                </p>
                <p className="text-sm text-slate-500">Receita Mensal</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">
                  {products?.length || 0}
                </p>
                <p className="text-sm text-slate-500">Produtos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800">
              Produtos e Planos
            </h2>
          </div>

          <div className="divide-y divide-slate-200">
            {products.map((product) => (
              <div key={product.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-slate-800">{product.name}</h3>
                    {product.description && (
                      <p className="text-sm text-slate-500 mt-1">{product.description}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    product.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {product.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {product.prices.map((price) => (
                    <div key={price.id} className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-800">
                          {formatCurrency(price.unit_amount, price.currency)}
                        </span>
                        {price.recurring && (
                          <span className="text-xs text-slate-500">
                            /{price.recurring.interval === 'month' ? 'mês' : 'ano'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">ID: {price.id}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {products.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Nenhum produto encontrado
              </div>
            )}
          </div>
        </div>

        {/* Links úteis */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Links Úteis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <a
              href="https://dashboard.stripe.com/customers"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Users className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">Customers</span>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
            
            <a
              href="https://dashboard.stripe.com/subscriptions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <CreditCard className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">Assinaturas</span>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
            
            <a
              href="https://dashboard.stripe.com/webhooks"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-slate-400" />
              <span className="text-sm font-medium">Webhooks</span>
              <ExternalLink className="w-4 h-4 text-slate-400 ml-auto" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}