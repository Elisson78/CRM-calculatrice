'use client';

import Link from 'next/link';
import { useCalculatriceStore } from '@/stores/calculatriceStore';

export function CalculatriceHeader() {
  const { entreprise } = useCalculatriceStore();
  
  const primaryColor = entreprise?.couleur_primaire || '#1e3a5f';
  
  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-20">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo et nom */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {entreprise?.logo_url ? (
              <img
                src={entreprise.logo_url}
                alt={entreprise.nom}
                className="w-10 h-10 sm:w-12 sm:h-12 object-contain flex-shrink-0"
              />
            ) : (
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl flex-shrink-0"
                style={{ backgroundColor: primaryColor }}
              >
                {entreprise?.nom?.charAt(0) || 'M'}
              </div>
            )}
            <h1 
              className="text-base sm:text-lg md:text-xl font-bold truncate"
              style={{ color: primaryColor }}
            >
              {entreprise?.nom || 'Moovelabs'}
            </h1>
          </div>
          
          {/* Info contact entreprise */}
          {entreprise?.telephone && (
            <a
              href={`tel:${entreprise.telephone}`}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 flex-shrink-0 ml-2"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="hidden sm:inline">{entreprise.telephone}</span>
              <span className="sm:hidden">Contact</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
