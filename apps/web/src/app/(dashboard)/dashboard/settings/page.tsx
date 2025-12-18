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
  Zap,
  Mail,
  Shield,
  Eye,
  EyeOff
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
  subscription_expires_at?: string | null;
  stripe_subscription_id?: string | null;
  stripe_customer_id?: string | null;
  plan_active?: boolean;
  smtp_host?: string | null;
  smtp_port?: number | null;
  smtp_user?: string | null;
  smtp_password?: string | null;
  smtp_secure?: boolean;
  use_custom_smtp?: boolean;
  logo_size?: number;
  logo_data?: string | null;
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
  const [showPassword, setShowPassword] = useState(false);
  const [logoSize, setLogoSize] = useState(100); // Tamanho em pixels
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    smtp_secure: true,
    use_custom_smtp: false,
  });

  useEffect(() => {
    setBaseUrl(window.location.origin);
    fetchEntreprise();
  }, []);

  const fetchEntreprise = async () => {
    try {
      console.log('🔍 Début fetchEntreprise - Récupération des données utilisateur...');
      
      const response = await fetch('/api/auth/me');
      console.log('📡 Réponse /api/auth/me:', response.status, response.statusText);
      
      if (!response.ok) {
        console.error('❌ Échec authentification, redirection vers login');
        const errorText = await response.text();
        console.error('📄 Erreur détaillée:', errorText);
        router.push('/login');
        return;
      }
      
      const data = await response.json();
      console.log('✅ Données utilisateur récupérées:', data);
      setUser(data.user);
      
      if (data.entreprise) {
        console.log('🏢 Récupération des données entreprise...', data.entreprise.id);
        
        const entResponse = await fetch(`/api/entreprise/${data.entreprise.id}`);
        console.log('📡 Réponse /api/entreprise:', entResponse.status, entResponse.statusText);
        
        if (entResponse.ok) {
          const entData = await entResponse.json();
          console.log('✅ Données entreprise récupérées:', entData.entreprise);
          
          setEntreprise(entData.entreprise);
          // Usar logo_data se disponível, senão usar logo_url
          const logoToUse = entData.entreprise.logo_data || entData.entreprise.logo_url;
          // Só atualizar o preview se pas déjà défini (éviter d'écraser après upload)
          setLogoPreview(prev => prev || logoToUse);
          
          const newFormData = {
            nom: entData.entreprise.nom || '',
            email: entData.entreprise.email || '',
            telephone: entData.entreprise.telephone || '',
            adresse: entData.entreprise.adresse || '',
            couleur_primaire: entData.entreprise.couleur_primaire || '#1e3a5f',
            couleur_secondaire: entData.entreprise.couleur_secondaire || '#2563eb',
            couleur_accent: entData.entreprise.couleur_accent || '#dc2626',
            titre_calculatrice: entData.entreprise.titre_calculatrice || 'Simulateur de volume pour déménagement',
            message_formulaire: entData.entreprise.message_formulaire || '',
            smtp_host: entData.entreprise.smtp_host || '',
            smtp_port: entData.entreprise.smtp_port || 587,
            smtp_user: entData.entreprise.smtp_user || '',
            smtp_password: entData.entreprise.smtp_password || '',
            smtp_secure: entData.entreprise.smtp_secure !== undefined ? entData.entreprise.smtp_secure : true,
            use_custom_smtp: entData.entreprise.use_custom_smtp || false,
          };
          
          console.log('📝 FormData initialisé:', newFormData);
          setFormData(newFormData);
          setLogoSize(entData.entreprise.logo_size || 100);
        } else {
          const errorText = await entResponse.text();
          console.error('❌ Erreur récupération entreprise:', errorText);
        }
      } else {
        console.warn('⚠️ Aucune entreprise trouvée pour cet utilisateur');
      }
    } catch (error) {
      console.error('💥 Erreur dans fetchEntreprise:', error);
      setSubmitError('Erreur de chargement des données: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setLoading(false);
      console.log('🏁 Fin fetchEntreprise');
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
    console.log('🚀 Début handleSubmit');
    
    if (!entreprise) {
      console.error('❌ Pas d\'entreprise définie');
      setSubmitError('Aucune entreprise trouvée');
      return;
    }

    console.log('💼 Entreprise actuelle:', entreprise.id, entreprise.nom);

    setSaving(true);
    setSubmitError(null);
    
    try {
      const payload = { ...formData, logo_size: logoSize };
      console.log('📦 Payload à envoyer:', payload);
      
      const response = await fetch(`/api/entreprise/${entreprise.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('📡 Réponse API:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sauvegarde réussie:', result);
        setSaved(true);
        
        // Afficher un message de succès temporaire 
        setTimeout(() => setSaved(false), 4000);
        
        // Recharger les données pour confirmer la sauvegarde
        await fetchEntreprise();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP:', response.status, errorText);
        try {
          const errorData = JSON.parse(errorText);
          setSubmitError(errorData.error || 'Erreur lors de la sauvegarde');
        } catch {
          setSubmitError(`Erreur ${response.status}: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('💥 Erreur handleSubmit:', error);
      setSubmitError('Erreur de connexion: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    } finally {
      setSaving(false);
      console.log('🏁 Fin handleSubmit');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !entreprise) return;

    console.log('Upload de fichier:', file.name, file.size, file.type);

    // Vérifications côté client
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Maximum 5MB.');
      return;
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non autorisé. Utilisez JPG, PNG, GIF, WebP ou SVG.');
      return;
    }

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

      console.log('Envoi vers API upload...');
      
      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      });

      console.log('Réponse upload status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Upload succès:', data);
        setLogoPreview(data.logoUrl);
        setEntreprise(prev => prev ? { ...prev, logo_url: data.logoUrl } : null);
        
        // Utiliser le système de notification existant
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const errorText = await response.text();
        console.error('Erreur upload response:', errorText);
        try {
          const error = JSON.parse(errorText);
          setSubmitError(error.error || 'Erreur lors de l\'upload');
        } catch {
          setSubmitError('Erreur lors de l\'upload: ' + errorText);
        }
        setLogoPreview(entreprise.logo_url);
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      setSubmitError('Erreur lors de l\'upload: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      setLogoPreview(entreprise?.logo_url || null);
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4 sm:mb-6">Paramètres</h1>

        <div className="space-y-6">
          {/* Subscription/Plan */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Plan et facturation
            </h2>
            
            <div className="space-y-4">
              {/* Plan atual */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-slate-50 rounded-lg">
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
              {entreprise.subscription_expires_at && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Prochain renouvellement: {formatDate(entreprise.subscription_expires_at)}
                  </span>
                </div>
              )}
              
              {/* Status da assinatura */}
              {entreprise.subscription_status && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className={`w-2 h-2 rounded-full ${
                    entreprise.subscription_status === 'active' ? 'bg-green-500' : 
                    entreprise.subscription_status === 'past_due' ? 'bg-orange-500' : 
                    'bg-red-500'
                  }`} />
                  <span>Status: {entreprise.subscription_status}</span>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex flex-col gap-3 pt-4 border-t border-slate-200">
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
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Logo de l&apos;entreprise
            </h2>
            
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
              {/* Preview */}
              <div className="relative mx-auto sm:mx-0">
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl 
                           flex items-center justify-center bg-slate-50 overflow-hidden"
                  style={{ 
                    width: `${logoSize}px`, 
                    height: `${logoSize}px`,
                    minWidth: '64px',
                    minHeight: '64px'
                  }}
                >
                  {logoPreview ? (
                    <img 
                      src={logoPreview} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                      <span className="text-xs">Aucun logo</span>
                    </div>
                  )}
                  {uploading && (
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>
                
                {/* Contrôle de taille */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Taille: {logoSize}px
                  </label>
                  <input
                    type="range"
                    min="64"
                    max="200"
                    value={logoSize}
                    onChange={(e) => setLogoSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-1">
                    <span>64px</span>
                    <span>200px</span>
                  </div>
                </div>
              </div>
              
              {/* Upload controls */}
              <div className="flex-1 w-full">
                <p className="text-sm text-slate-600 mb-4">
                  Uploadez le logo de votre entreprise. Il apparaîtra sur votre calculatrice.
                  <br />
                  <span className="text-slate-400">Formats: JPG, PNG, GIF, WebP, SVG. Max 5MB.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3">
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
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Informations de l&apos;entreprise
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Personnalisation de la calculatrice
            </h2>
            
            {/* Couleurs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Couleur primaire
                </label>
                <div className="flex gap-2 items-center">
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
                <div className="flex gap-2 items-center">
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
                <div className="flex gap-2 items-center">
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
            <div className="mb-6 p-3 sm:p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-500 mb-3">Prévisualisation:</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                {logoPreview && (
                  <img 
                    src={logoPreview} 
                    alt="Logo" 
                    className="object-contain"
                    style={{ width: `${Math.min(logoSize * 0.5, 48)}px`, height: `${Math.min(logoSize * 0.5, 48)}px` }}
                  />
                )}
                <div className="flex gap-2 flex-wrap w-full">
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

          {/* Configuration SMTP */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Configuration SMTP
            </h2>
            
            <div className="space-y-4">
              {/* Toggle SMTP personnalisé */}
              <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <input
                  type="checkbox"
                  id="use_custom_smtp"
                  checked={formData.use_custom_smtp}
                  onChange={(e) => setFormData(prev => ({ ...prev, use_custom_smtp: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="use_custom_smtp" className="text-sm font-medium text-slate-700">
                  Utiliser un serveur SMTP personnalisé
                </label>
              </div>
              
              <p className="text-sm text-slate-600">
                Par défaut, les emails sont envoyés depuis notre serveur. 
                Activez cette option pour envoyer les emails depuis votre propre serveur SMTP.
              </p>
              
              {formData.use_custom_smtp && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 sm:p-4 bg-slate-50 rounded-lg border">
                  <div className="sm:col-span-2">
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-amber-700">
                        Configuration sécurisée
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Serveur SMTP *
                    </label>
                    <input
                      type="text"
                      name="smtp_host"
                      value={formData.smtp_host}
                      onChange={handleChange}
                      placeholder="smtp.gmail.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Port *
                    </label>
                    <input
                      type="number"
                      name="smtp_port"
                      value={formData.smtp_port}
                      onChange={handleChange}
                      placeholder="587"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom d&apos;utilisateur *
                    </label>
                    <input
                      type="text"
                      name="smtp_user"
                      value={formData.smtp_user}
                      onChange={handleChange}
                      placeholder="votre@email.com"
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg
                               focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mot de passe *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="smtp_password"
                        value={formData.smtp_password}
                        onChange={handleChange}
                        placeholder="••••••••••"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg pr-10
                                 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formData.smtp_secure}
                        onChange={(e) => setFormData(prev => ({ ...prev, smtp_secure: e.target.checked }))}
                        className="rounded"
                      />
                      Connexion sécurisée (TLS/SSL)
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Lien calculatrice */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Lien de votre calculatrice
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <code className="flex-1 min-w-0 bg-slate-100 px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm break-all sm:truncate">
                {calculatriceUrl}
              </code>
              <button
                type="button"
                onClick={copyLink}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 text-sm"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copié!' : 'Copier'}
              </button>
              <Link
                href={`/calculatrice/${entreprise.slug}`}
                target="_blank"
                className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Voir
              </Link>
            </div>
          </div>

          {/* Messages d'erreur et de succès */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{submitError}</p>
            </div>
          )}
          
          {saved && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <p className="text-green-600 text-sm font-medium">
                  Configuration enregistrée avec succès !
                </p>
              </div>
            </div>
          )}

          {/* Bouton sauvegarder */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg
                       hover:bg-blue-700 disabled:opacity-50 font-medium w-full sm:w-auto"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Enregistrement...
                </>
              ) : saved ? (
                <>
                  <Check className="w-5 h-5" />
                  Configuration sauvegardée !
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer la configuration
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
