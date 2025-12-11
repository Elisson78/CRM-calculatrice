'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Loader2,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle,
  Users,
  BarChart3,
  PieChart,
  Calendar,
  Clock,
  ArrowRight,
  Eye
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Stats {
  totalDevis: number;
  totalVolume: number;
  totalMeubles: number;
  clientsUniques: number;
  devisNouveau: number;
  devisEnCours: number;
  devisAccepte: number;
  devisRefuse: number;
  devisTermine: number;
  devisCeMois: number;
  volumeCeMois: number;
  acceptesCeMois: number;
  devisSemaine: number;
  volumeSemaine: number;
  volumeMoyen: number;
  tauxConversion: number;
  tendanceDevis: number;
  devisParJour: Array<{ jour: string; count: number }>;
  devisParStatut: Array<{ statut: string; count: number }>;
  topMeubles: Array<{ nom: string; quantite: number }>;
  derniersDevis: Array<{
    id: string;
    numero: string;
    client_nom: string;
    client_email: string;
    volume_total_m3: number;
    statut: string;
    created_at: string;
  }>;
}

interface Entreprise {
  id: string;
  nom: string;
  slug: string;
}

const statutColors: Record<string, { bg: string; text: string; label: string }> = {
  nouveau: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Nouveau' },
  vu: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Vu' },
  en_traitement: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En traitement' },
  devis_envoye: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Devis envoyé' },
  accepte: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepté' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusé' },
  termine: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Terminé' },
};

