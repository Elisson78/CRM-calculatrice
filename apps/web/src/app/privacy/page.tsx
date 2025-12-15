import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Politique de Confidentialité</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Collecte des informations</h2>
            <p className="text-gray-600 mb-4">
              Moovelabs collecte uniquement les informations nécessaires au bon fonctionnement de la plateforme de devis de déménagement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Utilisation des données</h2>
            <p className="text-gray-600 mb-4">
              Vos données sont utilisées pour :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Générer vos devis de déménagement</li>
              <li>Communiquer avec vous concernant votre demande</li>
              <li>Améliorer nos services</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Protection des données</h2>
            <p className="text-gray-600 mb-4">
              Nous mettons en place des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Vos droits</h2>
            <p className="text-gray-600 mb-4">
              Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement et de portabilité de vos données.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Contact</h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant cette politique de confidentialité, contactez-nous à : 
              <a href="mailto:contact@moovelabs.com" className="text-primary-600 hover:text-primary-700 ml-1">
                contact@moovelabs.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}