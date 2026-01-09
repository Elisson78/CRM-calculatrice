'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    FileText,
    Eye,
    Clock,
    CheckCircle,
    XCircle,
    Loader2,
    Search,
    MapPin,
    Phone,
    Mail,
    Calendar,
    Building2,
    Download,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    Pencil,
    Trash2,
    AlertTriangle,
    X
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface Devis {
    id: string;
    numero: string;
    client_nom: string;
    client_email: string;
    client_telephone: string;
    adresse_depart: string;
    adresse_arrivee: string;
    volume_total_m3: number;
    nombre_meubles: number;
    statut: string;
    date_demenagement: string | null;
    montant_estime: number | null;
    devise: string;
    created_at: string;
    entreprise_nom: string;
    entreprise_slug: string;
}

const statutColors: Record<string, { bg: string; text: string; label: string }> = {
    nouveau: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Nouveau' },
    vu: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Vu' },
    en_traitement: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'En traitement' },
    devis_envoye: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Devis envoyé' },
    accepte: { bg: 'bg-green-100', text: 'text-green-700', label: 'Accepté' },
    refuse: { bg: 'bg-red-100', text: 'text-red-700', label: 'Refusé' },
    termine: { bg: 'bg-slate-100', text: 'text-slate-700', label: 'Terminé' },
};

