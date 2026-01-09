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
  etage_depart: number | null;
  adresse_arrivee: string;
  avec_ascenseur_arrivee: boolean;
  etage_arrivee: number | null;
  volume_total_m3: number;
  poids_total_kg: number;
  nombre_meubles: number;
  statut: string;
  date_demenagement: string | null;
  observations: string | null;
  montant_estime: number | null;
  devise: string;
  nombre_demenageurs: number | null;
  entreprise_nom?: string;
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
    etage_depart: '0',
    etage_arrivee: '0',
    avec_ascenseur_depart: false,
    avec_ascenseur_arrivee: false,
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
          date_demenagement: data.devis.date_demenagement ? new Date(data.devis.date_demenagement).toISOString().split('T')[0] : '',
          etage_depart: data.devis.etage_depart?.toString() || '0',
          etage_arrivee: data.devis.etage_arrivee?.toString() || '0',
          avec_ascenseur_depart: data.devis.avec_ascenseur_depart ?? false,
          avec_ascenseur_arrivee: data.devis.avec_ascenseur_arrivee ?? false,
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
          etage_depart: editForm.etage_depart || 0,
          etage_arrivee: editForm.etage_arrivee || 0,
          avec_ascenseur_depart: editForm.avec_ascenseur_depart,
          avec_ascenseur_arrivee: editForm.avec_ascenseur_arrivee,
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
          etage_depart: parseInt(editForm.etage_depart || '0'),
          etage_arrivee: parseInt(editForm.etage_arrivee || '0'),
          avec_ascenseur_depart: editForm.avec_ascenseur_depart,
          avec_ascenseur_arrivee: editForm.avec_ascenseur_arrivee,
        });
        setIsEditing(false);
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Erreur inconnue lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de la sauvegarde');
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
        etage_depart: devis.etage_depart?.toString() || '0',
        etage_arrivee: devis.etage_arrivee?.toString() || '0',
        avec_ascenseur_depart: devis.avec_ascenseur_depart ?? false,
        avec_ascenseur_arrivee: devis.avec_ascenseur_arrivee ?? false,
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
                {devis.entreprise_nom ? `${devis.entreprise_nom} - Devis ${devis.numero}` : `Devis ${devis.numero}`}
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

        {/* Layout pour impression - en une colonne */}
        <div className="print:block hidden">
          {/* En-tête de devis pour impression */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
            <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
              <div>
                {devis.entreprise_nom && (
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-1">
                    {devis.entreprise_nom}
                  </h1>
                )}
                <h2 className="text-lg font-bold text-slate-700">Devis {devis.numero}</h2>
                <p className="text-sm text-slate-600">
                  Demande le {formatDate(devis.created_at)}
                  {devis.date_demenagement && (
                    <span className="ml-4 text-primary-600 font-medium">
                      Déménagement prévu le {new Date(devis.date_demenagement).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{parseFloat(String(devis.volume_total_m3 || 0)).toFixed(1)} m³</div>
                <div className="text-sm text-slate-600">
                  {devis.nombre_meubles} meubles • {devis.poids_total_kg} kg
                  {devis.nombre_demenageurs && (
                    <span className="ml-1">• {devis.nombre_demenageurs} déménageurs</span>
                  )}
                </div>
                {devis.montant_estime && (
                  <div className="text-lg font-bold text-green-600 mt-1">
                    {Number(devis.montant_estime).toFixed(2)} {devis.devise || 'EUR'}
                  </div>
                )}
              </div>
            </div>

            {/* Client et adresses en ligne */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-2">Client</h3>
                <p className="text-lg font-bold text-slate-800">{devis.client_nom}</p>
                <p className="text-sm text-slate-600">{devis.client_email}</p>
                {devis.client_telephone && (
                  <p className="text-sm text-slate-600">{devis.client_telephone}</p>
                )}
              </div>

              <div>
                <h3 className="text-sm font-semibold text-red-600 mb-2">Départ</h3>
                <p className="text-sm text-slate-800">{devis.adresse_depart}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Ascenseur: <span className="font-bold">{devis.avec_ascenseur_depart ? 'OUI' : 'NON'}</span>
                  {devis.etage_depart !== null && devis.etage_depart !== undefined && (
                    <> • Étage: <span className="font-bold">{devis.etage_depart === 0 ? 'RDC' : devis.etage_depart}</span></>
                  )}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-green-600 mb-2">Arrivée</h3>
                <p className="text-sm text-slate-800">{devis.adresse_arrivee}</p>
                <p className="text-xs text-slate-600 mt-1">
                  Ascenseur: <span className="font-bold">{devis.avec_ascenseur_arrivee ? 'OUI' : 'NON'}</span>
                  {devis.etage_arrivee !== null && devis.etage_arrivee !== undefined && (
                    <> • Étage: <span className="font-bold">{devis.etage_arrivee === 0 ? 'RDC' : devis.etage_arrivee}</span></>
                  )}
                </p>
              </div>
            </div>

            {devis.observations && (
              <div className="mt-4 p-3 bg-slate-50 rounded border">
                <p className="text-xs font-medium text-slate-600 mb-1">Observations:</p>
                <p className="text-sm text-slate-700">{devis.observations}</p>
              </div>
            )}
          </div>

          {/* Liste des meubles compacte pour impression */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Inventaire détaillé</h2>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(meublesParCategorie).map(([categorie, items]) => (
                <div key={categorie} className="mb-4">
                  <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 rounded">
                    {categorie}
                  </h3>
                  <div className="space-y-1">
                    {items.map((m) => (
                      <div key={m.id} className="flex justify-between items-center text-sm py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-xs font-semibold">
                            {m.quantite}
                          </span>
                          <span className="text-slate-800 text-xs">{m.meuble_nom}</span>
                        </div>
                        <span className="text-slate-600 text-xs">
                          {(Number(m.quantite || 0) * Number(m.volume_unitaire_m3 || 0)).toFixed(2)} m³
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Layout normal pour écran */}
        <div className="print:hidden grid lg:grid-cols-3 gap-8">
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
                  <p className="text-sm text-slate-600 mt-2">
                    Ascenseur: <span className="font-bold">{devis.avec_ascenseur_depart ? 'Oui' : 'Non'}</span>
                    {devis.etage_depart !== null && devis.etage_depart !== undefined && (
                      <span className="ml-3">Étage: <span className="font-bold">{devis.etage_depart === 0 ? 'RDC' : devis.etage_depart}</span></span>
                    )}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 text-green-600 font-medium mb-2">
                    <MapPin className="w-4 h-4" />
                    Arrivée
                  </div>
                  <p className="text-slate-800">{devis.adresse_arrivee}</p>
                  <p className="text-sm text-slate-600 mt-2">
                    Ascenseur: <span className="font-bold">{devis.avec_ascenseur_arrivee ? 'Oui' : 'Non'}</span>
                    {devis.etage_arrivee !== null && devis.etage_arrivee !== undefined && (
                      <span className="ml-3">Étage: <span className="font-bold">{devis.etage_arrivee === 0 ? 'RDC' : devis.etage_arrivee}</span></span>
                    )}
                  </p>
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
                      <p className="text-2xl font-bold">{Number(devis.montant_estime).toFixed(2)}</p>
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

            {/* Modal d'édition */}
            {isEditing && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                      <Edit className="w-5 h-5 text-primary-600" />
                      Édition du devis
                    </h2>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Montant et Devise
                        </label>
                        <div className="flex gap-3">
                          <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 sm:text-sm">
                                {editForm.devise === 'EUR' ? '€' : editForm.devise === 'USD' ? '$' : 'Fr'}
                              </span>
                            </div>
                            <input
                              type="number"
                              step="0.01"
                              value={editForm.montant_estime}
                              onChange={(e) => setEditForm({ ...editForm, montant_estime: e.target.value })}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                          <select
                            value={editForm.devise}
                            onChange={(e) => setEditForm({ ...editForm, devise: e.target.value })}
                            className="w-24 px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                          >
                            <option value="EUR">EUR</option>
                            <option value="CHF">CHF</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Logistique & Équipe
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Déménageurs</label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                              <input
                                type="number"
                                min="1"
                                value={editForm.nombre_demenageurs}
                                onChange={(e) => setEditForm({ ...editForm, nombre_demenageurs: e.target.value })}
                                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-primary-500"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                          <div className="space-y-3">
                            <p className="text-xs font-bold text-slate-400 uppercase">Départ</p>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Étage</label>
                              <input
                                type="number"
                                value={editForm.etage_depart}
                                onChange={(e) => setEditForm({ ...editForm, etage_depart: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500"
                              />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.avec_ascenseur_depart}
                                onChange={(e) => setEditForm({ ...editForm, avec_ascenseur_depart: e.target.checked })}
                                className="rounded text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-xs text-slate-700 font-medium">Ascenseur</span>
                            </label>
                          </div>

                          <div className="space-y-3 border-l border-slate-200 pl-4">
                            <p className="text-xs font-bold text-slate-400 uppercase">Arrivée</p>
                            <div>
                              <label className="block text-xs text-slate-500 mb-1">Étage</label>
                              <input
                                type="number"
                                value={editForm.etage_arrivee}
                                onChange={(e) => setEditForm({ ...editForm, etage_arrivee: e.target.value })}
                                className="w-full p-2 border border-slate-300 rounded focus:ring-primary-500"
                              />
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editForm.avec_ascenseur_arrivee}
                                onChange={(e) => setEditForm({ ...editForm, avec_ascenseur_arrivee: e.target.checked })}
                                className="rounded text-primary-600 focus:ring-primary-500"
                              />
                              <span className="text-xs text-slate-700 font-medium">Ascenseur</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Planification
                        </label>
                        <div>
                          <label className="block text-xs text-slate-500 mb-1">Date de déménagement</label>
                          <input
                            type="date"
                            value={editForm.date_demenagement}
                            onChange={(e) => setEditForm({ ...editForm, date_demenagement: e.target.value })}
                            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-4">
                        <label className="block text-sm font-semibold text-slate-700">
                          Notes & Observations
                        </label>
                        <textarea
                          value={editForm.observations}
                          onChange={(e) => setEditForm({ ...editForm, observations: e.target.value })}
                          rows={4}
                          className="w-full px-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Ajoutez des détails importants pour ce devis..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-100 bg-slate-50 rounded-b-xl">
                    <button
                      onClick={handleCancelEdit}
                      disabled={saving}
                      className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Enregistrer les modifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Affichage des informations (Lecture seule) */}
            {!isEditing && (
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Euro className="w-5 h-5 text-slate-400" />
                    Détails financiers & logistiques
                  </h2>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Modifier
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className={`p-4 rounded-xl border ${devis.montant_estime ? 'bg-green-50 border-green-100' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-sm font-medium text-slate-500 mb-1">Montant estimé</p>
                    {devis.montant_estime ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-slate-800">{Number(devis.montant_estime).toFixed(2)}</span>
                        <span className="text-sm font-medium text-slate-600">{devis.devise || 'EUR'}</span>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Non défini</p>
                    )}
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-sm font-medium text-slate-500 mb-1">Équipe</p>
                    {devis.nombre_demenageurs ? (
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="text-lg font-semibold text-slate-800">{devis.nombre_demenageurs}</span>
                        <span className="text-slate-600">déménageurs</span>
                      </div>
                    ) : (
                      <p className="text-slate-400 italic">Non défini</p>
                    )}
                  </div>
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

