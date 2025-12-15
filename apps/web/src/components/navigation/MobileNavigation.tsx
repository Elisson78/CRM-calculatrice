'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface MobileNavigationProps {
  className?: string;
}

export default function MobileNavigation({ className = '' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/calculatrice/calculateur-demenagement', label: 'Calculateur' },
    { href: '/login', label: 'Connexion' },
    { href: '/register', label: 'S\'inscrire' },
  ];

  return (
    <div className={`md:hidden ${className}`}>
      {/* Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-white hover:text-white/80 transition-colors"
        aria-label="Menu"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu Content */}
          <div className="fixed top-0 right-0 w-80 max-w-[85vw] h-full bg-white z-50 shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">M</span>
                </div>
                <span className="text-primary-800 font-bold">Moovelabs</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
                aria-label="Fermer le menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="p-6">
              <ul className="space-y-4">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block py-3 px-4 text-gray-700 hover:text-primary-800 hover:bg-gray-50 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Link
                  href="/register"
                  className="block w-full bg-primary-800 text-white text-center py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Commencer gratuitement
                </Link>
              </div>
            </nav>
          </div>
        </>
      )}
    </div>
  );
}