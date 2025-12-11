'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, 
  Loader2,
  Search,
  Mail,
  Phone,
  Calendar,
  FileText
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Client {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  total_devis: number;
  dernier_devis: string | null;
  volume_total: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState<any>(null);
  const [entreprise, setEntreprise] = useState<any>(null);

  useEffect(() => {
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
      setUser(data.user);
      if (data.entreprise) {
        setEntreprise(data.entreprise);
        fetchClients(data.entreprise.id);
      }
    } catch (error) {
      console.error('Erreur:', error);
      router.push('/login');
    }
  };

  const fetchClients = async (entrepriseId: string) => {
    try {
      const response = await fetch(`/api/entreprise/clients?entrepriseId=${entrepriseId}`);
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Erreur clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(c => 
    c.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
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
        {/* Recherche */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Liste des clients */}
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200">
            <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">Aucun client</h3>
            <p className="text-slate-500">
              Les clients qui font des demandes de devis apparaîtront ici
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Client</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-slate-600">Contact</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Devis</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-slate-600">Volume total</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-slate-600">Dernier devis</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-800">{client.nom}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                          <div className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {client.email}
                          </div>
                          {client.telephone && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {client.telephone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                          <FileText className="w-3 h-3" />
                          {client.total_devis}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-slate-700">
                          {parseFloat(String(client.volume_total || 0)).toFixed(1)} m³
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-slate-500">
                        {formatDate(client.dernier_devis)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredClients.map((client) => (
                <div key={client.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-800 text-lg">{client.nom}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                      <FileText className="w-3 h-3" />
                      {client.total_devis}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className="break-all">{client.email}</span>
                    </div>
                    {client.telephone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        {client.telephone}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Volume total</p>
                      <p className="font-semibold text-slate-700">
                        {parseFloat(String(client.volume_total || 0)).toFixed(1)} m³
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 mb-1">Dernier devis</p>
                      <p className="text-sm text-slate-600">
                        {formatDate(client.dernier_devis)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

