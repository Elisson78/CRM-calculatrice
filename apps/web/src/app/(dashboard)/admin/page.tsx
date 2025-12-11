'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Package, 
  Users, 
  FileText,
  Loader2,
  Eye,
  CreditCard
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Stats {
  totalEntreprises: number;
  totalMeubles: number;
  totalDevis: number;
  totalClients: number;
}

interface Entreprise {
  id: string;
  nom: string;
  email: string;
  slug: string;
  actif: boolean;
  plan: string;
  created_at: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [user, setUser] = useState<any>(null);

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
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [statsRes, entreprisesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/entreprises'),
      ]);
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
      
      if (entreprisesRes.ok) {
        const entData = await entreprisesRes.json();
        setEntreprises(entData.entreprises);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <h1 className="text-2xl font-bold text-slate-800">
            Dashboard Admin
          </h1>
          <Link
            href="/admin/stripe"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <CreditCard className="w-4 h-4" />
            Gerenciar Stripe
          </Link>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {stats?.totalEntreprises || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Entreprises</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {stats?.totalMeubles || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Meubles</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {stats?.totalDevis || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Devis</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl sm:text-2xl font-bold text-slate-800">
                    {stats?.totalClients || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500">Clients</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Liste entreprises */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h2 className="text-base sm:text-lg font-semibold text-slate-800">
                Entreprises récentes
              </h2>
              <Link
                href="/admin/entreprises"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium whitespace-nowrap"
              >
                Voir tout →
              </Link>
            </div>
            
            <div className="divide-y divide-slate-200">
              {entreprises.slice(0, 5).map((ent) => (
                <div key={ent.id} className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 truncate">{ent.nom}</h3>
                    <p className="text-sm text-slate-500 truncate">{ent.email}</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${
                      ent.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {ent.actif ? 'Actif' : 'Inactif'}
                    </span>
                    <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
                      {ent.plan}
                    </span>
                    <Link
                      href={`/calculatrice/${ent.slug}`}
                      target="_blank"
                      className="p-2 hover:bg-slate-100 rounded-lg ml-auto sm:ml-0"
                    >
                      <Eye className="w-4 h-4 text-slate-400" />
                    </Link>
                  </div>
                </div>
              ))}
              
              {entreprises.length === 0 && (
                <div className="p-8 text-center text-slate-500">
                  Aucune entreprise
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }



