'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Building2, 
  Loader2,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Power,
  ExternalLink
} from 'lucide-react';

interface Entreprise {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  slug: string;
  actif: boolean;
  plan: string;
  created_at: string;
}

export default function AdminEntreprisesPage() {
  const router = useRouter();
  const [entreprises, setEntreprises] = useState<Entreprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      fetchEntreprises();
    } catch (error) {
      router.push('/login');
    }
  };

  const fetchEntreprises = async () => {
    try {
      const response = await fetch('/api/admin/entreprises');
      if (response.ok) {
        const data = await response.json();
        setEntreprises(data.entreprises);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActif = async (id: string, actif: boolean) => {
    try {
      const response = await fetch(`/api/admin/entreprises/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: !actif }),
      });
      
      if (response.ok) {
        setEntreprises(entreprises.map(e => 
          e.id === id ? { ...e, actif: !actif } : e
        ));
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const filteredEntreprises = entreprises.filter(e => 
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="ml-4 text-xl font-bold text-slate-800">Gestion des entreprises</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher une entreprise..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Liste des entreprises */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Entreprise</th>
                <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Contact</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Plan</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Statut</th>
                <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Créé le</th>
                <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredEntreprises.map((entreprise) => (
                <tr key={entreprise.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-slate-800">{entreprise.nom}</p>
                      <p className="text-sm text-slate-500">/{entreprise.slug}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600">{entreprise.email}</p>
                    {entreprise.telephone && (
                      <p className="text-sm text-slate-500">{entreprise.telephone}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      entreprise.plan === 'premium' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : entreprise.plan === 'pro'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {entreprise.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      entreprise.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {entreprise.actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center text-sm text-slate-500">
                    {formatDate(entreprise.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/calculatrice/${entreprise.slug}`}
                        target="_blank"
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title="Voir calculatrice"
                      >
                        <ExternalLink className="w-4 h-4 text-slate-400" />
                      </Link>
                      <button
                        onClick={() => toggleActif(entreprise.id, entreprise.actif)}
                        className={`p-2 rounded-lg ${
                          entreprise.actif ? 'hover:bg-red-100' : 'hover:bg-green-100'
                        }`}
                        title={entreprise.actif ? 'Désactiver' : 'Activer'}
                      >
                        <Power className={`w-4 h-4 ${
                          entreprise.actif ? 'text-red-500' : 'text-green-500'
                        }`} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredEntreprises.length === 0 && (
            <div className="p-8 text-center text-slate-500">
              <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              Aucune entreprise trouvée
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







