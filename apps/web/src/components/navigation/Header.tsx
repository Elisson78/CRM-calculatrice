import Link from 'next/link';
import MobileNavigation from './MobileNavigation';

interface HeaderProps {
  className?: string;
}

export default function Header({ className = '' }: HeaderProps) {
  return (
    <header className={`container mx-auto px-4 py-6 ${className}`}>
      <nav className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
            <span className="text-primary-800 font-bold text-xl">M</span>
          </div>
          <span className="text-white font-bold text-xl">Moovelabs</span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-white/80 hover:text-white transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/calculatrice/calculateur-demenagement"
            className="text-white/80 hover:text-white transition-colors"
          >
            Calculateur
          </Link>
          <Link
            href="/login"
            className="text-white/80 hover:text-white transition-colors"
          >
            Connexion
          </Link>
          <Link
            href="/register"
            className="bg-white text-primary-800 px-4 py-2 rounded-lg font-medium
                       hover:bg-slate-100 transition-colors"
          >
            S'inscrire
          </Link>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation />
      </nav>
    </header>
  );
}