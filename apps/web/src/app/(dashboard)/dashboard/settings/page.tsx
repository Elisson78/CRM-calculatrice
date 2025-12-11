'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Settings, 
  Palette, 
  Save,
  Loader2,
  ExternalLink,
  Check,
  Copy,
  Upload,
  Trash2,
  Image as ImageIcon,
  CreditCard,
  Calendar,
  Crown,
  Zap
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Entreprise {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  slug: string;
  logo_url: string | null;
  couleur_primaire: string;
  couleur_secondaire: string;
  couleur_accent: string;
  titre_calculatrice: string;
  message_formulaire: string;
  plan: 'basic' | 'pro' | 'enterprise';
  subscription_status?: string | null;
  subscription_current_period_end?: string | null;
  stripe_subscription_id?: string | null;
}

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [entreprise, setEntreprise] = useState<Entreprise | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
    couleur_primaire: '#1e3a5f',
    couleur_secondaire: '#2563eb',
    couleur_accent: '#dc2626',
    titre_calculatrice: 'Simulateur de volume pour déménagement',
    message_formulaire: '',
  });

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchEntreprise();
  }, []);

  const fetchEntreprise = async () => {
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
          setLogoPreview(entData.entreprise.logo_url);
          setFormData({
            nom: entData.entreprise.nom || '',
            email: entData.entreprise.email || '',
            telephone: entData.entreprise.telephone || '',
            adresse: entData.entreprise.adresse || '',
            couleur_primaire: entData.entreprise.couleur_primaire || '#1e3a5f',
            couleur_secondaire: entData.entreprise.couleur_secondaire || '#2563eb',
            couleur_accent: entData.entreprise.couleur_accent || '#dc2626',
            titre_calculatrice: entData.entreprise.titre_calculatrice || 'Simulateur de volume pour déménagement',
            message_formulaire: entData.entreprise.message_formulaire || '',
          });
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
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

  const handleUpgrade = async (plan: 'basic' | 'pro' | 'enterprise') => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Erreur upgrade:', error);
      alert('Erreur lors de la création du checkout');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleColorChange = (colorName: string, value: string) => {
    setFormData(prev => ({ ...prev, [colorName]: value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entreprise) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/entreprise/${entreprise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !entreprise) return;

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('entrepriseId', entreprise.id);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setLogoPreview(data.logoUrl);
        setEntreprise({ ...entreprise, logo_url: data.logoUrl });
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur lors de l\'upload');
        setLogoPreview(entreprise.logo_url);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      alert('Erreur lors de l\'upload');
      setLogoPreview(entreprise.logo_url);
    } finally {
      setUploading(false);
    }
  };

  const handleLogoDelete = async () => {
    if (!entreprise || !confirm('Supprimer le logo?')) return;

    try {
      const response = await fetch(`/api/upload/logo?entrepriseId=${entreprise.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setLogoPreview(null);
        setEntreprise({ ...entreprise, logo_url: null });
      }
    } catch (error) {
      console.error('Erreur suppression:', error);
    }
  };

  const copyLink = () => {
    if (entreprise) {
      navigator.clipboard.writeText(`${baseUrl}/calculatrice/${entreprise.slug}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!entreprise) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-slate-500 mb-4">Entreprise non trouvée</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  const calculatriceUrl = `${baseUrl}/calculatrice/${entreprise.slug}`;

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'pro':
        return <Zap className="w-5 h-5" />;
      case 'enterprise':
        return <Crown className="w-5 h-5" />;
      default:
        return <CreditCard className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'pro':
        return 'bg-purple-100 text-purple-700';
      case 'enterprise':
        return 'bg-amber-100 text-amber-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <DashboardLayout
      user={{
        role: user.role || 'entreprise',
        nom: user.nom,
        entreprise: {
          nom: entreprise.nom,
          slug: entreprise.slug,
        },
      }}
      onLogout={handleLogout}
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Paramètres</h1>

        <div className="space-y-6">
          {/* Subscription/Plan */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Plan et facturation
            </h2>
            
            <div className="space-y-4">
              {/* Plan atual */}
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getPlanIcon(entreprise.plan)}
                  <div>
                    <p className="font-semibold text-slate-800 capitalize">{entreprise.plan}</p>
                    {entreprise.subscription_status && (
                      <p className="text-sm text-slate-500 capitalize">
                        Status: {entreprise.subscription_status}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(entreprise.plan)}`}>
                  {entreprise.plan}
                </span>
              </div>

              {/* Informações da subscription */}
              {entreprise.subscription_current_period_end && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Prochain renouvellement: {formatDate(entreprise.subscription_current_period_end)}
                  </span>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-200">
                {entreprise.stripe_subscription_id ? (
                  <button
                    onClick={handleOpenPortal}
                    disabled={loadingPortal}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {loadingPortal ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Chargement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Gérer l&apos;abonnement
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Crown className="w-4 h-4" />
                    Choisir un plan
                  </button>
                )}

                {entreprise.plan !== 'enterprise' && (
                  <button
                    onClick={() => {
                      const nextPlan = entreprise.plan === 'basic' ? 'pro' : 'enterprise';
                      handleUpgrade(nextPlan);
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Zap className="w-4 h-4" />
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          
          {/* Logo Upload */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Logo de l&apos;entreprise
            </h2>
            
            <div className="flex items-start gap-6">
              {/* Preview */}
              <div className="relative">
                <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-xl 
                              flex items-center justify-center bg-slate-50 overflow-hidden">
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-10 h-10 mx-auto mb-1" />
                      <span className="text-xs">Aucun logo</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Upload controls */}
              <div className="flex-1">
                <p className="text-sm text-slate-600 mb-4">
                  Uploadez le logo de votre entreprise. Il apparaîtra sur votre calculatrice.
                  <br />
                  <span className="text-slate-400">Formats: JPG, PNG, GIF, WebP, SVG. Max 5MB.</span>
                </p>
                
                <div className="flex flex-wrap gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                             hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Upload className="w-4 h-4" />
                    {logoPreview ? 'Changer le logo' : 'Uploader un logo'}
                  </button>
                  
                  {logoPreview && (
                    <button
                      type="button"
                      onClick={handleLogoDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg 
                               hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informations entreprise */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informations de l&apos;entreprise
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+41 XX XXX XX XX"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Personnalisation calculatrice */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personnalisation de la calculatrice
            </h2>
            
            {/* Couleurs */}
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couleur primaire
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.couleur_primaire}
                    onChange={(e) => handleColorChange('couleur_primaire', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.couleur_primaire}
                    onChange={(e) => handleColorChange('couleur_primaire', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couleur secondaire
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.couleur_secondaire}
                    onChange={(e) => handleColorChange('couleur_secondaire', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.couleur_secondaire}
                    onChange={(e) => handleColorChange('couleur_secondaire', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couleur accent
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.couleur_accent}
                    onChange={(e) => handleColorChange('couleur_accent', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer border-0"
                  />
                  <input
                    type="text"
                    value={formData.couleur_accent}
                    onChange={(e) => handleColorChange('couleur_accent', e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="mb-6 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-500 mb-3">Prévisualisation:</p>
              <div className="flex items-center gap-4">
                {logoPreview && (
                  <img src={logoPreview} alt="Logo" className="w-12 h-12 object-contain" />
                )}
                <div className="flex gap-2 flex-wrap">
                  <div 
                    className="px-4 py-2 rounded text-white font-medium text-sm"
                    style={{ backgroundColor: formData.couleur_primaire }}
                  >
                    Primaire
                  </div>
                  <div 
                    className="px-4 py-2 rounded text-white font-medium text-sm"
                    style={{ backgroundColor: formData.couleur_secondaire }}
                  >
                    Secondaire
                  </div>
                  <div 
                    className="px-4 py-2 rounded text-white font-medium text-sm"
                    style={{ backgroundColor: formData.couleur_accent }}
                  >
                    Accent
                  </div>
                </div>
              </div>
            </div>
            
            {/* Titre */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Titre de la calculatrice
              </label>
              <input
                type="text"
                name="titre_calculatrice"
                value={formData.titre_calculatrice}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Message formulaire */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Message RGPD du formulaire
              </label>
              <textarea
                name="message_formulaire"
                value={formData.message_formulaire}
                onChange={handleChange}
                rows={3}
                placeholder="Ces informations ne serviront qu'à l'édition de votre devis..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg resize-none
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Lien calculatrice */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Lien de votre calculatrice
            </h2>
            <div className="flex items-center gap-4 flex-wrap">
              <code className="flex-1 min-w-0 bg-slate-100 px-4 py-3 rounded-lg text-sm truncate">
                {calculatriceUrl}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié!' : 'Copier'}
              </button>
              <Link
                href={`/calculatrice/${entreprise.slug}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4" />
                Voir
              </Link>
            </div>
          </div>

          {/* Bouton sauvegarder */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Enregistré!
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
