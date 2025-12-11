'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Loader2,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  Printer,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  Save,
  X,
  Euro,
  Users
} from 'lucide-react';

interface Devis {
  id: string;
  numero: string;
  client_nom: string;
  client_email: string;
  client_telephone: string;
  adresse_depart: string;
  avec_ascenseur_depart: boolean;
  adresse_arrivee: string;
  avec_ascenseur_arrivee: boolean;
  volume_total_m3: number;
  poids_total_kg: number;
  nombre_meubles: number;
  statut: string;
  date_demenagement: string | null;
  observations: string | null;
  montant_estime: number | null;
  devise: string;
  nombre_demenageurs: number | null;
  created_at: string;
}

interface DevisMeuble {
  id: string;
  meuble_nom: string;
  meuble_categorie: string;
  quantite: number;
  volume_unitaire_m3: number;
  poids_unitaire_kg: number | null;
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

export default function DevisDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [devis, setDevis] = useState<Devis | null>(null);
  const [meubles, setMeubles] = useState<DevisMeuble[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    montant_estime: '',
    nombre_demenageurs: '',
    devise: 'EUR',
    observations: '',
    date_demenagement: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDevis();
  }, [params.id]);

  const fetchDevis = async () => {
    try {
      const response = await fetch(`/api/entreprise/devis/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setDevis(data.devis);
        setMeubles(data.meubles);
        // Initialiser le formulaire d'édition
        setEditForm({
          montant_estime: data.devis.montant_estime?.toString() || '',
          nombre_demenageurs: data.devis.nombre_demenageurs?.toString() || '',
          devise: data.devis.devise || 'EUR',
          observations: data.devis.observations || '',
          date_demenagement: data.devis.date_demenagement || '',
        });
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatut = async (newStatut: string) => {
    try {
      const response = await fetch(`/api/entreprise/devis/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatut }),
      });
      
      if (response.ok && devis) {
        setDevis({ ...devis, statut: newStatut });
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/entreprise/devis/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          montant_estime: editForm.montant_estime || null,
          nombre_demenageurs: editForm.nombre_demenageurs || null,
          devise: editForm.devise,
          observations: editForm.observations || null,
          date_demenagement: editForm.date_demenagement || null,
        }),
      });
      
      if (response.ok && devis) {
        setDevis({
          ...devis,
          montant_estime: editForm.montant_estime ? parseFloat(editForm.montant_estime) : null,
          nombre_demenageurs: editForm.nombre_demenageurs ? parseInt(editForm.nombre_demenageurs) : null,
          devise: editForm.devise,
          observations: editForm.observations || null,
          date_demenagement: editForm.date_demenagement || null,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (devis) {
      setEditForm({
        montant_estime: devis.montant_estime?.toString() || '',
        nombre_demenageurs: devis.nombre_demenageurs?.toString() || '',
        devise: devis.devise || 'EUR',
        observations: devis.observations || '',
        date_demenagement: devis.date_demenagement || '',
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Grouper les meubles par catégorie
  const meublesParCategorie = meubles.reduce((acc, m) => {
    const cat = m.meuble_categorie || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(m);
    return acc;
  }, {} as Record<string, DevisMeuble[]>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!devis) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Devis non trouvé</p>
          <Link href="/dashboard/devis" className="text-primary-600 hover:underline">
            Retour aux devis
          </Link>
        </div>
      </div>
    );
  }

  const statut = statutColors[devis.statut] || statutColors.nouveau;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard/devis" className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-5 h-5" />
                Retour
              </Link>
              <h1 className="ml-4 text-xl font-bold text-slate-800">
                Devis {devis.numero}
              </h1>
              <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${statut.bg} ${statut.text}`}>
                {statut.label}
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations client */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Informations client</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{devis.client_nom}</p>
                  <div className="mt-3 space-y-2 text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <a href={`mailto:${devis.client_email}`} className="hover:text-primary-600">
                        {devis.client_email}
                      </a>
                    </div>
                    {devis.client_telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <a href={`tel:${devis.client_telephone}`} className="hover:text-primary-600">
                          {devis.client_telephone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Demande le {formatDate(devis.created_at)}
                  </div>
                  {devis.date_demenagement && (
                    <div className="flex items-center gap-2 mt-2 text-primary-600 font-medium">
                      <Calendar className="w-4 h-4" />
                      Déménagement prévu le {new Date(devis.date_demenagement).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Adresses */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Adresses</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex items-center gap-2 text-red-600 font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Départ
                  </div>
                  <p className="text-slate-800">{devis.adresse_depart}</p>
                  {devis.avec_ascenseur_depart && (
                    <p className="text-sm text-slate-500 mt-1">Avec ascenseur</p>
                  )}
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Arrivée
                  </div>
                  <p className="text-slate-800">{devis.adresse_arrivee}</p>
                  {devis.avec_ascenseur_arrivee && (
                    <p className="text-sm text-slate-500 mt-1">Avec ascenseur</p>
                  )}
                </div>
              </div>
              {devis.observations && (
                <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-600 mb-1">Observations:</p>
                  <p className="text-slate-700">{devis.observations}</p>
                </div>
              )}
            </div>

            {/* Liste des meubles */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Meubles ({devis.nombre_meubles})
              </h2>
              
              {Object.entries(meublesParCategorie).map(([categorie, items]) => (
                <div key={categorie} className="mb-6 last:mb-0">
                  <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {categorie}
                  </h3>
                  <div className="space-y-2">
                    {items.map((m) => (
                      <div key={m.id} className="flex items-center justify-between py-2 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-semibold">
                            {m.quantite}
                          </span>
                          <span className="text-slate-800">{m.meuble_nom}</span>
                        </div>
                        <span className="text-slate-600">
                          {(Number(m.quantite || 0) * Number(m.volume_unitaire_m3 || 0)).toFixed(2)} m³
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Résumé */}
            <div className="bg-blue-800 text-white rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Résumé</h2>
              <div className="space-y-4">
                <div className="text-center p-4 bg-white/10 rounded-lg">
                  <p className="text-4xl font-bold">{parseFloat(String(devis.volume_total_m3 || 0)).toFixed(1)}</p>
                  <p className="text-white/80">m³</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{devis.nombre_meubles || 0}</p>
                    <p className="text-sm text-white/80">meubles</p>
                  </div>
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <p className="text-2xl font-bold">{devis.poids_total_kg || 0}</p>
                    <p className="text-sm text-white/80">kg</p>
                  </div>
                </div>
                {devis.montant_estime && (
                  <div className="text-center p-3 bg-green-500/20 rounded-lg border border-green-400/30">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Euro className="w-4 h-4" />
                      <p className="text-2xl font-bold">{devis.montant_estime.toFixed(2)}</p>
                      <span className="text-sm text-white/80">{devis.devise || 'EUR'}</span>
                    </div>
                    <p className="text-xs text-white/80">Montant du devis</p>
                  </div>
                )}
                {devis.nombre_demenageurs && (
                  <div className="text-center p-3 bg-white/10 rounded-lg">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <Users className="w-4 h-4" />
                      <p className="text-2xl font-bold">{devis.nombre_demenageurs}</p>
                    </div>
                    <p className="text-xs text-white/80">déménageurs</p>
                  </div>
                )}
              </div>
            </div>

            {/* Formulaire d'édition */}
            {isEditing ? (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Éditer le devis</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Montant du devis ({editForm.devise})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={editForm.montant_estime}
                      onChange={(e) => setEditForm({ ...editForm, montant_estime: e.target.value })}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nombre de déménageurs
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editForm.nombre_demenageurs}
                      onChange={(e) => setEditForm({ ...editForm, nombre_demenageurs: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Devise
                    </label>
                    <select
                      value={editForm.devise}
                      onChange={(e) => setEditForm({ ...editForm, devise: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="EUR">EUR</option>
                      <option value="CHF">CHF</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date de déménagement
                    </label>
                    <input
                      type="date"
                      value={editForm.date_demenagement}
                      onChange={(e) => setEditForm({ ...editForm, date_demenagement: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observations
                    </label>
                    <textarea
                      value={editForm.observations}
                      onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Notes supplémentaires..."
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Enregistrer
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-slate-800">Informations du devis</h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    <Edit className="w-4 h-4" />
                    Éditer
                  </button>
                </div>
                <div className="space-y-3">
                  {devis.montant_estime ? (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 text-green-700">
                        <Euro className="w-4 h-4" />
                        <span className="text-lg font-bold">{devis.montant_estime.toFixed(2)}</span>
                        <span className="text-sm">{devis.devise || 'EUR'}</span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">Montant du devis</p>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-sm">
                      Aucun montant défini
                    </div>
                  )}
                  {devis.nombre_demenageurs ? (
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-2 text-blue-700">
                        <Users className="w-4 h-4" />
                        <span className="text-lg font-bold">{devis.nombre_demenageurs}</span>
                        <span className="text-sm">déménageur{devis.nombre_demenageurs > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-500 text-sm">
                      Nombre de déménageurs non défini
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 print:hidden">
              <h2 className="text-lg font-semibold text-slate-800 mb-4">Actions</h2>
              <div className="space-y-3">
                {devis.statut === 'nouveau' && (
                  <button
                    onClick={() => updateStatut('vu')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    <Clock className="w-4 h-4" />
                    Marquer comme vu
                  </button>
                )}
                
                {(devis.statut === 'nouveau' || devis.statut === 'vu') && (
                  <button
                    onClick={() => updateStatut('en_traitement')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    <Clock className="w-4 h-4" />
                    Passer en traitement
                  </button>
                )}
                
                {devis.statut === 'en_traitement' && (
                  <button
                    onClick={() => updateStatut('devis_envoye')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                  >
                    <Send className="w-4 h-4" />
                    Devis envoyé
                  </button>
                )}
                
                {devis.statut !== 'accepte' && devis.statut !== 'refuse' && devis.statut !== 'termine' && (
                  <>
                    <button
                      onClick={() => updateStatut('accepte')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accepter
                    </button>
                    <button
                      onClick={() => updateStatut('refuse')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser
                    </button>
                  </>
                )}
                
                {devis.statut === 'accepte' && (
                  <button
                    onClick={() => updateStatut('termine')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer terminé
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

