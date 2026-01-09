'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Package,
  Users,
  FileText,
  Settings,
  LogOut,
  X,
  Menu,
  CreditCard
} from 'lucide-react';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
}

interface SidebarProps {
  user: {
    role: 'admin' | 'entreprise' | 'client';
    nom?: string | null;
    entreprise?: {
      nom: string;
      slug: string;
    } | null;
  };
  onLogout: () => void;
}

const adminNavItems: NavItem[] = [
  { href: '/admin', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { href: '/admin/entreprises', icon: <Building2 className="w-5 h-5" />, label: 'Entreprises' },
  { href: '/admin/devis', icon: <FileText className="w-5 h-5" />, label: 'Orçamentos' },
  { href: '/admin/meubles', icon: <Package className="w-5 h-5" />, label: 'Catalogue' },
  { href: '/admin/users', icon: <Users className="w-5 h-5" />, label: 'Utilisateurs' },
  { href: '/admin/stripe', icon: <CreditCard className="w-5 h-5" />, label: 'Stripe' },
];

const entrepriseNavItems: NavItem[] = [
  { href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard' },
  { href: '/dashboard/devis', icon: <FileText className="w-5 h-5" />, label: 'Devis' },
  { href: '/dashboard/clients', icon: <Users className="w-5 h-5" />, label: 'Clients' },
  { href: '/dashboard/plans', icon: <CreditCard className="w-5 h-5" />, label: 'Plans et facturation' },
  { href: '/dashboard/settings', icon: <Settings className="w-5 h-5" />, label: 'Paramètres' },
];

export default function Sidebar({ user, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determinar quais itens de navegação usar
  const navItems = user.role === 'admin' ? adminNavItems : entrepriseNavItems;

  // Título da sidebar
  const sidebarTitle = user.role === 'admin'
    ? 'Administration'
    : (user.entreprise?.nom || 'Dashboard');

  // Fechar menu mobile quando a rota mudar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Prevenir scroll do body quando menu mobile está aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary-800">
              <span className="text-white font-bold text-xl">M</span>
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-sm">
                {user.role === 'admin' ? 'Moovelabs' : (user.entreprise?.nom || 'Dashboard')}
              </h1>
              <p className="text-xs text-slate-500">{sidebarTitle}</p>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-700" />
            ) : (
              <Menu className="w-6 h-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop */}
      <aside className={`
        hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0
        w-64 bg-primary-800 
        text-white h-screen z-30
      `}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Logo */}
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-xl text-primary-800">
                  M
                </span>
              </div>
              <div>
                <h1 className="font-bold">Moovelabs</h1>
                <p className="text-xs text-white/60">{sidebarTitle}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="p-6 border-t border-white/10">
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-white/70 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu sidebar */}
      <aside
        className={`
          lg:hidden fixed inset-y-0 left-0 z-50
          w-64 bg-primary-800
          text-white transform transition-transform duration-300 ease-in-out
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="font-bold text-xl text-primary-800">
                  M
                </span>
              </div>
              <div>
                <h1 className="font-bold">Moovelabs</h1>
                <p className="text-xs text-white/60">{sidebarTitle}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && item.href !== '/admin' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Logout button */}
          <div className="mt-auto p-6 border-t border-white/10">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onLogout();
              }}
              className="flex items-center gap-2 text-white/70 hover:text-white w-full px-4 py-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}