const statutColorsBars: Record<string, string> = {
  nouveau: '#3b82f6',
  vu: '#eab308',
  en_traitement: '#f97316',
  devis_envoye: '#a855f7',
  accepte: '#22c55e',
  refuse: '#ef4444',
  termine: '#64748b',
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      
      if (data.entreprise) {
        setEntreprise(data.entreprise);
        fetchStats(data.entreprise.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchStats = async (entrepriseId: string) => {
    try {
      const response = await fetch(`/api/entreprise/stats?entrepriseId=${entrepriseId}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Erreur stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const copyLink = () => {
    if (entreprise) {
      navigator.clipboard.writeText(`${baseUrl}/calculatrice/${entreprise.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatJour = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  // Calculer le max pour le graphique
  const maxDevisJour = stats?.devisParJour 
    ? Math.max(...stats.devisParJour.map(d => d.count), 1) 
    : 1;

  if (!entreprise) {
    return null;
  }

  return (
    <DashboardLayout
      user={{
        role: 'entreprise',
        nom: entreprise.nom,
        entreprise: {
          nom: entreprise.nom,
          slug: entreprise.slug,
        },
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto">
        {/* Lien calculatrice */}
        <div className="bg-gradient-to-r from-primary-700 to-primary-800 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-white">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold mb-1">Votre calculatrice de volume</h2>
              <p className="text-primary-100 text-sm">Partagez ce lien avec vos clients</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <code className="bg-white/20 px-4 py-2 rounded-lg text-xs sm:text-sm break-all sm:truncate sm:max-w-xs">
                {baseUrl}/calculatrice/{entreprise?.slug}
              </code>
              <div className="flex items-center gap-3">
                <button
                  onClick={copyLink}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white text-primary-700 rounded-lg hover:bg-primary-50 font-medium flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié!' : 'Copier'}
                </button>
                <Link
                  href={`/calculatrice/${entreprise?.slug}`}
                  target="_blank"
                  className="p-2 bg-white/20 rounded-lg hover:bg-white/30 flex-shrink-0"
                >
                  <ExternalLink className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stats principales */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary-500" />
              {stats?.tendanceDevis !== 0 && (
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                  (stats?.tendanceDevis || 0) >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {(stats?.tendanceDevis || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(stats?.tendanceDevis || 0)}%
                </span>
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats?.totalDevis || 0}</p>
            <p className="text-xs sm:text-sm text-slate-500">Total devis</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{(stats?.totalVolume || 0).toFixed(1)}</p>
            <p className="text-xs sm:text-sm text-slate-500">m³ total</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats?.clientsUniques || 0}</p>
            <p className="text-xs sm:text-sm text-slate-500">Clients</p>
          </div>
          
          <div className="bg-white rounded-xl p-4 sm:p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-800">{stats?.tauxConversion || 0}%</p>
            <p className="text-xs sm:text-sm text-slate-500">Taux conversion</p>
          </div>
        </div>

        {/* Stats par statut */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-primary-50 rounded-xl p-4 border border-primary-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-primary-500"></div>
              <span className="text-sm font-medium text-primary-700">Nouveaux</span>
            </div>
            <p className="text-2xl font-bold text-primary-800">{stats?.devisNouveau || 0}</p>
          </div>
          
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm font-medium text-orange-700">En cours</span>
            </div>
            <p className="text-2xl font-bold text-orange-800">{stats?.devisEnCours || 0}</p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm font-medium text-green-700">Acceptés</span>
            </div>
            <p className="text-2xl font-bold text-green-800">{stats?.devisAccepte || 0}</p>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm font-medium text-red-700">Refusés</span>
            </div>
            <p className="text-2xl font-bold text-red-800">{stats?.devisRefuse || 0}</p>
          </div>
          
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-slate-500"></div>
              <span className="text-sm font-medium text-slate-700">Terminés</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.devisTermine || 0}</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Graphique des 7 derniers jours */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-slate-400" />
                <h3 className="font-semibold text-slate-800">Devis des 7 derniers jours</h3>
              </div>
              <span className="text-sm text-slate-500">
                {stats?.devisSemaine || 0} devis cette semaine
              </span>
            </div>
            
            <div className="flex items-end justify-between gap-2 h-40">
              {stats?.devisParJour && stats.devisParJour.length > 0 ? (
                stats.devisParJour.map((jour, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-primary-500 rounded-t-lg transition-all hover:bg-primary-600"
                      style={{ 
                        height: `${(jour.count / maxDevisJour) * 100}%`,
                        minHeight: jour.count > 0 ? '20px' : '4px',
                        backgroundColor: jour.count === 0 ? '#e2e8f0' : undefined
                      }}
                    >
                      {jour.count > 0 && (
                        <span className="block text-center text-white text-xs font-bold pt-1">
                          {jour.count}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatJour(jour.jour)}</span>
                  </div>
                ))
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-400">
                  Aucune donnée
                </div>
              )}
            </div>
          </div>

          {/* Top meubles */}
          <div className="bg-white rounded-xl p-6 border border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-800">Meubles populaires</h3>
            </div>
            
            {stats?.topMeubles && stats.topMeubles.length > 0 ? (
              <div className="space-y-4">
                {stats.topMeubles.map((meuble, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-slate-700 truncate max-w-[150px]">{meuble.nom}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{meuble.quantite}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-8">Aucune donnée</p>
            )}
          </div>
        </div>

        {/* Stats du mois et métriques */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Ce mois</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{stats?.devisCeMois || 0}</p>
            <p className="text-xs text-slate-500">devis reçus</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Package className="w-4 h-4" />
              <span className="text-sm">Volume mois</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{(stats?.volumeCeMois || 0).toFixed(1)}</p>
            <p className="text-xs text-slate-500">m³</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">Volume moyen</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{(stats?.volumeMoyen || 0).toFixed(1)}</p>
            <p className="text-xs text-slate-500">m³/devis</p>
          </div>
          
          <div className="bg-white rounded-xl p-5 border border-slate-200">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Cette semaine</span>
            </div>
            <p className="text-2xl font-bold text-slate-800">{(stats?.volumeSemaine || 0).toFixed(1)}</p>
            <p className="text-xs text-slate-500">m³</p>
          </div>
        </div>

        {/* Derniers devis */}
        <div className="bg-white rounded-xl border border-slate-200">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800">Derniers devis</h3>
            <Link href="/dashboard/devis" className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              Voir tous
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          {stats?.derniersDevis && stats.derniersDevis.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {stats.derniersDevis.map((devis) => {
                const statut = statutColors[devis.statut] || statutColors.nouveau;
                return (
                  <Link 
                    key={devis.id} 
                    href={`/dashboard/devis/${devis.id}`}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium text-slate-800">{devis.client_nom}</p>
                        <p className="text-sm text-slate-500">{devis.numero}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-slate-700">
                        {parseFloat(String(devis.volume_total_m3 || 0)).toFixed(1)} m³
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${statut.bg} ${statut.text}`}>
                        {statut.label}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatDate(devis.created_at)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              Aucun devis pour le moment
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
