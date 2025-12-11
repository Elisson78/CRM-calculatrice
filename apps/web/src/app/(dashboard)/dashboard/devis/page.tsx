'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  FileText, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2,
  Search,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Euro,
  Users
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Devis {
  id: string;
  numero: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  adresse_depart: string;
  adresse_arrivee: string;
  volume_total_m3: number;
  nombre_meubles: number;
  statut: string;
  date_demenagement: string | null;
  montant_estime: number | null;
  devise: string;
  nombre_demenageurs: number | null;
  created_at: string;
}

const statutColors: Record<string, { bg: string; text: string; label: string }> = {
  nouveau: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nouveau' },
  vu: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Vu' },
  en_traitement: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En traitement' },
  devis_envoye: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Devis envoyé' },
  accepte: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepté' },
  refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusé' },
  termine: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Terminé' },
};

export default function DevisPage() {
  const router = useRouter();
  const [devis, setDevis] = useState<Devis[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [entrepriseId, setEntrepriseId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [entreprise, setEntreprise] = useState<any>(null);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        console.error('Erreur auth:', response.status);
        router.push('/login');
        return;
      }
      const data = await response.json();
      setUser(data.user);
      if (data.entreprise) {
        setEntreprise(data.entreprise);
        setEntrepriseId(data.entreprise.id);
        fetchDevis(data.entreprise.id);
      } else {
        console.error('Nenhuma entreprise encontrada para o usuário');
        setLoading(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchDevis = async (entId: string) => {
    try {
      const response = await fetch(`/api/entreprise/devis?entrepriseId=${entId}`);
      if (response.ok) {
        const data = await response.json();
        setDevis(data.devis || []);
      } else {
        const errorData = await response.json();
        console.error('Erreur API devis:', errorData);
      }
    } catch (error) {
      console.error('Erreur devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (devisId: string, newStatut: string) => {
    try {
      const response = await fetch(`/api/entreprise/devis/${devisId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut }),
      });
      
      if (response.ok) {
        setDevis(devis.map(d => 
          d.id === devisId ? { ...d, statut: newStatut } : d
        ));
      }
    } catch (error) {
      console.error('Erreur update:', error);
    }
  };

  const filteredDevis = devis.filter(d => {
    const matchSearch = 
      d.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.numero?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = !filterStatut || d.statut === filterStatut;
    return matchSearch && matchStatut;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        role: user.role || 'entreprise',
        nom: user.nom,
        entreprise: entreprise ? {
          nom: entreprise.nom,
          slug: entreprise.slug,
        } : null,
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Mes Devis</h1>

        {/* Filtres */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, email ou numéro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(statutColors).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        {/* Liste des devis */}
        {filteredDevis.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun devis</h3>
            <p className="text-slate-500">
              Les demandes de devis de votre calculatrice apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDevis.map((d) => {
              const statut = statutColors[d.statut] || statutColors.nouveau;
              
              return (
                <div key={d.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="p-4 sm:p-6">
                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                      {/* Infos principales */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-sm font-mono text-slate-500">{d.numero}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                            {statut.label}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          {d.client_nom || 'Client sans nom'}
                        </h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-slate-400" />
                            {d.client_email}
                          </div>
                          {d.client_telephone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-slate-400" />
                              {d.client_telephone}
                            </div>
                          )}
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                            <span className="truncate">{d.adresse_depart}</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="truncate">{d.adresse_arrivee}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stats et actions */}
                      <div className="flex flex-col sm:items-end gap-3">
                        <div className="flex items-center gap-4 sm:gap-6">
                          <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold text-primary-600">{parseFloat(String(d.volume_total_m3 || 0)).toFixed(1)}</p>
                            <p className="text-xs text-slate-500">m³</p>
                          </div>
                          <div className="text-center">
                            <p className="text-xl sm:text-2xl font-bold text-slate-700">{d.nombre_meubles}</p>
                            <p className="text-xs text-slate-500">meubles</p>
                          </div>
                        </div>
                        {d.montant_estime && (
                          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-1">
                              <Euro className="w-3 h-3 text-green-600" />
                              <p className="text-lg font-bold text-green-700">{d.montant_estime.toFixed(2)}</p>
                              <span className="text-xs text-green-600">{d.devise || 'EUR'}</span>
                            </div>
                          </div>
                        )}
                        {d.nombre_demenageurs && (
                          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-blue-600" />
                              <p className="text-sm font-semibold text-blue-700">{d.nombre_demenageurs}</p>
                              <span className="text-xs text-blue-600">déménageur{d.nombre_demenageurs > 1 ? 's' : ''}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Clock className="w-3 h-3" />
                          {formatDate(d.created_at)}
                        </div>
                        
                        {d.date_demenagement && (
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3 h-3" />
                            Prévu: {new Date(d.date_demenagement).toLocaleDateString('fr-FR')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="bg-slate-50 px-4 sm:px-6 py-3 flex flex-wrap gap-2 border-t border-slate-200">
                    <Link
                      href={`/dashboard/devis/${d.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                    >
                      <Eye className="w-4 h-4" />
                      Voir détails
                    </Link>
                    
                    {d.statut === 'nouveau' && (
                      <button
                        onClick={() => updateStatut(d.id, 'vu')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                      >
                        <Eye className="w-4 h-4" />
                        Marquer vu
                      </button>
                    )}
                    
                    {(d.statut === 'nouveau' || d.statut === 'vu') && (
                      <button
                        onClick={() => updateStatut(d.id, 'en_traitement')}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                      >
                        <Clock className="w-4 h-4" />
                        En traitement
                      </button>
                    )}
                    
                    {d.statut !== 'accepte' && d.statut !== 'refuse' && d.statut !== 'termine' && (
                      <>
                        <button
                          onClick={() => updateStatut(d.id, 'accepte')}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Accepter
                        </button>
                        <button
                          onClick={() => updateStatut(d.id, 'refuse')}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <XCircle className="w-4 h-4" />
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

