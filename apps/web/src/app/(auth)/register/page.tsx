'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Loader2, UserPlus, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    entrepriseNom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          entrepriseNom: formData.entrepriseNom,
          telephone: formData.telephone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      // Rediriger vers le dashboard
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-700 to-secondary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center">
              <span className="text-primary-800 font-bold text-2xl">M</span>
            </div>
            <span className="text-white font-bold text-2xl">Moovelabs</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Building2 className="w-6 h-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-slate-800">
              Créer un compte
            </h1>
          </div>
          <p className="text-slate-500 text-center mb-6">
            Inscrivez votre entreprise de déménagement
          </p>

          {/* Erreur */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom entreprise */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                name="entrepriseNom"
                value={formData.entrepriseNom}
                onChange={handleChange}
                placeholder="Ma Société de Déménagement"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder:text-slate-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Adresse email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@entreprise.com"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder:text-slate-400"
              />
            </div>

            {/* Téléphone */}
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
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder:text-slate-400"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                           placeholder:text-slate-400 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirmer mot de passe */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Confirmer le mot de passe *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Répétez le mot de passe"
                required
                className="w-full px-4 py-3 border border-slate-300 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                         placeholder:text-slate-400"
              />
            </div>

            {/* Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 rounded border-slate-300 text-primary-600 
                         focus:ring-primary-500"
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                J'accepte les{' '}
                <Link href="/terms" className="text-primary-600 hover:underline">
                  conditions d'utilisation
                </Link>{' '}
                et la{' '}
                <Link href="/privacy" className="text-primary-600 hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-800 text-white py-3 rounded-lg font-semibold
                       hover:bg-primary-700 transition-colors duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Création en cours...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          {/* Connexion */}
          <p className="text-center mt-6 text-slate-600">
            Déjà un compte ?{' '}
            <Link href="/login" className="text-primary-600 font-semibold hover:text-primary-700">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Retour accueil */}
        <p className="text-center mt-6">
          <Link href="/" className="text-white/70 hover:text-white text-sm">
            ← Retour à l'accueil
          </Link>
        </p>
      </div>
    </div>
  );
}