export default function AdminDevisPage() {
    const router = useRouter();
    const [devis, setDevis] = useState<Devis[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatut, setFilterStatut] = useState('');
    const [user, setUser] = useState<any>(null);
    const [sortField, setSortField] = useState<keyof Devis | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedDevis, setSelectedDevis] = useState<string[]>([]);

    // Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDevis, setEditingDevis] = useState<Devis | null>(null);
    const [editForm, setEditForm] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deletingDevisId, setDeletingDevisId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            fetchDevis();
        } catch (error) {
            console.error('Erreur:', error);
            router.push('/login');
        }
    };

    const fetchDevis = async () => {
        try {
            const response = await fetch('/api/admin/devis');
            if (response.ok) {
                const data = await response.json();
                setDevis(data.devis || []);
            }
        } catch (error) {
            console.error('Erreur devis:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (field: keyof Devis) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
        setCurrentPage(1);
    };

    const getSortIcon = (field: keyof Devis) => {
        if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-slate-400" />;
        return sortDirection === 'asc' ?
            <ArrowUp className="w-3 h-3 text-primary-600" /> :
            <ArrowDown className="w-3 h-3 text-primary-600" />;
    };

    const handleSelectDevis = (devisId: string) => {
        setSelectedDevis(prev =>
            prev.includes(devisId)
                ? prev.filter(id => id !== devisId)
                : [...prev, devisId]
        );
    };

    const handleSelectAll = () => {
        if (selectedDevis.length === paginatedDevis.length) {
            setSelectedDevis([]);
        } else {
            setSelectedDevis(paginatedDevis.map(d => d.id));
        }
    };

    const exportSelectedDevis = () => {
        const selected = devis.filter(d => selectedDevis.includes(d.id));
        const csvContent = [
            'Numéro,Entreprise,Client,Email,Téléphone,Adresse Départ,Adresse Arrivée,Volume (m³),Meubles,Statut,Date création',
            ...selected.map(d => [
                d.numero,
                d.entreprise_nom,
                d.client_nom,
                d.client_email,
                d.client_telephone || '',
                d.adresse_depart,
                d.adresse_arrivee,
                d.volume_total_m3,
                d.nombre_meubles,
                statutColors[d.statut]?.label || d.statut,
                new Date(d.created_at).toLocaleDateString('fr-FR')
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `admin-devis-export-${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleEdit = (devisItem: Devis) => {
        setEditingDevis(devisItem);
        setEditForm({
            client_nom: devisItem.client_nom,
            client_email: devisItem.client_email,
            client_telephone: devisItem.client_telephone || '',
            adresse_depart: devisItem.adresse_depart,
            adresse_arrivee: devisItem.adresse_arrivee,
            statut: devisItem.statut,
            volume_total_m3: devisItem.volume_total_m3,
            date_demenagement: devisItem.date_demenagement ? devisItem.date_demenagement.split('T')[0] : '',
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDevis) return;

        setIsSaving(true);
        try {
            const response = await fetch(`/api/admin/devis/${editingDevis.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                await fetchDevis();
                setIsEditModalOpen(false);
                setEditingDevis(null);
            } else {
                alert('Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur update:', error);
            alert('Erreur serveur');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteClick = (devisId: string) => {
        setDeletingDevisId(devisId);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deletingDevisId) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/devis/${deletingDevisId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setDevis(prev => prev.filter(d => d.id !== deletingDevisId));
                setIsDeleteModalOpen(false);
                setDeletingDevisId(null);
            } else {
                alert('Erreur lors de la suppression');
            }
        } catch (error) {
            console.error('Erreur delete:', error);
            alert('Erreur serveur');
        } finally {
            setIsDeleting(false);
        }
    };

    let filteredDevis = devis.filter(d => {
        const matchSearch =
            d.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.client_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            d.entreprise_nom?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchStatut = !filterStatut || d.statut === filterStatut;
        return matchSearch && matchStatut;
    });

    if (sortField) {
        filteredDevis = [...filteredDevis].sort((a, b) => {
            let aVal = a[sortField];
            let bVal = b[sortField];
            if (aVal === null || aVal === undefined) aVal = '';
            if (bVal === null || bVal === undefined) bVal = '';
            if (typeof aVal === 'string') aVal = aVal.toLowerCase();
            if (typeof bVal === 'string') bVal = bVal.toLowerCase();

            if (sortDirection === 'asc') {
                return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            } else {
                return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
            }
        });
    }

    const totalPages = Math.ceil(filteredDevis.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDevis = filteredDevis.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <DashboardLayout
            user={{ role: user.role, nom: user.nom }}
            onLogout={handleLogout}
        >
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">Tous les Devis</h1>
                </div>

                {/* Filtres */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Rechercher par client, entreprise ou numéro..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm
                       focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filterStatut}
                        onChange={(e) => setFilterStatut(e.target.value)}
                        className="px-4 py-2 border border-slate-300 rounded-lg text-sm"
                    >
                        <option value="">Tous les statuts</option>
                        {Object.entries(statutColors).map(([key, { label }]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>

                {/* Actions en masse */}
                {selectedDevis.length > 0 && (
                    <div className="mb-6 flex items-center justify-between p-4 bg-primary-50 border border-primary-100 rounded-xl">
                        <span className="text-primary-700 font-medium">
                            {selectedDevis.length} devis sélectionné(s)
                        </span>
                        <button
                            onClick={exportSelectedDevis}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                        >
                            <Download className="w-4 h-4" />
                            Exporter CSV
                        </button>
                    </div>
                )}

                {/* Liste des devis */}
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-center w-12">
                                        <input
                                            type="checkbox"
                                            checked={paginatedDevis.length > 0 && selectedDevis.length === paginatedDevis.length}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-slate-300"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <button onClick={() => handleSort('numero')} className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                                            Numéro {getSortIcon('numero')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <button onClick={() => handleSort('entreprise_nom')} className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                                            Entreprise {getSortIcon('entreprise_nom')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <button onClick={() => handleSort('client_nom')} className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                                            Client {getSortIcon('client_nom')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-center">
                                        <button onClick={() => handleSort('volume_total_m3')} className="flex items-center gap-1 text-sm font-semibold text-slate-600 mx-auto">
                                            Volume {getSortIcon('volume_total_m3')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <button onClick={() => handleSort('statut')} className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                                            Statut {getSortIcon('statut')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-left">
                                        <button onClick={() => handleSort('created_at')} className="flex items-center gap-1 text-sm font-semibold text-slate-600">
                                            Date {getSortIcon('created_at')}
                                        </button>
                                    </th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {paginatedDevis.map((d) => {
                                    const statut = statutColors[d.statut] || statutColors.nouveau;
                                    return (
                                        <tr key={d.id} className="hover:bg-slate-50">
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedDevis.includes(d.id)}
                                                    onChange={() => handleSelectDevis(d.id)}
                                                    className="w-4 h-4 rounded border-slate-300"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-mono text-slate-500">{d.numero}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-800">{d.entreprise_nom}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-slate-800">{d.client_nom}</span>
                                                    <span className="text-xs text-slate-500">{d.client_email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm font-semibold text-primary-600">
                                                    {parseFloat(String(d.volume_total_m3 || 0)).toFixed(1)} m³
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statut.bg} ${statut.text}`}>
                                                    {statut.label}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-xs text-slate-600">{formatDate(d.created_at)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/calculatrice/${d.entreprise_slug}`}
                                                    target="_blank"
                                                    className="p-2 hover:bg-slate-100 rounded-lg inline-flex items-center"
                                                    title="Voir la calculatrice"
                                                >
                                                    <Eye className="w-4 h-4 text-slate-400" />
                                                </Link>
                                                <button
                                                    onClick={() => handleEdit(d)}
                                                    className="p-2 hover:bg-slate-100 rounded-lg inline-flex items-center"
                                                    title="Modifier"
                                                >
                                                    <Pencil className="w-4 h-4 text-slate-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteClick(d.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg inline-flex items-center"
                                                    title="Supprimer"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-400" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {paginatedDevis.length === 0 && (
                        <div className="p-12 text-center text-slate-500">
                            <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <p>Aucun devis trouvé</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                            <span className="text-sm text-slate-600">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => goToPage(i + 1)}
                                            className={`w-8 h-8 text-sm rounded-lg ${currentPage === i + 1 ? 'bg-primary-600 text-white' : 'border border-slate-300 hover:bg-white'
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <h2 className="text-lg font-bold text-slate-800">Modifier le Devis {editingDevis?.numero}</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdate} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Nom du client</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.client_nom}
                                        onChange={(e) => setEditForm({ ...editForm, client_nom: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Email</label>
                                    <input
                                        type="email"
                                        required
                                        value={editForm.client_email}
                                        onChange={(e) => setEditForm({ ...editForm, client_email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Téléphone</label>
                                    <input
                                        type="tel"
                                        value={editForm.client_telephone}
                                        onChange={(e) => setEditForm({ ...editForm, client_telephone: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Statut</label>
                                    <select
                                        value={editForm.statut}
                                        onChange={(e) => setEditForm({ ...editForm, statut: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    >
                                        {Object.entries(statutColors).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Adresse de départ</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.adresse_depart}
                                        onChange={(e) => setEditForm({ ...editForm, adresse_depart: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Adresse d'arrivée</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.adresse_arrivee}
                                        onChange={(e) => setEditForm({ ...editForm, adresse_arrivee: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Volume (m³)</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        required
                                        value={editForm.volume_total_m3}
                                        onChange={(e) => setEditForm({ ...editForm, volume_total_m3: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Date déménagement</label>
                                    <input
                                        type="date"
                                        value={editForm.date_demenagement}
                                        onChange={(e) => setEditForm({ ...editForm, date_demenagement: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-6 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-all shadow-lg shadow-primary-200 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Enregistrer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">Confirmer la suppression</h3>
                            <p className="text-slate-500 mb-6">
                                Êtes-vous sûr de vouloir supprimer ce devis ? Cette action est irréversible et supprimera également tous les meubles associés.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-slate-300 text-slate-600 rounded-xl hover:bg-slate-50 font-medium transition-all"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-all shadow-lg shadow-red-200 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Supprimer'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
