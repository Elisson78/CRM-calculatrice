import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Conditions Générales d'Utilisation</h1>
          
          <div className="prose prose-gray max-w-none">
            <p className="text-lg text-gray-600 mb-6">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Objet</h2>
            <p className="text-gray-600 mb-4">
              Les présentes conditions générales régissent l'utilisation de la plateforme Moovelabs, 
              service de calculatrice de volume pour devis de déménagement.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Accès au service</h2>
            <p className="text-gray-600 mb-4">
              L'accès à Moovelabs est gratuit pour les estimations de base. 
              Des fonctionnalités premium sont disponibles via un abonnement payant.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Utilisation du service</h2>
            <p className="text-gray-600 mb-4">
              L'utilisateur s'engage à :
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4">
              <li>Fournir des informations exactes et à jour</li>
              <li>Ne pas utiliser le service à des fins illégales</li>
              <li>Respecter les droits de propriété intellectuelle</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Responsabilité</h2>
            <p className="text-gray-600 mb-4">
              Les estimations fournies par Moovelabs sont indicatives. 
              La responsabilité de Moovelabs ne saurait être engagée en cas d'écart avec le volume réel.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Abonnements</h2>
            <p className="text-gray-600 mb-4">
              Les abonnements sont facturés mensuellement. 
              L'utilisateur peut résilier son abonnement à tout moment depuis son compte.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Contact</h2>
            <p className="text-gray-600 mb-4">
              Pour toute question concernant ces conditions, contactez-nous à : 
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