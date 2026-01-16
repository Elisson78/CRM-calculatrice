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
  ExternalLink,
  Settings,
  Mail,
  Palette,
  Save,
  Upload,
  Check,
  X,
  Image as ImageIcon
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

  // Estados para o modal de configurações
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedEntreprise, setSelectedEntreprise] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'smtp'>('general');
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  const handleOpenSettings = async (entrepriseId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/entreprises/${entrepriseId}`);
      if (response.ok) {
        const data = await response.json();
        const ent = data.entreprise;
        setSelectedEntreprise(ent);
        setSettingsForm({
          nom: ent.nom || '',
          email: ent.email || '',
          telephone: ent.telephone || '',
          adresse: ent.adresse || '',
          couleur_primaire: ent.couleur_primaire || '#1e3a5f',
          couleur_secondaire: ent.couleur_secondaire || '#2563eb',
          couleur_accent: ent.couleur_accent || '#dc2626',
          logo_size: ent.logo_size || 100,
          smtp_host: ent.smtp_host || '',
          smtp_port: ent.smtp_port || 587,
          smtp_user: ent.smtp_user || '',
          smtp_password: ent.smtp_password || '',
          smtp_secure: ent.smtp_secure !== undefined ? ent.smtp_secure : true,
          use_custom_smtp: ent.use_custom_smtp || false,
          email_notification: ent.email_notification || '',
          email_notification_1: ent.email_notification_1 || '',
          email_notification_2: ent.email_notification_2 || '',
          email_notification_3: ent.email_notification_3 || '',
        });
        setLogoPreview(ent.logo_data || ent.logo_url);
        setIsSettingsModalOpen(true);
      }
    } catch (error) {
      console.error('Erreur loading settings:', error);
      alert('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntreprise) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/entreprises/${selectedEntreprise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settingsForm),
      });

      if (response.ok) {
        alert('Paramètres enregistrés avec succès !');
        fetchEntreprises();
        setIsSettingsModalOpen(false);
      } else {
        alert('Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      console.error('Erreur saving settings:', error);
      alert('Erreur de connexion');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEntreprise) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Fichier trop volumineux (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('logo', file);
    formData.append('entrepriseId', selectedEntreprise.id);

    try {
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoPreview(data.logoUrl);
      } else {
        alert('Erreur lors de l\'upload du logo');
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur de connexion');
    }
  };

  const handleTestSmtp = async () => {
    if (!settingsForm.smtp_host || !settingsForm.smtp_user || !settingsForm.smtp_password) {
      alert('Veuillez remplir les informations SMTP.');
      return;
    }

    setIsTestingSmtp(true);
    try {
      const response = await fetch('/api/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: settingsForm.smtp_host,
          port: settingsForm.smtp_port,
          user: settingsForm.smtp_user,
          pass: settingsForm.smtp_password,
          secure: settingsForm.smtp_secure
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message || 'Test SMTP réussi !');
      } else {
        alert(`Erreur: ${data.details || data.error}`);
      }
    } catch (error) {
      console.error('Erreur test SMTP:', error);
      alert('Erreur lors du test SMTP');
    } finally {
      setIsTestingSmtp(false);
    }
  };

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
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${entreprise.plan === 'premium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : entreprise.plan === 'pro'
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-slate-100 text-slate-700'
                      }`}>
                      {entreprise.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${entreprise.actif ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
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
                        onClick={() => handleOpenSettings(entreprise.id)}
                        className="p-2 hover:bg-slate-100 rounded-lg"
                        title="Paramètres"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => toggleActif(entreprise.id, entreprise.actif)}
                        className={`p-2 rounded-lg ${entreprise.actif ? 'hover:bg-red-100' : 'hover:bg-green-100'
                          }`}
                        title={entreprise.actif ? 'Désactiver' : 'Activer'}
                      >
                        <Power className={`w-4 h-4 ${entreprise.actif ? 'text-red-500' : 'text-green-500'
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

      {/* Settings Modal */}
      {isSettingsModalOpen && selectedEntreprise && settingsForm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Paramètres de {selectedEntreprise.nom}</h2>
                <p className="text-sm text-slate-500">Gérez la marque, le SMTP e as notificações</p>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 bg-white px-6">
              <button
                onClick={() => setActiveTab('general')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'general' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                Général
              </button>
              <button
                onClick={() => setActiveTab('appearance')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'appearance' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                Apparence
              </button>
              <button
                onClick={() => setActiveTab('smtp')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === 'smtp' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                  }`}
              >
                SMTP & E-mail
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
              <form id="settings-form" onSubmit={handleSaveSettings}>
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'entreprise</label>
                        <input
                          type="text"
                          value={settingsForm.nom}
                          onChange={(e) => setSettingsForm({ ...settingsForm, nom: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email principal</label>
                        <input
                          type="email"
                          value={settingsForm.email}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
                        <input
                          type="text"
                          value={settingsForm.telephone}
                          onChange={(e) => setSettingsForm({ ...settingsForm, telephone: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                        <input
                          type="text"
                          value={settingsForm.adresse}
                          onChange={(e) => setSettingsForm({ ...settingsForm, adresse: e.target.value })}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-200">
                      <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Mail className="w-4 h-4" /> Notificações extras
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="email"
                          placeholder="Email extra 1"
                          value={settingsForm.email_notification_1}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email_notification_1: e.target.value })}
                          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email extra 2"
                          value={settingsForm.email_notification_2}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email_notification_2: e.target.value })}
                          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                        <input
                          type="email"
                          placeholder="Email extra 3"
                          value={settingsForm.email_notification_3}
                          onChange={(e) => setSettingsForm({ ...settingsForm, email_notification_3: e.target.value })}
                          className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" /> Logo de l'entreprise
                      </h3>
                      <div className="flex items-center gap-6 p-4 bg-white rounded-xl border border-slate-200">
                        <div
                          className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden"
                          style={{ width: `${settingsForm.logo_size}px`, height: `${settingsForm.logo_size}px`, minWidth: '64px', minHeight: '64px' }}
                        >
                          {logoPreview ? (
                            <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                          )}
                        </div>
                        <div className="flex-1 space-y-3">
                          <input
                            type="file"
                            id="admin-logo-upload"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                          <div className="flex gap-2">
                            <label htmlFor="admin-logo-upload" className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg cursor-pointer hover:bg-primary-700">
                              <Upload className="w-4 h-4" /> Changer
                            </label>
                            <button
                              type="button"
                              onClick={() => { setLogoPreview(null); setSettingsForm({ ...settingsForm, logo_url: null, logo_data: null }); }}
                              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              Supprimer
                            </button>
                          </div>
                          <div>
                            <label className="block text-xs text-slate-500 mb-1">Taille du logo: {settingsForm.logo_size}px</label>
                            <input
                              type="range" min="64" max="250"
                              value={settingsForm.logo_size}
                              onChange={(e) => setSettingsForm({ ...settingsForm, logo_size: Number(e.target.value) })}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <Palette className="w-4 h-4" /> Couleurs de la marque
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-white rounded-xl border border-slate-200">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 block">Primaire</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={settingsForm.couleur_primaire} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_primaire: e.target.value })} className="h-10 w-10 rounded border-none" />
                            <input type="text" value={settingsForm.couleur_primaire} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_primaire: e.target.value })} className="flex-1 px-3 py-1 border rounded-lg text-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 block">Secondaire</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={settingsForm.couleur_secondaire} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_secondaire: e.target.value })} className="h-10 w-10 rounded border-none" />
                            <input type="text" value={settingsForm.couleur_secondaire} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_secondaire: e.target.value })} className="flex-1 px-3 py-1 border rounded-lg text-sm" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700 block">Accent</label>
                          <div className="flex items-center gap-2">
                            <input type="color" value={settingsForm.couleur_accent} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_accent: e.target.value })} className="h-10 w-10 rounded border-none" />
                            <input type="text" value={settingsForm.couleur_accent} onChange={(e) => setSettingsForm({ ...settingsForm, couleur_accent: e.target.value })} className="flex-1 px-3 py-1 border rounded-lg text-sm" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'smtp' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-100 rounded-xl">
                      <div>
                        <p className="font-semibold text-slate-800">Utiliser un SMTP personnalisé</p>
                        <p className="text-sm text-slate-500">Envoyez des e-mails depuis votre propre serveur</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSettingsForm({ ...settingsForm, use_custom_smtp: !settingsForm.use_custom_smtp })}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settingsForm.use_custom_smtp ? 'bg-primary-600' : 'bg-slate-300'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settingsForm.use_custom_smtp ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {settingsForm.use_custom_smtp && (
                      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Hôte SMTP</label>
                            <input
                              type="text" placeholder="smtp.exemple.com"
                              value={settingsForm.smtp_host}
                              onChange={(e) => setSettingsForm({ ...settingsForm, smtp_host: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Port</label>
                            <input
                              type="number" placeholder="587"
                              value={settingsForm.smtp_port}
                              onChange={(e) => setSettingsForm({ ...settingsForm, smtp_port: Number(e.target.value) })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={settingsForm.smtp_secure}
                                onChange={(e) => setSettingsForm({ ...settingsForm, smtp_secure: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded"
                              />
                              <span className="text-sm font-medium text-slate-700">SSL/TLS sécurisé</span>
                            </label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Utilisateur</label>
                            <input
                              type="text" placeholder="login@exemple.com"
                              value={settingsForm.smtp_user}
                              onChange={(e) => setSettingsForm({ ...settingsForm, smtp_user: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe</label>
                            <input
                              type="password" placeholder="••••••••"
                              value={settingsForm.smtp_password}
                              onChange={(e) => setSettingsForm({ ...settingsForm, smtp_password: e.target.value })}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end">
                          <button
                            type="button"
                            onClick={handleTestSmtp}
                            disabled={isTestingSmtp}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50"
                          >
                            {isTestingSmtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                            Tester la conexão
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
              >
                Annuler
              </button>
              <button
                form="settings-form"
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium disabled:opacity-50 shadow-lg shadow-primary-200"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Sauvegarder les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}









