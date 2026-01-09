'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users,
    Loader2,
    Search,
    UserCog,
    ShieldCheck,
    Building2,
    User as UserIcon,
    SearchX,
    RefreshCw,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';


interface User {
    id: string;
    email: string;
    role: 'admin' | 'entreprise' | 'client';
    nom: string | null;
    prenom: string | null;
    telephone: string | null;
    created_at: string;
    email_verified: boolean;
}

export default function AdminUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        checkAdmin();
    }, []);

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

            setUser(data.user);
            fetchUsers();
        } catch (error) {
            console.error('Erreur:', error);
            router.push('/login');
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/users');
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Erreur loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            setUpdatingId(userId);
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (response.ok) {
                // Mettre à jour localement
                setUsers(users.map(u =>
                    u.id === userId ? { ...u, role: newRole as any } : u
                ));
            } else {
                alert('Erreur lors de la mise à jour du rôle');
            }
        } catch (error) {
            console.error('Erreur updating role:', error);
            alert('Une erreur est survenue');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.nom && user.nom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.prenom && user.prenom.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin':
                return (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                        <ShieldCheck className="w-3 h-3" /> Administrateur
                    </span>
                );
            case 'entreprise':
                return (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        <Building2 className="w-3 h-3" /> Entreprise
                    </span>
                );
            case 'client':
                return (
                    <span className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        <UserIcon className="w-3 h-3" /> Client
                    </span>
                );
            default:
                return null;
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <DashboardLayout
            user={{ role: user.role, nom: user.nom }}
            onLogout={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
            }}
        >
            <div className="p-6 max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                            <Users className="w-7 h-7 text-primary-600" />
                            Gestion des Utilisateurs
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Administrez les comptes e changez les rôles d'accès.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                            title="Actualiser la liste"
                        >
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Filtres e Recherche */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par nom, email..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-slate-900"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table/List */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {loading && users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader2 className="w-10 h-10 animate-spin text-primary-600 mb-4" />
                            <p className="text-slate-500">Chargement des utilisateurs...</p>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SearchX className="w-16 h-16 text-slate-200 mb-4" />
                            <p className="text-slate-600 font-medium">Aucun utilisateur trouvé</p>
                            <p className="text-slate-400 text-sm">Réessayez avec d'autres termes de recherche.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Papel Atual</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Inscrição</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 italic">
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase">
                                                        {user.prenom?.[0] || user.nom?.[0] || user.email[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900 leading-tight">
                                                            {[user.prenom, user.nom].filter(Boolean).join(' ') || 'Sans nom'}
                                                        </p>
                                                        <p className="text-sm text-slate-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-900">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 italic">
                                                {new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(user.created_at))}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {updatingId === user.id ? (
                                                        <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                                                    ) : (
                                                        <select
                                                            className="bg-slate-50 border border-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900"
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                        >
                                                            <option value="client">Client</option>
                                                            <option value="entreprise">Entreprise</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    )}
                                                    <UserCog className="w-4 h-4 text-slate-400" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
